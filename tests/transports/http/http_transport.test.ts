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

    // 3) Invalid Content-Type => HttpRequestError
    await t.step("Invalid Content-Type (text/html)", async () => {
        globalThis.fetch = async () =>
            new Response("<html>not json</html>", {
                status: 200,
                headers: { "Content-Type": "text/html" },
            });

        const transport = new HttpTransport();
        await assertRejects(() => transport.request("explorer", {}), HttpRequestError);
    });

    // 4) onRequest callback modifies request (URL, custom headers, etc.)
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

    // 5) onResponse callback replaces the original response
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

    // 6) Custom base URL usage
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

    // 7) fetchOptions merging (headers, keepalive, credentials, etc.)
    // Temporarily out of service: https://github.com/denoland/deno/issues/27763
    await t.step({
        name: "fetchOptions merging",
        ignore: true,
        fn: async () => {
            // @ts-ignore - Mock fetch API
            globalThis.fetch = async (request: Request) => {
                // Default code sets keepalive = true, but we override to false
                assertEquals(request.keepalive, false, "Expected keepalive=false from fetchOptions");
                assertEquals(request.headers.get("Content-Type"), "application/json");
                assertEquals(request.headers.get("X-FetchOption"), "Custom");
                assertEquals(request.credentials, "include");
                return new Response(JSON.stringify({ merged: true }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            };

            const transport = new HttpTransport({
                fetchOptions: {
                    keepalive: false,
                    credentials: "include",
                    headers: {
                        "X-FetchOption": "Custom",
                    },
                },
            });

            const result = await transport.request("info", { fetchOption: true });
            assertEquals(result, { merged: true });
        },
    });

    // 8) AbortSignal tests:

    // 8a) Internal timeout => triggers TimeoutError if fetch doesn't resolve in time
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

    // 8b) User-supplied signal triggers CustomError
    await t.step("User-supplied signal triggers CustomError", async () => {
        globalThis.fetch = originalFetch;
        class CustomError extends Error {}

        const transport = new HttpTransport();
        const userSignal = AbortSignal.abort(new CustomError("user-supplied abort"));
        const promise = transport.request("info", { type: "meta" }, userSignal);

        await assertRejects(() => promise, CustomError, "user-supplied abort");
    });

    globalThis.fetch = originalFetch;
});
