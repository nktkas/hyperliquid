import { assert, assertEquals } from "jsr:@std/assert@^1.0.9";
import { ReconnectingWebSocket } from "../../src/utils/reconnecting-websocket.ts";

Deno.test("ReconnectingWebSocket", async (t) => {
    await t.step("should reconnect", async () => {
        const server = Deno.serve({
            port: 8080,
            handler: (request) => {
                if (request.headers.get("upgrade") === "websocket") {
                    const { socket, response } = Deno.upgradeWebSocket(request);
                    socket.onmessage = (event) => {
                        socket.send(event.data);
                    };
                    return response;
                }
                return new Response();
            },
            onListen: () => {},
        });

        const ws = new ReconnectingWebSocket("ws://localhost:8080", undefined, {
            maxAttempts: 2,
            delay: 100,
            timeout: 5000,
        });

        let closeCount = 0;
        ws.addEventListener("close", () => {
            closeCount++;
        });

        await waitWsOpen(ws);
        // @ts-ignore accessing private property
        ws.socket.close();

        await new Promise((r) => setTimeout(r, 5000));

        assert(closeCount > 0, "Should have attempted to reconnect");
        assertEquals(ws.readyState, WebSocket.OPEN, "WebSocket should be open after reconnection");

        ws.close();
        await server.shutdown();
    });

    await t.step("should respect maxAttempts", async () => {
        const maxAttempts = 3;
        const ws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
            maxAttempts,
            delay: 0,
        });

        let closeCount = 0;
        ws.addEventListener("close", () => {
            closeCount++;
        });

        await new Promise((r) => setTimeout(r, 100));

        assert(
            ws.terminationController.signal.aborted,
            "Connection should be terminated after max attempts",
        );
        assertEquals(ws.readyState, WebSocket.CLOSED, "WebSocket should be closed");
        assertEquals(closeCount - 1, maxAttempts, "Should have attempted to reconnect maxAttempts times");
    });

    await t.step("should buffer messages during reconnection", async () => {
        const server = Deno.serve({
            port: 8080,
            handler: (request) => {
                if (request.headers.get("upgrade") === "websocket") {
                    const { socket, response } = Deno.upgradeWebSocket(request);
                    socket.onmessage = (event) => {
                        socket.send(event.data);
                    };
                    return response;
                }
                return new Response();
            },
            onListen: () => {},
        });

        const ws = new ReconnectingWebSocket("ws://localhost:8080", undefined, {
            maxAttempts: 2,
            delay: 100,
        });

        const messages = ["test1", "test2", "test3"];
        const receivedMessages: string[] = [];

        ws.addEventListener("message", (event) => {
            receivedMessages.push(event.data);
        });

        await waitWsOpen(ws);
        // @ts-ignore accessing private property
        ws.socket.close();

        // Send messages while disconnected
        messages.forEach((msg) => ws.send(msg));

        // Wait for reconnection and message processing
        await new Promise((r) => setTimeout(r, 5000));

        assertEquals(receivedMessages, messages, "Should receive all buffered messages");

        ws.close();
        await server.shutdown();
    });
});

function waitWsOpen(ws: WebSocket, signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (signal?.aborted) {
            return reject(signal.reason);
        }

        if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
            return reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
        }

        if (ws.readyState === WebSocket.OPEN) {
            return resolve();
        }

        const handleOpen = () => {
            ws.removeEventListener("close", handleClose);
            signal?.removeEventListener("abort", handleAbort);
            resolve();
        };

        const handleClose = () => {
            ws.removeEventListener("open", handleOpen);
            signal?.removeEventListener("abort", handleAbort);
            reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
        };

        const handleAbort = () => {
            ws.removeEventListener("open", handleOpen);
            ws.removeEventListener("close", handleClose);
            reject(signal!.reason);
        };

        ws.addEventListener("open", handleOpen, { once: true });
        ws.addEventListener("close", handleClose, { once: true });
        signal?.addEventListener("abort", handleAbort, { once: true });
    });
}
