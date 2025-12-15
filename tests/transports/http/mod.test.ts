// deno-lint-ignore-file no-import-prefix
import { assert, assertEquals, assertIsError, assertRejects } from "jsr:@std/assert@1";
import { HttpRequestError, HttpTransport } from "@nktkas/hyperliquid";

// ============================================================
// Helpers
// ============================================================

/** One-time mock for global fetch. */
function mockFetch(handler: (input: RequestInfo | URL, init?: RequestInit) => Response | Promise<Response>): void {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (...args) => {
    try {
      return await handler(...args);
    } finally {
      globalThis.fetch = originalFetch;
    }
  };
}

/** Returns a successful JSON response. */
function jsonResponse(body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// ============================================================
// Test Data
// ============================================================

const ENDPOINTS = ["info", "exchange", "explorer"] as const;

const URL_EXPECTATIONS = {
  mainnet: {
    info: "https://api.hyperliquid.xyz/info",
    exchange: "https://api.hyperliquid.xyz/exchange",
    explorer: "https://rpc.hyperliquid.xyz/explorer",
  },
  testnet: {
    info: "https://api.hyperliquid-testnet.xyz/info",
    exchange: "https://api.hyperliquid-testnet.xyz/exchange",
    explorer: "https://rpc.hyperliquid-testnet.xyz/explorer",
  },
} as const;

// ============================================================
// Tests
// ============================================================

Deno.test("HttpTransport", async (t) => {
  await t.step("URL routing", async (t) => {
    await t.step("mainnet (default)", async (t) => {
      const transport = new HttpTransport();

      for (const endpoint of ENDPOINTS) {
        await t.step(`${endpoint}`, async () => {
          mockFetch((req) => {
            assertEquals(new Request(req).url, URL_EXPECTATIONS.mainnet[endpoint]);
            return jsonResponse();
          });
          await transport.request(endpoint, {});
        });
      }
    });

    await t.step("testnet (isTestnet: true)", async (t) => {
      const transport = new HttpTransport({ isTestnet: true });

      for (const endpoint of ENDPOINTS) {
        await t.step(`${endpoint}`, async () => {
          mockFetch((req) => {
            assertEquals(new Request(req).url, URL_EXPECTATIONS.testnet[endpoint]);
            return jsonResponse();
          });
          await transport.request(endpoint, {});
        });
      }
    });

    await t.step("custom URLs", async () => {
      const transport = new HttpTransport({
        apiUrl: "https://custom-api.example.com",
        rpcUrl: "https://custom-rpc.example.com",
      });

      mockFetch((req) => {
        assertEquals(new Request(req).url, "https://custom-api.example.com/info");
        return jsonResponse();
      });
      await transport.request("info", {});

      mockFetch((req) => {
        assertEquals(new Request(req).url, "https://custom-rpc.example.com/explorer");
        return jsonResponse();
      });
      await transport.request("explorer", {});
    });
  });

  await t.step("request()", async (t) => {
    await t.step("success response", async () => {
      mockFetch((_req, init) => {
        assertEquals(init?.method, "POST");
        assertEquals(new Headers(init?.headers).get("Content-Type"), "application/json");
        return jsonResponse({ data: "test" });
      });

      const transport = new HttpTransport();
      const result = await transport.request("info", {});
      assertEquals(result, { data: "test" });
    });

    await t.step("error responses", async (t) => {
      await t.step("non-200 status throws HttpRequestError", async () => {
        mockFetch(() => new Response("", { status: 500 }));

        const transport = new HttpTransport();
        await assertRejects(() => transport.request("info", {}), HttpRequestError);
      });

      await t.step("invalid Content-Type throws HttpRequestError", async () => {
        mockFetch(() => new Response("", { status: 200, headers: { "Content-Type": "text/html" } }));

        const transport = new HttpTransport();
        await assertRejects(() => transport.request("info", {}), HttpRequestError);
      });

      await t.step("error type in body throws HttpRequestError", async () => {
        mockFetch(() => jsonResponse({ type: "error", message: "test error" }));

        const transport = new HttpTransport();
        await assertRejects(() => transport.request("info", {}), HttpRequestError);
      });

      await t.step("response body is consumed on error", async () => {
        mockFetch(async () => {
          const response = new Response("error body", { status: 500 });
          await response.text();
          return response;
        });

        const transport = new HttpTransport();
        const error = await assertRejects(() => transport.request("info", {}), HttpRequestError);
        assert(error.response?.bodyUsed);
      });

      await t.step("unknown error wraps in HttpRequestError", async () => {
        mockFetch(() => {
          throw new Error("network error");
        });

        const transport = new HttpTransport();
        const error = await assertRejects(() => transport.request("info", {}), HttpRequestError);
        assertIsError(error.cause, Error, "network error");
      });
    });
  });

  await t.step("fetchOptions", async (t) => {
    await t.step("headers as object", async () => {
      mockFetch((_req, init) => {
        const headers = new Headers(init?.headers);
        assertEquals(headers.get("Content-Type"), "application/json");
        assertEquals(headers.get("X-Custom"), "value");
        return jsonResponse();
      });

      const transport = new HttpTransport({
        fetchOptions: { headers: { "X-Custom": "value" } },
      });
      await transport.request("info", {});
    });

    await t.step("headers as Headers instance", async () => {
      mockFetch((_req, init) => {
        const headers = new Headers(init?.headers);
        assertEquals(headers.get("Content-Type"), "application/json");
        assertEquals(headers.get("X-Custom"), "value");
        return jsonResponse();
      });

      const transport = new HttpTransport({
        fetchOptions: { headers: new Headers({ "X-Custom": "value" }) },
      });
      await transport.request("info", {});
    });
  });

  await t.step("AbortSignal", async (t) => {
    await t.step("internal timeout triggers TimeoutError", async () => {
      const transport = new HttpTransport({ timeout: 1 });

      const error = await assertRejects(() => transport.request("info", {}), HttpRequestError);
      assertIsError(error.cause, DOMException);
      assertEquals(error.cause.name, "TimeoutError");
    });

    await t.step("user signal is respected", async () => {
      class CustomAbortError extends Error {}

      const transport = new HttpTransport();
      const signal = AbortSignal.abort(new CustomAbortError("user abort"));

      const error = await assertRejects(() => transport.request("info", {}, signal), HttpRequestError);
      assertIsError(error.cause, CustomAbortError);
    });

    await t.step("timeout: null disables internal timeout", async () => {
      const originalTimeout = AbortSignal.timeout;
      let timeoutCalled = false;
      AbortSignal.timeout = (ms: number) => {
        timeoutCalled = true;
        return originalTimeout(ms);
      };

      try {
        mockFetch(() => jsonResponse());
        const transport = new HttpTransport({ timeout: null });
        await transport.request("info", {});
        assertEquals(timeoutCalled, false);
      } finally {
        AbortSignal.timeout = originalTimeout;
      }
    });
  });
});
