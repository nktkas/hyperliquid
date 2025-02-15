// deno-lint-ignore-file require-await

import { assert, assertEquals, assertRejects } from "jsr:@std/assert@^1.0.10";
import { HttpRequestError, HttpTransport } from "../../../src/transports/http/http_transport.ts";

Deno.test("HttpTransport Tests", async (t) => {
    const originalFetch = globalThis.fetch;

    // 1) Successful JSON response using default base + endpoint path
    await t.step("Success response (status 200, JSON)", async () => {
        // @ts-ignore - Mock fetch API
        globalThis.fetch = async (request: Request) => {
            // Should use default base "https://api.hyperliquid.xyz" + "/info"
            assert(request.url.includes("https://api.hyperliquid.xyz/info"), `Unexpected request URL: ${request.url}`);
            assertEquals(request.method, "POST");
            assertEquals(request.headers.get("Content-Type"), "application/json");
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        };

        const transport = new HttpTransport();
        const result = await transport.request("info", { data: "test-payload" });
        assertEquals(result, { success: true });
    });

    // 2) Non-200 status => HttpRequestError
    await t.step("Non-200 status (throws HttpRequestError)", async () => {
        globalThis.fetch = async () =>
            new Response("Server Error", {
                status: 500,
                statusText: "Internal Error",
                headers: { "Content-Type": "text/plain" },
            });

        const transport = new HttpTransport();
        await assertRejects(() => transport.request("action", { foo: "bar" }), HttpRequestError);
    });

    // 3) Response body unloading on failed request
    await t.step("Response body unloading on failed request", async () => {
        // @ts-ignore - Mock fetch API
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

    // 4) Invalid Content-Type => HttpRequestError
    await t.step("Invalid Content-Type (text/html)", async () => {
        globalThis.fetch = async () =>
            new Response("<html>not json</html>", {
                status: 200,
                headers: { "Content-Type": "text/html" },
            });

        const transport = new HttpTransport();
        await assertRejects(() => transport.request("explorer", {}), HttpRequestError);
    });

    // 5) onRequest callback modifies request (URL, custom headers, etc.)
    await t.step("onRequest callback modifies request", async () => {
        // @ts-ignore - Mock fetch API
        globalThis.fetch = async (request: Request) => {
            assertEquals(request.url, "https://example.com/custom-info");
            assertEquals(request.headers.get("X-My-Header"), "Test123");
            return new Response(JSON.stringify({ changed: true }), {
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

        const result = await transport.request("info", { data: 1 });
        assertEquals(result, { changed: true });
    });

    // 6) onResponse callback replaces the original response
    await t.step("onResponse callback replaces response", async () => {
        globalThis.fetch = async () =>
            new Response(JSON.stringify({ original: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });

        const transport = new HttpTransport({
            onResponse: () => {
                // Return a completely new response
                return new Response(JSON.stringify({ replaced: true }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            },
        });

        const result = await transport.request("info", { data: 2 });
        assertEquals(result, { replaced: true });
    });

    // 7) Custom base URL usage
    await t.step("Custom base URL usage", async () => {
        // @ts-ignore - Mock fetch API
        globalThis.fetch = async (request: Request) => {
            assertEquals(request.url, "https://my-base.example/explorer");
            return new Response(JSON.stringify({ baseUrlUsed: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        };

        const transport = new HttpTransport({ url: "https://my-base.example" });
        const result = await transport.request("explorer", {});
        assertEquals(result, { baseUrlUsed: true });
    });

    // 8) fetchOptions merging
    // FIXME: Not all RequestInit options can be checked, see https://github.com/denoland/deno/issues/27763
    await t.step("fetchOptions merging", async (t) => {
        await t.step("headers are an object", async () => {
            // @ts-ignore - Mock fetch API
            globalThis.fetch = async (request: Request) => {
                // Default code sets keepalive = true, but we override to false
                assertEquals(request.headers.get("Content-Type"), "application/json");
                assertEquals(request.headers.get("X-FetchOption"), "Custom");
                assertEquals(request.headers.get("X-FetchOption2"), "Custom2");
                assertEquals(request.headers.get("X-FetchOption3"), "Custom3");
                return new Response(JSON.stringify({ merged: true }), {
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

            const result = await transport.request("info", { fetchOption: true });
            assertEquals(result, { merged: true });
        });
        await t.step("headers are iterable", async () => {
            // @ts-ignore - Mock fetch API
            globalThis.fetch = async (request: Request) => {
                // Default code sets keepalive = true, but we override to false
                assertEquals(request.headers.get("Content-Type"), "application/json");
                assertEquals(request.headers.get("X-FetchOption"), "Custom");
                assertEquals(request.headers.get("X-FetchOption2"), "Custom2");
                assertEquals(request.headers.get("X-FetchOption3"), "Custom3");
                return new Response(JSON.stringify({ merged: true }), {
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

            const result = await transport.request("info", { fetchOption: true });
            assertEquals(result, { merged: true });
        });
    });

    // 9) AbortSignal tests:

    // 9a) Internal timeout => triggers TimeoutError if fetch doesn't resolve in time
    await t.step("Internal timeout triggers TimeoutError", async () => {
        globalThis.fetch = originalFetch;

        const transport = new HttpTransport({ timeout: 50 });
        try {
            await transport.request("info", { type: "meta" });
            throw new Error("Expected request to throw an error due to timeout");
        } catch (err) {
            // In Deno, an aborted fetch typically throws a DOMException with name "TimeoutError"
            assert(err instanceof DOMException, "Expected a DOMException on abort");
            assertEquals(err.name, "TimeoutError");
        }
    });

    // 9b) User-supplied signal triggers CustomError
    await t.step("User-supplied signal triggers CustomError", async () => {
        globalThis.fetch = originalFetch;
        class CustomError extends Error {}

        const transport = new HttpTransport();
        const userSignal = AbortSignal.abort(new CustomError("user-supplied abort"));
        const promise = transport.request("info", { type: "meta" }, userSignal);

        await assertRejects(() => promise, CustomError, "user-supplied abort");
    });

    // 9c) timeout: null disables internal timeout
    await t.step("timeout: null disables internal timeout", async () => {
        // We save the original function so that we can restore it later.
        const originalTimeout = AbortSignal.timeout;
        let timeoutCalled = false;
        // Override AbortSignal.timeout to mark the call
        AbortSignal.timeout = (ms: number) => {
            timeoutCalled = true;
            return originalTimeout(ms);
        };

        // @ts-ignore - Mock fetch API
        globalThis.fetch = async () => {
            return new Response(JSON.stringify({ noTimeout: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        };

        // Create a transport with timeout disabled
        const transport = new HttpTransport({ timeout: null });
        const result = await transport.request("info", { test: "null timeout" });

        // Check that AbortSignal.timeout has not been called
        assertEquals(timeoutCalled, false, "AbortSignal.timeout should not be called when timeout: null");
        assertEquals(result, { noTimeout: true });

        // Restore the original function
        AbortSignal.timeout = originalTimeout;
    });

    globalThis.fetch = originalFetch;
});
