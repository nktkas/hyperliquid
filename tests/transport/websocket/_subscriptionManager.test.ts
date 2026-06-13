// deno-lint-ignore-file no-import-prefix

/**
 * Tests for the subscription lifecycle manager: listener registration,
 * resubscription across reconnects, failure reporting, and server-side limits.
 * @module
 */

import { assert, assertEquals, assertFalse, assertRejects } from "jsr:@std/assert@1";
import { ReconnectingWebSocket } from "@nktkas/rews";
import { WebSocketDispatcher, WebSocketRequestError } from "../../../src/transport/websocket/_dispatcher.ts";
import { HyperliquidEventTarget } from "../../../src/transport/websocket/_events.ts";
import { WebSocketSubscriptionManager } from "../../../src/transport/websocket/_subscriptionManager.ts";
import { drain, MockWebSocket, RESPONSES } from "./_mock.ts";

// =============================================================================
// Helpers
// =============================================================================

/** Strips private/protected modifiers so intersections with internal-state types don't collapse to `never`. */
type Public<T> = { [K in keyof T]: T[K] };
type ManagerWithInternals = Public<WebSocketSubscriptionManager> & {
  _subscriptions: Map<string, { listeners: Map<unknown, unknown> }>;
};

/** Creates a new WebSocketSubscriptionManager with mock socket. */
function createManager(resubscribe = true): { socket: MockWebSocket; manager: ManagerWithInternals } {
  const socket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
  const hlEvents = new HyperliquidEventTarget(socket);
  const dispatcher = new WebSocketDispatcher(socket, hlEvents, 10_000);
  const manager = new WebSocketSubscriptionManager(socket, dispatcher, hlEvents, resubscribe);
  return {
    socket,
    manager: manager as unknown as ManagerWithInternals,
  };
}

// =============================================================================
// Tests
// =============================================================================

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

      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      const sub = await subPromise;

      socket.mockMessage(RESPONSES.channelEvent("test", { update: "subscription update" }));
      assertEquals(eventReceived, true);

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

    await t.step("second listener does not send subscription request", () => {
      const { socket, manager } = createManager();

      const payload = { channel: "test", extra: "data" };

      manager.subscribe("test", payload, () => {}).catch(() => {});
      manager.subscribe("test", payload, () => {}).catch(() => {});

      assertEquals(socket.sentMessages.length, 1);
    });

    await t.step("new listeners wait for pending subscription", async () => {
      const { socket, manager } = createManager();

      const payload = { channel: "test", extra: "data" };
      const subPromise1 = manager.subscribe("test", payload, () => {});

      let secondCompleted = false;
      manager.subscribe("test", payload, () => {}).then(() => secondCompleted = true);

      await drain();
      assertFalse(secondCompleted);

      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await subPromise1;

      await drain();
      assert(secondCompleted);
    });

    await t.step("rejected confirmation removes the subscription", async () => {
      const { socket, manager } = createManager();
      const payload = { channel: "test", extra: "data" };

      let events = 0;
      const promise = manager.subscribe("test", payload, () => events++);
      socket.mockMessage(RESPONSES.errorChannel(`Already subscribed: ${JSON.stringify(payload)}`));
      await assertRejects(() => promise, WebSocketRequestError, "Already subscribed");

      // The listener is detached and the entry is gone.
      socket.mockMessage(RESPONSES.channelEvent("test", { update: "x" }));
      assertEquals(events, 0);
      assertEquals(manager._subscriptions.size, 0);

      // A retry is no longer poisoned by the cached rejection.
      const retry = manager.subscribe("test", payload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await retry;
    });

    await t.step("limit errors carry the request payload", async () => {
      const { socket, manager } = createManager();

      for (let i = 0; i < 15; i++) {
        const payload = { type: "userEvents", user: `0x${i.toString().padStart(40, "0")}` };
        const promise = manager.subscribe("userEvents", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      const payload16 = { type: "userEvents", user: "0x000000000000000000000000000000000000000f" };
      const err = await assertRejects(
        () => manager.subscribe("userEvents", payload16, () => {}),
        WebSocketRequestError,
      );
      assertEquals(err.request, payload16);
    });
  });

  await t.step("AbortSignal", async (t) => {
    await t.step("rejects without sending when already aborted", async () => {
      const { socket, manager } = createManager();
      const payload = { channel: "test", extra: "data" };

      const signal = AbortSignal.abort(new Error("pre-aborted"));
      const err = await assertRejects(
        () => manager.subscribe("test", payload, () => {}, { signal }),
        WebSocketRequestError,
        "Subscription was aborted",
      );
      assertEquals(err.cause, signal.reason);
      assertEquals(socket.sentMessages.length, 0);
    });

    await t.step("abort while the confirmation is pending detaches the listener", async () => {
      const { socket, manager } = createManager();
      const payload = { channel: "test", extra: "data" };

      let events = 0;
      const controller = new AbortController();
      const promise = manager.subscribe("test", payload, () => events++, { signal: controller.signal });

      controller.abort(new Error("stop waiting"));
      const err = await assertRejects(() => promise, WebSocketRequestError, "Subscription was aborted");
      assertEquals(err.cause, controller.signal.reason);
      assertEquals(manager._subscriptions.size, 0);

      // The in-flight request may still confirm: the slot is freed server-side.
      assertEquals(JSON.parse(socket.sentMessages[1]).method, "unsubscribe");

      // A late confirmation does not resurrect the subscription.
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      socket.mockMessage(RESPONSES.channelEvent("test", { update: "x" }));
      assertEquals(events, 0);
    });

    await t.step("abort of one waiter does not affect the others", async () => {
      const { socket, manager } = createManager();
      const payload = { channel: "test", extra: "data" };

      let events = 0;
      const promise = manager.subscribe("test", payload, () => events++);

      const controller = new AbortController();
      const joiner = manager.subscribe("test", payload, () => {}, { signal: controller.signal });
      controller.abort(new Error("changed my mind"));
      await assertRejects(() => joiner, WebSocketRequestError, "Subscription was aborted");

      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await promise;

      socket.mockMessage(RESPONSES.channelEvent("test", { update: "x" }));
      assertEquals(events, 1);
      assertEquals(manager._subscriptions.get(JSON.stringify(payload))?.listeners.size, 1);
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

      socket.disconnect();
      socket.open();

      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload1));
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload2));

      socket.mockMessage(RESPONSES.channelEvent("test1", { update: "event" }));
      socket.mockMessage(RESPONSES.channelEvent("test2", { update: "event" }));

      await drain();

      assertEquals(eventCount1, 2);
      assertEquals(eventCount2, 2);

      socket.terminate();
    });

    await t.step("onError: rejected re-subscription notifies once, drops the channel, and is not retried", async () => {
      const { socket, manager } = createManager(true);
      const payload = { channel: "test", extra: "data" };

      const errors: unknown[] = [];
      const subPromise = manager.subscribe("test", payload, () => {}, { onError: (e) => errors.push(e) });
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await subPromise;

      // Reconnect, then the server rejects the re-subscription while the socket stays open.
      socket.disconnect();
      socket.open();
      socket.mockMessage(RESPONSES.errorChannel(JSON.stringify({ method: "subscribe", subscription: payload })));
      await drain();

      assertEquals(errors.length, 1);
      assert(errors[0] instanceof WebSocketRequestError);
      // The connection is still live, but the failed channel is dropped.
      assertEquals(socket.readyState, ReconnectingWebSocket.OPEN);
      assertEquals(manager._subscriptions.size, 0);

      // Next reconnect does not retry the dropped channel: no new subscribe frame, no new onError.
      const sentBefore = socket.sentMessages.length;
      socket.disconnect();
      socket.open();
      await drain();
      assertEquals(socket.sentMessages.length, sentBefore);
      assertEquals(errors.length, 1);

      // A later terminal close does not re-notify the already-dropped channel.
      socket.terminate(new Error("dead"));
      await drain();
      assertEquals(errors.length, 1);
    });

    await t.step("a subscriber joining an in-flight resubscribe shares its failure", async () => {
      const { socket, manager } = createManager(true);
      const payload = { channel: "test", extra: "data" };

      const subPromise = manager.subscribe("test", payload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await subPromise;

      // Reconnect; the re-subscription is in flight when a new subscriber joins.
      socket.disconnect();
      socket.open();
      const joiner = manager.subscribe("test", payload, () => {});

      // The server rejects the re-subscription on the live socket.
      socket.mockMessage(RESPONSES.errorChannel(JSON.stringify({ method: "subscribe", subscription: payload })));

      await assertRejects(() => joiner, WebSocketRequestError);
      assertEquals(manager._subscriptions.size, 0);
    });

    await t.step("a joiner rejected by a disconnect does not keep a zombie listener", async () => {
      const { socket, manager } = createManager(true);
      const payload = { channel: "test", extra: "data" };

      let survivorEvents = 0;
      let joinerEvents = 0;
      const subPromise = manager.subscribe("test", payload, () => survivorEvents++);
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await subPromise;

      // Reconnect; a joiner subscribes while the re-subscription is in flight,
      // then the connection drops again before the confirmation.
      socket.disconnect();
      socket.open();
      const joiner = manager.subscribe("test", payload, () => joinerEvents++);
      socket.disconnect();
      await assertRejects(() => joiner, WebSocketRequestError, "WebSocket connection closed");

      // The survivor keeps the entry; the joiner's listener is gone with its rejection.
      assertEquals(manager._subscriptions.size, 1);
      assertEquals(manager._subscriptions.get(JSON.stringify(payload))?.listeners.size, 1);

      socket.open();
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      socket.mockMessage(RESPONSES.channelEvent("test", { update: "x" }));
      await drain();
      assertEquals(survivorEvents, 1);
      assertEquals(joinerEvents, 0);
    });

    await t.step("a subscriber hitting a poisoned cached rejection does not leak its listener", async () => {
      const { socket, manager } = createManager(true);
      const payload = { channel: "test", extra: "data" };

      const subPromise = manager.subscribe("test", payload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await subPromise;

      // The connection flaps: the re-subscription is rejected by the disconnect
      // and its rejection stays cached in the surviving entry.
      socket.disconnect();
      socket.open();
      socket.disconnect();
      await drain();

      // A subscriber in the disconnected window hits the cached rejection.
      let lateEvents = 0;
      const late = manager.subscribe("test", payload, () => lateEvents++);
      await assertRejects(() => late, WebSocketRequestError, "WebSocket connection closed");
      assertEquals(manager._subscriptions.get(JSON.stringify(payload))?.listeners.size, 1);

      socket.open();
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      socket.mockMessage(RESPONSES.channelEvent("test", { update: "x" }));
      await drain();
      assertEquals(lateEvents, 0);
    });

    await t.step("a re-subscription rejected by a disconnect survives for the next open", async () => {
      const { socket, manager } = createManager(true);
      const payload = { channel: "test", extra: "data" };

      let events = 0;
      let onErrorCalled = false;
      const subPromise = manager.subscribe("test", payload, () => events++, {
        onError: () => onErrorCalled = true,
      });
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await subPromise;

      // The connection flaps while the re-subscription is in flight:
      // the dispatcher rejects its queue, but the channel must survive.
      socket.disconnect();
      socket.open();
      socket.disconnect();
      await drain();

      assertFalse(onErrorCalled);
      assertEquals(manager._subscriptions.size, 1);

      // The next open retries and the channel keeps working.
      socket.open();
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      socket.mockMessage(RESPONSES.channelEvent("test", { update: "x" }));
      assertEquals(events, 1);
    });

    await t.step("onError: terminal loss notifies every listener once with the reason, isolating throws", async () => {
      const { socket, manager } = createManager(true);
      const payload = { channel: "test", extra: "data" };

      // Two listeners on one channel: the first throws after being called, the second records the reason.
      let firstCalls = 0;
      const seen: unknown[] = [];
      const p1 = manager.subscribe("test", payload, () => {}, {
        onError: () => {
          firstCalls++;
          throw new Error("boom");
        },
      });
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await p1;
      await manager.subscribe("test", payload, () => {}, { onError: (e) => seen.push(e) });

      socket.terminate(new Error("gone for good"));
      await drain();

      // The first listener's throw does not block the sibling, which receives
      // a wrapped error whose cause is the termination reason.
      assertEquals(firstCalls, 1);
      assertEquals(seen.length, 1);
      assert(seen[0] instanceof WebSocketRequestError);
      assertEquals((seen[0] as WebSocketRequestError).cause, socket.terminationSignal.reason);
      assertEquals(manager._subscriptions.size, 0);
    });

    await t.step("onError: terminal also fires via the socket error event", async () => {
      const { socket, manager } = createManager(true);
      const payload = { channel: "test", extra: "data" };

      const errors: unknown[] = [];
      const subPromise = manager.subscribe("test", payload, () => {}, { onError: (e) => errors.push(e) });
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await subPromise;

      socket.terminationController.abort(new Error("error-path"));
      socket.dispatchEvent(new Event("error"));
      await drain();

      // The terminal-via-error failure is wrapped too, with the reason as cause.
      assertEquals(errors.length, 1);
      assert(errors[0] instanceof WebSocketRequestError);
      assertEquals((errors[0] as WebSocketRequestError).cause, socket.terminationSignal.reason);
    });

    await t.step("onError: re-subscribing the same listener keeps its original onError (first-wins)", async () => {
      const { socket, manager } = createManager(true);
      const payload = { channel: "test", extra: "data" };

      let first = 0;
      let second = 0;
      const listener = () => {};
      const p1 = manager.subscribe("test", payload, listener, { onError: () => first++ });
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await p1;

      const sentBefore = socket.sentMessages.length;
      await manager.subscribe("test", payload, listener, { onError: () => second++ }); // same listener, different onError

      assertEquals(socket.sentMessages.length, sentBefore); // no new subscribe sent (dedup)
      assertEquals(manager._subscriptions.get(JSON.stringify(payload))?.listeners.size, 1);

      socket.terminate(new Error("x"));
      await drain();

      assertEquals(first, 1); // original onError fired
      assertEquals(second, 0); // replacement ignored
    });

    await t.step("onError: called once when the connection drops with resubscribe disabled", async () => {
      const { socket, manager } = createManager(false);
      const payload = { channel: "test", extra: "data" };

      let errorCalls = 0;
      const subPromise = manager.subscribe("test", payload, () => {}, { onError: () => errorCalls++ });
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await subPromise;

      // Not a termination, but the subscription cannot be served anymore.
      socket.disconnect();
      await drain();

      assertEquals(manager._subscriptions.size, 0);
      assertEquals(errorCalls, 1);

      // The already-failed subscription is not re-notified on termination.
      socket.terminate();
      await drain();
      assertEquals(errorCalls, 1);
    });

    await t.step("a failure before the confirmation rejects subscribe() without firing onError", async () => {
      const { socket, manager } = createManager(false);
      const payload = { channel: "test", extra: "data" };

      let errorCalls = 0;
      const subPromise = manager.subscribe("test", payload, () => {}, { onError: () => errorCalls++ });

      socket.disconnect();
      await assertRejects(() => subPromise, WebSocketRequestError, "WebSocket connection closed");
      await drain();

      // One failure, one reporting channel: the rejection. No onError.
      assertEquals(errorCalls, 0);
      assertEquals(manager._subscriptions.size, 0);
    });

    await t.step("a termination before the confirmation rejects subscribe() without firing onError", async () => {
      const { socket, manager } = createManager(true);
      const payload = { channel: "test", extra: "data" };

      let errorCalls = 0;
      const subPromise = manager.subscribe("test", payload, () => {}, { onError: () => errorCalls++ });

      socket.terminate(new Error("gone"));
      await assertRejects(() => subPromise, WebSocketRequestError);
      await drain();

      assertEquals(errorCalls, 0);
      assertEquals(manager._subscriptions.size, 0);
    });

    await t.step("disabling resubscribe while disconnected fails the stranded subscriptions at open", async () => {
      const { socket, manager } = createManager(true);
      const payload = { channel: "test", extra: "data" };

      const errors: unknown[] = [];
      let events = 0;
      const subPromise = manager.subscribe("test", payload, () => events++, { onError: (e) => errors.push(e) });
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await subPromise;

      // The subscription survives the drop, but re-subscription is switched
      // off while the socket is down — it cannot be served after the reopen.
      socket.disconnect();
      manager.resubscribe = false;
      const sentBefore = socket.sentMessages.length;
      socket.open();
      await drain();

      assertEquals(socket.sentMessages.length, sentBefore);
      assertEquals(errors.length, 1);
      assert(errors[0] instanceof WebSocketRequestError);
      assertEquals(manager._subscriptions.size, 0);

      socket.mockMessage(RESPONSES.channelEvent("test", { update: "x" }));
      assertEquals(events, 0);
    });

    await t.step("resubscribe: false clears subscriptions on close", async () => {
      const { socket, manager } = createManager(false);

      let eventCount1 = 0;
      let eventCount2 = 0;

      const payload1 = { channel: "test1", extra: "data1" };
      const payload2 = { channel: "test2", extra: "data2" };

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

      socket.disconnect();
      await drain();

      assertEquals(manager._subscriptions.size, 0);

      // After the reopen no resubscription happens and no events are delivered.
      socket.open();
      socket.mockMessage(RESPONSES.channelEvent("test1", { update: "event" }));
      socket.mockMessage(RESPONSES.channelEvent("test2", { update: "event" }));
      await drain();

      assertEquals(eventCount1, 1);
      assertEquals(eventCount2, 1);

      socket.terminate();
    });
  });

  await t.step("unique user subscription limit", async (t) => {
    await t.step("rejects when exceeding 15 unique users", async () => {
      const { socket, manager } = createManager();

      for (let i = 0; i < 15; i++) {
        const payload = { type: "userEvents", user: `0x${i.toString().padStart(40, "0")}` };
        const promise = manager.subscribe("userEvents", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      const payload16 = { type: "userEvents", user: "0x000000000000000000000000000000000000000f" };
      await assertRejects(
        () => manager.subscribe("userEvents", payload16, () => {}),
        WebSocketRequestError,
        "Cannot track more than 15 total users.",
      );
    });

    await t.step("allows subscription after unsubscribing", async () => {
      const { socket, manager } = createManager();

      const subs = [];
      for (let i = 0; i < 15; i++) {
        const payload = { type: "userEvents", user: `0x${i.toString().padStart(40, "0")}` };
        const promise = manager.subscribe("userEvents", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        subs.push({ sub: await promise, payload });
      }

      const unsubPromise = subs[0].sub.unsubscribe();
      socket.mockMessage(RESPONSES.subscriptionResponse("unsubscribe", subs[0].payload));
      await unsubPromise;

      const newUserPayload = { type: "userEvents", user: "0x000000000000000000000000000000000000000f" };
      const promise = manager.subscribe("userEvents", newUserPayload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", newUserPayload));
      await promise;

      assertEquals(manager._subscriptions.size, 15);
    });

    await t.step("does not count subscriptions without user parameter", async () => {
      const { socket, manager } = createManager();

      for (let i = 0; i < 10; i++) {
        const payload = { type: "allMids" };
        const promise = manager.subscribe("allMids", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      const userPayload = { type: "userEvents", user: "0x0000000000000000000000000000000000000001" };
      const promise = manager.subscribe("userEvents", userPayload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", userPayload));
      await promise;
    });

    await t.step("allows a new channel of an already tracked user at the limit", async () => {
      const { socket, manager } = createManager();

      for (let i = 0; i < 15; i++) {
        const payload = { type: "userEvents", user: `0x${i.toString().padStart(40, "0")}` };
        const promise = manager.subscribe("userEvents", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      // A new channel of user 0 does not add a 16th user.
      const payload = { type: "userFills", user: `0x${"0".padStart(40, "0")}` };
      const promise = manager.subscribe("userFills", payload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await promise;
    });

    await t.step("matches tracked users case-insensitively", async () => {
      const { socket, manager } = createManager();

      const mixedCase = "0x00000000000000000000000000000000000000AB";
      for (const user of [mixedCase, ...Array.from({ length: 14 }, (_, i) => `0x${`${i}`.padStart(40, "0")}`)]) {
        const payload = { type: "userEvents", user };
        const promise = manager.subscribe("userEvents", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      // The same address in a different case is not a 16th user.
      const payload = { type: "userFills", user: mixedCase.toLowerCase() };
      const promise = manager.subscribe("userFills", payload, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      await promise;
    });

    await t.step("allows multiple listeners on same user subscription", async () => {
      const { socket, manager } = createManager();

      for (let i = 0; i < 15; i++) {
        const payload = { type: "userEvents", user: `0x${i.toString().padStart(40, "0")}` };
        const promise = manager.subscribe("userEvents", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      const existingPayload = { type: "userEvents", user: "0x0000000000000000000000000000000000000000" };
      await manager.subscribe("userEvents", existingPayload, () => {});
    });

    await t.step("allows multiple subscriptions for same user", async () => {
      const { socket, manager } = createManager();

      // Many channels of one user count as a single unique user.
      const user = "0x0000000000000000000000000000000000000001";
      for (let i = 0; i < 10; i++) {
        const payload = { type: `channel${i}`, user };
        const promise = manager.subscribe(`channel${i}`, payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

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

      for (let i = 0; i < 1000; i++) {
        const payload = { type: "allMids", id: i };
        const promise = manager.subscribe("allMids", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      const payload1001 = { type: "allMids", id: 1000 };
      await assertRejects(
        () => manager.subscribe("allMids", payload1001, () => {}),
        WebSocketRequestError,
        "Cannot subscribe to more than 1000 channels.",
      );
    });

    await t.step("allows subscription after unsubscribing", async () => {
      const { socket, manager } = createManager();

      const subs = [];
      for (let i = 0; i < 1000; i++) {
        const payload = { type: "allMids", id: i };
        const promise = manager.subscribe("allMids", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        subs.push({ sub: await promise, payload });
      }

      const unsubPromise = subs[0].sub.unsubscribe();
      socket.mockMessage(RESPONSES.subscriptionResponse("unsubscribe", subs[0].payload));
      await unsubPromise;

      const payload1001 = { type: "allMids", id: 1000 };
      const promise = manager.subscribe("allMids", payload1001, () => {});
      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload1001));
      await promise;

      assertEquals(manager._subscriptions.size, 1000);
    });

    await t.step("allows multiple listeners on same subscription", async () => {
      const { socket, manager } = createManager();

      for (let i = 0; i < 1000; i++) {
        const payload = { type: "allMids", id: i };
        const promise = manager.subscribe("allMids", payload, () => {});
        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        await promise;
      }

      const existingPayload = { type: "allMids", id: 0 };
      await manager.subscribe("allMids", existingPayload, () => {});

      assertEquals(manager._subscriptions.size, 1000);
    });
  });
});
