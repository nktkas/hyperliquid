import test from "node:test";
import assert from "node:assert";
import { HttpRequestError, HttpTransport } from "../../../src/mod.ts";

/** One-time mock for global fetch */
function mockFetch(handler: (input: RequestInfo | URL, init?: RequestInit) => Response | Promise<Response>) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (...args) => {
    try {
      return await handler(...args);
    } finally {
      globalThis.fetch = originalFetch;
    }
  };
}

test("HttpTransport Tests", async (t) => {
  // 1) Testnet / Mainnet URL Modifications
  await t.test("Testnet / Mainnet URL Modifications", async (t) => {
    await t.test("isTestnet=true", async () => {
      const transport = new HttpTransport({ isTestnet: true });

      // Test for endpoint 'info' with isTestnet=true
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.url, "https://api.hyperliquid-testnet.xyz/info");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });

      await transport.request("info", {});

      // Test for endpoint 'explorer' with isTestnet=true
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.url, "https://rpc.hyperliquid-testnet.xyz/explorer");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });

      await transport.request("explorer", {});

      // Test for endpoint 'exchange' with isTestnet=true
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.url, "https://api.hyperliquid-testnet.xyz/exchange");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });

      await transport.request("exchange", {});
    });

    await t.test("isTestnet=false (default)", async () => {
      const transport = new HttpTransport(); // isTestnet defaults to false

      // Test for endpoint 'info' with isTestnet=false
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.url, "https://api.hyperliquid.xyz/info");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });

      await transport.request("info", {});

      // Test for endpoint 'explorer' with isTestnet=false
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.url, "https://rpc.hyperliquid.xyz/explorer");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });

      await transport.request("explorer", {});

      // Test for endpoint 'exchange' with isTestnet=false
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.url, "https://api.hyperliquid.xyz/exchange");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });

      await transport.request("exchange", {});
    });

    await t.test("explicitly set isTestnet=false", async () => {
      const transport = new HttpTransport({ isTestnet: false });

      // Test for endpoint 'info' with explicit isTestnet=false
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.url, "https://api.hyperliquid.xyz/info");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });

      await transport.request("info", {});
    });
  });

  // 2) Successful JSON response using default base + endpoint path
  await t.test("Success response (status 200, JSON)", async () => {
    mockFetch((req: RequestInfo | URL) => {
      req = new Request(req);
      assert(req.url.includes("https://api.hyperliquid.xyz/info"), `Unexpected request URL: ${req.url}`);
      assert.strictEqual(req.method, "POST");
      assert.strictEqual(req.headers.get("Content-Type"), "application/json");
      return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
    });
    const transport = new HttpTransport();

    await transport.request("info", {});
  });

  // 3) Error response
  await t.test("Error response", async (t) => {
    await t.test("Non-200 status (throws HttpRequestError)", async () => {
      mockFetch(() => {
        return new Response("", { status: 500 });
      });
      const transport = new HttpTransport();

      await assert.rejects(
        () => transport.request("exchange", {}),
        HttpRequestError,
      );
    });

    await t.test("Response body unloading on failed request", async () => {
      mockFetch(async () => {
        const response = new Response("", { status: 500 });
        await response.text(); // Read the body to cause an error the next time `.text()` is called
        return response;
      });
      const transport = new HttpTransport();

      await assert.rejects(
        async () => await transport.request("info", {}),
        (e) => e instanceof HttpRequestError && e.response && e.response.bodyUsed,
      );
    });

    await t.test("Invalid Content-Type (text/html)", async () => {
      mockFetch(() => {
        return new Response("", { status: 200, headers: { "Content-Type": "text/html" } });
      });
      const transport = new HttpTransport();

      await assert.rejects(
        () => transport.request("explorer", {}),
        HttpRequestError,
      );
    });

    await t.test("Body includes error type", async () => { // Example of a real error: txDetails({ hash: "0x556ecab2c80c2d0124690412855269000009aec1fbc0bc9a7df2f8e786eca2e1" })
      mockFetch(() => {
        return new Response(
          JSON.stringify({ type: "error", message: "test error" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      });
      const transport = new HttpTransport();

      await assert.rejects(
        () => transport.request("explorer", {}),
        HttpRequestError,
      );
    });

    await t.test("Unknown error", async () => {
      mockFetch(() => {
        throw new Error("Unknown error");
      });
      const transport = new HttpTransport();

      await assert.rejects(
        () => transport.request("info", {}),
        (e) => e instanceof HttpRequestError && e.cause instanceof Error,
      );
    });
  });

  // 4) onRequest callback modifies request (URL, custom headers, etc.)
  await t.test("onRequest callback modifies request", async () => {
    mockFetch((req: RequestInfo | URL) => {
      req = new Request(req);
      assert.strictEqual(req.url, "https://example.com/custom-info");
      assert.strictEqual(req.headers.get("X-My-Header"), "Test123");
      return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
    });
    const transport = new HttpTransport({
      onRequest: (req) => {
        const newHeaders = new Headers(req.headers);
        newHeaders.set("X-My-Header", "Test123");
        return new Request("https://example.com/custom-info", { ...req, headers: newHeaders });
      },
    });

    await transport.request("info", {});
  });

  // 5) onResponse callback replaces the original response
  await t.test("onResponse callback replaces response", async () => {
    mockFetch(() => {
      return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
    });
    const transport = new HttpTransport({
      onResponse: () => {
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      },
    });

    await transport.request("info", {});
  });

  // 6) fetchOptions merging
  // FIXME: Not all RequestInit options can be checked, see https://github.com/denoland/deno/issues/27763
  await t.test("fetchOptions merging", async (t) => {
    await t.test("headers are an object", async () => {
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.headers.get("Content-Type"), "application/json");
        assert.strictEqual(req.headers.get("X-FetchOption"), "Custom");
        assert.strictEqual(req.headers.get("X-FetchOption2"), "Custom2");
        assert.strictEqual(req.headers.get("X-FetchOption3"), "Custom3");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });
      const transport = new HttpTransport({
        fetchOptions: {
          headers: {
            "X-FetchOption": "Custom",
            "X-FetchOption2": "Custom2",
            "X-FetchOption3": "Custom3",
          },
        },
      });

      await transport.request("info", {});
    });

    await t.test("headers are iterable", async () => {
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.headers.get("Content-Type"), "application/json");
        assert.strictEqual(req.headers.get("X-FetchOption"), "Custom");
        assert.strictEqual(req.headers.get("X-FetchOption2"), "Custom2");
        assert.strictEqual(req.headers.get("X-FetchOption3"), "Custom3");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });
      const transport = new HttpTransport({
        fetchOptions: {
          headers: new Headers({
            "X-FetchOption": "Custom",
            "X-FetchOption2": "Custom2",
            "X-FetchOption3": "Custom3",
          }),
        },
      });

      await transport.request("info", {});
    });
  });

  // 7) AbortSignal
  await t.test("AbortSignal", async (t) => {
    await t.test("Internal timeout triggers TimeoutError", async () => {
      const transport = new HttpTransport({ timeout: 1 });

      await assert.rejects(
        async () => await transport.request("info", {}),
        (e) => e instanceof HttpRequestError && e.cause instanceof DOMException && e.cause.name === "TimeoutError",
      );
    });

    await t.test("User-supplied signal triggers CustomError", async () => {
      class CustomError extends Error {}

      const transport = new HttpTransport();
      const userSignal = AbortSignal.abort(new CustomError("user-supplied abort"));

      await assert.rejects(
        () => transport.request("info", {}, userSignal),
        (e) => e instanceof HttpRequestError && e.cause instanceof CustomError,
      );
    });

    await t.test("timeout: null disables internal timeout", async () => {
      // Override AbortSignal.timeout to mark the call
      const originalTimeout = AbortSignal.timeout;
      let timeoutCalled = false;
      AbortSignal.timeout = (ms: number) => {
        timeoutCalled = true;
        return originalTimeout(ms);
      };

      mockFetch(() => {
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });

      // Create a transport with timeout disabled
      const transport = new HttpTransport({ timeout: null });
      await transport.request("info", {});

      // Check that AbortSignal.timeout has not been called
      assert.strictEqual(timeoutCalled, false, "AbortSignal.timeout should not be called when timeout: null");

      // Restore the original function
      AbortSignal.timeout = originalTimeout;
    });
  });

  // 8) Server Configuration Tests
  await t.test("Server Configuration Tests", async (t) => {
    await t.test("Default server", async () => {
      const transport = new HttpTransport();

      // Test for endpoint 'info' with default server
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.url, "https://api.hyperliquid.xyz/info");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });
      await transport.request("info", {});

      // Test for endpoint 'explorer' with default server
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.url, "https://rpc.hyperliquid.xyz/explorer");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });
      await transport.request("explorer", {});
    });

    await t.test("Custom URL object", async () => {
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
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.url, "https://custom-api.example.com/info");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });
      await transport.request("info", {});

      // Test for endpoint 'explorer' with custom URL
      mockFetch((req: RequestInfo | URL) => {
        req = new Request(req);
        assert.strictEqual(req.url, "https://custom-rpc.example.com/explorer");
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      });
      await transport.request("explorer", {});
    });
  });
});
