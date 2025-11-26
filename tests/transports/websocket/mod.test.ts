// deno-lint-ignore-file no-import-prefix
import { assert, assertEquals, assertFalse, assertIsError, assertLess, assertRejects } from "jsr:@std/assert@1";
// @ts-types="npm:@types/ws"
import { WebSocketServer } from "npm:ws@8";
import { WebSocketRequestError, WebSocketTransport } from "../../../src/transport/websocket/mod.ts";

type TransportWithInternals = WebSocketTransport & {
  _subscriptions: Map<string, { listeners: Set<unknown> }>;
  _keepAliveTimeout: number | undefined;
  _wsRequester: { queue: unknown[] };
};

type ServerMessage = {
  method?: string;
  id?: string | number;
  request?: { delay?: number };
  subscription?: { delay?: number; channel?: string };
  [key: string]: unknown;
};

async function createNodeTestServer(port: number) {
  const wss = new WebSocketServer({ port });
  await new Promise<void>((resolve) => wss.once("listening", resolve));

  wss.on("connection", (socket, request) => {
    const testCase = new URL(request.url ?? "", `http://localhost:${port}`).searchParams.get("test");

    socket.on("message", (raw) => {
      let data: ServerMessage;
      try {
        data = JSON.parse(raw.toString()) as ServerMessage;
      } catch {
        return;
      }

      const send = (payload: unknown) => socket.send(JSON.stringify(payload));

      if (data.method === "post") {
        if (testCase === "request-fail") {
          send({ channel: "error", data: `Request failed: ${JSON.stringify(data)}` });
        } else if (testCase === "request-timeout") {
          return;
        } else if (testCase === "request-delay") {
          setTimeout(() =>
            send({
              channel: "post",
              data: {
                id: data.id,
                response: { type: "info", payload: { data: "very-late-response" } },
              },
            }), data.request?.delay ?? 0);
        } else {
          send({
            channel: "post",
            data: {
              id: data.id,
              response: { type: "info", payload: { data: "response-success" } },
            },
          });
        }
      } else if (data.method === "subscribe") {
        if (testCase === "subscribe-fail") {
          send({ channel: "error", data: `Subscription failed: ${JSON.stringify(data)}` });
        } else if (testCase === "subscribe-timeout") {
          return;
        } else if (testCase === "subscribe-no-timeout") {
          setTimeout(() =>
            send({
              channel: "subscriptionResponse",
              data: { method: data.method, subscription: data.subscription },
            }), data.subscription?.delay ?? 0);
        } else if (testCase === "subscribe-delay") {
          setTimeout(() => send({ channel: "subscriptionResponse", data }), 5000);
        } else {
          send({ channel: "subscriptionResponse", data });
          if (data.subscription?.channel) {
            send({ channel: data.subscription.channel, data: { update: "subscription update" } });
          }
        }
      } else if (data.method === "unsubscribe") {
        if (testCase === "unsubscribe-fail") {
          send({ channel: "error", data: `Unsubscribe failed: ${JSON.stringify(data)}` });
        } else if (testCase === "unsubscribe-timeout") {
          return;
        } else {
          send({ channel: "subscriptionResponse", data });
        }
      } else if (data.method === "ping") {
        send({ channel: "pong" });
      }
    });
  });

  return {
    shutdown: () =>
      new Promise<void>((resolve, reject) => {
        wss.close((err) => err ? reject(err) : resolve());
      }),
  };
}

Deno.test("WebSocketTransport", async (t) => {
  const server = await createNodeTestServer(8080);

  await t.step("request()", async (t) => {
    await t.step("Send post request and resolves with server response", async () => {
      // Setup
      const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
      await transport.ready();

      // Test
      const result = await transport.request("info", { key: "value" });
      assertEquals(result, "response-success");

      // Clean up
      await transport.close();
    });

    await t.step("Reject", async (t) => {
      await t.step("Reject an unsuccessful request", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-fail" });
        await transport.ready();

        // Test
        const promise = transport.request("info", { key: "value" });
        await assertRejects(() => promise, WebSocketRequestError, "Request failed:");

        // Clean up
        await transport.close();
      });

      await t.step("Reject if AbortSignal is aborted", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
        await transport.ready();

        // Test
        const signal = AbortSignal.abort(new Error("Aborted"));
        const promise = transport.request("info", { key: "value" }, signal);
        const error = await assertRejects(() => promise, WebSocketRequestError);
        assertIsError(error.cause, Error, "Aborted");

        // Clean up
        await transport.close();
      });

      await t.step("Reject after timeout expires", async () => {
        // Setup
        const transport = new WebSocketTransport({
          url: "ws://localhost:8080/?test=request-timeout",
          timeout: 100,
        });
        await transport.ready();

        // Test
        const promise = transport.request("info", { key: "value" });
        const error = await assertRejects(() => promise, WebSocketRequestError);
        assertIsError(error.cause, DOMException, "signal timed out");

        // Clean up
        await transport.close();
      });

      await t.step("If timeout is not set, never reject", async () => {
        // Setup
        const defaultTimeout = new WebSocketTransport({ url: "ws://example.com" }).timeout!;
        const transport = new WebSocketTransport({
          url: "ws://localhost:8080/?test=request-no-timeout",
          timeout: null,
        });
        await transport.ready();

        // Test
        await transport.request("info", { delay: defaultTimeout * 1.5 });

        // Clean up
        await transport.close();
      });
    });
  });

  // The following things need to be tested:
  // - Standard use: subscription request/response, receive event, unsubscribe request/response
  // - Correct signal processing for requests
  // - No double subscription/unsubscription request
  // - Distribution of a single event to listeners
  // - Resolution of a promise after receipt of a response
  // - Correct resource cleansing
  await t.step("subscribe()", async (t) => {
    await t.step(
      "Standard use: subscription request/response, receive event, unsubscribe request/response",
      async () => {
        // Setup
        const transport = new WebSocketTransport({
          url: "ws://localhost:8080/?test=subscribe-success",
        }) as TransportWithInternals;
        await transport.ready();

        // Test
        let eventReceived = false;
        const listener = (e: CustomEvent) => {
          if (e.detail && e.detail.update === "subscription update") {
            eventReceived = true;
          }
        };

        // Check that the subscription was added
        const sub = await transport.subscribe("test", { channel: "test", extra: "data" }, listener);
        await new Promise((r) => setTimeout(r, 100));
        assertEquals(eventReceived, true);

        // Check that the subscription was removed
        await sub.unsubscribe();
        await new Promise((r) => setTimeout(r, 100));
        assert(transport._subscriptions.size === 0, "Subscriptions map should be empty after unsubscribe");

        // Clean up
        await transport.close();
      },
    );

    await t.step(
      "A listener added twice should not be added to the internal list of listeners",
      async () => {
        // Setup
        const transport = new WebSocketTransport({
          url: "ws://localhost:8080/?test=subscribe-success",
        }) as TransportWithInternals;
        await transport.ready();

        // Test
        const payload = { channel: "test", extra: "data" };
        const listener = () => {};
        await transport.subscribe("test", payload, listener);
        await transport.subscribe("test", payload, listener);

        assertEquals(transport._subscriptions.size, 1);
        assertEquals(transport._subscriptions.get(JSON.stringify(payload))?.listeners.size, 1);

        // Clean up
        await transport.close();
      },
    );

    await t.step(
      "Two different listeners for the same event should not create a new list of event listeners",
      async () => {
        // Setup
        const transport = new WebSocketTransport({
          url: "ws://localhost:8080/?test=subscribe-success",
        }) as TransportWithInternals;
        await transport.ready();

        // Test
        const payload = { channel: "test", extra: "data" };
        const listener1 = () => {};
        const listener2 = () => {};
        await transport.subscribe("test", payload, listener1);
        await transport.subscribe("test", payload, listener2);

        assertEquals(transport._subscriptions.size, 1);
        assertEquals(transport._subscriptions.get(JSON.stringify(payload))?.listeners.size, 2);

        // Clean up
        await transport.close();
      },
    );

    await t.step(
      "A subscription object must be the same across different listeners for the same event",
      async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=subscribe-success" });
        await transport.ready();

        // Test
        const payload = { channel: "test", extra: "data" };
        const listener = () => {};
        const sub1 = await transport.subscribe("test", payload, listener);
        const sub2 = await transport.subscribe("test", payload, listener);

        assertEquals(sub1.unsubscribe, sub2.unsubscribe);

        // Clean up
        await transport.close();
      },
    );

    await t.step(
      "A second listener added after the first listener should not send a subscription request",
      async () => {
        // Setup
        const transport = new WebSocketTransport({
          url: "ws://localhost:8080/?test=subscribe-success",
        }) as TransportWithInternals;
        await transport.ready();

        // Test
        const payload = { channel: "test", extra: "data" };
        const listener1 = () => {};
        const listener2 = () => {};

        transport.subscribe("test", payload, listener1).catch(() => {});
        transport.subscribe("test", payload, listener2).catch(() => {});

        assertEquals(transport._wsRequester.queue.length, 1);

        // Clean up
        await transport.close();
      },
    );

    await t.step(
      "New listeners must wait for a response to a subscription request",
      async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=subscribe-delay" });
        await transport.ready();

        // Test
        const payload = { channel: "test", extra: "data" };

        // First subscribe - server will respond after 5 seconds
        const subPromise1 = transport.subscribe("test", payload, () => {});

        // Second subscribe - should wait for the first to complete
        let secondCompleted = false;
        transport.subscribe("test", payload, () => {}).then(() => secondCompleted = true);

        // If the second promise resolves before the first, the test will fail
        await new Promise((r) => setTimeout(r, 100));
        assertFalse(secondCompleted);

        // Now wait for the first subscription to complete
        await subPromise1;
        await new Promise((r) => setTimeout(r, 10));
        assert(secondCompleted, "Second subscription did not complete after the first");

        // Clean up
        await transport.close();
      },
    );
  });

  await t.step("unsubscribe()", async (t) => {
    await t.step("Unsubscribe a listener, request to be unsubscribed and clear resources", async () => {
      // Setup
      const transport = new WebSocketTransport({
        url: "ws://localhost:8080/?test=unsubscribe-success",
      }) as TransportWithInternals;
      await transport.ready();

      // Test
      const sub = await transport.subscribe("test", { channel: "test" }, () => {});
      await sub.unsubscribe();
      assert(transport._subscriptions.size === 0, "Subscriptions map should be empty after unsubscribe");

      // Clean up
      await transport.close();
    });

    await t.step("Do not send an unsubscribe request if there are more listeners", async () => {
      // Setup
      const transport = new WebSocketTransport({
        url: "ws://localhost:8080/?test=unsubscribe-success",
      }) as TransportWithInternals;
      await transport.ready();

      // Test
      const payload = { channel: "test" };
      const listener1 = () => {};
      const listener2 = () => {};

      const sub1 = await transport.subscribe("test", payload, listener1);
      await transport.subscribe("test", payload, listener2);

      await sub1.unsubscribe();
      assertEquals(transport._subscriptions.get(JSON.stringify(payload))?.listeners.size, 1);

      // Clean up
      await transport.close();
    });
  });

  await t.step("ready()", async (t) => {
    await t.step("Resolve immediately if the socket is already open", async () => {
      // Setup
      const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
      await transport.ready();

      // Test
      const start = performance.now();
      await transport.ready();
      const dur = performance.now() - start;
      assertLess(dur, 20, `ready() again should resolve immediately, took ${dur}ms`);

      // Clean up
      await transport.close();
    });

    await t.step("AbortSignal check", async (t) => {
      await t.step("Reject immediately if the signal has already been aborted", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });

        // Test
        const alreadyAborted = AbortSignal.abort(new Error("Already aborted"));
        const promise = transport.ready(alreadyAborted);
        await assertRejects(() => promise, Error, "Already aborted");

        // Clean up
        await transport.close();
      });

      await t.step("Reject if the signal is later aborted", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });

        // Test
        const controller = new AbortController();
        const promise = transport.ready(controller.signal);
        controller.abort(new Error("Aborted later"));

        await assertRejects(() => promise, Error, "Aborted later");

        // Clean up
        await transport.close();
      });
    });

    await t.step("Reject if the connection is permanently closed", async () => {
      // Setup
      const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });

      // Test
      await transport.close();
      const promise = transport.ready();
      await assertRejects(() => promise, Error, "TERMINATED_BY_USER");
    });
  });

  await t.step("close()", async (t) => {
    await t.step("Resolve immediately if the socket is already closed", async () => {
      // Setup
      const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
      await transport.ready();
      await transport.close();

      // Test
      const start = performance.now();
      await transport.close();
      const dur = performance.now() - start;
      assertLess(dur, 20, `close() again should resolve immediately, took ${dur}ms`);
    });

    await t.step("AbortSignal check", async (t) => {
      await t.step("Reject immediately if the signal has already been aborted", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
        await transport.ready();

        // Test
        const aborted = AbortSignal.abort(new Error("Already aborted close"));
        const promise = transport.close(aborted);
        await assertRejects(() => promise, Error, "Already aborted close");

        // Clean up
        await transport.close();
      });

      await t.step("Reject if the signal is later aborted", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
        await transport.ready();

        // Test
        const controller = new AbortController();
        const promise = transport.close(controller.signal);
        controller.abort(new Error("Close aborted"));

        await assertRejects(() => promise, Error, "Close aborted");

        // Clean up
        await transport.close();
      });
    });
  });

  await t.step("keepAlive", async (t) => {
    await t.step("Send ping messages after connection open", async () => {
      // Setup
      const transport = new WebSocketTransport({
        url: "ws://localhost:8080/?test=ping",
        keepAliveInterval: 1000,
      });
      await transport.ready();

      // Test
      let pingSent = false;
      let pongReceived = false;
      const originalSend = transport.socket.send.bind(transport.socket);
      transport.socket.send = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
        const msg = JSON.parse(data.toString());
        if (msg.method === "ping") pingSent = true;
        return originalSend(data);
      };
      transport.socket.addEventListener("message", (ev: MessageEvent) => {
        const data = JSON.parse(ev.data);
        if (data.channel === "pong") pongReceived = true;
      });

      await new Promise((r) => setTimeout(r, transport.keepAliveInterval! + 3000));

      assert(pingSent, "Ping has not been sent");
      assert(pongReceived, "Pong has not been received");

      // Clean up
      await transport.close();
    });

    await t.step("Stops sending ping messages after closing", async () => {
      // Setup
      const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=ping" }) as TransportWithInternals;
      await transport.ready();

      // Test
      assert(transport._keepAliveTimeout, "Keep-alive timeout should be set after ready()");
      await transport.close();
      assertFalse(transport._keepAliveTimeout);
    });
  });

  await t.step("autoResubscribe", async (t) => {
    await t.step("automatically resubscribes after reconnection", async () => {
      // Setup
      const transport = new WebSocketTransport({
        url: "ws://localhost:8080/?test=subscribe-success",
        reconnect: { maxRetries: 1, reconnectionDelay: 100 },
      });
      await transport.ready();

      // Test
      // Subscribe to multiple events
      const payload1 = { channel: "test1", extra: "data1" };
      const payload2 = { channel: "test2", extra: "data2" };
      let eventCount1 = 0;
      let eventCount2 = 0;
      const listener1 = () => eventCount1++;
      const listener2 = () => eventCount2++;

      await transport.subscribe("test1", payload1, listener1);
      await transport.subscribe("test2", payload2, listener2);
      await new Promise((r) => setTimeout(r, 100));
      assertEquals(eventCount1, 1); // Initial events received
      assertEquals(eventCount2, 1);

      // Simulate connection loss and reconnection
      transport.socket.close(undefined, undefined, false);
      await transport.ready();

      // Check that subscriptions are still active after reconnection
      await new Promise((r) => setTimeout(r, 100));
      assertEquals(eventCount1, 2); // Events received after reconnection
      assertEquals(eventCount2, 2);

      // Clean up
      await transport.close();
    });

    await t.step("handles resubscription errors gracefully", async () => {
      // Setup
      const transport = new WebSocketTransport({
        url: "ws://localhost:8080/?test=subscribe-delay",
        reconnect: { maxRetries: 1, reconnectionDelay: 100 },
      });
      await transport.ready();

      // Test
      const payload = { channel: "test", extra: "data" };
      const sub = await transport.subscribe("test", payload, () => {});

      transport.socket.close(undefined, undefined, false);
      await transport.ready();
      await transport.close();

      await new Promise((r) => setTimeout(r, 1000));
      assert(sub.resubscribeSignal?.aborted, "Resubscribe signal should be aborted");

      // Clean up
      await transport.close();
    });

    await t.step("does not resubscribe and clears subscriptions on connection close", async () => {
      // Setup
      const transport = new WebSocketTransport({
        url: "ws://localhost:8080/?test=subscribe-success",
        resubscribe: false,
        reconnect: { maxRetries: 1, reconnectionDelay: 100 },
      }) as TransportWithInternals;
      await transport.ready();

      // Test
      // Subscribe to multiple events
      const payload1 = { channel: "test1", extra: "data1" };
      const payload2 = { channel: "test2", extra: "data2" };
      let eventCount1 = 0;
      let eventCount2 = 0;
      const listener1 = () => eventCount1++;
      const listener2 = () => eventCount2++;

      await transport.subscribe("test1", payload1, listener1);
      await transport.subscribe("test2", payload2, listener2);
      await new Promise((r) => setTimeout(r, 100));
      assertEquals(eventCount1, 1); // Initial events received
      assertEquals(eventCount2, 1);
      assertEquals(transport._subscriptions.size, 2);

      // Simulate connection loss
      transport.socket.close(undefined, undefined, false);
      await new Promise((r) => setTimeout(r, 100));

      // Check that subscriptions are cleared and no resubscription happens
      assertEquals(transport._subscriptions.size, 0);

      // Wait for potential reconnection and verify no new events
      await transport.ready();
      await new Promise((r) => setTimeout(r, 100));
      assertEquals(eventCount1, 1); // No new events after reconnection
      assertEquals(eventCount2, 1);

      // Clean up
      await transport.close();
    });
  });

  await server.shutdown();
});
