import test from "node:test";
import assert from "node:assert";
import { WebSocketServer } from "ws";
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

test("WebSocketTransport", async (t) => {
  const server = await createNodeTestServer(8080);

  await t.test("request()", async (t) => {
    await t.test("Send post request and resolves with server response", async () => {
      // Setup
      const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
      await transport.ready();

      // Test
      const result = await transport.request("info", { key: "value" });
      assert.strictEqual(result, "response-success");

      // Clean up
      await transport.close();
    });

    await t.test("Reject", async (t) => {
      await t.test("Reject an unsuccessful request", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-fail" });
        await transport.ready();

        // Test
        const promise = transport.request("info", { key: "value" });
        await assert.rejects(
          () => promise,
          (e) => e instanceof WebSocketRequestError && e.message.includes("Request failed:"),
        );

        // Clean up
        await transport.close();
      });

      await t.test("Reject if AbortSignal is aborted", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
        await transport.ready();

        // Test
        const signal = AbortSignal.abort(new Error("Aborted"));
        const promise = transport.request("info", { key: "value" }, signal);
        await assert.rejects(
          () => promise,
          (e) => e instanceof WebSocketRequestError && e.cause instanceof Error && e.cause.message === "Aborted",
        );

        // Clean up
        await transport.close();
      });

      await t.test("Reject after timeout expires", async () => {
        // Setup
        const transport = new WebSocketTransport({
          url: "ws://localhost:8080/?test=request-timeout",
          timeout: 100,
        });
        await transport.ready();

        // Test
        const promise = transport.request("info", { key: "value" });
        await assert.rejects(
          () => promise,
          (e) =>
            e instanceof WebSocketRequestError &&
            e.cause instanceof DOMException &&
            e.cause.message === "signal timed out",
        );

        // Clean up
        await transport.close();
      });

      await t.test("If timeout is not set, never reject", async () => {
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
  await t.test("subscribe()", async (t) => {
    await t.test(
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
        assert.strictEqual(eventReceived, true);

        // Check that the subscription was removed
        await sub.unsubscribe();
        await new Promise((r) => setTimeout(r, 100));
        assert(transport._subscriptions.size === 0);

        // Clean up
        await transport.close();
      },
    );

    await t.test(
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

        assert.strictEqual(transport._subscriptions.size, 1);
        assert.strictEqual(transport._subscriptions.get(JSON.stringify(payload))?.listeners.size, 1);

        // Clean up
        await transport.close();
      },
    );

    await t.test(
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

        assert.strictEqual(transport._subscriptions.size, 1);
        assert.strictEqual(transport._subscriptions.get(JSON.stringify(payload))?.listeners.size, 2);

        // Clean up
        await transport.close();
      },
    );

    await t.test(
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

        assert.strictEqual(sub1.unsubscribe, sub2.unsubscribe);

        // Clean up
        await transport.close();
      },
    );

    await t.test(
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

        assert.strictEqual(transport._wsRequester.queue.length, 1);

        // Clean up
        await transport.close();
      },
    );

    await t.test(
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
        assert(!secondCompleted);

        // Now wait for the first subscription to complete
        await subPromise1;
        await new Promise((r) => setTimeout(r, 10));
        assert(secondCompleted);

        // Clean up
        await transport.close();
      },
    );
  });

  await t.test("unsubscribe()", async (t) => {
    await t.test("Unsubscribe a listener, request to be unsubscribed and clear resources", async () => {
      // Setup
      const transport = new WebSocketTransport({
        url: "ws://localhost:8080/?test=unsubscribe-success",
      }) as TransportWithInternals;
      await transport.ready();

      // Test
      const sub = await transport.subscribe("test", { channel: "test" }, () => {});
      await sub.unsubscribe();
      assert(transport._subscriptions.size === 0);

      // Clean up
      await transport.close();
    });

    await t.test("Do not send an unsubscribe request if there are more listeners", async () => {
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
      assert.strictEqual(transport._subscriptions.get(JSON.stringify(payload))?.listeners.size, 1);

      // Clean up
      await transport.close();
    });
  });

  await t.test("ready()", async (t) => {
    await t.test("Resolve immediately if the socket is already open", async () => {
      // Setup
      const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
      await transport.ready();

      // Test
      const start = performance.now();
      await transport.ready();
      const dur = performance.now() - start;
      assert(dur < 20, `ready() again should resolve immediately, took ${dur}ms`);

      // Clean up
      await transport.close();
    });

    await t.test("AbortSignal check", async (t) => {
      await t.test("Reject immediately if the signal has already been aborted", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });

        // Test
        const alreadyAborted = AbortSignal.abort(new Error("Already aborted"));
        const promise = transport.ready(alreadyAborted);
        await assert.rejects(
          () => promise,
          (e) => e instanceof Error && e.message === "Already aborted",
        );

        // Clean up
        await transport.close();
      });

      await t.test("Reject if the signal is later aborted", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });

        // Test
        const controller = new AbortController();
        const promise = transport.ready(controller.signal);
        controller.abort(new Error("Aborted later"));

        await assert.rejects(
          () => promise,
          (e) => e instanceof Error && e.message === "Aborted later",
        );

        // Clean up
        await transport.close();
      });
    });

    await t.test("Reject if the connection is permanently closed", async () => {
      // Setup
      const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });

      // Test
      await transport.close();
      const promise = transport.ready();
      await assert.rejects(
        () => promise,
        (e) => e instanceof Error && e.message.includes("TERMINATED_BY_USER"),
      );
    });
  });

  await t.test("close()", async (t) => {
    await t.test("Resolve immediately if the socket is already closed", async () => {
      // Setup
      const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
      await transport.ready();
      await transport.close();

      // Test
      const start = performance.now();
      await transport.close();
      const dur = performance.now() - start;
      assert(dur < 20, `close() again should resolve immediately, took ${dur}ms`);
    });

    await t.test("AbortSignal check", async (t) => {
      await t.test("Reject immediately if the signal has already been aborted", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
        await transport.ready();

        // Test
        const aborted = AbortSignal.abort(new Error("Already aborted close"));
        const promise = transport.close(aborted);
        await assert.rejects(
          () => promise,
          (e) => e instanceof Error && e.message === "Already aborted close",
        );

        // Clean up
        await transport.close();
      });

      await t.test("Reject if the signal is later aborted", async () => {
        // Setup
        const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
        await transport.ready();

        // Test
        const controller = new AbortController();
        const promise = transport.close(controller.signal);
        controller.abort(new Error("Close aborted"));

        await assert.rejects(
          () => promise,
          (e) => e instanceof Error && e.message === "Close aborted",
        );

        // Clean up
        await transport.close();
      });
    });
  });

  await t.test("keepAlive", async (t) => {
    await t.test("Send ping messages after connection open", async () => {
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

    await t.test("Stops sending ping messages after closing", async () => {
      // Setup
      const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=ping" }) as TransportWithInternals;
      await transport.ready();

      // Test
      assert(transport._keepAliveTimeout);
      await transport.close();
      assert(!transport._keepAliveTimeout);
    });
  });

  await t.test("autoResubscribe", async (t) => {
    await t.test("automatically resubscribes after reconnection", async () => {
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
      assert.strictEqual(eventCount1, 1); // Initial events received
      assert.strictEqual(eventCount2, 1);

      // Simulate connection loss and reconnection
      transport.socket.close(undefined, undefined, false);
      await transport.ready();

      // Check that subscriptions are still active after reconnection
      await new Promise((r) => setTimeout(r, 100));
      assert.strictEqual(eventCount1, 2); // Events received after reconnection
      assert.strictEqual(eventCount2, 2);

      // Clean up
      await transport.close();
    });

    await t.test("handles resubscription errors gracefully", async () => {
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
      assert(sub.resubscribeSignal?.aborted);

      // Clean up
      await transport.close();
    });

    await t.test("does not resubscribe and clears subscriptions on connection close", async () => {
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
      assert.strictEqual(eventCount1, 1); // Initial events received
      assert.strictEqual(eventCount2, 1);
      assert.strictEqual(transport._subscriptions.size, 2);

      // Simulate connection loss
      transport.socket.close(undefined, undefined, false);
      await new Promise((r) => setTimeout(r, 100));

      // Check that subscriptions are cleared and no resubscription happens
      assert.strictEqual(transport._subscriptions.size, 0);

      // Wait for potential reconnection and verify no new events
      await transport.ready();
      await new Promise((r) => setTimeout(r, 100));
      assert.strictEqual(eventCount1, 1); // No new events after reconnection
      assert.strictEqual(eventCount2, 1);

      // Clean up
      await transport.close();
    });
  });

  await server.shutdown();
});
