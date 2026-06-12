// deno-lint-ignore-file no-import-prefix

/**
 * Tests for the WebSocket request dispatcher: request/response matching,
 * server error parsing, and queueing across reconnects.
 * @module
 */

import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import { ReconnectingWebSocket } from "@nktkas/rews";
import { WebSocketDispatcher, WebSocketRequestError } from "../../../src/transport/websocket/_dispatcher.ts";
import { HyperliquidEventTarget } from "../../../src/transport/websocket/_events.ts";
import { getLastSent, MockWebSocket, RESPONSES } from "./_mock.ts";

// =============================================================================
// Helpers
// =============================================================================

/** Creates a new WebSocketDispatcher with mock socket. */
function createRequester(timeout: number | null = 10_000): {
  socket: MockWebSocket;
  requester: WebSocketDispatcher;
} {
  const socket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
  const hlEvents = new HyperliquidEventTarget(socket);
  const requester = new WebSocketDispatcher(socket, hlEvents, timeout);
  return { socket, requester };
}

// =============================================================================
// Tests
// =============================================================================

Deno.test("WebSocketDispatcher", async (t) => {
  await t.step("request()", async (t) => {
    await t.step("post", async (t) => {
      await t.step("sends request and receives info response", async () => {
        const { socket, requester } = createRequester();

        const promise = requester.request("post", { foo: "bar" });
        const sent = getLastSent(socket);

        assertEquals(sent.method, "post");
        assertEquals(typeof sent.id, "number");
        assertEquals((sent.request as Record<string, unknown>).foo, "bar");

        socket.mockMessage(RESPONSES.info(sent.id as number, "TestData"));
        assertEquals(await promise, "TestData");
      });

      await t.step("receives action response", async () => {
        const { socket, requester } = createRequester();

        const promise = requester.request("post", { test: "action" });
        const sent = getLastSent(socket);

        socket.mockMessage(RESPONSES.action(sent.id as number, { action: "DoAction" }));
        assertEquals(await promise, { action: "DoAction" });
      });

      await t.step("rejects on error response", async () => {
        const { socket, requester } = createRequester();

        const promise = requester.request("post", { test: true });
        const sent = getLastSent(socket);

        socket.mockMessage(RESPONSES.error(sent.id as number, "Operation failed"));
        const err = await assertRejects(() => promise, WebSocketRequestError, "Operation failed");
        assertEquals((err as WebSocketRequestError).request, { test: true });
      });

      await t.step("rejects on error channel", async () => {
        const { socket, requester } = createRequester();

        const promise = requester.request("post", { test: true });
        const sent = getLastSent(socket);

        socket.mockMessage(RESPONSES.errorChannel(`Something failed: {"id":${sent.id}}`));
        await assertRejects(() => promise, WebSocketRequestError);
      });

      await t.step("rejects by the trailing id of a body-less error", async () => {
        const { socket, requester } = createRequester();

        const promise = requester.request("post", { test: true });
        const sent = getLastSent(socket);

        socket.mockMessage(RESPONSES.errorChannel(`too many pending post requests id=${sent.id}`));
        await assertRejects(() => promise, WebSocketRequestError, "too many pending post requests");
      });
    });

    await t.step("subscribe/unsubscribe", async (t) => {
      await t.step("sends subscription and receives response", async () => {
        const { socket, requester } = createRequester();
        const payload = { channel: "test-sub", param: "XYZ" };

        const promise = requester.request("subscribe", payload);
        const sent = getLastSent(socket);
        assertEquals(sent.method, "subscribe");

        socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
        const result = await promise as Record<string, unknown>;
        assertEquals(result.method, "subscribe");
        assertEquals(result.subscription, payload);
      });

      await t.step("rejects on subscription error", async () => {
        const { socket, requester } = createRequester();
        const payload = { channel: "test", param: "test" };

        const promise = requester.request("subscribe", payload);
        const errorMsg = `Something failed: {"method":"subscribe","subscription":${JSON.stringify(payload)}}`;

        socket.mockMessage(RESPONSES.errorChannel(errorMsg));
        await assertRejects(() => promise, WebSocketRequestError, errorMsg);
      });

      await t.step("rejects on Already subscribed", async () => {
        const { socket, requester } = createRequester();
        const payload = { channel: "test", param: "test" };

        const promise = requester.request("subscribe", payload);
        const errorMsg = `Already subscribed: ${JSON.stringify(payload)}`;

        socket.mockMessage(RESPONSES.errorChannel(errorMsg));
        await assertRejects(() => promise, WebSocketRequestError, errorMsg);
      });

      await t.step("rejects when the echo carries server-added fields", async () => {
        const { socket, requester } = createRequester();
        const payload = { type: "userFills", user: "0xabc" };

        const promise = requester.request("subscribe", payload);
        const echoed = JSON.stringify({ type: "userFills", user: "0xabc", aggregateByTime: false });

        socket.mockMessage(RESPONSES.errorChannel(`Already subscribed: ${echoed}`));
        await assertRejects(() => promise, WebSocketRequestError, "Already subscribed");
      });

      await t.step("rejects on Invalid subscription", async () => {
        const { socket, requester } = createRequester();
        const payload = { channel: "invalid", param: "test" };

        const promise = requester.request("subscribe", payload);
        const errorMsg = `Invalid subscription ${JSON.stringify(payload)}`;

        socket.mockMessage(RESPONSES.errorChannel(errorMsg));
        await assertRejects(() => promise, WebSocketRequestError, errorMsg);
      });

      await t.step("rejects on Already unsubscribed", async () => {
        const { socket, requester } = createRequester();
        const payload = { channel: "test", param: "test" };

        const promise = requester.request("unsubscribe", payload);
        const errorMsg = `Already unsubscribed: ${JSON.stringify(payload)}`;

        socket.mockMessage(RESPONSES.errorChannel(errorMsg));
        await assertRejects(() => promise, WebSocketRequestError, errorMsg);
      });

      await t.step("an echo matches the most specific pending payload", async (t) => {
        await t.step("confirmation of the superset does not resolve the subset", async () => {
          const { socket, requester } = createRequester();
          const subset = { type: "l2Book", coin: "BTC" };
          const superset = { type: "l2Book", coin: "BTC", nSigFigs: 5 };

          const subsetPromise = requester.request("subscribe", subset);
          const supersetPromise = requester.request("subscribe", superset);

          socket.mockMessage(
            RESPONSES.subscriptionResponse("subscribe", { type: "l2Book", coin: "BTC", nSigFigs: 5, mantissa: null }),
          );
          const supersetResult = await supersetPromise as Record<string, unknown>;
          assertEquals((supersetResult.subscription as Record<string, unknown>).nSigFigs, 5);

          socket.mockMessage(
            RESPONSES.subscriptionResponse("subscribe", {
              type: "l2Book",
              coin: "BTC",
              nSigFigs: null,
              mantissa: null,
            }),
          );
          const subsetResult = await subsetPromise as Record<string, unknown>;
          assertEquals((subsetResult.subscription as Record<string, unknown>).nSigFigs, null);
        });

        await t.step("an error echo of the superset does not reject the subset", async () => {
          const { socket, requester } = createRequester();
          const subset = { type: "l2Book", coin: "BTC" };
          const superset = { type: "l2Book", coin: "BTC", nSigFigs: 999 };

          const subsetPromise = requester.request("subscribe", subset);
          const supersetPromise = requester.request("subscribe", superset);

          const echo = JSON.stringify({ method: "subscribe", subscription: superset });
          socket.mockMessage(RESPONSES.errorChannel(`Error parsing JSON into valid websocket request: ${echo}`));
          await assertRejects(() => supersetPromise, WebSocketRequestError);

          socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", subset));
          const result = await subsetPromise as Record<string, unknown>;
          assertEquals(result.method, "subscribe");
        });
      });
    });

    await t.step("connection close", async () => {
      const { socket, requester } = createRequester();

      const p1 = requester.request("post", { foo: "bar1" });
      const p2 = requester.request("subscribe", { sub: "bar2" });

      socket.disconnect();

      await assertRejects(() => p1, WebSocketRequestError, "WebSocket connection closed");
      await assertRejects(() => p2, WebSocketRequestError, "WebSocket connection closed");
    });

    await t.step("connection error", async () => {
      const { socket, requester } = createRequester();

      const promise = requester.request("post", { foo: "bar" });

      socket.error();

      await assertRejects(() => promise, WebSocketRequestError, "WebSocket connection closed");
    });

    await t.step("queues the request until the connection opens", async () => {
      const { socket, requester } = createRequester();
      socket.readyState = ReconnectingWebSocket.CONNECTING;

      const promise = requester.request("post", { foo: "bar" });
      assertEquals(socket.sentMessages.length, 0);

      socket.open();
      assertEquals(socket.sentMessages.length, 1);

      socket.mockMessage(RESPONSES.info(getLastSent(socket).id as number, "late-open"));
      assertEquals(await promise, "late-open");
    });

    await t.step("a queued request cannot reach the server after a disconnect", async () => {
      const { socket, requester } = createRequester();
      socket.readyState = ReconnectingWebSocket.CONNECTING;

      const promise = requester.request("post", { foo: "bar" });
      socket.disconnect();
      await assertRejects(() => promise, WebSocketRequestError, "closed before the request was sent");

      socket.open();
      assertEquals(socket.sentMessages.length, 0);
    });

    await t.step("rejects if permanently closed", async () => {
      const { socket, requester } = createRequester();

      socket.terminate(new Error("Permanently closed"));

      const err = await assertRejects(
        () => requester.request("post", { foo: "bar" }),
        WebSocketRequestError,
        "WebSocket connection permanently terminated",
      );
      assertEquals(err.cause, socket.terminationSignal.reason);
    });

    await t.step("rejects an in-flight request when permanently closed", async () => {
      const { socket, requester } = createRequester();

      const promise = requester.request("post", { foo: "bar" });
      socket.terminate(new Error("Permanently closed"));

      const err = await assertRejects(
        () => promise,
        WebSocketRequestError,
        "WebSocket connection permanently terminated",
      );
      assertEquals(err.cause, socket.terminationSignal.reason);
    });

    await t.step("AbortSignal", async (t) => {
      await t.step("rejects if aborted before call", async () => {
        const { requester } = createRequester();

        const controller = new AbortController();
        controller.abort(new Error("Aborted pre-emptively"));

        const promise = requester.request("post", { foo: "bar" }, controller.signal);
        const err = await assertRejects(() => promise, WebSocketRequestError, "Request aborted");
        assertEquals((err.cause as Error).message, "Aborted pre-emptively");
      });

      await t.step("rejects if aborted after sending", async () => {
        const { socket, requester } = createRequester();

        const controller = new AbortController();
        const promise = requester.request("post", { foo: "bar" }, controller.signal);
        assertEquals(socket.sentMessages.length, 1);

        controller.abort(new Error("Aborted after sending"));
        const err = await assertRejects(() => promise, WebSocketRequestError, "Request aborted");
        assertEquals((err.cause as Error).message, "Aborted after sending");
      });

      await t.step("an aborted queued request is never flushed on open", async () => {
        const { socket, requester } = createRequester();
        socket.readyState = ReconnectingWebSocket.CONNECTING;

        const controller = new AbortController();
        const promise = requester.request("post", { foo: "bar" }, controller.signal);
        controller.abort(new Error("changed my mind"));
        socket.open();

        assertEquals(socket.sentMessages.length, 0);
        await assertRejects(() => promise, WebSocketRequestError, "Request aborted");
      });

      await t.step("rejects after timeout expires", async () => {
        const { requester } = createRequester(30);

        const promise = requester.request("post", { foo: "bar" });

        const err = await assertRejects(() => promise, WebSocketRequestError, "Request timed out after 30 ms");
        assertEquals((err.cause as Error)?.name, "TimeoutError");
      });

      await t.step("timeout: 0 expires immediately", async () => {
        const { requester } = createRequester(0);

        const promise = requester.request("post", { foo: "bar" });

        await assertRejects(() => promise, WebSocketRequestError, "Request timed out after 0 ms");
      });

      await t.step("timeout: null disables timeout", async () => {
        const { socket, requester } = createRequester(null);

        const promise = requester.request("post", { foo: "bar" });
        const sent = getLastSent(socket);

        setTimeout(() => {
          socket.mockMessage(RESPONSES.info(sent.id as number, "late-success"));
        }, 50);

        assertEquals(await promise, "late-success");
      });

      await t.step("timeout: Infinity never fires", async () => {
        const { socket, requester } = createRequester(Infinity);

        const promise = requester.request("post", { foo: "bar" });
        const sent = getLastSent(socket);

        setTimeout(() => {
          socket.mockMessage(RESPONSES.info(sent.id as number, "late-success"));
        }, 50);

        assertEquals(await promise, "late-success");
      });

      await t.step("the timeout message reports the value the timer was armed with", async () => {
        const { requester } = createRequester(30);

        const promise = requester.request("post", { foo: "bar" });
        requester.timeout = null;

        await assertRejects(() => promise, WebSocketRequestError, "Request timed out after 30 ms");
      });
    });

    await t.step("cleanup of a finished request keeps its duplicate pending", async () => {
      const { socket, requester } = createRequester();
      const payload = { channel: "x" };

      const p1 = requester.request("subscribe", payload);
      const controller = new AbortController();
      const p2 = requester.request("subscribe", payload, controller.signal);

      controller.abort(new Error("cancel the duplicate"));
      await assertRejects(() => p2, WebSocketRequestError, "Request aborted");

      socket.mockMessage(RESPONSES.subscriptionResponse("subscribe", payload));
      const result = await p1 as Record<string, unknown>;
      assertEquals(result.method, "subscribe");
    });
  });
});
