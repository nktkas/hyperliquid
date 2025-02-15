import { assertEquals, assertRejects } from "jsr:@std/assert@^1.0.11";
import {
    WebSocketRequestDispatcher,
    WebSocketRequestError,
} from "../../../src/transports/websocket/_websocket_request_dispatcher.ts";
import { HyperliquidEventTarget } from "../../../src/transports/websocket/_hyperliquid_event_target.ts";

class MockWebSocket extends EventTarget implements WebSocket {
    public sentMessages: string[] = [];

    send(data: string): void {
        this.sentMessages.push(data);
    }

    close(): void {
        this.readyState = WebSocket.CLOSED;
        this.dispatchEvent(new CloseEvent("close"));
    }

    // WebSocket constants & unimplemented fields:
    binaryType: BinaryType = "blob";
    bufferedAmount: number = 0;
    extensions: string = "";
    protocol: string = "";
    readyState: number = 1;
    url: string = "";
    onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null = null;
    onerror: ((this: WebSocket, ev: Event) => unknown) | null = null;
    onmessage: ((this: WebSocket, ev: MessageEvent) => unknown) | null = null;
    onopen: ((this: WebSocket, ev: Event) => unknown) | null = null;
    CONNECTING = WebSocket.CONNECTING;
    OPEN = WebSocket.OPEN;
    CLOSING = WebSocket.CLOSING;
    CLOSED = WebSocket.CLOSED;
    static CONNECTING = WebSocket.CONNECTING;
    static OPEN = WebSocket.OPEN;
    static CLOSING = WebSocket.CLOSING;
    static CLOSED = WebSocket.CLOSED;

    // Mock functions
    mockMessage(data: unknown): void {
        const event = new MessageEvent("message", { data: JSON.stringify(data) });
        this.dispatchEvent(event);
    }
}

Deno.test("WebSocketRequestDispatcher Tests", async (t) => {
    await t.step("request() => post => resolves after 'post' event", async (t) => {
        await t.step("basic", async () => {
            const mockSocket = new MockWebSocket();
            const hlEvents = new HyperliquidEventTarget(mockSocket);
            const dispatcher = new WebSocketRequestDispatcher(mockSocket, hlEvents);

            const promise = dispatcher.request("post", { foo: "bar" });
            // Confirm outbound message
            assertEquals(mockSocket.sentMessages.length, 1, "Should send exactly one message");
            const sent = JSON.parse(mockSocket.sentMessages[0]);
            assertEquals(sent.method, "post", "Should have method 'post'");
            assertEquals(typeof sent.id, "number", "ID should be a number");
            assertEquals(sent.request.foo, "bar", "Request payload should match");

            // Now simulate a WebSocket "message" containing a 'post' response
            const mockMessage = {
                channel: "post",
                data: {
                    id: sent.id,
                    response: { type: "info", payload: { data: "SomeData" } },
                },
            };
            mockSocket.mockMessage(mockMessage);

            // The request promise should now resolve
            const result = await promise;
            assertEquals(result, mockMessage.data.response.payload.data, "Should resolve with the 'data' field");
        });

        await t.step("type === info", async () => {
            const mockSocket = new MockWebSocket();
            const hlEvents = new HyperliquidEventTarget(mockSocket);
            const dispatcher = new WebSocketRequestDispatcher(mockSocket, hlEvents);

            const promise = dispatcher.request("post", { test: "info" });
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
            assertEquals(
                result,
                "InfoResponseData",
                "With type 'info' promise must be resolved by the payload.data value",
            );
        });

        await t.step("type === action", async () => {
            const mockSocket = new MockWebSocket();
            const hlEvents = new HyperliquidEventTarget(mockSocket);
            const dispatcher = new WebSocketRequestDispatcher(mockSocket, hlEvents);

            const promise = dispatcher.request("post", { test: "action" });
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
            assertEquals(
                result,
                { action: "DoAction", params: { key: "value" } },
                "With the 'action' type, promise should be resolved by the whole payload value",
            );
        });
    });

    await t.step("request() => subscribe => resolves after 'subscriptionResponse' event", async () => {
        const mockSocket = new MockWebSocket();
        const hlEvents = new HyperliquidEventTarget(mockSocket);
        const dispatcher = new WebSocketRequestDispatcher(mockSocket, hlEvents);

        const subPayload = { channel: "test-sub", param: "XYZ" };
        const promise = dispatcher.request("subscribe", subPayload);

        assertEquals(mockSocket.sentMessages.length, 1, "Should send exactly one message for subscribe");
        const sent = JSON.parse(mockSocket.sentMessages[0]);
        assertEquals(sent.method, "subscribe");
        // The subscription is the raw payload, ID is internally stringified

        // Simulate "subscriptionResponse"
        mockSocket.mockMessage({
            channel: "subscriptionResponse",
            data: {
                method: "subscribe",
                subscription: subPayload,
            },
        });

        const resolvedData = await promise as { method: string; subscription: unknown };
        assertEquals(resolvedData.method, "subscribe", "Should return the subscription method");
        assertEquals(resolvedData.subscription, subPayload, "Should return the subscription payload");
    });

    await t.step("request() => rejects on 'error' event", async (t) => {
        await t.step("post request", async () => {
            const mockSocket = new MockWebSocket();
            const hlEvents = new HyperliquidEventTarget(mockSocket);
            const dispatcher = new WebSocketRequestDispatcher(mockSocket, hlEvents);

            const promise = dispatcher.request("post", { testErr: true });
            const sent = JSON.parse(mockSocket.sentMessages[0]);

            // Simulate error channel message
            mockSocket.mockMessage({
                channel: "error",
                data: `Something failed: {"id":${sent.id}}`,
            });

            await assertRejects(
                () => promise,
                WebSocketRequestError,
                "Cannot complete WebSocket request",
                "Should reject with WebSocketRequestError for matching post ID",
            );
        });

        await t.step("subscription request", async () => {
            const mockSocket = new MockWebSocket();
            const hlEvents = new HyperliquidEventTarget(mockSocket);
            const dispatcher = new WebSocketRequestDispatcher(mockSocket, hlEvents);

            // We'll do a "subscribe" request
            const subPayload = { channel: "test-sub-error", param: "XYZ-ERR" };
            const promise = dispatcher.request("subscribe", subPayload);

            // Let's simulate an error for that subscription
            const mockMessage = {
                channel: "error",
                data: `Something failed: {"subscription":${JSON.stringify(subPayload)}}`,
            };
            mockSocket.mockMessage(mockMessage);

            await assertRejects(
                () => promise,
                WebSocketRequestError,
                `Cannot complete WebSocket request: ${mockMessage.data}`,
                "Should reject with WebSocketRequestError for matching subscription request ID",
            );
        });

        await t.step("unknown request", async () => {
            const mockSocket = new MockWebSocket();
            const hlEvents = new HyperliquidEventTarget(mockSocket);
            const dispatcher = new WebSocketRequestDispatcher(mockSocket, hlEvents);

            // We'll do a "subscribe" request with an "unknown" structure
            const unknownPayload = { someUnknown: "stuff" };
            const promise = dispatcher.request("subscribe", unknownPayload);

            // Now let's dispatch an error event referencing the same unknown object
            const mockMessage = {
                channel: "error",
                data: `Something failed: ${JSON.stringify(unknownPayload)}`,
            };
            mockSocket.mockMessage(mockMessage);

            await assertRejects(
                () => promise,
                WebSocketRequestError,
                `Cannot complete WebSocket request: ${mockMessage.data}`,
                "Should reject with WebSocketRequestError for matching unknown request",
            );
        });
    });

    await t.step("request() => rejects pending requests when WebSocket connection closes", async () => {
        const mockSocket = new MockWebSocket();
        const hlEvents = new HyperliquidEventTarget(mockSocket);
        const dispatcher = new WebSocketRequestDispatcher(mockSocket, hlEvents);

        const p1 = dispatcher.request("post", { foo: "bar1" });
        const p2 = dispatcher.request("subscribe", { sub: "bar2" });
        assertEquals(mockSocket.sentMessages.length, 2, "Should send two messages");

        // Now close the socket => all pending requests should reject
        mockSocket.close();

        await assertRejects(
            () => p1,
            WebSocketRequestError,
            "connection is closed",
            "Should reject with connection closed error",
        );
        await assertRejects(
            () => p2,
            WebSocketRequestError,
            "connection is closed",
            "Should also reject with connection closed error",
        );
    });

    await t.step("request() => follows AbortSignal", async (t) => {
        await t.step("rejects immediately if aborted before call", async () => {
            const mockSocket = new MockWebSocket();
            const hlEvents = new HyperliquidEventTarget(mockSocket);
            const dispatcher = new WebSocketRequestDispatcher(mockSocket, hlEvents);

            const controller = new AbortController();
            controller.abort(new Error("Aborted pre-emptively"));

            await assertRejects(
                () => dispatcher.request("post", { foo: "bar" }, controller.signal),
                Error,
                "Aborted pre-emptively",
                "Should throw immediately if the signal is already aborted",
            );
        });

        await t.step("rejects if aborted after sending request", async () => {
            const mockSocket = new MockWebSocket();
            const hlEvents = new HyperliquidEventTarget(mockSocket);
            const dispatcher = new WebSocketRequestDispatcher(mockSocket, hlEvents);

            const controller = new AbortController();
            const promise = dispatcher.request("post", { foo: "bar" }, controller.signal);
            assertEquals(mockSocket.sentMessages.length, 1, "Should send exactly one message");

            // Now abort
            controller.abort(new Error("Aborted after sending"));

            await assertRejects(
                () => promise,
                Error,
                "Aborted after sending",
                "Should reject if aborted after the request is sent",
            );
        });
    });

    await t.step("requestToId() => ensures hex is lowercased, other data is unchanged", () => {
        /**
         * We'll confirm:
         * - Hex strings like '0xABC123' become '0xabc123'
         * - Arrays remain intact
         * - Non-hex strings, booleans, numbers, etc. remain identical
         * - Keys get sorted in alphabetical order
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

        const strId = WebSocketRequestDispatcher.requestToId(complex);
        const parsed = JSON.parse(strId);

        // Keys should be sorted by ASCII: "arr" > "boolVal" > "nested" > "textVal" > "Z"
        assertEquals(Object.keys(parsed), ["arr", "boolVal", "nested", "textVal", "Z"]);

        // Check hex transformations
        assertEquals(parsed.Z, "0xabc123", "Hex string must be lowercased");
        // The array's string element should also be lowercased if it's hex
        assertEquals(parsed.arr[1], "0xf00d", "Hex in array must be lowercased");
        // The nested hex should also be lowercased
        assertEquals(parsed.nested.hexString, "0xffffff", "Nested hex string is lowercased");

        // Non-hex data is unchanged
        assertEquals(parsed.boolVal, true, "Boolean stays the same");
        assertEquals(parsed.textVal, "SOME Text Not Hex", "Regular string is unchanged");
        assertEquals(parsed.nested.aNumber, 123, "Number is unchanged");
        assertEquals(parsed.nested.randomStr, "NotHex0123", "Non-hex string is unchanged");
    });

    await t.step("error event with invalid JSON is ignored", async () => {
        const mockSocket = new MockWebSocket();
        const hlEvents = new HyperliquidEventTarget(mockSocket);
        const dispatcher = new WebSocketRequestDispatcher(mockSocket, hlEvents);

        const promise = dispatcher.request("post", { test: "jsonErrorIgnore" });
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
