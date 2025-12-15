// deno-lint-ignore-file no-import-prefix
import { assert, assertEquals, assertFalse, assertRejects } from "jsr:@std/assert@1";
import type { ReconnectingWebSocket } from "@nktkas/rews";
import { WebSocketPostRequest, WebSocketRequestError } from "../../../src/transport/websocket/_postRequest.ts";
import { HyperliquidEventTarget } from "../../../src/transport/websocket/_hyperliquidEventTarget.ts";
import { WebSocketSubscriptionManager } from "../../../src/transport/websocket/_subscriptionManager.ts";

// ============================================================
// Helpers
// ============================================================

// @ts-expect-error: Mocking WebSocket for testing purposes
class MockWebSocket extends EventTarget implements ReconnectingWebSocket {
  sentMessages: string[] = [];
  readyState = WebSocket.OPEN;
  terminationController = new AbortController();
  terminationSignal = this.terminationController.signal;

  send(data: string): void {
    this.sentMessages.push(data);
  }

  close(): void {
    this.readyState = WebSocket.CLOSED;
    this.dispatchEvent(new CloseEvent("close"));
  }

  open(): void {
    this.readyState = WebSocket.OPEN;
    this.dispatchEvent(new Event("open"));
  }

  terminate(reason?: unknown): void {
    this.terminationController.abort(reason);
    this.close();
  }

  mockMessage(data: unknown): void {
    this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(data) }));
  }
}

type ManagerWithInternals = WebSocketSubscriptionManager & {
  _subscriptions: Map<string, { listeners: Map<unknown, unknown> }>;
};

/** Creates a new WebSocketSubscriptionManager with mock socket. */
function createManager(resubscribe = true): {
  socket: MockWebSocket;
  requester: WebSocketPostRequest & { queue: unknown[] };
  hlEvents: HyperliquidEventTarget;
  manager: ManagerWithInternals;
} {
  const socket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
  const hlEvents = new HyperliquidEventTarget(socket);
  const requester = new WebSocketPostRequest(socket, hlEvents, 10_000) as WebSocketPostRequest & { queue: unknown[] };
  const manager = new WebSocketSubscriptionManager(socket, requester, hlEvents, resubscribe) as ManagerWithInternals;
  return { socket, requester, hlEvents, manager };
}

// ============================================================
// Test Data
// ============================================================

const RESPONSES = {
  subscriptionResponse: (method: string, subscription: unknown) => ({
    channel: "subscriptionResponse",
    data: { method, subscription },
  }),
  channelEvent: (channel: string, data: unknown) => ({
    channel,
    data,
  }),
} as const;

// ============================================================
// Tests
// ============================================================

Deno.test("WebSocketSubscriptionManager", async (t) => {
  await t.step("subscribe()", async (t) => {
    await t.step("standard flow: subscribe, receive event, unsubscribe", async () => {
      const { socket, manager } = createManager();

      let eventReceived = false;
      const listener = (e: CustomEvent) => {
        if (e.detail?.update === "subscription update") eventReceived = true;
      };

      const payload = { channel: "test", extra: "data" };
      const subPromise = manager.subscribe("test", payload, listener);

      // Confirm subscription
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      const sub = await subPromise;

      // Send event
      socket.mockMessage(RESPONSES.channelEvent("test", { update: "subscription update" }));
      assertEquals(eventReceived, true);

      // Unsubscribe
      const unsubPromise = sub.unsubscribe();
      socket.mockMessage(RESPONSES.subscriptionResponse("unsubscribe", payload));
      await unsubPromise;

      assert(manager._subscriptions.size === 0);
    });

    await t.step("duplicate listener is not added twice", async () => {
      const { socket, manager } = createManager();

      const payload = { channel: "test", extra: "data" };
      const listener = () => {};

      const sub1Promise = manager.subscribe("test", payload, listener);
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await sub1Promise;

      await manager.subscribe("test", payload, listener);

      assertEquals(manager._subscriptions.size, 1);
      assertEquals(manager._subscriptions.get(JSON.stringify(payload))?.listeners.size, 1);
    });

    await t.step("different listeners share same subscription", async () => {
      const { socket, manager } = createManager();

      const payload = { channel: "test", extra: "data" };

      const sub1Promise = manager.subscribe("test", payload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await sub1Promise;

      await manager.subscribe("test", payload, () => {});

      assertEquals(manager._subscriptions.size, 1);
      assertEquals(manager._subscriptions.get(JSON.stringify(payload))?.listeners.size, 2);
    });

    await t.step("returns same subscription object for same payload", async () => {
      const { socket, manager } = createManager();

      const payload = { channel: "test", extra: "data" };
      const listener = () => {};

      const sub1Promise = manager.subscribe("test", payload, listener);
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      const sub1 = await sub1Promise;

      const sub2 = await manager.subscribe("test", payload, listener);

      assertEquals(sub1.unsubscribe, sub2.unsubscribe);
    });

    await t.step("second listener does not send subscription request", () => {
      const { manager, requester } = createManager();

      const payload = { channel: "test", extra: "data" };

      manager.subscribe("test", payload, () => {}).catch(() => {});
      manager.subscribe("test", payload, () => {}).catch(() => {});

      assertEquals(requester.queue.length, 1);
    });

    await t.step("new listeners wait for pending subscription", async () => {
      const { socket, manager } = createManager();

      const payload = { channel: "test", extra: "data" };
      const subPromise1 = manager.subscribe("test", payload, () => {});

      let secondCompleted = false;
      manager.subscribe("test", payload, () => {}).then(() => secondCompleted = true);

      // Both should be waiting
      await new Promise((r) => setTimeout(r, 10));
      assertFalse(secondCompleted);

      // Confirm subscription - both should complete
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await subPromise1;

      await new Promise((r) => setTimeout(r, 10));
      assert(secondCompleted);
    });
  });

  await t.step("unsubscribe()", async (t) => {
    await t.step("removes listener and clears resources", async () => {
      const { socket, manager } = createManager();

      const payload = { channel: "test" };
      const subPromise = manager.subscribe("test", payload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      const sub = await subPromise;

      const unsubPromise = sub.unsubscribe();
      socket.mockMessage(RESPONSES.subscriptionResponse("unsubscribe", payload));
      await unsubPromise;

      assert(manager._subscriptions.size === 0);
    });

    await t.step("does not send request if other listeners exist", async () => {
      const { socket, manager } = createManager();

      const payload = { channel: "test" };

      const sub1Promise = manager.subscribe("test", payload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      const sub1 = await sub1Promise;

      await manager.subscribe("test", payload, () => {});

      // First unsubscribe - should not send request
      await sub1.unsubscribe();

      assertEquals(manager._subscriptions.get(JSON.stringify(payload))?.listeners.size, 1);
    });
  });

  await t.step("autoResubscribe", async (t) => {
    await t.step("resubscribes after reconnection", async () => {
      const { socket, manager } = createManager(true);

      let eventCount1 = 0;
      let eventCount2 = 0;

      const payload1 = { channel: "test1", extra: "data1" };
      const payload2 = { channel: "test2", extra: "data2" };

      // Subscribe to both channels
      const sub1Promise = manager.subscribe("test1", payload1, () => eventCount1++);
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload1));
      await sub1Promise;
      socket.mockMessage(RESPONSES.channelEvent("test1", { update: "event" }));

      const sub2Promise = manager.subscribe("test2", payload2, () => eventCount2++);
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload2));
      await sub2Promise;
      socket.mockMessage(RESPONSES.channelEvent("test2", { update: "event" }));

      assertEquals(eventCount1, 1);
      assertEquals(eventCount2, 1);

      // Simulate reconnection
      socket.close();
      socket.open();

      // Confirm resubscriptions
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload1));
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload2));

      // Send events again
      socket.mockMessage(RESPONSES.channelEvent("test1", { update: "event" }));
      socket.mockMessage(RESPONSES.channelEvent("test2", { update: "event" }));

      await new Promise((r) => setTimeout(r, 10));

      assertEquals(eventCount1, 2);
      assertEquals(eventCount2, 2);
    });

    await t.step("handles resubscription errors", async () => {
      const { socket, manager } = createManager(true);

      const payload = { channel: "test", extra: "data" };

      const subPromise = manager.subscribe("test", payload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      const sub = await subPromise;

      // Simulate reconnection
      socket.close();
      socket.open();

      // Resubscription fails (terminate connection)
      socket.terminate(new Error("Connection terminated"));

      await new Promise((r) => setTimeout(r, 10));
      assert(sub.failureSignal?.aborted);
    });

    await t.step("resubscribe: false clears subscriptions on close", async () => {
      const { socket, manager } = createManager(false);

      let eventCount1 = 0;
      let eventCount2 = 0;

      const payload1 = { channel: "test1", extra: "data1" };
      const payload2 = { channel: "test2", extra: "data2" };

      // Subscribe to both channels
      const sub1Promise = manager.subscribe("test1", payload1, () => eventCount1++);
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload1));
      await sub1Promise;
      socket.mockMessage(RESPONSES.channelEvent("test1", { update: "event" }));

      const sub2Promise = manager.subscribe("test2", payload2, () => eventCount2++);
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload2));
      await sub2Promise;
      socket.mockMessage(RESPONSES.channelEvent("test2", { update: "event" }));

      assertEquals(eventCount1, 1);
      assertEquals(eventCount2, 1);
      assertEquals(manager._subscriptions.size, 2);

      // Close connection - should clear subscriptions
      socket.close();

      await new Promise((r) => setTimeout(r, 10));

      assertEquals(manager._subscriptions.size, 0);

      // Reopen - no resubscription
      socket.open();

      // Send events - should not be received (listeners removed)
      socket.mockMessage(RESPONSES.channelEvent("test1", { update: "event" }));
      socket.mockMessage(RESPONSES.channelEvent("test2", { update: "event" }));

      await new Promise((r) => setTimeout(r, 10));

      assertEquals(eventCount1, 1);
      assertEquals(eventCount2, 1);
    });
  });

  await t.step("unique user subscription limit", async (t) => {
    await t.step("rejects when exceeding 10 unique user subscriptions", async () => {
      const { socket, manager } = createManager();

      // Subscribe to 10 users
      for (let i = 0; i < 10; i++) {
        const payload = { type: "userEvents", user: `0x${i.toString().padStart(40, "0")}` };
        const promise = manager.subscribe("userEvents", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      // 11th subscription should fail
      const payload11 = { type: "userEvents", user: "0x000000000000000000000000000000000000000a" };
      await assertRejects(
        () => manager.subscribe("userEvents", payload11, () => {}),
        WebSocketRequestError,
        "Cannot track more than 10 unique users",
      );
    });

    await t.step("allows subscription after unsubscribing", async () => {
      const { socket, manager } = createManager();

      // Subscribe to 10 users
      const subs = [];
      for (let i = 0; i < 10; i++) {
        const payload = { type: "userEvents", user: `0x${i.toString().padStart(40, "0")}` };
        const promise = manager.subscribe("userEvents", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        subs.push({ sub: await promise, payload });
      }

      // Unsubscribe one
      const unsubPromise = subs[0].sub.unsubscribe();
      socket.mockMessage(RESPONSES.subscriptionResponse("unsubscribe", subs[0].payload));
      await unsubPromise;

      // New subscription should succeed
      const payload11 = { type: "userEvents", user: "0x000000000000000000000000000000000000000a" };
      const promise = manager.subscribe("userEvents", payload11, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload11));
      await promise;

      assertEquals(manager._subscriptions.size, 10);
    });

    await t.step("does not count subscriptions without user parameter", async () => {
      const { socket, manager } = createManager();

      // Subscribe to 10 channels without user parameter
      for (let i = 0; i < 10; i++) {
        const payload = { type: "allMids" };
        const promise = manager.subscribe("allMids", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      // User subscription should still succeed
      const userPayload = { type: "userEvents", user: "0x0000000000000000000000000000000000000001" };
      const promise = manager.subscribe("userEvents", userPayload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", userPayload));
      await promise;
    });

    await t.step("allows multiple listeners on same user subscription", async () => {
      const { socket, manager } = createManager();

      // Subscribe to 10 users
      for (let i = 0; i < 10; i++) {
        const payload = { type: "userEvents", user: `0x${i.toString().padStart(40, "0")}` };
        const promise = manager.subscribe("userEvents", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      // Adding another listener to existing subscription should succeed
      const existingPayload = { type: "userEvents", user: "0x0000000000000000000000000000000000000000" };
      await manager.subscribe("userEvents", existingPayload, () => {});
    });

    await t.step("allows multiple subscriptions for same user", async () => {
      const { socket, manager } = createManager();

      // Subscribe to multiple channels for the same user (should count as 1 unique user)
      const user = "0x0000000000000000000000000000000000000001";
      for (let i = 0; i < 10; i++) {
        const payload = { type: `channel${i}`, user };
        const promise = manager.subscribe(`channel${i}`, payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      // Subscription for a second unique user should succeed (only 2 unique users total)
      const newUserPayload = { type: "userEvents", user: "0x0000000000000000000000000000000000000002" };
      const promise = manager.subscribe("userEvents", newUserPayload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", newUserPayload));
      await promise;

      assertEquals(manager._subscriptions.size, 11);
    });
  });

  await t.step("subscription limit", async (t) => {
    await t.step("rejects when exceeding 1000 subscriptions", async () => {
      const { socket, manager } = createManager();

      // Subscribe to 1000 channels
      for (let i = 0; i < 1000; i++) {
        const payload = { type: "allMids", id: i };
        const promise = manager.subscribe("allMids", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      // 1001st subscription should fail
      const payload1001 = { type: "allMids", id: 1000 };
      await assertRejects(
        () => manager.subscribe("allMids", payload1001, () => {}),
        WebSocketRequestError,
        "Cannot subscribe to more than 1000 channels",
      );
    });

    await t.step("allows subscription after unsubscribing", async () => {
      const { socket, manager } = createManager();

      // Subscribe to 1000 channels
      const subs = [];
      for (let i = 0; i < 1000; i++) {
        const payload = { type: "allMids", id: i };
        const promise = manager.subscribe("allMids", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        subs.push({ sub: await promise, payload });
      }

      // Unsubscribe one
      const unsubPromise = subs[0].sub.unsubscribe();
      socket.mockMessage(RESPONSES.subscriptionResponse("unsubscribe", subs[0].payload));
      await unsubPromise;

      // New subscription should succeed
      const payload1001 = { type: "allMids", id: 1000 };
      const promise = manager.subscribe("allMids", payload1001, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload1001));
      await promise;

      assertEquals(manager._subscriptions.size, 1000);
    });

    await t.step("allows multiple listeners on same subscription", async () => {
      const { socket, manager } = createManager();

      // Subscribe to 1000 channels
      for (let i = 0; i < 1000; i++) {
        const payload = { type: "allMids", id: i };
        const promise = manager.subscribe("allMids", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      // Adding another listener to existing subscription should succeed
      const existingPayload = { type: "allMids", id: 0 };
      await manager.subscribe("allMids", existingPayload, () => {});

      assertEquals(manager._subscriptions.size, 1000);
    });
  });
});
