// deno-lint-ignore-file no-import-prefix

/**
 * Integration tests for WebSocketTransport against a local WebSocket server
 * speaking the happy-path Hyperliquid protocol.
 * @module
 */

import { getEventListeners } from "node:events";
import { assert, assertEquals, assertLess, assertRejects } from "jsr:@std/assert@1";
import { WebSocketRequestError, WebSocketTransport } from "@nktkas/hyperliquid";

// =============================================================================
// Helpers
// =============================================================================

/** WebSocketTransport that closes itself at the end of an `await using` block. */
class DisposeWebSocketTransport extends WebSocketTransport {
  [Symbol.asyncDispose](): Promise<void> {
    this.close();
    return Promise.resolve();
  }
}

/** Creates a transport connected to the test server. */
function createTransport(url: string): DisposeWebSocketTransport {
  return new DisposeWebSocketTransport({ url });
}

// =============================================================================
// Test Server
// =============================================================================

/** Serves the happy-path Hyperliquid protocol on an ephemeral port. */
function createTestServer(): { url: string } & AsyncDisposable {
  const server = Deno.serve(
    { port: 0, onListen: () => {} },
    (request) => {
      if (request.headers.get("upgrade") !== "websocket") {
        return new Response(null, { status: 501 });
      }

      const { socket, response } = Deno.upgradeWebSocket(request);
      socket.addEventListener("message", (e) => {
        const send = (payload: unknown) => socket.send(JSON.stringify(payload));
        const data = JSON.parse(e.data);

        if (data.method === "post") {
          send({
            channel: "post",
            data: { id: data.id, response: { type: "info", payload: { data: `response:${data.request.type}` } } },
          });
        } else if (data.method === "ping") {
          send({ channel: "pong" });
        } else if (data.method === "drop") {
          socket.close();
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
    url: `ws://localhost:${server.addr.port}`,
    async [Symbol.asyncDispose](): Promise<void> {
      await server.shutdown();
    },
  };
}

// =============================================================================
// Tests
// =============================================================================

Deno.test("WebSocketTransport", async (t) => {
  await using server = createTestServer();

  await t.step("request() sends request and receives response", async () => {
    await using transport = createTransport(server.url);
    await transport.ready();

    const result = await transport.request("info", { key: "value" });
    assertEquals(result, "response:info");
  });

  await t.step("request() wraps the exchange endpoint as an action envelope", async () => {
    await using transport = createTransport(server.url);
    await transport.ready();

    const result = await transport.request("exchange", { key: "value" });
    assertEquals(result, "response:action");
  });

  await t.step("subscription() subscribes, receives event, unsubscribes", async () => {
    await using transport = createTransport(server.url);
    await transport.ready();

    const channel = "test-channel";
    const payload = { channel, foo: "bar" };

    let received: unknown;
    const { promise: eventPromise, resolve } = Promise.withResolvers<void>();
    const subscription = await transport.subscribe(channel, payload, (e) => {
      received = e.detail;
      resolve();
    });
    await eventPromise;

    assertEquals(received, { update: "subscription update" });

    await subscription.unsubscribe();
  });

  await t.step("ready()", async (t) => {
    await t.step("resolves immediately if already open", async () => {
      await using transport = createTransport(server.url);
      await transport.ready();

      const start = performance.now();
      await transport.ready();
      assertLess(performance.now() - start, 20);
    });

    await t.step("rejects if already aborted", async () => {
      await using transport = createTransport(server.url);

      const signal = AbortSignal.abort(new Error("Already aborted"));
      const error = await assertRejects(
        () => transport.ready(signal),
        WebSocketRequestError,
        "Waiting for the connection was aborted",
      );
      assertEquals(error.cause, signal.reason);
    });

    await t.step("rejects if aborted later", async () => {
      await using transport = createTransport(server.url);

      const controller = new AbortController();
      const promise = transport.ready(controller.signal);
      controller.abort(new Error("Aborted later"));

      const error = await assertRejects(
        () => promise,
        WebSocketRequestError,
        "Waiting for the connection was aborted",
      );
      assertEquals(error.cause, controller.signal.reason);
    });

    await t.step("rejects if connection is closed", async () => {
      await using transport = createTransport(server.url);
      transport.close();

      const error = await assertRejects(
        () => transport.ready(),
        WebSocketRequestError,
        "Failed to establish WebSocket connection",
      );
      assertEquals(error.cause, transport.socket.terminationSignal.reason);
    });

    await t.step("detaches its listeners once settled", async () => {
      await using transport = createTransport(server.url);

      const terminationBaseline = getEventListeners(transport.socket.terminationSignal, "abort").length;
      const openBaseline = getEventListeners(transport.socket, "open").length;

      const controller = new AbortController();
      await Promise.all(Array.from({ length: 100 }, () => transport.ready(controller.signal)));

      assertEquals(getEventListeners(transport.socket.terminationSignal, "abort").length, terminationBaseline);
      assertEquals(getEventListeners(transport.socket, "open").length, openBaseline);
    });
  });

  await t.step("close()", async (t) => {
    await t.step("is idempotent", async () => {
      await using transport = createTransport(server.url);
      await transport.ready();

      transport.close();
      transport.close();
      assert(transport.socket.terminationSignal.aborted);
    });

    await t.step("terminates when called from a close listener", async () => {
      await using transport = createTransport(server.url);
      await transport.ready();

      const { promise: dropped, resolve } = Promise.withResolvers<void>();
      transport.socket.addEventListener("close", () => {
        transport.close();
        resolve();
      }, { once: true });

      transport.socket.send('{"method":"drop"}');
      await dropped;
      assert(transport.socket.terminationSignal.aborted);
    });
  });
});
