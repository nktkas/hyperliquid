import { assert, assertEquals } from "jsr:@std/assert@^1.0.9";
import { type MessageBufferStrategy, ReconnectingWebSocket } from "../../src/utils/reconnecting-websocket.ts";

Deno.test("ReconnectingWebSocket", async (t) => {
    await t.step("Automatic Reconnection", async (t) => {
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
                maxAttempts: 1,
                delay: 1000,
            });

            let reconnectingCalled = false;
            let reconnectedCalled = false;

            ws.addEventListener("reconnecting", () => {
                reconnectingCalled = true;
            });

            ws.addEventListener("reconnected", () => {
                reconnectedCalled = true;
            });

            await waitWsOpen(ws);
            // @ts-ignore access to private property
            ws.socket.close();

            // Wait for reconnection events
            await new Promise((r) => setTimeout(r, 5000));

            assert(reconnectingCalled);
            assert(reconnectedCalled);

            ws.close();
            await waitWsClose(ws);
            await server.shutdown();
        });

        await t.step("should follow maxAttempts", async () => {
            const maxAttempts = 2;
            const ws = new ReconnectingWebSocket("ws://invalid.site", undefined, {
                maxAttempts,
                delay: 100,
            });

            let reconnectingCount = 0;

            ws.addEventListener("reconnecting", () => {
                reconnectingCount++;
            });

            await new Promise((r) => setTimeout(r, 1000));

            assertEquals(
                reconnectingCount,
                maxAttempts,
                `Should have attempted to reconnect exactly ${maxAttempts} times`,
            );

            assertEquals(
                ws.readyState,
                WebSocket.CLOSED,
                "WebSocket should be closed after max attempts",
            );

            assert(
                ws.terminationController.signal.aborted,
                "Connection should be terminated after max attempts",
            );

            ws.close();
            await waitWsClose(ws);
        });

        await t.step("should follow delay", async () => {
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
                maxAttempts: 1,
                delay: 1000,
            });

            await new Promise<void>((resolve) => {
                let reconnectStart = 0;
                let reconnectEnd = 0;

                ws.addEventListener("reconnecting", () => {
                    reconnectStart = Date.now();
                });
                ws.addEventListener("reconnected", () => {
                    reconnectEnd = Date.now();
                    const delay = reconnectEnd - reconnectStart;
                    assert(delay > 1000, "Delay should be greater than 1000ms, got " + delay);
                    resolve();
                });

                ws.addEventListener("open", () => {
                    // @ts-ignore access to private property
                    ws.socket.close(3000);
                }, { once: true });
            });

            ws.close();
            await waitWsClose(ws);
            await server.shutdown();
        });
    });

    await t.step("Message Buffering", async (t) => {
        await t.step("should handle default FIFO buffer strategy correctly", async () => {
            const server = Deno.serve({
                port: 8080,
                handler: async (request) => {
                    if (request.headers.get("upgrade") === "websocket") {
                        await new Promise((resolve) => setTimeout(resolve, 500));
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

            const ws = new ReconnectingWebSocket("ws://localhost:8080");

            await waitWsOpen(ws);
            // @ts-ignore access to private property
            ws.socket.close();

            const messages = Array.from({ length: 105 }, (_, i) => `message${i}`);
            messages.forEach((msg) => ws.send(msg));

            const receivedMessages: string[] = [];
            ws.addEventListener("message", (event) => {
                receivedMessages.push(event.data);
            });

            await new Promise<void>((resolve) => {
                ws.addEventListener("reconnected", () => {
                    setTimeout(() => {
                        assertEquals(receivedMessages.length, 100, "Should receive exactly 100 messages");
                        assertEquals(
                            receivedMessages[0],
                            "message0",
                            "First message should be message0",
                        );
                        assertEquals(
                            receivedMessages[99],
                            "message99",
                            "Last message should be message99",
                        );
                        resolve();
                    }, 1000);
                });
            });

            ws.close();
            await waitWsClose(ws);
            await server.shutdown();
        });

        await t.step("should work with custom priority buffer strategy", async () => {
            const server = Deno.serve({
                port: 8080,
                handler: async (request) => {
                    if (request.headers.get("upgrade") === "websocket") {
                        await new Promise((resolve) => setTimeout(resolve, 500));
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

            class PriorityBuffer implements MessageBufferStrategy {
                private messages: {
                    data: string | ArrayBufferLike | Blob | ArrayBufferView;
                    priority: number;
                }[] = [];

                push(data: string | ArrayBufferLike | Blob | ArrayBufferView): boolean {
                    const priority = typeof data === "string" && data.includes("high") ? 1 : 0;
                    this.messages.push({ data, priority });
                    this.messages.sort((a, b) => b.priority - a.priority);
                    return true;
                }

                shift(): (string | ArrayBufferLike | Blob | ArrayBufferView) | undefined {
                    const message = this.messages.shift();
                    return message?.data;
                }

                clear(): void {
                    this.messages = [];
                }
            }

            const ws = new ReconnectingWebSocket("ws://localhost:8080", undefined, {
                messageBuffer: new PriorityBuffer(),
            });

            await waitWsOpen(ws);
            // @ts-ignore access to private property
            ws.socket.close();

            const messages = [
                "low_1",
                "high_priority_1",
                "low_2",
                "high_priority_2",
                "low_3",
                "high_priority_3",
            ];
            messages.forEach((msg) => ws.send(msg));

            const receivedMessages: string[] = [];
            ws.addEventListener("message", (event) => {
                receivedMessages.push(event.data);
            });

            await new Promise<void>((resolve) => {
                ws.addEventListener("reconnected", () => {
                    setTimeout(() => {
                        assertEquals(receivedMessages.length, 6, "Should receive all 6 messages");
                        assert(
                            receivedMessages[0].includes("high") &&
                                receivedMessages[1].includes("high") &&
                                receivedMessages[2].includes("high"),
                            "High priority messages should be sent first",
                        );
                        assert(
                            !receivedMessages[3].includes("high") &&
                                !receivedMessages[4].includes("high") &&
                                !receivedMessages[5].includes("high"),
                            "Low priority messages should be sent last",
                        );
                        resolve();
                    }, 1000);
                });
            });

            ws.close();
            await waitWsClose(ws);
            await server.shutdown();
        });
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
function waitWsClose(ws: WebSocket, signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (signal?.aborted) {
            return reject(signal.reason);
        }

        if (ws.readyState === WebSocket.CLOSED) {
            return resolve();
        }

        if (ws.readyState === WebSocket.OPEN) {
            return reject(new DOMException("The WebSocket is in an invalid state.", "InvalidStateError"));
        }

        const handleClose = () => {
            signal?.removeEventListener("abort", handleAbort);
            resolve();
        };

        const handleAbort = () => {
            ws.removeEventListener("close", handleClose);
            reject(signal!.reason);
        };

        ws.addEventListener("close", handleClose, { once: true });
        signal?.addEventListener("abort", handleAbort, { once: true });
    });
}
