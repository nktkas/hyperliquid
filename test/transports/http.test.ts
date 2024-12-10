import { assert } from "jsr:@std/assert";
import { HttpRequestError, HttpTransport } from "../../src/transports/http.ts";

Deno.test("HTTP Transport Tests", async (t) => {
    await t.step("should accept custom configuration", () => {
        const transport = new HttpTransport({
            url: "https://custom.api.com",
            timeout: 5000,
            fetchOptions: {
                headers: new Headers({ "Custom-Header": "test" }),
            },
        });

        assert(
            transport.url === "https://custom.api.com",
            "URL should be https://custom.api.com, but got: " + transport.url,
        );
        assert(
            transport.timeout === 5000,
            "Timeout should be 5000, but got: " + transport.timeout,
        );
        assert(
            transport.fetchOptions?.headers instanceof Headers,
            "Headers should be instance of Headers",
        );
        assert(
            transport.fetchOptions?.headers?.get("Custom-Header") === "test",
            "Custom header should be 'test'",
        );
    });

    await t.step("should handle successful request", async () => {
        const transport = new HttpTransport();
        const response = await transport.request("info", { type: "meta" });
        assert(
            response !== null && typeof response === "object",
            "Response should be an object, but got: " + typeof response,
        );
    });

    await t.step("should handle an invalid API request", async () => {
        const transport = new HttpTransport();

        try {
            await transport.request("info", { type: "invalid_request" });
            assert(false, "Should have thrown an error");
        } catch (error: unknown) {
            assert(
                error instanceof HttpRequestError,
                "Error should be HttpRequestError, but got: " + error!.constructor.name,
            );
            assert(
                error.response instanceof Response,
                "Error should contain Response object, but got: " + error.response.constructor.name,
            );
            assert(
                error.response.status >= 400,
                `Response status should be error code (>=400), but got: ${error.response.status}`,
            );
        }
    });

    await t.step("should handle timeout", async () => {
        const timeoutTransport = new HttpTransport({ timeout: 1 });

        try {
            await timeoutTransport.request("info", { type: "meta" });
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
    });

    await t.step("should respect abort signal", async () => {
        const transport = new HttpTransport();
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
    });
});
