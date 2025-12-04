// deno-lint-ignore-file no-import-prefix
import { assertEquals, assertIsError, assertLess, assertRejects } from "jsr:@std/assert@1";
import { WebSocketRequestError, WebSocketTransport } from "@nktkas/hyperliquid";

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
  return Deno.serve(
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
        }
      });
      return response;
    },
  );
}

// ============================================================
// Tests
// ============================================================

Deno.test("WebSocketTransport", async (t) => {
  const server = createTestServer();

  await t.step("request()", async (t) => {
    await t.step("sends request and receives response", async () => {
      await using transport = createTransport("request-success");
      await transport.ready();

      const result = await transport.request("info", { key: "value" });
      assertEquals(result, "response-success");
    });

    await t.step("rejects", async (t) => {
      await t.step("on unsuccessful request", async () => {
        await using transport = createTransport("request-fail");
        await transport.ready();

        await assertRejects(
          () => transport.request("info", { key: "value" }),
          WebSocketRequestError,
          "Request failed:",
        );
      });

      await t.step("if AbortSignal is aborted", async () => {
        await using transport = createTransport("request-success");
        await transport.ready();

        const signal = AbortSignal.abort(new Error("Aborted"));
        const error = await assertRejects(
          () => transport.request("info", { key: "value" }, signal),
          WebSocketRequestError,
        );
        assertIsError(error.cause, Error, "Aborted");
      });

      await t.step("after timeout expires", async () => {
        await using transport = createTransport("request-timeout", { timeout: 100 });
        await transport.ready();

        const error = await assertRejects(
          () => transport.request("info", { key: "value" }),
          WebSocketRequestError,
        );
        assertIsError(error.cause, DOMException, "Signal timed out.");
      });

      await t.step("timeout: null disables timeout", async () => {
        const defaultTimeout = await (async () => {
          await using t = createTransport("request-success");
          return t.timeout!;
        })();

        await using transport = createTransport("request-no-timeout", { timeout: null });
        await transport.ready();
        await transport.request("info", { delay: defaultTimeout * 1.5 });
      });
    });
  });

  await t.step("ready()", async (t) => {
    await t.step("resolves immediately if already open", async () => {
      await using transport = createTransport("request-success");
      await transport.ready();

      const start = performance.now();
      await transport.ready();
      assertLess(performance.now() - start, 20);
    });

    await t.step("AbortSignal", async (t) => {
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

    await t.step("AbortSignal", async (t) => {
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

  await server.shutdown();
  await new Promise((r) => setTimeout(r, 5000));
});
