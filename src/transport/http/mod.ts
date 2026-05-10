/**
 * HTTP transport for executing requests to the Hyperliquid API.
 *
 * Use {@link HttpTransport} for simple requests via HTTP POST.
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
import { AbortSignal_ } from "../_polyfills.ts";

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

/** Error thrown when an HTTP request fails. */
export class HttpRequestError extends TransportError {
  /** The HTTP response that caused the error. */
  response?: Response;

  constructor(args?: { response?: Response; message?: string }, options?: ErrorOptions) {
    const { response, message: detail } = args ?? {};

    let message: string;
    if (response) {
      message = `${response.status} ${response.statusText}`.trim();
      if (detail) message += ` - ${detail}`;
    } else {
      message = `Unknown HTTP request error: ${options?.cause}`;
    }

    super(message, options);
    this.name = "HttpRequestError";
    this.response = response;
  }
}

/**
 * HTTP transport for the Hyperliquid API.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint
 */
export class HttpTransport implements IRequestTransport {
  /** Indicates this transport uses testnet endpoint. */
  isTestnet: boolean;
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
   * @throws {HttpRequestError} When the HTTP request fails.
   */
  async request<T>(
    endpoint: "info" | "exchange" | "explorer",
    payload: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    try {
      // --- Build URL and request init ------------------------
      const url = new URL(endpoint, endpoint === "explorer" ? this.rpcUrl : this.apiUrl);
      const init = mergeRequestInit(
        {
          body: JSON.stringify(payload),
          headers: {
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Content-Type": "application/json",
          },
          keepalive: true,
          method: "POST",
          signal: this.timeout ? AbortSignal_.timeout(this.timeout) : undefined,
        },
        this.fetchOptions,
        { signal },
      );

      // --- Send -----------------------------------------------
      const response = await fetch(url, init);

      // --- Reject non-OK or non-JSON responses ---------------
      if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json")) {
        const clone = response.clone();
        const body = await response.text().catch(() => undefined); // releases connection, clone stays readable
        throw new HttpRequestError({ response: clone, message: body });
      }

      // --- Parse and check application-level error -----------
      const clone = response.clone();
      const body = await response.json();

      if (body?.type === "error") {
        throw new HttpRequestError({ response: clone, message: body?.message });
      }

      return body;
    } catch (error) {
      if (error instanceof TransportError) throw error;
      throw new HttpRequestError(undefined, { cause: error });
    }
  }
}

// ============================================================
// Helpers
// ============================================================

function mergeHeadersInit(...inits: HeadersInit[]): Headers {
  const merged = new Headers();
  for (const headers of inits) {
    const entries = Symbol.iterator in headers ? headers : Object.entries(headers);
    for (const [key, value] of entries) {
      merged.set(key, value);
    }
  }
  return merged;
}

function mergeRequestInit(...inits: RequestInit[]): RequestInit {
  const merged: RequestInit = {};
  const headersList: HeadersInit[] = [];
  const signals: AbortSignal[] = [];

  for (const init of inits) {
    Object.assign(merged, init);
    if (init.headers) headersList.push(init.headers);
    if (init.signal) signals.push(init.signal);
  }
  if (headersList.length > 0) merged.headers = mergeHeadersInit(...headersList);
  if (signals.length > 0) merged.signal = signals.length > 1 ? AbortSignal_.any(signals) : signals[0];

  return merged;
}
