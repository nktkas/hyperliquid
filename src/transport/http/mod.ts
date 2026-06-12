/**
 * HTTP transport for executing requests to the Hyperliquid API.
 *
 * Use {@link HttpTransport} for simple requests via HTTP POST.
 *
 * ---
 *
 * ```text
 * HttpTransport.request():
 *   controller ◄─ timeout / user signal / fetchOptions.signal
 *    └─► fetch ┬─► non-OK or non-JSON body ─► HttpRequestError(response, detail)
 *              └─► parse JSON ─► T
 *     catch: classify by reference ─► finally: cancel timer, detach
 * ```
 *
 * @example
 * ```ts
 * import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";
 *
 * const transport = new HttpTransport();
 * const client = new InfoClient({ transport });
 *
 * const mids = await client.allMids();
 * ```
 *
 * @module
 */

import { type IRequestTransport, TransportError } from "../_base.ts";
import * as abort from "../_abort.ts";

/** Configuration options for the HTTP transport layer. */
export interface HttpTransportOptions {
  /**
   * Indicates this transport uses testnet endpoint.
   *
   * Default: `false`
   */
  isTestnet?: boolean;
  /**
   * Request timeout in ms. Set to `null` to disable.
   *
   * Default: `10_000`
   */
  timeout?: number | null;
  /**
   * Custom API URL for `info` and `exchange` requests.
   *
   * Default: `https://api.hyperliquid.xyz` for mainnet, `https://api.hyperliquid-testnet.xyz` for testnet.
   */
  apiUrl?: string | URL;
  /**
   * Custom RPC URL for `explorer` requests.
   *
   * Default: `https://rpc.hyperliquid.xyz` for mainnet, `https://rpc.hyperliquid-testnet.xyz` for testnet.
   */
  rpcUrl?: string | URL;
  /** A custom {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit | RequestInit} that is merged with a fetch request. */
  fetchOptions?: Omit<RequestInit, "body" | "method">;
}

/** Mainnet API URL. */
export const MAINNET_API_URL = "https://api.hyperliquid.xyz";
/** Testnet API URL. */
export const TESTNET_API_URL = "https://api.hyperliquid-testnet.xyz";
/** Mainnet RPC URL. */
export const MAINNET_RPC_URL = "https://rpc.hyperliquid.xyz";
/** Testnet RPC URL. */
export const TESTNET_RPC_URL = "https://rpc.hyperliquid-testnet.xyz";

/**
 * Error thrown when an HTTP request fails.
 *
 * @example
 * ```ts
 * import { HttpRequestError, HttpTransport } from "@nktkas/hyperliquid";
 *
 * const transport = new HttpTransport();
 * try {
 *   // Throws on a non-OK response, a timeout, an abort, or a network failure.
 *   await transport.request("info", { type: "allMids" });
 * } catch (error) {
 *   if (error instanceof HttpRequestError) {
 *     console.error(error.message, error.response?.status);
 *   }
 * }
 * ```
 */
export class HttpRequestError extends TransportError {
  /** The HTTP response that caused the error. */
  response?: Response;
  /** The original request payload that triggered the error, if available. */
  request?: unknown;

  /**
   * Creates an HTTP request error.
   *
   * The message is the response status line, extended with `detail` when given;
   * without a response, `detail` alone or a description of `cause` is used.
   */
  constructor(options?: ErrorOptions & { detail?: string; response?: Response; request?: unknown }) {
    const { detail, response, request, ...errorOptions } = options ?? {};

    let message: string;
    if (response) {
      message = `${response.status} ${response.statusText}`.trim();
      if (detail) message += ` - ${detail}`;
    } else if (detail) {
      message = detail;
    } else {
      const cause = errorOptions.cause;
      message = cause === undefined
        ? "Unknown HTTP request error"
        : `Unknown HTTP request error: ${cause instanceof Error ? cause.message : String(cause)}`;
    }

    super(message, errorOptions);
    this.name = "HttpRequestError";
    this.response = response;
    this.request = request;
  }
}

/**
 * HTTP transport for the Hyperliquid API.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 *
 * const transport = new HttpTransport();
 * const mids = await transport.request("info", { type: "allMids" });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint
 */
export class HttpTransport implements IRequestTransport<"info" | "exchange" | "explorer"> {
  /** Indicates this transport uses testnet endpoint. */
  readonly isTestnet: boolean;
  /** Request timeout in ms. Set to `null` to disable. */
  timeout: number | null;
  /** Custom API URL for requests. */
  apiUrl: string | URL;
  /** Custom RPC URL for explorer requests. */
  rpcUrl: string | URL;
  /** A custom {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit | RequestInit} that is merged with a fetch request. */
  fetchOptions: Omit<RequestInit, "body" | "method">;

  constructor(options?: HttpTransportOptions) {
    this.isTestnet = options?.isTestnet ?? false;
    this.timeout = options?.timeout === undefined ? 10_000 : options.timeout;
    this.apiUrl = options?.apiUrl ?? (this.isTestnet ? TESTNET_API_URL : MAINNET_API_URL);
    this.rpcUrl = options?.rpcUrl ?? (this.isTestnet ? TESTNET_RPC_URL : MAINNET_RPC_URL);
    this.fetchOptions = options?.fetchOptions ?? {};
  }

  /**
   * Sends a request to the Hyperliquid API.
   *
   * Routes to {@linkcode apiUrl} for `info`/`exchange` and {@linkcode rpcUrl} for `explorer`.
   *
   * @param endpoint The API endpoint to send the request to.
   * @param payload The payload to send with the request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return A promise that resolves with the parsed JSON response body.
   *
   * @throws {HttpRequestError} When the HTTP request fails.
   *
   * @example
   * ```ts
   * import { HttpTransport } from "@nktkas/hyperliquid";
   *
   * const transport = new HttpTransport();
   * const mids = await transport.request("info", { type: "allMids" });
   * ```
   */
  async request<T>(
    endpoint: "info" | "exchange" | "explorer",
    payload: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    // One controller per request: the timeout timer and all user signals relay into it,
    // and `finally` detaches everything, so no listener or timer outlives the request.
    const controller = new AbortController();
    const timeoutMs = this.timeout; // for correct error message after user changes
    const timeout = timeoutMs !== null ? abort.scheduleTimeout(controller, timeoutMs) : undefined;
    const detachRelay = abort.relay([signal, this.fetchOptions.signal], controller);

    try {
      // --- Request init ------------------------------------------------------
      const url = buildEndpointUrl(endpoint === "explorer" ? this.rpcUrl : this.apiUrl, endpoint);
      const init = mergeRequestInit(
        {
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
        this.fetchOptions,
        { signal: controller.signal },
      );

      // --- Send and validate -------------------------------------------------
      const response = await fetch(url, init);
      if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json")) {
        const clone = response.clone();
        const body = await response.text().catch(() => undefined); // releases connection, clone stays readable
        throw new HttpRequestError({
          response: clone,
          detail: body ? truncate(body) : undefined,
          request: payload,
        });
      }

      // --- Parse -------------------------------------------------------------
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (error) {
        throw new HttpRequestError({
          response: recreateResponse(response, text),
          detail: "Invalid JSON response body",
          cause: error,
          request: payload,
        });
      }
    } catch (error) {
      if (error instanceof TransportError) throw error;
      if (timeout !== undefined && error === timeout.reason) {
        throw new HttpRequestError({
          detail: `Request timed out after ${timeoutMs} ms`,
          cause: error,
          request: payload,
        });
      }
      if (controller.signal.aborted && error === controller.signal.reason) {
        throw new HttpRequestError({ detail: "Request aborted", cause: error, request: payload });
      }
      throw new HttpRequestError({ cause: error, request: payload });
    } finally {
      timeout?.cancel();
      detachRelay();
    }
  }
}

// =============================================================================
// Helpers
// =============================================================================

/** Truncates `text` to `limit` characters, appending the original length. */
function truncate(text: string, limit = 1024): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}… (${text.length} chars total)`;
}

/** Resolves an endpoint against a base URL without dropping the base path or query. */
function buildEndpointUrl(base: string | URL, endpoint: string): URL {
  const baseUrl = new URL(base);
  if (!baseUrl.pathname.endsWith("/")) baseUrl.pathname += "/";
  const url = new URL(endpoint, baseUrl);
  url.search = baseUrl.search; // relative resolution drops the base query
  return url;
}

/** Rebuilds a response whose body has already been consumed, so `error.response` stays readable. */
function recreateResponse(original: Response, text: string): Response {
  return new Response(text || null, {
    status: original.status,
    statusText: original.statusText,
    headers: original.headers,
  });
}

/** Merges headers inits left to right: a later occurrence of a key overwrites the earlier one. */
function mergeHeadersInit(...inits: HeadersInit[]): Headers {
  const merged = new Headers();
  for (const init of inits) {
    for (const [key, value] of new Headers(init)) {
      merged.set(key, value);
    }
  }
  return merged;
}

/** Merges request inits left to right: `headers` are combined, every other field is last-init-wins. */
function mergeRequestInit(...inits: RequestInit[]): RequestInit {
  const merged: RequestInit = {};
  const headersList: HeadersInit[] = [];

  for (const init of inits) {
    Object.assign(merged, init);
    if (init.headers) headersList.push(init.headers);
  }
  if (headersList.length > 0) merged.headers = mergeHeadersInit(...headersList);

  return merged;
}
