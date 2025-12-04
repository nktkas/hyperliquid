// deno-lint-ignore-file no-import-prefix
import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import type { ReconnectingWebSocket } from "@nktkas/rews";
import { WebSocketAsyncRequest, WebSocketRequestError } from "../../../src/transport/websocket/_postRequest.ts";
import { HyperliquidEventTarget } from "../../../src/transport/websocket/_hyperliquidEventTarget.ts";

// ============================================================
// Helpers
// ============================================================

// @ts-expect-error: Mocking WebSocket for testing purposes
class MockWebSocket extends EventTarget implements ReconnectingWebSocket {
  sentMessages: string[] = [];
  readyState = WebSocket.CONNECTING;
  terminationController = new AbortController();
  terminationSignal = this.terminationController.signal;

  send(data: string): void {
    this.sentMessages.push(data);
  }

  close(): void {
    this.readyState = WebSocket.CLOSED;
    this.dispatchEvent(new CloseEvent("close"));
  }

  error(): void {
    this.dispatchEvent(new Event("error"));
  }

  terminate(reason?: unknown): void {
    this.terminationController.abort(reason);
  }

  mockMessage(data: unknown): void {
    this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(data) }));
  }
}

/** Creates a new WebSocketAsyncRequest with mock socket. */
function createRequester(): {
  socket: MockWebSocket;
  requester: WebSocketAsyncRequest;
} {
  const socket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
  const hlEvents = new HyperliquidEventTarget(socket);
  const requester = new WebSocketAsyncRequest(socket, hlEvents);
  return { socket, requester };
}

/** Gets the last sent message as parsed JSON. */
function getLastSent(socket: MockWebSocket): Record<string, unknown> {
  return JSON.parse(socket.sentMessages[socket.sentMessages.length - 1]);
}

// ============================================================
// Test Data
// ============================================================

const RESPONSES = {
  info: (id: number, data: unknown) => ({
    channel: "post",
    data: { id, response: { type: "info", payload: { data } } },
  }),
  action: (id: number, payload: unknown) => ({
    channel: "post",
    data: { id, response: { type: "action", payload } },
  }),
  error: (id: number, message: string) => ({
    channel: "post",
    data: { id, response: { type: "error", payload: message } },
  }),
  subscriptionResponse: (method: string, subscription: unknown) => ({
    channel: "subscriptionResponse",
    data: { method, subscription },
  }),
  errorChannel: (message: string) => ({
    channel: "error",
    data: message,
  }),
  pong: () => ({
    channel: "pong",
  }),
} as const;

// ============================================================
// Tests
// ============================================================

Deno.test("WebSocketAsyncRequest", async (t) => {
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
        await assertRejects(() => promise, WebSocketRequestError, "Operation failed");
      });

      await t.step("rejects on error channel", async () => {
        const { socket, requester } = createRequester();

        const promise = requester.request("post", { test: true });
        const sent = getLastSent(socket);

        socket.mockMessage(RESPONSES.errorChannel(`Something failed: {"id":${sent.id}}`));
        await assertRejects(() => promise, WebSocketRequestError);
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

      await t.step("rejects on Invalid subscription", async () => {
        const { socket, requester } = createRequester();
        const payload = { channel: "invalid", param: "test" };

        const promise = requester.request("subscribe", payload);
        const errorMsg = `Invalid subscription: ${JSON.stringify(payload)}`;

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
    });

    await t.step("ping", async () => {
      const { socket, requester } = createRequester();

      const promise = requester.request("ping");
      const sent = getLastSent(socket);

      assertEquals(sent.method, "ping");

      socket.mockMessage(RESPONSES.pong());
      await promise;
    });

    await t.step("connection close", async () => {
      const { socket, requester } = createRequester();

      const p1 = requester.request("post", { foo: "bar1" });
      const p2 = requester.request("subscribe", { sub: "bar2" });

      socket.close();

      await assertRejects(() => p1, WebSocketRequestError, "WebSocket connection closed.");
      await assertRejects(() => p2, WebSocketRequestError, "WebSocket connection closed.");
    });

    await t.step("connection error", async () => {
      const { socket, requester } = createRequester();

      const promise = requester.request("post", { foo: "bar" });

      socket.error();

      await assertRejects(() => promise, WebSocketRequestError, "WebSocket connection closed.");
    });

    await t.step("rejects if permanently closed", async () => {
      const { socket, requester } = createRequester();

      socket.terminate(new Error("Permanently closed"));

      await assertRejects(() => requester.request("post", { foo: "bar" }), Error, "Permanently closed");
    });

    await t.step("AbortSignal", async (t) => {
      await t.step("rejects if aborted before call", async () => {
        const { requester } = createRequester();

        const controller = new AbortController();
        controller.abort(new Error("Aborted pre-emptively"));

        const promise = requester.request("post", { foo: "bar" }, controller.signal);
        await assertRejects(() => promise, Error, "Aborted pre-emptively");
      });

      await t.step("rejects if aborted after sending", async () => {
        const { socket, requester } = createRequester();

        const controller = new AbortController();
        const promise = requester.request("post", { foo: "bar" }, controller.signal);
        assertEquals(socket.sentMessages.length, 1);

        controller.abort(new Error("Aborted after sending"));
        await assertRejects(() => promise, Error, "Aborted after sending");
      });
    });
  });

  await t.step("requestToId()", () => {
    const input = {
      Z: "0xABC123",
      boolVal: true,
      textVal: "SOME Text Not Hex",
      nested: {
        aNumber: 123,
        hexString: "0xFFFfFf",
        randomStr: "NotHex0123",
      },
      arr: [10, "0xF00D", false],
    };

    const result = JSON.parse(WebSocketAsyncRequest.requestToId(input));

    // Keys sorted alphabetically
    assertEquals(Object.keys(result), ["Z", "arr", "boolVal", "nested", "textVal"]);

    // Hex strings lowercased
    assertEquals(result.Z, "0xabc123");
    assertEquals(result.arr[1], "0xf00d");
    assertEquals(result.nested.hexString, "0xffffff");

    // Non-hex unchanged
    assertEquals(result.boolVal, true);
    assertEquals(result.textVal, "SOME Text Not Hex");
    assertEquals(result.nested.aNumber, 123);
    assertEquals(result.nested.randomStr, "NotHex0123");
  });

  await t.step("invalid JSON in error channel is ignored", async () => {
    const { socket, requester } = createRequester();

    const promise = requester.request("post", { test: "jsonErrorIgnore" });
    const sent = getLastSent(socket);

    // Invalid JSON in error - should be ignored
    socket.mockMessage(RESPONSES.errorChannel(`Something failed: {"id":${sent.id}, 12312312312}`));

    // Valid response should still work
    socket.mockMessage(RESPONSES.info(sent.id as number, "Success"));
    assertEquals(await promise, "Success");
  });
});
