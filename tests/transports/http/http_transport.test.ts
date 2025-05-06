// deno-lint-ignore-file require-await

import { assert, assertEquals, assertIsError, assertRejects } from "jsr:@std/assert@^1.0.10";
import { HttpRequestError, HttpTransport } from "../../../src/transports/http/http_transport.ts";

Deno.test("HttpTransport Tests", async (t) => {
    const originalFetch = globalThis.fetch;

    // 1) Testnet / Mainnet URL Modifications
    await t.step("Testnet / Mainnet URL Modifications", async (t) => {
        await t.step("isTestnet=true", async () => {
            const transport = new HttpTransport({ isTestnet: true });

            // Test for endpoint 'info' with isTestnet=true
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api.hyperliquid-testnet.xyz/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});

            // Test for endpoint 'explorer' with isTestnet=true
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://rpc.hyperliquid-testnet.xyz/explorer");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("explorer", {});

            // Test for endpoint 'exchange' with isTestnet=true
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api.hyperliquid-testnet.xyz/exchange");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("exchange", {});
        });

        await t.step("isTestnet=false (default)", async () => {
            const transport = new HttpTransport(); // isTestnet defaults to false

            // Test for endpoint 'info' with isTestnet=false
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api.hyperliquid.xyz/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});

            // Test for endpoint 'explorer' with isTestnet=false
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://rpc.hyperliquid.xyz/explorer");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("explorer", {});

            // Test for endpoint 'exchange' with isTestnet=false
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api.hyperliquid.xyz/exchange");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("exchange", {});
        });

        await t.step("explicitly set isTestnet=false", async () => {
            const transport = new HttpTransport({ isTestnet: false });

            // Test for endpoint 'info' with explicit isTestnet=false
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api.hyperliquid.xyz/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});
        });
    });

    // 2) Successful JSON response using default base + endpoint path
    await t.step("Success response (status 200, JSON)", async () => {
        globalThis.fetch = async (req: RequestInfo | URL) => {
            req = new Request(req);

            // Should use default base "https://api.hyperliquid.xyz" + "/info"
            assert(req.url.includes("https://api.hyperliquid.xyz/info"), `Unexpected request URL: ${req.url}`);
            assertEquals(req.method, "POST");
            assertEquals(req.headers.get("Content-Type"), "application/json");
            return new Response("{}", {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        };

        const transport = new HttpTransport();
        await transport.request("info", { data: "test-payload" });
    });

    // 3) Error response tests
    await t.step("Error response tests", async (t) => {
        await t.step("Non-200 status (throws HttpRequestError)", async () => {
            globalThis.fetch = async () =>
                new Response("Server Error", {
                    status: 500,
                    statusText: "Internal Error",
                    headers: { "Content-Type": "text/plain" },
                });

            const transport = new HttpTransport();
            await assertRejects(() => transport.request("exchange", { foo: "bar" }), HttpRequestError);
        });

        await t.step("Response body unloading on failed request", async () => {
            globalThis.fetch = async () => {
                const response = new Response("body", {
                    status: 500,
                    headers: { "Content-Type": "text/plain" },
                });
                // Read the body to cause an error the next time `.text()` is called
                await response.text();
                return response;
            };

            const transport = new HttpTransport();

            try {
                await transport.request("info", { test: "body-unload" });
                throw new Error("Expected HttpRequestError");
            } catch (error) {
                assert(error instanceof HttpRequestError, "Expected `HttpRequestError`");
                assertEquals(error.responseBody, undefined, "Expected `responseBody` to be `undefined`");
                assert(error.response.bodyUsed, "Expected `response.bodyUsed` to be `true`");
            }
        });

        await t.step("Invalid Content-Type (text/html)", async () => {
            globalThis.fetch = async () =>
                new Response("<html>not json</html>", {
                    status: 200,
                    headers: { "Content-Type": "text/html" },
                });

            const transport = new HttpTransport();
            await assertRejects(() => transport.request("explorer", {}), HttpRequestError);
        });

        await t.step("Body includes error type", async () => {
            // Example of a real error:
            // txDetails({ hash: "0x556ecab2c80c2d0124690412855269000009aec1fbc0bc9a7df2f8e786eca2e1" })

            globalThis.fetch = async () => {
                return new Response(JSON.stringify({ type: "error", message: "test error" }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };

            const transport = new HttpTransport();
            await assertRejects(() => transport.request("explorer", {}), HttpRequestError);
        });
    });

    // 4) onRequest callback modifies request (URL, custom headers, etc.)
    await t.step("onRequest callback modifies request", async () => {
        globalThis.fetch = async (req: RequestInfo | URL) => {
            req = new Request(req);

            assertEquals(req.url, "https://example.com/custom-info");
            assertEquals(req.headers.get("X-My-Header"), "Test123");
            return new Response("{}", {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        };

        const transport = new HttpTransport({
            onRequest: (req) => {
                const newHeaders = new Headers(req.headers);
                newHeaders.set("X-My-Header", "Test123");
                return new Request("https://example.com/custom-info", {
                    ...req,
                    headers: newHeaders,
                });
            },
        });

        await transport.request("info", { data: 1 });
    });

    // 5) onResponse callback replaces the original response
    await t.step("onResponse callback replaces response", async () => {
        globalThis.fetch = async () =>
            new Response("{}", {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });

        const transport = new HttpTransport({
            onResponse: () => {
                // Return a completely new response
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            },
        });

        await transport.request("info", { data: 2 });
    });

    // 6) fetchOptions merging
    // FIXME: Not all RequestInit options can be checked, see https://github.com/denoland/deno/issues/27763
    await t.step("fetchOptions merging", async (t) => {
        await t.step("headers are an object", async () => {
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                // Default code sets keepalive = true, but we override to false
                assertEquals(req.headers.get("Content-Type"), "application/json");
                assertEquals(req.headers.get("X-FetchOption"), "Custom");
                assertEquals(req.headers.get("X-FetchOption2"), "Custom2");
                assertEquals(req.headers.get("X-FetchOption3"), "Custom3");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };

            const transport = new HttpTransport({
                fetchOptions: {
                    headers: {
                        "X-FetchOption": "Custom",
                        "X-FetchOption2": "Custom2",
                        "X-FetchOption3": "Custom3",
                    },
                },
            });

            await transport.request("info", { fetchOption: true });
        });

        await t.step("headers are iterable", async () => {
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                // Default code sets keepalive = true, but we override to false
                assertEquals(req.headers.get("Content-Type"), "application/json");
                assertEquals(req.headers.get("X-FetchOption"), "Custom");
                assertEquals(req.headers.get("X-FetchOption2"), "Custom2");
                assertEquals(req.headers.get("X-FetchOption3"), "Custom3");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };

            const transport = new HttpTransport({
                fetchOptions: {
                    headers: new Headers({
                        "X-FetchOption": "Custom",
                        "X-FetchOption2": "Custom2",
                        "X-FetchOption3": "Custom3",
                    }),
                },
            });

            await transport.request("info", { fetchOption: true });
        });
    });

    // 7) AbortSignal tests
    await t.step("AbortSignal tests", async (t) => {
        await t.step("Internal timeout triggers TimeoutError", async () => {
            globalThis.fetch = originalFetch;

            const transport = new HttpTransport({ timeout: 1 });
            try {
                await transport.request("info", { type: "metaAndAssetCtxs" });
                throw new Error("Expected request to throw an error due to timeout");
            } catch (err) {
                // In Deno, an aborted fetch typically throws a DOMException with name "TimeoutError"
                assertIsError(err, DOMException);
                assertEquals(err.name, "TimeoutError");
            }
        });

        await t.step("User-supplied signal triggers CustomError", async () => {
            globalThis.fetch = originalFetch;
            class CustomError extends Error {}

            const transport = new HttpTransport();
            const userSignal = AbortSignal.abort(new CustomError("user-supplied abort"));
            const promise = transport.request("info", { type: "meta" }, userSignal);

            await assertRejects(() => promise, CustomError, "user-supplied abort");
        });

        await t.step("timeout: null disables internal timeout", async () => {
            // We save the original function so that we can restore it later.
            const originalTimeout = AbortSignal.timeout;
            let timeoutCalled = false;
            // Override AbortSignal.timeout to mark the call
            AbortSignal.timeout = (ms: number) => {
                timeoutCalled = true;
                return originalTimeout(ms);
            };

            globalThis.fetch = async () => {
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };

            // Create a transport with timeout disabled
            const transport = new HttpTransport({ timeout: null });
            await transport.request("info", { test: "null timeout" });

            // Check that AbortSignal.timeout has not been called
            assertEquals(timeoutCalled, false, "AbortSignal.timeout should not be called when timeout: null");

            // Restore the original function
            AbortSignal.timeout = originalTimeout;
        });
    });

    // 8) Server Configuration Tests
    await t.step("Server Configuration Tests", async (t) => {
        await t.step("Default server (should be 'api')", async () => {
            const transport = new HttpTransport();

            // Test for endpoint 'info' with default server
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api.hyperliquid.xyz/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});

            // Test for endpoint 'explorer' with default server
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://rpc.hyperliquid.xyz/explorer");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("explorer", {});
        });

        await t.step("api2 server", async () => {
            const transport = new HttpTransport({ server: "api2" });

            // Test for endpoint 'info' with api2 server
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api2.hyperliquid.xyz/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});

            // Test for endpoint 'exchange' with api2 server
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api2.hyperliquid.xyz/exchange");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("exchange", {});

            // Test for endpoint 'explorer' with api2 server (should still use rpc URL)
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://rpc.hyperliquid.xyz/explorer");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("explorer", {});
        });

        await t.step("api-ui server", async () => {
            const transport = new HttpTransport({ server: "api-ui" });

            // Test for endpoint 'info' with api-ui server
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api-ui.hyperliquid.xyz/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});
        });

        await t.step("api2 server with testnet=true", async () => {
            const transport = new HttpTransport({ server: "api2", isTestnet: true });

            // Test for endpoint 'info' with api2 server on testnet
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api2.hyperliquid-testnet.xyz/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});
        });

        await t.step("Custom URL object", async () => {
            const transport = new HttpTransport({
                server: {
                    mainnet: {
                        api: "https://custom-api.example.com",
                        rpc: "https://custom-rpc.example.com",
                    },
                    testnet: {
                        api: "https://custom-testnet-api.example.com",
                        rpc: "https://custom-testnet-rpc.example.com",
                    },
                },
            });

            // Test for endpoint 'info' with custom URL
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://custom-api.example.com/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});

            // Test for endpoint 'explorer' with custom URL
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://custom-rpc.example.com/explorer");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("explorer", {});
        });

        await t.step("Custom URL object with testnet=true", async () => {
            const transport = new HttpTransport({
                isTestnet: true,
                server: {
                    mainnet: {
                        api: "https://custom-api.example.com",
                        rpc: "https://custom-rpc.example.com",
                    },
                    testnet: {
                        api: "https://custom-testnet-api.example.com",
                        rpc: "https://custom-testnet-rpc.example.com",
                    },
                },
            });

            // Test for endpoint 'info' with custom testnet URL
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://custom-testnet-api.example.com/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});
        });

        await t.step("Partial custom URL object (fall back to defaults)", async () => {
            const transport = new HttpTransport({
                server: {
                    mainnet: {
                        api: "https://custom-api.example.com",
                        // No RPC specified, should fall back to default
                    },
                    // No testnet specified, should fall back to default
                },
            });

            // Test for endpoint 'info' with partial custom URL
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://custom-api.example.com/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});

            // Test for endpoint 'explorer' with partial custom URL (should fall back to default RPC)
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://rpc.hyperliquid.xyz/explorer");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("explorer", {});

            // Switch to testnet (should fall back to default testnet URLs)
            transport.isTestnet = true;

            // Test for endpoint 'info' with testnet and partial custom URL
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api.hyperliquid-testnet.xyz/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});

            // Empty mainnet.api should also return default value
            transport.isTestnet = false;
            transport.server = {};
            globalThis.fetch = async (req: RequestInfo | URL) => {
                req = new Request(req);

                assertEquals(req.url, "https://api.hyperliquid.xyz/info");
                return new Response("{}", {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };
            await transport.request("info", {});
        });
    });

    globalThis.fetch = originalFetch;
});
