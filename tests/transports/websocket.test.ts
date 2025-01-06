import { assert } from "jsr:@std/assert@^1.0.10";
import { WebSocketRequestError, WebSocketTransport } from "../../src/transports/websocket.ts";

Deno.test("WebSocket Transport Tests", async (t) => {
    await t.step("should accept custom configuration", async () => {
        const transport = new WebSocketTransport({
            url: "wss://custom.api.com/ws",
            timeout: 5000,
            keepAliveInterval: 30000,
            reconnect: {
                maxAttempts: 5,
                delay: 1000,
            },
        });

        assert(
            transport.url === "wss://custom.api.com/ws",
            "URL should be wss://custom.api.com/ws, but got: " + transport.url,
        );
        assert(
            transport.timeout === 5000,
            "Timeout should be 5000, but got: " + transport.timeout,
        );
        assert(
            transport.keepAliveInterval === 30000,
            "Keep alive interval should be 30000, but got: " + transport.keepAliveInterval,
        );
        assert(
            transport.socket.config.maxAttempts === 5,
            "Max reconnect attempts should be 5, but got: " + transport.socket.config.maxAttempts,
        );

        await transport.close();
    });

    await t.step("should handle successful request", async () => {
        const transport = new WebSocketTransport();

        const response = await transport.request("info", { type: "meta" });
        assert(
            response !== null && typeof response === "object",
            "Response should be an object, but got: " + typeof response,
        );
        await transport.close();
    });

    await t.step("should handle an invalid request", async () => {
        const transport = new WebSocketTransport();

        try {
            await transport.request("info", { type: "invalid_request" });
            assert(false, "Should have thrown an error");
        } catch (error: unknown) {
            assert(
                error instanceof WebSocketRequestError,
                "Error should be WebSocketRequestError, but got: " + error!.constructor.name,
            );
        }
        await transport.close();
    });

    await t.step("should handle timeout", async () => {
        const transport = new WebSocketTransport({ timeout: 1 });

        try {
            await transport.request("info", { type: "meta" });
            assert(false, "Should have thrown a timeout error");
        } catch (error: unknown) {
            assert(
                error instanceof DOMException,
                "Error should be DOMException, but got: " + error!.constructor.name,
            );
            assert(
                error.name === "TimeoutError",
                "Error should be TimeoutError, but got: " + error.name,
            );
        }
        await transport.close();
    });

    await t.step("should respect abort signal", async () => {
        const transport = new WebSocketTransport();
        const signal = AbortSignal.abort();

        try {
            await transport.request("info", { type: "meta" }, signal);
            assert(false, "Should have thrown an abort error");
        } catch (error) {
            assert(
                error instanceof DOMException,
                "Error should be DOMException, but got: " + error!.constructor.name,
            );
            assert(
                error.name === "AbortError",
                "Error should be AbortError, but got: " + error.name,
            );
        }
        await transport.close();
    });

    await t.step("should handle connection close", async () => {
        const transport = new WebSocketTransport();
        await transport.close();

        try {
            await transport.request("info", { type: "meta" });
            assert(false, "Should have thrown an error");
        } catch (error) {
            assert(
                error instanceof DOMException,
                "Error should be DOMException, but got: " + error!.constructor.name,
            );
            assert(
                error.name === "InvalidStateError",
                "Error should be InvalidStateError, but got: " + error.name,
            );
        }
    });

    await t.step("should await a successful connection", async () => {
        const transport = new WebSocketTransport();
        await transport.ready();
        assert(transport.socket.readyState === WebSocket.OPEN, "Socket should be open");

        await transport.close();
    });
});
