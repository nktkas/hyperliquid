import { assert, assertEquals, assertInstanceOf, assertIsError, assertNotEquals } from "jsr:@std/assert@1";
import {
    ReconnectingWebSocket,
    ReconnectingWebSocketError,
} from "../../../src/transports/websocket/_reconnecting_websocket.ts";

Deno.test("ReconnectingWebSocket", async (t) => {
    const server = Deno.serve(
        { port: 8080, onListen: () => {} },
        async (request) => {
            if (request.headers.get("upgrade") !== "websocket") {
                return new Response("Not a websocket", { status: 400 });
            }

            const url = new URL(request.url);
            const delay = url.searchParams.has("delay") ? parseInt(url.searchParams.get("delay") ?? "1000") : 1000;

            await new Promise((resolve) => setTimeout(resolve, delay));

            const protocolsHeader = request.headers.get("sec-websocket-protocol") ?? "";
            const requestedProtocols = protocolsHeader.split(",").map((p) => p.trim())[0] ?? "";

            const { socket, response } = Deno.upgradeWebSocket(request, { protocol: requestedProtocols });
            socket.addEventListener("message", (event) => {
                socket.send(`echo:${event.data}`);
            });

            return response;
        },
    );

    await t.step("Basic WebSocket", async (t) => {
        await t.step("get url()", () => {
            const rws = new ReconnectingWebSocket("ws://localhost:8080/");

            assertEquals(rws.url, "ws://localhost:8080/");

            rws.close();
        });

        await t.step("get readyState()", () => {
            const rws = new ReconnectingWebSocket("ws://localhost:8080/");

            assertEquals(rws.readyState, WebSocket.CONNECTING);

            rws.close();
        });

        await t.step("get bufferedAmount()", () => {
            const rws = new ReconnectingWebSocket("ws://localhost:8080/");

            assertEquals(rws.bufferedAmount, 0);

            rws.close();
        });

        await t.step("get extensions()", () => {
            const rws = new ReconnectingWebSocket("ws://localhost:8080/");

            assertEquals(rws.extensions, "");

            rws.close();
        });

        await t.step("get protocol()", async () => {
            const rws = new ReconnectingWebSocket("ws://localhost:8080/", "superchat");
            await new Promise((resolve) => rws.addEventListener("open", resolve, { once: true })); // Wait for the connection to open

            assertEquals(rws.protocol, "superchat");

            rws.close();
        });

        await t.step("binaryType", async (t) => {
            await t.step("get binaryType()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                assertEquals(rws.binaryType, "blob");

                rws.close();
            });
            await t.step("set binaryType()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                rws.binaryType = "arraybuffer";
                assertEquals(rws.binaryType, "arraybuffer");

                rws.close();
            });
        });

        await t.step("CONNECTING", async (t) => {
            await t.step("get CONNECTING()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                assertEquals(rws.CONNECTING, WebSocket.CONNECTING);

                rws.close();
            });
            await t.step("static CONNECTING", () => {
                assertEquals(ReconnectingWebSocket.CONNECTING, WebSocket.CONNECTING);
            });
        });
        await t.step("OPEN", async (t) => {
            await t.step("get OPEN()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                assertEquals(rws.OPEN, WebSocket.OPEN);

                rws.close();
            });
            await t.step("static OPEN", () => {
                assertEquals(ReconnectingWebSocket.OPEN, WebSocket.OPEN);
            });
        });
        await t.step("CLOSING", async (t) => {
            await t.step("get CLOSING()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                assertEquals(rws.CLOSING, WebSocket.CLOSING);

                rws.close();
            });
            await t.step("static CLOSING", () => {
                assertEquals(ReconnectingWebSocket.CLOSING, WebSocket.CLOSING);
            });
        });
        await t.step("CLOSED", async (t) => {
            await t.step("get CLOSED()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                assertEquals(rws.CLOSED, WebSocket.CLOSED);

                rws.close();
            });
            await t.step("static CLOSED", () => {
                assertEquals(ReconnectingWebSocket.CLOSED, WebSocket.CLOSED);
            });
        });

        await t.step("onclose", async (t) => {
            await t.step("get onclose()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                assertEquals(rws.onclose, null);

                rws.close();
            });
            await t.step("set onclose()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                const onclose = () => {};
                rws.onclose = onclose;

                assertEquals(rws.onclose, onclose);

                rws.close();
            });
        });
        await t.step("onerror", async (t) => {
            await t.step("get onerror()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                assertEquals(rws.onerror, null);

                rws.close();
            });
            await t.step("set onerror()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                const onerror = () => {};
                rws.onerror = onerror;

                assertEquals(rws.onerror, onerror);

                rws.close();
            });
        });
        await t.step("onmessage", async (t) => {
            await t.step("get onmessage()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                assertEquals(rws.onmessage, null);

                rws.close();
            });
            await t.step("set onmessage()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                const onmessage = () => {};
                rws.onmessage = onmessage;

                assertEquals(rws.onmessage, onmessage);

                rws.close();
            });
        });
        await t.step("onopen", async (t) => {
            await t.step("get onopen()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                assertEquals(rws.onopen, null);

                rws.close();
            });
            await t.step("set onopen()", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                const onopen = () => {};
                rws.onopen = onopen;

                assertEquals(rws.onopen, onopen);

                rws.close();
            });
        });

        await t.step("close()", () => {
            const rws = new ReconnectingWebSocket("ws://localhost:8080/");

            assertNotEquals(rws.readyState, WebSocket.CLOSED);

            rws.close();

            assertEquals(rws.readyState, WebSocket.CLOSING);
        });

        await t.step("send()", () => {
            const rws = new ReconnectingWebSocket("ws://localhost:8080/");

            const message = "Hello, World!";

            let received = "";
            rws.addEventListener("message", (ev) => received = ev.data, { once: true });

            rws.dispatchEvent(new MessageEvent("message", { data: message }));

            assertEquals(received, message);

            rws.close();
        });

        await t.step("addEventListener()", async (t) => {
            await t.step("listener is fn", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                let called = false;
                rws.addEventListener("message", () => called = true, { once: true });

                rws.dispatchEvent(new Event("message"));

                assert(called);

                rws.close();
            });
            await t.step("listener is an object", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                let called = false;
                rws.addEventListener("message", { handleEvent: () => called = true }, { once: true });

                rws.dispatchEvent(new Event("message"));

                assert(called);

                rws.close();
            });

            await t.step("Does not wrap listener when termination signal is aborted", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");
                rws.close();

                assertInstanceOf(
                    rws.reconnectAbortController.signal.reason,
                    ReconnectingWebSocketError,
                    "Error when reconnecting WebSocket: USER_INITIATED_CLOSE",
                );

                // @ts-ignore - accessing private property for testing purposes
                const initialListenersCount = rws._listeners.length;
                rws.addEventListener("message", () => {});

                // @ts-ignore - accessing private property for testing purposes
                const finalListenersCount = rws._listeners.length;
                assertEquals(finalListenersCount, initialListenersCount);
            });
        });

        await t.step("removeEventListener()", async (t) => {
            await t.step("listener is fn", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                let called = false;
                const listener = () => called = true;
                rws.addEventListener("message", listener, { once: true });
                rws.removeEventListener("message", listener);

                rws.dispatchEvent(new Event("message"));

                assert(!called);

                rws.close();
            });
            await t.step("listener is an object", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080/");

                let called = false;
                const listener = { handleEvent: () => called = true };
                rws.addEventListener("message", listener, { once: true });
                rws.removeEventListener("message", listener);

                rws.dispatchEvent(new Event("message"));

                assert(!called);

                rws.close();
            });
        });

        await t.step("dispatchEvent()", () => {
            const rws = new ReconnectingWebSocket("ws://localhost:8080/");

            let called = false;
            rws.addEventListener("open", () => called = true, { once: true });

            rws.dispatchEvent(new Event("open"));

            assert(called);

            rws.close();
        });
    });

    await t.step("Reconnecting WebSocket", async (t) => {
        await t.step("protocols: Retains chosen protocol across reconnect", async () => {
            const rws = new ReconnectingWebSocket("ws://localhost:8080", "superchat");

            await new Promise<void>((resolve) => {
                rws.addEventListener("open", () => {
                    assertEquals(rws.protocol, "superchat");
                    resolve();
                }, { once: true });
            });

            rws.close(undefined, undefined, false); // Close without permanently aborting

            await new Promise<void>((resolve) => {
                rws.addEventListener("open", () => {
                    assertEquals(rws.protocol, "superchat");
                    resolve();
                }, { once: true });
            });

            rws.close();
        });

        await t.step("maxRetries: Respects maxRetries limit", async () => {
            const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                maxRetries: 2,
                connectionDelay: 0,
            });

            let closeCount = 0;
            rws.addEventListener("close", () => closeCount++);

            await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations

            assertEquals(rws.readyState, WebSocket.CLOSED, "WebSocket should be closed");
            // Typically: 1st "close" after initial connect fails, then 2 more reconnect attempts => total 3 close events
            // so (closeCount - 1) = 2 means it tried 2 reconnect attempts.
            assertEquals(closeCount - 1, 2);

            rws.close();
        });

        await t.step("connectionTimeout:", async (t) => {
            await t.step("Connection timeout is disabled if set to 'connectionTimeout: null'", async () => {
                const defaultConnectionTimeout = new ReconnectingWebSocket("ws://example.com")
                    .reconnectOptions.connectionTimeout!;
                const rws = new ReconnectingWebSocket(
                    `ws://localhost:8080?delay=${defaultConnectionTimeout + 5000}`,
                    undefined,
                    { connectionTimeout: null },
                );

                await new Promise((resolve) => setTimeout(resolve, defaultConnectionTimeout + 2000));
                assertEquals(rws.readyState, WebSocket.CONNECTING);

                rws.close();
            });

            await t.step("Connection timeout if not opened in time", async () => {
                const rwsTimeout = new ReconnectingWebSocket("ws://localhost:8080", undefined, {
                    connectionTimeout: 10,
                });

                await new Promise((resolve) => setTimeout(resolve, 1000));
                assertEquals(rwsTimeout.readyState, WebSocket.CLOSED);

                rwsTimeout.close();
            });
        });

        await t.step("connectionDelay:", async (t) => {
            await t.step("Custom delay", async () => {
                const customDelay = 500;
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                    maxRetries: 3,
                    connectionDelay: customDelay,
                });

                const closeTimes: number[] = [];
                rws.addEventListener("close", () => {
                    closeTimes.push(performance.now());
                });

                await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay for network operations
                rws.close();

                for (let i = 1; i < closeTimes.length; i++) {
                    const diff = closeTimes[i] - closeTimes[i - 1];
                    assert(
                        diff >= customDelay && diff <= customDelay * 1.4,
                        `Close event #${i} waited less than customDelay. Expected ${customDelay}ms, got ${diff}ms`,
                    );
                }
            });

            await t.step("Custom delay via function", async () => {
                const delays = [200, 500, 700];
                let attemptCount = 0;
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                    maxRetries: 3,
                    connectionDelay: () => delays[attemptCount < delays.length ? attemptCount++ : delays.length - 1],
                });

                const closeTimes: number[] = [];
                rws.addEventListener("close", () => closeTimes.push(performance.now()));

                await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay for network operations
                rws.close();

                for (let i = 1; i < closeTimes.length; i++) {
                    const diff = closeTimes[i] - closeTimes[i - 1];
                    const expected = delays[i - 1] || delays[delays.length - 1];
                    assert(
                        diff >= expected && diff <= 1000,
                        `Close event #${i} waited less than the function-supplied delay. Expected ${expected}ms, got ${diff}ms`,
                    );
                }
            });
        });

        await t.step("shouldReconnect: Respects custom function 'shouldReconnect' when reconnecting", async () => {
            const maxRetries = 3;
            let internalCloseCount = 0;
            const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                maxRetries: maxRetries * 2,
                connectionDelay: 0,
                shouldReconnect: (event) => {
                    assert(event instanceof CloseEvent, "shouldReconnect should receive CloseEvent");
                    return internalCloseCount++ < 3;
                },
            });

            let closeCount = 0;
            rws.addEventListener("close", () => closeCount++);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            assertEquals(closeCount, maxRetries + 1); // 3 reconnect attempts + 1 initial close

            rws.close();
        });

        await t.step("messageBuffer: Buffers messages when not open and replays on reconnect", async () => {
            const rws = new ReconnectingWebSocket("ws://localhost:8080", undefined, {
                maxRetries: 1,
                connectionDelay: 0,
            });

            await new Promise((resolve) => rws.addEventListener("open", resolve, { once: true })); // Wait for the connection to open

            rws.close(undefined, undefined, false); // Close without permanently aborting
            rws.send("HelloAfterClose1");
            rws.send("HelloAfterClose2");

            // @ts-ignore - accessing private property
            assertEquals(rws.reconnectOptions.messageBuffer.queue.length, 2);

            const receivedMessages: string[] = [];
            rws.addEventListener("message", (ev) => receivedMessages.push(ev.data));

            await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations

            assertEquals(receivedMessages.length, 2);
            assert(receivedMessages.includes("echo:HelloAfterClose1"));
            assert(receivedMessages.includes("echo:HelloAfterClose2"));

            // @ts-ignore - accessing private property
            assertEquals(rws.reconnectOptions.messageBuffer.queue.length, 0);

            rws.close();
        });

        await t.step("close():", async (t) => {
            await t.step("close(permanently = true) prevents reconnection", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                    maxRetries: 3,
                    connectionDelay: 0,
                });

                let closeEvents = 0;
                rws.addEventListener("close", () => closeEvents++);

                rws.close();

                await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for network operations

                assertEquals(closeEvents, 1, "should have only 1 close event");
                assertEquals(rws.readyState, WebSocket.CLOSED, "socket should remain closed");
                assert(rws.reconnectAbortController.signal.aborted, "should be permanently closed");
            });

            await t.step("close(permanently = false) closes but does not stop reconnection logic", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                    maxRetries: 3,
                    connectionDelay: 0,
                });

                let closeEvents = 0;
                rws.addEventListener("close", () => closeEvents++);

                rws.close(undefined, undefined, false); // Close without permanently aborting

                await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay for network operations

                assertEquals(closeEvents, 4, "should have multiple close events for reconnection");
                assertEquals(rws.readyState, WebSocket.CLOSED, "socket should remain closed");
                assert(rws.reconnectAbortController.signal.aborted, "should be permanently closed");

                rws.close();
            });
        });

        await t.step("Event listeners:", async (t) => {
            await t.step("Re-registers event listeners after reconnection", async () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080", undefined, {
                    maxRetries: 1,
                    connectionDelay: 0,
                });

                let openCount = 0;
                rws.addEventListener("open", () => openCount++);
                let messageCount = 0;
                rws.addEventListener("message", () => messageCount++);

                await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations
                assertEquals(openCount, 1);

                rws.close(undefined, undefined, false); // Close without permanently aborting

                await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations
                assertEquals(openCount, 2);

                rws.send("TestingReRegistration");

                await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for network operations
                assertEquals(messageCount, 1);

                rws.close();
            });

            await t.step("Executes { once: true } listener only 1 time and does not reconnect", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                    maxRetries: 3,
                    connectionDelay: 0,
                });

                let closeOnceCalls = 0;
                const onceClose = () => closeOnceCalls++;
                rws.addEventListener("close", onceClose, { once: true });

                await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay for network operations
                assertEquals(closeOnceCalls, 1);

                rws.close();
            });

            await t.step("Adding identical listeners does not increase eventListeners array", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080");
                const handler = () => {};

                // @ts-ignore - internal property
                assertEquals(rws._listeners.length, 0, "Initially no event listeners stored");

                rws.addEventListener("message", handler);
                rws.addEventListener("message", handler);
                rws.addEventListener("message", handler);

                // @ts-ignore - internal property
                assertEquals(rws._listeners.length, 1, "should still only have 1 event listener after duplicates");

                // Remove it once, array should be empty
                rws.removeEventListener("message", handler);

                // @ts-ignore - internal property
                assertEquals(rws._listeners.length, 0, "should have no listeners after removal");

                rws.close();
            });

            await t.step("Reattaches on* properties after reconnection", async () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080");

                let onopenCalled = 0;
                let oncloseCalled = 0;
                let onerrorCalled = 0;
                let onmessageCalled = 0;
                const onopen = () => onopenCalled++;
                const onclose = () => oncloseCalled++;
                const onerror = () => onerrorCalled++;
                const onmessage = () => onmessageCalled++;
                rws.onopen = onopen;
                rws.onclose = onclose;
                rws.onerror = onerror;
                rws.onmessage = onmessage;

                await new Promise((resolve) => rws.addEventListener("open", resolve, { once: true })); // Wait for the connection to open
                rws.close(undefined, undefined, false); // Close without permanently aborting
                await new Promise((resolve) => rws.addEventListener("open", resolve, { once: true })); // Wait for the connection to reopen

                assertEquals(rws.onopen, onopen);
                assertEquals(rws.onclose, onclose);
                assertEquals(rws.onerror, onerror);
                assertEquals(rws.onmessage, onmessage);

                // Dispatches events manually to check the handlers work
                rws.dispatchEvent(new Event("open"));
                rws.dispatchEvent(new CloseEvent("close"));
                rws.dispatchEvent(new Event("error"));
                rws.dispatchEvent(new MessageEvent("message", { data: "test" }));

                await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for event processing

                assertEquals(onopenCalled, 3);
                assertEquals(oncloseCalled, 2);
                assertEquals(onerrorCalled, 1);
                assertEquals(onmessageCalled, 1);

                rws.close();
            });
        });

        await t.step("reconnectAbortController:", async (t) => {
            await t.step("Error in reconnection process aborts permanently", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                    maxRetries: 3,
                    connectionDelay: 0,
                    shouldReconnect: () => {
                        throw new Error("BOOM");
                    },
                });

                let closeEvents = 0;
                rws.addEventListener("close", () => closeEvents++);

                await new Promise((resolve) => setTimeout(resolve, 3000));

                assertEquals(closeEvents, 1);
                assert(rws.reconnectAbortController.signal.aborted);

                rws.close();
            });

            await t.step(
                "'reconnectAbortController' indicates permanent closure and reason for termination",
                async () => {
                    // Check maxRetries reached reason
                    const rws1 = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, { maxRetries: 0 });

                    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for network operations

                    assertIsError(
                        rws1.reconnectAbortController.signal.reason,
                        ReconnectingWebSocketError,
                        "Error when reconnecting WebSocket: RECONNECTION_LIMIT_REACHED",
                    );

                    rws1.close();

                    // Check user-initiated close reason
                    const rws2 = new ReconnectingWebSocket("ws://localhost:8080");
                    rws2.close();

                    assertIsError(
                        rws2.reconnectAbortController.signal.reason,
                        ReconnectingWebSocketError,
                        "Error when reconnecting WebSocket: USER_INITIATED_CLOSE",
                    );
                },
            );

            await t.step("Checking aborted signal after 'shouldReconnect'", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                    maxRetries: 2,
                    connectionDelay: 0,
                    shouldReconnect: () => {
                        rws.close();
                        return true;
                    },
                });

                await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for network operations

                assertInstanceOf(
                    rws.reconnectAbortController.signal.reason,
                    ReconnectingWebSocketError,
                    "Error when reconnecting WebSocket: USER_INITIATED_CLOSE",
                );
            });

            await t.step("Checking aborted signal after 'connectionDelay'", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                    maxRetries: 2,
                    connectionDelay: () => {
                        rws.close();
                        return 0;
                    },
                });

                await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for network operations

                assertInstanceOf(
                    rws.reconnectAbortController.signal.reason,
                    ReconnectingWebSocketError,
                    "Error when reconnecting WebSocket: USER_INITIATED_CLOSE",
                );
            });

            await t.step("Checking 'onAbort' in 'sleep' on reconnect", async () => {
                const connectionDelay = 10_000;
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                    maxRetries: 2,
                    connectionDelay: 10_000,
                });

                await new Promise((resolve) => setTimeout(resolve, connectionDelay / 3));

                rws.close();

                await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for network operations

                assertInstanceOf(
                    rws.reconnectAbortController.signal.reason,
                    ReconnectingWebSocketError,
                    "Error when reconnecting WebSocket: USER_INITIATED_CLOSE",
                );
            });
        });
    });

    await server.shutdown();
});
