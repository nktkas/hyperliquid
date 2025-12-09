// deno-lint-ignore-file no-import-prefix
import { assertEquals, assertIsError, assertLess, assertRejects } from "jsr:@std/assert@1";
import { WebSocketTransport } from "@nktkas/hyperliquid";

// ============================================================
// Helpers
// ============================================================

class DisposeWebSocketTransport extends WebSocketTransport {
  async [Symbol.asyncDispose]() {
    await this.close();
  }
}

/** Creates a transport with the test server URL. */
function createTransport(testCase: string, options?: Partial<ConstructorParameters<typeof WebSocketTransport>[0]>) {
  return new DisposeWebSocketTransport({
    url: `ws://localhost:8080/?test=${testCase}`,
    ...options,
  });
}

// ============================================================
// Test Server
// ============================================================

function createTestServer() {
  const server = Deno.serve(
    { port: 8080, onListen: () => {} },
    (request) => {
      if (request.headers.get("upgrade") !== "websocket") {
        return new Response(null, { status: 501 });
      }

      const url = new URL(request.url);
      const testCase = url.searchParams.get("test");

      const { socket, response } = Deno.upgradeWebSocket(request);
      socket.addEventListener("message", (e) => {
        const send = (payload: unknown) => socket.send(JSON.stringify(payload));
        const data = JSON.parse(e.data);

        if (data.method === "post") {
          if (testCase === "request-fail") {
            send({
              channel: "error",
              data: "Request failed: " + JSON.stringify(data),
            });
          } else if (testCase === "request-timeout") {
            // Do nothing
          } else if (testCase === "request-delay") {
            setTimeout(() => {
              send({
                channel: "post",
                data: { id: data.id, response: { type: "info", payload: { data: "very-late-response" } } },
              });
            }, data.request.delay);
          } else {
            send({
              channel: "post",
              data: { id: data.id, response: { type: "info", payload: { data: "response-success" } } },
            });
          }
        } else if (data.method === "ping") {
          send({ channel: "pong" });
        } else if (data.method === "subscribe") {
          send({
            channel: "subscriptionResponse",
            data: { method: "subscribe", subscription: data.subscription },
          });

          const eventChannel = (data.subscription && data.subscription.channel) || "test-channel";
          send({ channel: eventChannel, data: { update: "subscription update" } });
        } else if (data.method === "unsubscribe") {
          send({
            channel: "subscriptionResponse",
            data: { method: "unsubscribe", subscription: data.subscription },
          });
        }
      });
      return response;
    },
  );
  return {
    async [Symbol.asyncDispose]() {
      await server.shutdown();
    },
  };
}

// ============================================================
// Tests
// ============================================================

Deno.test("WebSocketTransport", async (t) => {
  await using _server = createTestServer();

  await t.step("request() sends request and receives response", async () => {
    await using transport = createTransport("request-success");
    await transport.ready();

    const result = await transport.request("info", { key: "value" });
    assertEquals(result, "response-success");
  });

  await t.step("subscription() subscribes, receives event, unsubscribes", async () => {
    await using transport = createTransport("request-success");
    await transport.ready();

    const channel = "test-channel";
    const payload = { channel, foo: "bar" };

    let received: unknown;
    const eventPromise = new Promise<void>((resolve) => {
      // Listener resolves promise on first event
      transport.subscribe(channel, payload, (e) => {
        received = e.detail;
        resolve();
      });
    });

    const subscription = await transport.subscribe(channel, payload, () => {});
    await eventPromise;

    assertEquals(received, { update: "subscription update" });

    await subscription.unsubscribe();
  });

  await t.step("ready()", async (t) => {
    await t.step("resolves immediately if already open", async () => {
      await using transport = createTransport("request-success");
      await transport.ready();

      const start = performance.now();
      await transport.ready();
      assertLess(performance.now() - start, 20);
    });

    await t.step("rejects if already aborted", async () => {
      await using transport = createTransport("request-success");

      const signal = AbortSignal.abort(new Error("Already aborted"));
      const error = await assertRejects(() => transport.ready(signal), Error);
      assertIsError(error.cause, Error, "Already aborted");
    });

    await t.step("rejects if aborted later", async () => {
      await using transport = createTransport("request-success");

      const controller = new AbortController();
      const promise = transport.ready(controller.signal);
      controller.abort(new Error("Aborted later"));

      const error = await assertRejects(() => promise, Error);
      assertIsError(error.cause, Error, "Aborted later");
    });

    await t.step("rejects if connection is closed", async () => {
      await using transport = createTransport("request-success");
      await transport.close();

      const error = await assertRejects(() => transport.ready(), Error);
      assertIsError(error.cause, Error, "TERMINATED_BY_USER");
    });
  });

  await t.step("close()", async (t) => {
    await t.step("resolves immediately if already closed", async () => {
      await using transport = createTransport("request-success");
      await transport.ready();
      await transport.close();

      const start = performance.now();
      await transport.close();
      assertLess(performance.now() - start, 20);
    });

    await t.step("rejects if already aborted", async () => {
      await using transport = createTransport("request-success");
      await transport.ready();

      const signal = AbortSignal.abort(new Error("Already aborted"));
      const error = await assertRejects(() => transport.close(signal), Error);
      assertIsError(error.cause, Error, "Already aborted");
    });

    await t.step("rejects if aborted later", async () => {
      await using transport = createTransport("request-success");
      await transport.ready();

      const controller = new AbortController();
      const promise = transport.close(controller.signal);
      controller.abort(new Error("Aborted later"));

      const error = await assertRejects(() => promise, Error);
      assertIsError(error.cause, Error, "Aborted later");
    });
  });
});
