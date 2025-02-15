import {
    ReconnectingWebSocket,
    ReconnectingWebSocketError,
} from "../../../src/transports/websocket/_reconnecting_websocket.ts";
import { assert, assertEquals } from "jsr:@std/assert@^1.0.11";

Deno.test("ReconnectingWebSocket Tests", async (t) => {
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
        const rws = new ReconnectingWebSocket("ws://localhost:8080/", "superchat");
        await new Promise((resolve) => rws.addEventListener("open", resolve, { once: true }));

        await t.step("get url()", () => {
            assert(rws.url === "ws://localhost:8080/", `url should be 'ws://localhost:8080', got ${rws.url}`);
        });

        await t.step("get readyState()", () => {
            assert(rws.readyState === WebSocket.OPEN, `readyState should be WebSocket.OPEN, got ${rws.readyState}`);
        });

        await t.step("get bufferedAmount()", () => {
            assert(rws.bufferedAmount === 0, `bufferedAmount should be 0, got ${rws.bufferedAmount}`);
        });

        await t.step("get extensions()", () => {
            assert(rws.extensions === "", `extensions should be empty string, got ${rws.extensions}`);
        });

        await t.step("get protocol()", () => {
            assert(rws.protocol === "superchat", `protocol should be 'superchat', got ${rws.protocol}`);
        });

        await t.step("CLOSED", async (t) => {
            await t.step("get CLOSED()", () => {
                assert(rws.CLOSED === WebSocket.CLOSED, `CLOSED should be WebSocket.CLOSED, got ${rws.CLOSED}`);
            });
            await t.step("static CLOSED", () => {
                assert(
                    ReconnectingWebSocket.CLOSED === WebSocket.CLOSED,
                    `CLOSED should be WebSocket.CLOSED, got ${ReconnectingWebSocket.CLOSED}`,
                );
            });
        });
        await t.step("CLOSING", async (t) => {
            await t.step("get CLOSING()", () => {
                assert(rws.CLOSING === WebSocket.CLOSING, `CLOSING should be WebSocket.CLOSING, got ${rws.CLOSING}`);
            });
            await t.step("static CLOSING", () => {
                assert(
                    ReconnectingWebSocket.CLOSING === WebSocket.CLOSING,
                    `CLOSING should be WebSocket.CLOSING, got ${ReconnectingWebSocket.CLOSING}`,
                );
            });
        });
        await t.step("CONNECTING", async (t) => {
            await t.step("get CONNECTING()", () => {
                assert(
                    rws.CONNECTING === WebSocket.CONNECTING,
                    `CONNECTING should be WebSocket.CONNECTING, got ${rws.CONNECTING}`,
                );
            });
            await t.step("static CONNECTING", () => {
                assert(
                    ReconnectingWebSocket.CONNECTING === WebSocket.CONNECTING,
                    `CONNECTING should be WebSocket.CONNECTING, got ${ReconnectingWebSocket.CONNECTING}`,
                );
            });
        });
        await t.step("OPEN", async (t) => {
            await t.step("get OPEN()", () => {
                assert(rws.OPEN === WebSocket.OPEN, `OPEN should be WebSocket.OPEN, got ${rws.OPEN}`);
            });
            await t.step("static OPEN", () => {
                assert(
                    ReconnectingWebSocket.OPEN === WebSocket.OPEN,
                    `OPEN should be WebSocket.OPEN, got ${ReconnectingWebSocket.OPEN}`,
                );
            });
        });

        await t.step("binaryType", async (t) => {
            await t.step("get binaryType()", () => {
                assert(rws.binaryType === "blob", `binaryType should be 'blob', got ${rws.binaryType}`);
            });
            await t.step("set binaryType()", () => {
                rws.binaryType = "arraybuffer";
                assert(rws.binaryType === "arraybuffer", `binaryType should be 'arraybuffer', got ${rws.binaryType}`);
            });
        });

        await t.step("onclose", async (t) => {
            await t.step("get onclose()", () => {
                assert(rws.onclose === null, `onclose should be null, got ${rws.onclose}`);
            });
            await t.step("set onclose()", () => {
                rws.onclose = () => {};
                assert(rws.onclose !== null, `onclose should not be null, got ${rws.onclose}`);
            });
        });

        await t.step("onerror", async (t) => {
            await t.step("get onerror()", () => {
                assert(rws.onerror === null, `onerror should be null, got ${rws.onerror}`);
            });
            await t.step("set onerror()", () => {
                rws.onerror = () => {};
                assert(rws.onerror !== null, `onerror should not be null, got ${rws.onerror}`);
            });
        });

        await t.step("onmessage", async (t) => {
            await t.step("get onmessage()", () => {
                assert(rws.onmessage === null, `onmessage should be null, got ${rws.onmessage}`);
            });
            await t.step("set onmessage()", () => {
                rws.onmessage = () => {};
                assert(rws.onmessage !== null, `onmessage should not be null, got ${rws.onmessage}`);
            });
        });

        await t.step("onopen", async (t) => {
            await t.step("get onopen()", () => {
                assert(rws.onopen === null, `onopen should be null, got ${rws.onopen}`);
            });
            await t.step("set onopen()", () => {
                rws.onopen = () => {};
                assert(rws.onopen !== null, `onopen should not be null, got ${rws.onopen}`);
            });
        });

        await t.step("close()", () => {
            assert(rws.readyState !== WebSocket.CLOSED, "Should not be closed yet");
            rws.close();
            assert(rws.readyState === WebSocket.CLOSED || rws.readyState === WebSocket.CLOSING, "Should be closed");
        });

        await t.step("send()", () => {
            const message = "Hello, World!";
            let received = "";
            rws.addEventListener("message", (ev) => received = ev.data);
            rws.dispatchEvent(new MessageEvent("message", { data: message }));
            assert(received === message, "Should receive the message");
        });

        await t.step("addEventListener()", async (t) => {
            await t.step("listener is fn", () => {
                let called = false;
                rws.addEventListener("message", () => called = true);
                rws.dispatchEvent(new Event("message"));
                assert(called, "Should call listener");
            });
            await t.step("listener is an object", () => {
                let called = false;
                rws.addEventListener("message", { handleEvent: () => called = true });
                rws.dispatchEvent(new Event("message"));
                assert(called, "Should call listener");
            });
        });

        await t.step("removeEventListener()", async (t) => {
            await t.step("listener is fn", () => {
                let called = false;
                const listener = () => called = true;
                rws.addEventListener("message", listener);
                rws.removeEventListener("message", listener);
                rws.dispatchEvent(new Event("message"));
                assert(!called, "Should not call listener");
            });
            await t.step("listener is an object", () => {
                let called = false;
                const listener = { handleEvent: () => called = true };
                rws.addEventListener("message", listener);
                rws.removeEventListener("message", listener);
                rws.dispatchEvent(new Event("message"));
                assert(!called, "Should not call listener");
            });
        });

        await t.step("dispatchEvent()", () => {
            let called = false;
            rws.addEventListener("open", () => called = true);
            rws.dispatchEvent(new Event("open"));
            assert(called, "Should call listener");
        });
    });

    await t.step("Reconnecting WebSocket", async (t) => {
        await t.step("protocols: Retains chosen protocol across reconnect", async () => {
            // We'll connect to our local server, offering "superchat".
            const rws = new ReconnectingWebSocket("ws://localhost:8080", ["superchat"], {
                maxRetries: 1,
            });

            // Wait for open
            await new Promise((resolve) => {
                rws.addEventListener("open", () => {
                    assertEquals(rws.protocol, "superchat", "Should have negotiated subprotocol 'superchat'");
                    resolve(null);
                }, { once: true });
            });

            // Temporarily close => triggers reconnection
            rws.close(undefined, undefined, false);

            // Wait for reconnection
            await new Promise((resolve) => {
                rws.addEventListener("open", () => {
                    assertEquals(rws.protocol, "superchat", "Should still have 'superchat' after reconnect");
                    resolve(null);
                }, { once: true });
            });

            rws.close();
        });

        await t.step("maxRetries: Respects maxRetries limit", async () => {
            const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                maxRetries: 2,
            });

            let closeCount = 0;
            rws.addEventListener("close", () => closeCount++);

            await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations

            assertEquals(rws.readyState, WebSocket.CLOSED, "WebSocket should be closed");
            // Typically: 1st "close" after initial connect fails, then 2 more reconnect attempts => total 3 close events
            // so (closeCount - 1) = 2 means it tried 2 reconnect attempts.
            assertEquals(closeCount - 1, 2, "Should have attempted to reconnect 'maxAttempts' times");

            rws.close();
        });

        await t.step("connectionTimeout: Tests related to 'connectionTimeout' option", async (t) => {
            await t.step("Connection timeout is disabled if set to 'connectionTimeout: null'", async () => {
                // First, let's check the first connection
                const rws = new ReconnectingWebSocket("ws://localhost:8080?delay=20000", undefined, {
                    connectionTimeout: null,
                });
                // Wait for the default connectionTimeout to pass (about 10 sec)
                await new Promise((resolve) => setTimeout(resolve, 15000));
                assertEquals(
                    rws.readyState,
                    WebSocket.CONNECTING,
                    `'readyState' should be 'CONNECTING', got ${rws.readyState}`,
                );

                // Now let's check the timeout on reconnection
                await new Promise((resolve) => rws.addEventListener("open", resolve, { once: true }));

                rws.close(undefined, undefined, false);
                await new Promise((resolve) => setTimeout(resolve, 15000));
                assertEquals(
                    rws.readyState,
                    WebSocket.CONNECTING,
                    `'readyState' should be 'CONNECTING', got ${rws.readyState}`,
                );

                // Clean up
                rws.close();
            });

            await t.step("Connection timeout if not opened in time", async () => {
                // Check that without connectionTimeout, the connection should succeed to our local server
                const rwsDefault = new ReconnectingWebSocket("ws://localhost:8080");
                await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations
                assertEquals(
                    rwsDefault.readyState,
                    WebSocket.OPEN,
                    "Without timeout, the server should open successfully",
                );
                rwsDefault.close();

                // Now let's make sure it's closed if 'connectionTimeout' is enabled
                const rwsTimeout = new ReconnectingWebSocket("ws://localhost:8080", undefined, {
                    connectionTimeout: 10,
                });
                await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations
                assert(
                    rwsTimeout.readyState === WebSocket.CLOSED || rwsTimeout.readyState === WebSocket.CLOSING,
                    "Should be closed by our short timeout",
                );
                rwsTimeout.close();
            });
        });

        await t.step("connectionDelay: Tests related to 'connectionDelay' option", async (t) => {
            await t.step("Calculates exponential backoff delay by default", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                    maxRetries: 3,
                });

                const closeTimes: number[] = [];
                rws.addEventListener("close", () => {
                    closeTimes.push(performance.now());
                });

                // Enough time to attempt ~3 reconnects
                await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations

                assert(closeTimes.length >= 2, "Should have multiple close events for exponential backoff test");

                for (let i = 1; i < closeTimes.length; i++) {
                    const diff = closeTimes[i] - closeTimes[i - 1];
                    // The default formula is roughly: Math.min(~~(1 << attempt) * 150, 10_000)
                    const expected = Math.min(~~(1 << i) * 150, 10_000);
                    assert(
                        diff >= expected && diff <= expected * 1.4,
                        `Close event #${i} expected backoff around ${expected}ms (+20%), but got ${diff}ms`,
                    );
                }

                rws.close();
            });

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

                await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations
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

                await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations
                rws.close();

                for (let i = 1; i < closeTimes.length; i++) {
                    const diff = closeTimes[i] - closeTimes[i - 1];
                    const expected = delays[i - 1] || delays[delays.length - 1];
                    assert(
                        diff >= expected && diff <= expected * 1.4,
                        `Close event #${i} waited less than the function-supplied delay. Expected ${expected}ms, got ${diff}ms`,
                    );
                }
            });
        });

        await t.step("shouldReconnect: Respects custom function 'shouldReconnect' when reconnecting", async () => {
            const maxRetries = 3;
            let internalCloseCount = 0;
            const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", undefined, {
                shouldReconnect: (event) => {
                    assertEquals(event instanceof CloseEvent, true, "shouldReconnect should receive CloseEvent");
                    return internalCloseCount++ < 3;
                },
                maxRetries: maxRetries * 2, // artificially high, but we manually limit in shouldReconnect
            });

            let closeCount = 0;
            rws.addEventListener("close", () => closeCount++);

            await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations

            // Should have original close + 3 reconnection attempts = 4 close events total
            assertEquals(closeCount, maxRetries + 1, "Should have attempted to reconnect exactly 3 times");

            rws.close();
        });

        await t.step("messageBuffer: Buffers messages when not open and replays on reconnect", async () => {
            // Using our real local server. We'll confirm that after reconnecting, the client actually
            // receives "echo" messages from the server. This proves the buffering logic worked.
            const rws = new ReconnectingWebSocket("ws://localhost:8080", undefined, {
                maxRetries: 1,
            });

            // Wait until open
            await new Promise((resolve) => {
                rws.addEventListener("open", resolve, { once: true });
            });

            // Now temporarily close
            rws.close(undefined, undefined, false);

            // Send messages while physically closed => they should go into buffer
            rws.send("HelloAfterClose1");
            rws.send("HelloAfterClose2");

            assertEquals(
                rws.reconnectOptions.messageBuffer.messages.length,
                2,
                "Should be buffered while closed",
            );

            // We'll listen for messages after the reconnect
            let messageCount = 0;
            const receivedMessages: string[] = [];
            rws.addEventListener("message", (ev) => {
                messageCount++;
                receivedMessages.push(ev.data);
            });

            // Wait a bit for reconnection
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // By now, if it reconnected successfully, the buffered messages were sent.
            // Our server echoes them back, so we expect 2 echo messages.
            assertEquals(messageCount, 2, "Should have received 2 echo messages from server");
            assertEquals(receivedMessages.includes("echo:HelloAfterClose1"), true);
            assertEquals(receivedMessages.includes("echo:HelloAfterClose2"), true);

            // And the internal buffer should be empty
            assertEquals(
                rws.reconnectOptions.messageBuffer.messages.length,
                0,
                "Buffer should be cleared after replay",
            );

            rws.close();
        });

        await t.step("close(): Tests related to modified 'close' method", async (t) => {
            await t.step("close(permanently = true) prevents reconnection", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", [], {
                    maxRetries: 3,
                });

                let closeEvents = 0;
                rws.addEventListener("close", () => closeEvents++);

                rws.close();

                await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations

                assertEquals(closeEvents, 1, "Should have only 1 close event");
                assertEquals(rws.readyState, WebSocket.CLOSED, "Socket should remain closed");
                assertEquals(rws.terminationSignal.aborted, true, "Should be permanently closed");

                rws.close();
            });

            await t.step("close(permanently = false) closes but does not stop reconnection logic", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", [], {
                    maxRetries: 3,
                });

                let closeEvents = 0;
                rws.addEventListener("close", () => closeEvents++);

                rws.close(undefined, undefined, false);

                await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for network operations

                assertEquals(closeEvents, 4, "Should have multiple close events for reconnection");
                assertEquals(rws.readyState, WebSocket.CLOSED, "Socket should remain closed");
                assertEquals(rws.terminationSignal.aborted, true, "Should be permanently closed");

                rws.close();
            });
        });

        await t.step("Tests related to event listeners", async (t) => {
            await t.step("Re-registers event listeners after reconnection", async () => {
                // We test that if the connection is lost, any event listeners we added remain active
                // after the socket is re-created internally.
                // We'll do this with a valid server: we close() temporarily and confirm the listener
                // still receives messages upon reconnect.

                const rws = new ReconnectingWebSocket("ws://localhost:8080", undefined, {
                    maxRetries: 1,
                });

                let openCount = 0;
                rws.addEventListener("open", () => {
                    openCount++;
                });

                let messageCount = 0;
                rws.addEventListener("message", () => {
                    messageCount++;
                });

                // Wait for initial open
                await new Promise((resolve) => setTimeout(resolve, 5000));
                assertEquals(openCount, 1, "Should have opened once so far");

                // Temporarily close => triggers reconnection
                rws.close(undefined, undefined, false);

                // Wait for it to reconnect
                await new Promise((resolve) => setTimeout(resolve, 5000));
                // Should open again => openCount now 2
                assertEquals(openCount, 2, "Should have reconnected, so open fired again");

                // Send a message => see if the 'message' listener still works
                rws.send("TestingReRegistration");
                await new Promise((resolve) => setTimeout(resolve, 1000));

                assertEquals(
                    messageCount,
                    1,
                    "Should have received an echo for the new message after reconnection",
                );

                rws.close();
            });

            await t.step("Executes { once: true } listener only 1 time and does not reconnect", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", [], {
                    maxRetries: 2,
                });

                let closeOnceCalls = 0;
                const onceClose = () => closeOnceCalls++;
                rws.addEventListener("close", onceClose, { once: true });

                // Wait, multiple closes will happen (initial + reconnect attempts)
                await new Promise((resolve) => setTimeout(resolve, 5000));

                // The socket had multiple close events, but the { once: true } handler
                // should have fired exactly once, then removed itself.
                assertEquals(closeOnceCalls, 1, "The { once: true } close listener should only run once");

                rws.close();
            });

            await t.step("Adding identical listeners does not increase eventListeners array", () => {
                const rws = new ReconnectingWebSocket("ws://localhost:8080");
                const handler = () => {};

                // @ts-ignore - internal property
                assertEquals(rws._eventListeners.length, 0, "Initially no event listeners stored");

                // Add the same listener multiple times
                rws.addEventListener("message", handler);
                rws.addEventListener("message", handler);
                rws.addEventListener("message", handler);

                // @ts-ignore - internal property
                assertEquals(rws._eventListeners.length, 1, "Should still only have 1 event listener after duplicates");

                // Remove it once, array should be empty
                rws.removeEventListener("message", handler);
                // @ts-ignore - internal property
                assertEquals(rws._eventListeners.length, 0, "Should have no listeners after removal");

                rws.close();
            });
        });

        await t.step("Cleans up resources after closing", async () => {
            const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", [], {
                maxRetries: 1,
            });

            rws.addEventListener("message", () => {}); // goes into listeners
            rws.send("testCleanup"); // goes into buffer

            // Wait, then close permanently
            await new Promise((resolve) => setTimeout(resolve, 1000));
            rws.close();

            // @ts-ignore - accessing private properties
            assertEquals(rws._eventListeners.length, 0, "Event listeners must be cleared on permanent close");
            assertEquals(rws.reconnectOptions.messageBuffer.messages.length, 0, "Message buffer must be cleared");
            assert(rws.terminationSignal.aborted, "terminationSignal must be aborted after cleanup");
        });

        await t.step("terminationSignal: Tests related to 'terminationSignal'", async (t) => {
            await t.step("Error in reconnection process aborts permanently", async () => {
                // If there's an error inside shouldReconnect, we expect the entire process to abort
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", [], {
                    maxRetries: 3,
                    shouldReconnect: () => {
                        throw new Error("BOOM");
                    },
                });

                let closeEvents = 0;
                rws.addEventListener("close", () => closeEvents++);

                await new Promise((resolve) => setTimeout(resolve, 3000));

                assertEquals(closeEvents, 1, "Should permanently abort after the first close event");
                assert(rws.terminationSignal.aborted, "terminationSignal must be aborted due to error");
                rws.close();
            });

            await t.step("'terminationSignal' indicates permanent closure and reason for termination", async () => {
                // Check that after maxRetries=0, we get "RECONNECTION_LIMIT_REACHED"
                const rws1 = new ReconnectingWebSocket("ws://invalid4567t7281.com", [], {
                    maxRetries: 0,
                });

                const signal1 = rws1.terminationSignal;
                let reason1: unknown;

                signal1.addEventListener("abort", () => {
                    reason1 = signal1.reason;
                });

                await new Promise((resolve) => setTimeout(resolve, 2000));
                assert(
                    reason1 instanceof ReconnectingWebSocketError,
                    "Reason should be an ReconnectingWebSocketError",
                );
                assertEquals(
                    reason1.message,
                    "Error when reconnecting WebSocket: RECONNECTION_LIMIT_REACHED",
                    "Expected RECONNECTION_LIMIT_REACHED when maxRetries=0",
                );
                rws1.close();

                // Check user-initiated close reason
                const rws2 = new ReconnectingWebSocket("ws://localhost:8080");
                const signal2 = rws2.terminationSignal;
                let reason2: unknown;
                signal2.addEventListener("abort", () => {
                    reason2 = signal2.reason;
                });

                rws2.close();
                assert(signal2.aborted, "Should be aborted immediately upon user close");
                assert(
                    reason2 instanceof ReconnectingWebSocketError,
                    "Reason must be an ReconnectingWebSocketError after cleanup",
                );
                assertEquals(
                    reason2.message,
                    "Error when reconnecting WebSocket: USER_INITIATED_CLOSE",
                    "Expected user-initiated close reason",
                );
            });

            await t.step("Checking aborted signal after 'shouldReconnect'", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", [], {
                    maxRetries: 2,
                    shouldReconnect: () => {
                        rws.close(3001, "Manual abort", true);
                        return true;
                    },
                });
                await new Promise((resolve) => setTimeout(resolve, 2000));
                assert(rws.terminationSignal.aborted, "Should be aborted after manual close");
                assert(
                    rws.terminationSignal.reason instanceof ReconnectingWebSocketError,
                    "Reason should be an ReconnectingWebSocketError",
                );
                assertEquals(
                    rws.terminationSignal.reason.message,
                    "Error when reconnecting WebSocket: USER_INITIATED_CLOSE",
                    "Expected USER_INITIATED_CLOSE reason",
                );
            });

            await t.step("Checking aborted signal after 'connectionDelay'", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", [], {
                    maxRetries: 2,
                    connectionDelay: () => {
                        rws.close(3001, "Manual abort", true);
                        return 0;
                    },
                });
                await new Promise((resolve) => setTimeout(resolve, 2000));
                assert(rws.terminationSignal.aborted, "Should be aborted after manual close");
                assert(
                    rws.terminationSignal.reason instanceof ReconnectingWebSocketError,
                    "Reason should be an ReconnectingWebSocketError",
                );
                assertEquals(
                    rws.terminationSignal.reason.message,
                    "Error when reconnecting WebSocket: USER_INITIATED_CLOSE",
                    "Expected USER_INITIATED_CLOSE reason",
                );
            });

            await t.step("Checking 'onAbort' in 'sleep' on reconnect", async () => {
                const rws = new ReconnectingWebSocket("ws://invalid4567t7281.com", [], {
                    maxRetries: 2,
                    connectionDelay: 10000,
                });
                await new Promise((resolve) => setTimeout(resolve, 2000));
                rws.close(3001, "Manual abort", true);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                assert(rws.terminationSignal.aborted, "Should be aborted after manual close");
                assert(
                    rws.terminationSignal.reason instanceof ReconnectingWebSocketError,
                    "Reason should be an ReconnectingWebSocketError",
                );
                assertEquals(
                    rws.terminationSignal.reason.message,
                    "Error when reconnecting WebSocket: USER_INITIATED_CLOSE",
                    "Expected USER_INITIATED_CLOSE reason",
                );
            });
        });
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await server.shutdown();
});
