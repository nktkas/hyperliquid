import test from "node:test";
import assert from "node:assert";
import type { ReconnectingWebSocket } from "@nktkas/rews";
import {
  WebSocketAsyncRequest,
  WebSocketRequestError,
} from "../../../src/transport/websocket/_websocket_async_request.ts";
import { HyperliquidEventTarget } from "../../../src/transport/websocket/_hyperliquid_event_target.ts";

// @ts-ignore: Mocking WebSocket for testing purposes
class MockWebSocket extends EventTarget implements ReconnectingWebSocket {
  sentMessages: string[] = [];
  readyState = WebSocket.CONNECTING;
  terminationSignal = new AbortController().signal;

  send(data: string): void {
    this.sentMessages.push(data);
  }

  close(): void {
    this.readyState = WebSocket.CLOSED;
    this.dispatchEvent(new CloseEvent("close"));
  }

  mockMessage(data: unknown): void {
    const event = new MessageEvent("message", { data: JSON.stringify(data) });
    this.dispatchEvent(event);
  }
}

test("WebSocketAsyncRequest", async (t) => {
  await t.test("request()", async (t) => {
    await t.test("method === post", async (t) => {
      await t.test("basic", async () => {
        const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
        const hlEvents = new HyperliquidEventTarget(mockSocket);
        const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

        // Check request
        const promise = wsRequester.request("post", { foo: "bar" });
        assert.strictEqual(mockSocket.sentMessages.length, 1);

        const sent = JSON.parse(mockSocket.sentMessages[0]);
        assert.strictEqual(sent.method, "post");
        assert.strictEqual(typeof sent.id, "number");
        assert.strictEqual(sent.request.foo, "bar");

        // Check response
        const mockMessage = {
          channel: "post",
          data: {
            id: sent.id,
            response: { type: "info", payload: { data: "SomeData" } },
          },
        };
        mockSocket.mockMessage(mockMessage);

        const result = await promise;
        assert.strictEqual(result, mockMessage.data.response.payload.data);
      });

      await t.test("type === info", async () => {
        const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
        const hlEvents = new HyperliquidEventTarget(mockSocket);
        const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

        const promise = wsRequester.request("post", { test: "info" });
        const sent = JSON.parse(mockSocket.sentMessages[0]);

        const response = {
          channel: "post",
          data: {
            id: sent.id,
            response: { type: "info", payload: { data: "InfoResponseData" } },
          },
        };
        mockSocket.mockMessage(response);

        const result = await promise;
        assert.strictEqual(result, "InfoResponseData");
      });

      await t.test("type === action", async () => {
        const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
        const hlEvents = new HyperliquidEventTarget(mockSocket);
        const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

        const promise = wsRequester.request("post", { test: "action" });
        const sent = JSON.parse(mockSocket.sentMessages[0]);

        const response = {
          channel: "post",
          data: {
            id: sent.id,
            response: { type: "action", payload: { action: "DoAction", params: { key: "value" } } },
          },
        };
        mockSocket.mockMessage(response);

        const result = await promise;
        assert.deepStrictEqual(result, { action: "DoAction", params: { key: "value" } });
      });
    });

    await t.test("method === subscribe", async () => {
      const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
      const hlEvents = new HyperliquidEventTarget(mockSocket);
      const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

      const payload = { channel: "test-sub", param: "XYZ" };

      // Check subscription request
      const promise = wsRequester.request("subscribe", payload);
      assert.strictEqual(mockSocket.sentMessages.length, 1);

      const sent = JSON.parse(mockSocket.sentMessages[0]);
      assert.strictEqual(sent.method, "subscribe");

      // Check response
      mockSocket.mockMessage({
        channel: "subscriptionResponse",
        data: {
          method: "subscribe",
          subscription: payload,
        },
      });

      const resolvedData = await promise as Record<string, unknown>;
      assert.strictEqual(resolvedData.method, "subscribe");
      assert.deepStrictEqual(resolvedData.subscription, payload);
    });

    await t.test("rejects", async (t) => {
      await t.test("method === post", async (t) => {
        await t.test("error in the `error` channel", async () => {
          const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
          const hlEvents = new HyperliquidEventTarget(mockSocket);
          const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

          const promise = wsRequester.request("post", { test: true });
          const sent = JSON.parse(mockSocket.sentMessages[0]);

          const mockMessage = {
            channel: "error",
            data: `Something failed: {"id":${sent.id}}`,
          };
          mockSocket.mockMessage(mockMessage);

          await assert.rejects(
            () => promise,
            (e) => e instanceof WebSocketRequestError && e.message === mockMessage.data,
          );
        });

        await t.test("error in the response payload", async () => {
          const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
          const hlEvents = new HyperliquidEventTarget(mockSocket);
          const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

          const promise = wsRequester.request("post", { test: true });
          const sent = JSON.parse(mockSocket.sentMessages[0]);

          const mockMessage = {
            channel: "post",
            data: {
              id: sent.id,
              response: { type: "error", payload: "Operation failed" },
            },
          };
          mockSocket.mockMessage(mockMessage);

          await assert.rejects(
            () => promise,
            (e) => e instanceof WebSocketRequestError && e.message === "Operation failed",
          );
        });
      });

      await t.test("method === subscription", async (t) => {
        await t.test("subscription error", async () => {
          const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
          const hlEvents = new HyperliquidEventTarget(mockSocket);
          const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

          const payload = { channel: "test", param: "test" };
          const promise = wsRequester.request("subscribe", payload);

          const mockMessage = {
            channel: "error",
            data: `Something failed: {"method":"subscribe","subscription":${JSON.stringify(payload)}}`,
          };
          mockSocket.mockMessage(mockMessage);

          await assert.rejects(
            () => promise,
            (e) => e instanceof WebSocketRequestError && e.message === mockMessage.data,
          );
        });

        await t.test("Already subscribed", async () => {
          const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
          const hlEvents = new HyperliquidEventTarget(mockSocket);
          const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

          const payload = { channel: "test", param: "test" };
          const promise = wsRequester.request("subscribe", payload);

          const mockMessage = {
            channel: "error",
            data: `Already subscribed: ${JSON.stringify(payload)}`,
          };
          mockSocket.mockMessage(mockMessage);

          await assert.rejects(
            () => promise,
            (e) => e instanceof WebSocketRequestError && e.message === mockMessage.data,
          );
        });

        await t.test("Invalid subscription", async () => {
          const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
          const hlEvents = new HyperliquidEventTarget(mockSocket);
          const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

          const payload = { channel: "invalid", param: "test" };
          const promise = wsRequester.request("subscribe", payload);

          const mockMessage = {
            channel: "error",
            data: `Invalid subscription: ${JSON.stringify(payload)}`,
          };
          mockSocket.mockMessage(mockMessage);

          await assert.rejects(
            () => promise,
            (e) => e instanceof WebSocketRequestError && e.message === mockMessage.data,
          );
        });

        await t.test("Already unsubscribed", async () => {
          const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
          const hlEvents = new HyperliquidEventTarget(mockSocket);
          const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

          const payload = { channel: "test", param: "test" };
          const promise = wsRequester.request("unsubscribe", payload);

          const mockMessage = {
            channel: "error",
            data: `Already unsubscribed: ${JSON.stringify(payload)}`,
          };
          mockSocket.mockMessage(mockMessage);

          await assert.rejects(
            () => promise,
            (e) => e instanceof WebSocketRequestError && e.message === mockMessage.data,
          );
        });
      });

      await t.test("rejects pending requests when WebSocket connection closes", async () => {
        const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
        const hlEvents = new HyperliquidEventTarget(mockSocket);
        const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

        const p1 = wsRequester.request("post", { foo: "bar1" });
        const p2 = wsRequester.request("subscribe", { sub: "bar2" });
        assert.strictEqual(mockSocket.sentMessages.length, 2);

        mockSocket.close();

        await assert.rejects(
          () => p1,
          (e) => e instanceof WebSocketRequestError && e.message === "WebSocket connection closed.",
        );
        await assert.rejects(
          () => p2,
          (e) => e instanceof WebSocketRequestError && e.message === "WebSocket connection closed.",
        );
      });

      await t.test("follows AbortSignal", async (t) => {
        await t.test("rejects immediately if aborted before call", async () => {
          const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
          const hlEvents = new HyperliquidEventTarget(mockSocket);
          const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

          const controller = new AbortController();
          controller.abort(new Error("Aborted pre-emptively"));

          const promise = wsRequester.request("post", { foo: "bar" }, controller.signal);

          await assert.rejects(
            () => promise,
            (e) => e instanceof Error && e.message === "Aborted pre-emptively",
          );
        });

        await t.test("rejects if aborted after sending request", async () => {
          const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
          const hlEvents = new HyperliquidEventTarget(mockSocket);
          const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

          const controller = new AbortController();
          const promise = wsRequester.request("post", { foo: "bar" }, controller.signal);
          assert.strictEqual(mockSocket.sentMessages.length, 1);

          controller.abort(new Error("Aborted after sending"));

          await assert.rejects(
            () => promise,
            (e) => e instanceof Error && e.message === "Aborted after sending",
          );
        });
      });
    });
  });

  await t.test("requestToId()", () => {
    /**
     * We'll confirm:
     * - Hex strings like '0xABC123' become '0xabc123'
     * - Keys get sorted in alphabetical order
     * - Arrays remain intact
     * - Non-hex strings, booleans, numbers, etc. remain identical
     */
    const complex = {
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

    const strId = WebSocketAsyncRequest.requestToId(complex);
    const parsed = JSON.parse(strId);

    // Keys should be sorted by ASCII: "Z" > "arr" > "boolVal" > "nested" > "textVal"
    assert.deepStrictEqual(Object.keys(parsed), ["Z", "arr", "boolVal", "nested", "textVal"]);

    // Check hex transformations
    assert.strictEqual(parsed.Z, "0xabc123");
    // The array's string element should also be lowercased if it's hex
    assert.strictEqual(parsed.arr[1], "0xf00d");
    // The nested hex should also be lowercased
    assert.strictEqual(parsed.nested.hexString, "0xffffff");

    // Non-hex data is unchanged
    assert(parsed.boolVal);
    assert.strictEqual(parsed.textVal, "SOME Text Not Hex");
    assert.strictEqual(parsed.nested.aNumber, 123);
    assert.strictEqual(parsed.nested.randomStr, "NotHex0123");
  });

  await t.test("invalid JSON messages are ignored", async () => {
    const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
    const hlEvents = new HyperliquidEventTarget(mockSocket);
    const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

    const promise = wsRequester.request("post", { test: "jsonErrorIgnore" });
    const sent = JSON.parse(mockSocket.sentMessages[0]);

    mockSocket.mockMessage({
      channel: "error",
      data: `Something failed: {"id":${sent.id}, 12312312312}`,
    });

    const validResponse = {
      channel: "post",
      data: {
        id: sent.id,
        response: { type: "info", payload: { data: "Success" } },
      },
    };
    mockSocket.mockMessage(validResponse);

    const result = await promise;
    assert.strictEqual(result, "Success");
  });
});
