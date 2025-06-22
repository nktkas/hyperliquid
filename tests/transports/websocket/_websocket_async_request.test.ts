import { assert, assertEquals, assertRejects } from "jsr:@std/assert@1";
import { WebSocketAsyncRequest } from "../../../src/transports/websocket/_websocket_async_request.ts";
import { HyperliquidEventTarget } from "../../../src/transports/websocket/_hyperliquid_event_target.ts";
import type { ReconnectingWebSocket } from "../../../src/transports/websocket/_reconnecting_websocket.ts";
import { WebSocketRequestError } from "../../../src/transports/websocket/websocket_transport.ts";

// @ts-ignore: Mocking WebSocket for testing purposes
class MockWebSocket extends EventTarget implements ReconnectingWebSocket {
    sentMessages: string[] = [];

    readyState: number = WebSocket.CONNECTING;

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

Deno.test("WebSocketAsyncRequest", async (t) => {
    await t.step("request()", async (t) => {
        await t.step("method === post", async (t) => {
            await t.step("basic", async () => {
                const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
                const hlEvents = new HyperliquidEventTarget(mockSocket);
                const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

                // Check request
                const promise = wsRequester.request("post", { foo: "bar" });
                assertEquals(mockSocket.sentMessages.length, 1);

                const sent = JSON.parse(mockSocket.sentMessages[0]);
                assertEquals(sent.method, "post");
                assertEquals(typeof sent.id, "number");
                assertEquals(sent.request.foo, "bar");

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
                assertEquals(result, mockMessage.data.response.payload.data);
            });

            await t.step("type === info", async () => {
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
                assertEquals(result, "InfoResponseData");
            });

            await t.step("type === action", async () => {
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
                assertEquals(result, { action: "DoAction", params: { key: "value" } });
            });
        });

        await t.step("method === subscribe", async () => {
            const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
            const hlEvents = new HyperliquidEventTarget(mockSocket);
            const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

            const payload = { channel: "test-sub", param: "XYZ" };

            // Check subscription request
            const promise = wsRequester.request("subscribe", payload);
            assertEquals(mockSocket.sentMessages.length, 1);

            const sent = JSON.parse(mockSocket.sentMessages[0]);
            assertEquals(sent.method, "subscribe");

            // Check response
            mockSocket.mockMessage({
                channel: "subscriptionResponse",
                data: {
                    method: "subscribe",
                    subscription: payload,
                },
            });

            const resolvedData = await promise as Record<string, unknown>;
            assertEquals(resolvedData.method, "subscribe");
            assertEquals(resolvedData.subscription, payload);
        });

        await t.step("rejects", async (t) => {
            await t.step("method === post", async (t) => {
                await t.step("request error", async () => {
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

                    await assertRejects(
                        () => promise,
                        WebSocketRequestError,
                        `Server error: ${mockMessage.data}`,
                    );
                });
            });

            await t.step("method === subscription", async (t) => {
                await t.step("subscription error", async () => {
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

                    await assertRejects(
                        () => promise,
                        WebSocketRequestError,
                        `Server error: ${mockMessage.data}`,
                    );
                });

                await t.step("Already subscribed", async () => {
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

                    await assertRejects(
                        () => promise,
                        WebSocketRequestError,
                        `Server error: ${mockMessage.data}`,
                    );
                });

                await t.step("Invalid subscription", async () => {
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

                    await assertRejects(
                        () => promise,
                        WebSocketRequestError,
                        `Server error: ${mockMessage.data}`,
                    );
                });

                await t.step("Already unsubscribed", async () => {
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

                    await assertRejects(
                        () => promise,
                        WebSocketRequestError,
                        `Server error: ${mockMessage.data}`,
                    );
                });
            });

            await t.step("rejects pending requests when WebSocket connection closes", async () => {
                const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
                const hlEvents = new HyperliquidEventTarget(mockSocket);
                const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

                const p1 = wsRequester.request("post", { foo: "bar1" });
                const p2 = wsRequester.request("subscribe", { sub: "bar2" });
                assertEquals(mockSocket.sentMessages.length, 2);

                mockSocket.close();

                await assertRejects(() => p1, WebSocketRequestError, "WebSocket connection closed.");
                await assertRejects(() => p2, WebSocketRequestError, "WebSocket connection closed.");
            });

            await t.step("follows AbortSignal", async (t) => {
                await t.step("rejects immediately if aborted before call", async () => {
                    const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
                    const hlEvents = new HyperliquidEventTarget(mockSocket);
                    const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

                    const controller = new AbortController();
                    controller.abort(new Error("Aborted pre-emptively"));

                    const promise = wsRequester.request("post", { foo: "bar" }, controller.signal);

                    await assertRejects(() => promise, Error, "Aborted pre-emptively");
                });

                await t.step("rejects if aborted after sending request", async () => {
                    const mockSocket = new MockWebSocket() as ReconnectingWebSocket & MockWebSocket;
                    const hlEvents = new HyperliquidEventTarget(mockSocket);
                    const wsRequester = new WebSocketAsyncRequest(mockSocket, hlEvents);

                    const controller = new AbortController();
                    const promise = wsRequester.request("post", { foo: "bar" }, controller.signal);
                    assertEquals(mockSocket.sentMessages.length, 1);

                    controller.abort(new Error("Aborted after sending"));

                    await assertRejects(() => promise, Error, "Aborted after sending");
                });
            });
        });
    });

    await t.step("requestToId()", () => {
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
        assertEquals(Object.keys(parsed), ["Z", "arr", "boolVal", "nested", "textVal"]);

        // Check hex transformations
        assertEquals(parsed.Z, "0xabc123");
        // The array's string element should also be lowercased if it's hex
        assertEquals(parsed.arr[1], "0xf00d");
        // The nested hex should also be lowercased
        assertEquals(parsed.nested.hexString, "0xffffff");

        // Non-hex data is unchanged
        assert(parsed.boolVal);
        assertEquals(parsed.textVal, "SOME Text Not Hex");
        assertEquals(parsed.nested.aNumber, 123);
        assertEquals(parsed.nested.randomStr, "NotHex0123");
    });

    await t.step("invalid JSON messages are ignored", async () => {
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
        assertEquals(result, "Success");
    });
});
