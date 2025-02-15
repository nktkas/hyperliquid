import { assert, assertEquals, assertRejects } from "jsr:@std/assert@^1.0.10";
import { WebSocketTransport } from "../../../src/transports/websocket/websocket_transport.ts";

Deno.test("WebSocketTransport Tests", async (t) => {
    const server = Deno.serve(
        { port: 8080, onListen: () => {} },
        (request) => {
            if (request.headers.get("upgrade") !== "websocket") {
                return new Response("Not a websocket", { status: 400 });
            }

            const url = new URL(request.url);
            const testCase = url.searchParams.get("test");

            const { socket, response } = Deno.upgradeWebSocket(request);
            socket.addEventListener("message", (ev) => {
                try {
                    const data = JSON.parse(ev.data);
                    if (data.method === "post") {
                        if (testCase === "request-fail") {
                            socket.send(JSON.stringify({
                                channel: "error",
                                data: "Request failed: " + JSON.stringify(data),
                            }));
                        } else if (testCase === "request-timeout") {
                            // Do nothing
                        } else if (testCase === "request-no-timeout") {
                            setTimeout(() => {
                                socket.send(JSON.stringify({
                                    channel: "post",
                                    data: {
                                        id: data.id,
                                        response: {
                                            type: "info",
                                            payload: { data: "very-late-response" },
                                        },
                                    },
                                }));
                            }, 15_000);
                        } else { // Default
                            socket.send(JSON.stringify({
                                channel: "post",
                                data: {
                                    id: data.id,
                                    response: { type: "info", payload: { data: "response-success" } },
                                },
                            }));
                        }
                    } else if (data.method === "subscribe") {
                        if (testCase === "subscribe-fail") {
                            socket.send(JSON.stringify({
                                channel: "error",
                                data: "Subscription failed: " + JSON.stringify(data.subscription),
                            }));
                        } else if (testCase === "subscribe-timeout") {
                            // Do nothing
                        } else if (testCase === "subscribe-no-timeout") {
                            setTimeout(() => {
                                socket.send(JSON.stringify({
                                    channel: "subscriptionResponse",
                                    data: {
                                        method: "subscribe",
                                        subscription: data.subscription,
                                    },
                                }));
                            }, 15_000);
                        } else if (testCase === "subscribe-delay") {
                            setTimeout(() => {
                                socket.send(JSON.stringify({
                                    channel: "subscriptionResponse",
                                    data: {
                                        method: "subscribe",
                                        subscription: data.subscription,
                                    },
                                }));
                            }, 5000);
                        } else { // Default
                            socket.send(JSON.stringify({
                                channel: "subscriptionResponse",
                                data: {
                                    method: "subscribe",
                                    subscription: data.subscription,
                                },
                            }));

                            if (data.subscription && data.subscription.channel) {
                                socket.send(JSON.stringify({
                                    channel: data.subscription.channel,
                                    data: { update: "subscription update" },
                                }));
                            }
                        }
                    } else if (data.method === "unsubscribe") {
                        if (testCase === "unsubscribe-fail") {
                            socket.send(JSON.stringify({
                                channel: "error",
                                data: "Unsubscribe failed: " + JSON.stringify(data.subscription),
                            }));
                        } else if (testCase === "unsubscribe-timeout") {
                            // Do nothing
                        } else { // Default
                            socket.send(JSON.stringify({
                                channel: "subscriptionResponse",
                                data: {
                                    method: "unsubscribe",
                                    subscription: data.subscription,
                                },
                            }));
                        }
                    } else if (data.method === "ping") {
                        socket.send(JSON.stringify({ channel: "pong" }));
                    }
                } catch {
                    // Ignore JSON errors
                }
            });
            return response;
        },
    );

    await t.step("constructor", async (t) => {
        await t.step("url", async (t) => {
            await t.step("default url", async () => {
                const transport = new WebSocketTransport();
                assertEquals(transport.socket.url, "wss://api.hyperliquid.xyz/ws");
                await transport.close();
            });
            await t.step("custom url", async () => {
                const transport = new WebSocketTransport({ url: "ws://localhost-test-123:8080" });
                assertEquals(transport.socket.url, "ws://localhost-test-123:8080/");
                await transport.close();
            });
        });
        await t.step("custom timeout", async (t) => {
            await t.step("default timeout", async () => {
                const transport = new WebSocketTransport();
                assertEquals(transport.timeout, 10_000);
                await transport.close();
            });
            await t.step("custom timeout", async () => {
                const transport = new WebSocketTransport({ timeout: 100 });
                assertEquals(transport.timeout, 100);
                await transport.close();
            });
        });
        await t.step("custom keepAlive.interval", async (t) => {
            await t.step("default keepAlive.interval", async () => {
                const transport = new WebSocketTransport();
                assertEquals(transport.keepAlive.interval, 20_000);
                await transport.close();
            });
            await t.step("custom keepAlive.interval", async () => {
                const transport = new WebSocketTransport({ keepAlive: { interval: 100 } });
                assertEquals(transport.keepAlive.interval, 100);
                await transport.close();
            });
        });
    });

    await t.step("request()", async (t) => {
        await t.step("Send post request and resolves with server response", async () => {
            // Setup
            const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
            await transport.ready();

            const result = await transport.request("info", { key: "value" });
            assertEquals(result, "response-success");

            // Clean up
            await transport.close();
        });

        await t.step("Reject", async (t) => {
            await t.step("Reject explorer type", async () => {
                // Calling request with type "explorer" should throw immediately

                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });

                await assertRejects(
                    async () => {
                        await transport.request("explorer", { key: "value" });
                    },
                    Error,
                    "Explorer requests are not supported in the Hyperliquid WebSocket API.",
                );

                // Clean up
                await transport.close();
            });

            await t.step("Reject an unsuccessful request", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-fail" });
                await transport.ready();

                await assertRejects(
                    async () => {
                        await transport.request("info", { key: "value" });
                    },
                    Error,
                    "Cannot complete WebSocket request:",
                );

                // Clean up
                await transport.close();
            });

            await t.step("Reject if AbortSignal is aborted", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
                await transport.ready();

                const signal = AbortSignal.abort(new Error("Aborted"));
                await assertRejects(
                    async () => {
                        await transport.request("info", { key: "value" }, signal);
                    },
                    Error,
                    "Aborted",
                );

                // Clean up
                await transport.close();
            });

            await t.step("Reject after timeout expires", async () => {
                // Setup
                const transport = new WebSocketTransport({
                    url: "ws://localhost:8080/?test=request-timeout",
                    timeout: 100,
                });
                await transport.ready();

                await assertRejects(
                    async () => {
                        await transport.request("info", { key: "value" });
                    },
                    DOMException,
                    "Signal timed out.",
                );

                // Clean up
                await transport.close();
            });

            await t.step("If timeout is not set, never reject", async () => {
                // Context: Default timeout is 10 seconds, but the server will respond after 15 seconds

                // Setup
                const transport = new WebSocketTransport({
                    url: "ws://localhost:8080/?test=request-no-timeout",
                    timeout: null,
                });
                await transport.ready();

                await transport.request("info", { key: "value" });

                // Clean up
                await transport.close();
            });
        });
    });

    // The following things need to be tested:
    // - Standard use: subscription request/response, receive event, unsubscribe request/response
    // - Correct signal processing for requests
    // - No double subscription/unsubscription request
    // - Distribution of a single event to listeners
    // - Resolution of a promise after receipt of a response
    // - Correct resource cleansing
    await t.step("subscribe()", async (t) => {
        await t.step(
            "Standard use: subscription request/response, receive event, unsubscribe request/response",
            async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=subscribe-success" });
                await transport.ready();

                // Subscribe to an event
                let eventReceived = false;
                const listener = (e: CustomEvent) => {
                    if (e.detail && e.detail.update === "subscription update") {
                        eventReceived = true;
                    }
                };
                const payload = { channel: "testEvent", extra: "data" };
                const sub = await transport.subscribe("testEvent", payload, listener);

                // Check that the subscription was added
                await new Promise((r) => setTimeout(r, 100));
                assertEquals(eventReceived, true);

                // Unsubscribe
                await sub.unsubscribe();

                // Check that the subscription was removed
                await new Promise((r) => setTimeout(r, 100));
                assertEquals(
                    // @ts-ignore - Accessing private properties for testing
                    transport._subscriptions.has(JSON.stringify(payload)),
                    false,
                    "Subscription should be removed after unsubscribe",
                );

                // Clean up
                await transport.close();
            },
        );

        await t.step(
            "A listener added twice should not be added to the internal list of listeners",
            async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=subscribe-success" });
                await transport.ready();

                const payload = { channel: "testEvent", extra: "data" };
                const listener = () => {};
                await transport.subscribe("testEvent", payload, listener);
                await transport.subscribe("testEvent", payload, listener);

                assertEquals(
                    // @ts-ignore - Accessing private properties for testing
                    transport._subscriptions.size,
                    1,
                    "Only one subscription should be created",
                );
                assertEquals(
                    // @ts-ignore - Accessing private properties for testing
                    transport._subscriptions.get(JSON.stringify(payload))?.listeners.size,
                    1,
                    "Only one listener should be added to the subscription",
                );

                // Clean up
                await transport.close();
            },
        );

        await t.step(
            "Two different listeners for the same event should not create a new list of event listeners",
            async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=subscribe-success" });
                await transport.ready();

                const payload = { channel: "testEvent", extra: "data" };
                const listener1 = () => {};
                const listener2 = () => {};
                await transport.subscribe("testEvent", payload, listener1);
                await transport.subscribe("testEvent", payload, listener2);

                assertEquals(
                    // @ts-ignore - Accessing private properties for testing
                    transport._subscriptions.size,
                    1,
                    "Only one subscription should be created",
                );
                assertEquals(
                    // @ts-ignore - Accessing private properties for testing
                    transport._subscriptions.get(JSON.stringify(payload))?.listeners.size,
                    2,
                    "Both listeners should be added to the subscription",
                );

                // Clean up
                await transport.close();
            },
        );

        await t.step(
            "A subscription object must be the same across different listeners for the same event",
            async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=subscribe-success" });
                await transport.ready();

                const payload = { channel: "testEvent", extra: "data" };
                const listener = () => {};
                const sub1 = await transport.subscribe("testEvent", payload, listener);
                const sub2 = await transport.subscribe("testEvent", payload, listener);

                assertEquals(sub1.unsubscribe, sub2.unsubscribe, "Both subscriptions should be the same");

                // Clean up
                await transport.close();
            },
        );

        await t.step(
            "A second listener added after the first listener should not send a subscription request",
            async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=subscribe-success" });
                await transport.ready();

                const payload = { channel: "singleSubRequest", extra: "data" };
                const listener1 = () => {};
                const listener2 = () => {};

                transport.subscribe("singleSubRequest", payload, listener1);
                transport.subscribe("singleSubRequest", payload, listener2);

                assertEquals(
                    // @ts-ignore - Accessing private properties for testing
                    transport._wsRequester.pending.size,
                    1,
                    "Only 1 subscription request should be in pending, despite two listeners",
                );

                // Clean up
                await transport.close();
            },
        );

        await t.step(
            "New listeners must wait for a response to a subscription request",
            async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=subscribe-delay" });
                await transport.ready();

                const payload = { channel: "slowSub", extra: "data" };

                // First subscribe - server will respond after 5 seconds
                const subPromise1 = transport.subscribe("slowSub", payload, () => {});

                // Second subscribe - should wait for the first to complete
                let secondCompleted = false;
                transport.subscribe("slowSub", payload, () => {}).then(() => secondCompleted = true);

                // If the second promise resolves before the first, the test will fail
                await new Promise((r) => setTimeout(r, 100));
                assertEquals(secondCompleted, false, "Second subscription should not complete yet");

                // Now wait for the first subscription to complete
                await subPromise1;
                await new Promise((r) => setTimeout(r, 10));
                assertEquals(secondCompleted, true, "Second subscription should complete after the first");

                // Clean up
                await transport.close();
            },
        );

        await t.step(
            "If the subscription request fails, resources must be released",
            async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=subscribe-fail" });
                await transport.ready();

                const payload = { channel: "failSub", reason: "testing" };
                const listener = () => {};

                await assertRejects(
                    async () => {
                        await transport.subscribe("failSub", payload, listener);
                    },
                    Error,
                    "Cannot complete WebSocket request:",
                );

                assert(
                    // @ts-ignore - Accessing private properties for testing
                    !transport._subscriptions.has(JSON.stringify(payload)),
                    "Subscription should not be added to the list of subscriptions",
                );

                // Clean up
                await transport.close();
            },
        );

        await t.step("Reject", async (t) => {
            await t.step("Reject if AbortSignal is aborted", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=subscribe-success" });
                await transport.ready();

                await assertRejects(
                    async () => {
                        await transport.subscribe(
                            "testEvent",
                            { channel: "testEvent", extra: "data" },
                            () => {},
                            AbortSignal.abort(new Error("Aborted")),
                        );
                    },
                    Error,
                    "Aborted",
                );
                // Clean up
                await transport.close();
            });

            await t.step("Reject after timeout expires", async () => {
                // Setup
                const transport = new WebSocketTransport({
                    url: "ws://localhost:8080/?test=subscribe-timeout",
                    timeout: 100,
                });
                await transport.ready();

                await assertRejects(
                    async () => {
                        await transport.subscribe("testTimeout", { channel: "testTimeout" }, () => {});
                    },
                    DOMException,
                    "Signal timed out.",
                );

                // Clean up
                await transport.close();
            });

            await t.step("If timeout is not set, never reject", async () => {
                // Context: Default timeout is 10 seconds, but the server will respond after 15 seconds

                // Setup
                const transport = new WebSocketTransport({
                    url: "ws://localhost:8080/?test=subscribe-no-timeout",
                    timeout: null,
                });
                await transport.ready();

                await transport.subscribe("testNoTimeout", { channel: "testNoTimeout" }, () => {});

                // Clean up
                await transport.close();
            });
        });
    });

    await t.step("unsubscribe()", async (t) => {
        await t.step("Unsubscribe a listener, request to be unsubscribed and clear resources", async () => {
            // Setup
            const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=unsubscribe-success" });
            await transport.ready();

            // First, subscribe to an event
            const payload = { channel: "testUnsub" };
            const listener = () => {};
            const sub = await transport.subscribe("testUnsub", payload, listener);

            // Unsubscribe the listener
            await sub.unsubscribe();
            assert(
                // @ts-ignore - Accessing private properties for testing
                !transport._subscriptions.has(JSON.stringify(payload)),
                "Must remove subscription after unsubscribe",
            );

            // Clean up
            await transport.close();
        });

        await t.step("Do not send an unsubscribe request if there are more listeners", async () => {
            // Setup
            const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=unsubscribe-success" });
            await transport.ready();

            // First, subscribe to an event
            const payload = { channel: "testUnsubMulti" };
            const listener1 = () => {};
            const listener2 = () => {};

            const sub1 = await transport.subscribe("testUnsubMulti", payload, listener1);
            await transport.subscribe("testUnsubMulti", payload, listener2);

            // Unsubscribe the first listener
            await sub1.unsubscribe();
            assertEquals(
                // @ts-ignore - Accessing private properties for testing
                transport._subscriptions.get(JSON.stringify(payload))?.listeners.size,
                1,
                "Only one listener should remain",
            );

            // Clean up
            await transport.close();
        });

        await t.step("Clears subscriptions on close", async () => {
            // Setup
            const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=unsubscribe-success" });
            await transport.ready();

            // First, subscribe to an event
            const payload = { channel: "closeSubs" };
            const listener = () => {};
            await transport.subscribe("closeSubs", payload, listener);

            // Close the transport
            await transport.close();
            assertEquals(
                // @ts-ignore - Accessing private properties for testing
                transport._subscriptions.size,
                0,
                "All subscriptions must be cleared on close",
            );
        });

        await t.step("Reject", async (t) => {
            await t.step("Reject if AbortSignal is aborted", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=unsubscribe-success" });
                await transport.ready();

                // First, subscribe to an event
                const payload = { channel: "testAbortUnsub" };
                const listener = () => {};
                const sub = await transport.subscribe("testAbortUnsub", payload, listener);

                // Unsubscribe the listener
                await assertRejects(
                    async () => {
                        await sub.unsubscribe(AbortSignal.abort(new Error("Unsub aborted")));
                    },
                    Error,
                    "Unsub aborted",
                );

                // Clean up
                await transport.close();
            });

            await t.step("Reject after timeout expires", async () => {
                // Setup
                const transport = new WebSocketTransport({
                    url: "ws://localhost:8080/?test=unsubscribe-timeout",
                    timeout: 100,
                });
                await transport.ready();

                // First, subscribe to an event
                const payload = { channel: "timeoutUnsub" };
                const listener = () => {};
                const sub = await transport.subscribe("timeoutUnsub", payload, listener);

                // Unsubscribe the listener
                await assertRejects(
                    async () => {
                        await sub.unsubscribe();
                    },
                    DOMException,
                    "Signal timed out.",
                );

                // Clean up
                await transport.close();
            });

            await t.step("If timeout is not set, never reject", async () => {
                // Context: Default timeout is 10 seconds, but the server will respond after 15 seconds

                // Setup
                const transport = new WebSocketTransport({
                    url: "ws://localhost:8080/?test=unsubscribe-no-timeout",
                    timeout: null,
                });
                await transport.ready();

                // First, subscribe to an event
                const payload = { channel: "noTimeoutUnsub" };
                const listener = () => {};
                const sub = await transport.subscribe("noTimeoutUnsub", payload, listener);

                // Unsubscribe the listener
                await sub.unsubscribe();
                assert(
                    // @ts-ignore - Accessing private properties for testing
                    !transport._subscriptions.has(JSON.stringify(payload)),
                    "Must remove subscription after unsubscribe",
                );

                // Clean up
                await transport.close();
            });
        });
    });

    await t.step("ready()", async (t) => {
        await t.step("Resolve", async (t) => {
            await t.step("Resolve as soon as the socket is open", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
                await transport.ready();
                // Clean up
                await transport.close();
            });

            await t.step("Resolve immediately if the socket is already open", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
                await transport.ready();

                const start = performance.now();
                await transport.ready();
                const dur = performance.now() - start;
                assert(dur < 20, `ready() again should resolve immediately, took ${dur}ms`);

                // Clean up
                await transport.close();
            });
        });

        await t.step("AbortSIgnal check", async (t) => {
            await t.step("Reject immediately if the signal has already been aborted", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });

                const alreadyAborted = AbortSignal.abort(new Error("Already aborted"));
                await assertRejects(
                    async () => {
                        await transport.ready(alreadyAborted);
                    },
                    Error,
                    "Already aborted",
                );
                // Clean up
                await transport.close();
            });

            await t.step("Reject if the signal is later aborted", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });

                const controller = new AbortController();
                const promise = transport.ready(controller.signal);
                controller.abort(new Error("Aborted later"));

                await assertRejects(
                    async () => {
                        await promise;
                    },
                    Error,
                    "Aborted later",
                );

                // Clean up
                await transport.close();
            });
        });

        await t.step("Reject if the connection is permanently closed", async () => {
            // Setup
            const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });

            await transport.close();
            await assertRejects(
                async () => {
                    await transport.ready();
                },
                Error,
                "USER_INITIATED_CLOSE",
            );
        });
    });

    await t.step("close()", async (t) => {
        await t.step("Resolve", async (t) => {
            await t.step("Resolve as soon as the socket is closed", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
                await transport.ready();
                // Clean up
                await transport.close();
            });

            await t.step("Resolve immediately if the socket is already closed", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
                await transport.ready();
                await transport.close();

                const start = performance.now();
                await transport.close();
                const dur = performance.now() - start;
                assert(dur < 20, `close() again should resolve immediately, took ${dur}ms`);
            });
        });

        await t.step("AbortSIgnal check", async (t) => {
            await t.step("Reject immediately if the signal has already been aborted", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
                await transport.ready();

                const aborted = AbortSignal.abort(new Error("Already aborted close"));
                await assertRejects(
                    async () => {
                        await transport.close(aborted);
                    },
                    Error,
                    "Already aborted close",
                );

                // Clean up
                await transport.close();
            });

            await t.step("Reject if the signal is later aborted", async () => {
                // Setup
                const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=request-success" });
                await transport.ready();

                const controller = new AbortController();
                const promise = transport.close(controller.signal);
                controller.abort(new Error("Close aborted"));

                await assertRejects(
                    async () => {
                        await promise;
                    },
                    Error,
                    "Close aborted",
                );

                // Clean up
                await transport.close();
            });
        });
    });

    await t.step("keepAlive", async (t) => {
        await t.step("Send ping messages after connection open", async () => {
            // Setup
            const transport = new WebSocketTransport({
                url: "ws://localhost:8080/?test=ping",
                keepAlive: { interval: 5000 },
            });
            await transport.ready();

            let pingSent = false;
            let pongReceived = false;

            const originalSend = transport.socket.send.bind(transport.socket);
            transport.socket.send = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
                try {
                    const msg = JSON.parse(data.toString());
                    if (msg.method === "ping") {
                        pingSent = true;
                    }
                } catch {
                    // Ignore JSON errors
                }
                return originalSend(data);
            };
            transport.socket.addEventListener("message", (ev: MessageEvent) => {
                try {
                    const data = JSON.parse(ev.data);
                    if (data.channel === "pong") {
                        pongReceived = true;
                    }
                } catch {
                    // Ignore JSON errors
                }
            });

            await new Promise((r) => setTimeout(r, transport.keepAlive.interval! + 3000));

            assert(pingSent, "Ping has not been sent");
            assert(pongReceived, "Pong has not been received");

            // Clean up
            await transport.close();
        });

        await t.step("Stops sending ping messages after closing", async () => {
            // Setup
            const transport = new WebSocketTransport({ url: "ws://localhost:8080/?test=ping" });
            await transport.ready();

            // Check that the timer is set
            assert(
                // @ts-ignore - Accessing private properties for testing
                transport._keepAliveTimer !== null,
                "Keep alive timer must be set after open",
            );

            // Close the connection and check that the timer is cleared
            await transport.close();
            assert(
                // @ts-ignore - Accessing private properties for testing
                transport._keepAliveTimer === null,
                "Keep alive timer must be cleared after close",
            );
        });
    });

    await server.shutdown();
});
