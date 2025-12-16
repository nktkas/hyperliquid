import { TransportError } from "../../_errors.ts";
import { AbortSignal_ } from "../_polyfills.ts";

/** Error thrown when an HTTP request fails. */
export class HttpRequestError extends TransportError {
  /** The HTTP response that caused the error. */
  response?: Response;
  /** The response body text. */
  body?: string;

  /**
   * Creates a new HTTP request error.
   *
   * @param args - The error arguments.
   * @param args.response - The HTTP response that caused the error.
   * @param args.body - The response body text.
   * @param options - The error options.
   */
  constructor(args?: { response?: Response; body?: string }, options?: ErrorOptions) {
    const { response, body } = args ?? {};

    let message: string;
    if (response) {
      message = `${response.status} ${response.statusText}`.trim();
      if (body) message += ` - ${body}`;
    } else {
      message = `Unknown HTTP request error: ${options?.cause}`;
    }

    super(message, options);
    this.name = "HttpRequestError";
    this.response = response;
    this.body = body;
  }
}

/** Configuration options for the HTTP transport layer. */
export interface HttpTransportOptions {
  /**
   * Indicates this transport uses testnet endpoint.
   * @default false
   */
  isTestnet?: boolean;
  /**
   * Request timeout in ms. Set to `null` to disable.
   * @default 10_000
   */
  timeout?: number | null;
  /**
   * Custom API URL for requests.
   * @default `https://api.hyperliquid.xyz` for mainnet, `https://api.hyperliquid-testnet.xyz` for testnet.
   */
  apiUrl?: string | URL;
  /**
   * Custom RPC URL for explorer requests.
   * @default `https://rpc.hyperliquid.xyz` for mainnet, `https://rpc.hyperliquid-testnet.xyz` for testnet.
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
 * HTTP transport for Hyperliquid API.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint
 */
export class HttpTransport {
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

  /**
   * Creates a new HTTP transport instance.
   *
   * @param options - Configuration options for the HTTP transport layer.
   */
  constructor(options?: HttpTransportOptions) {
    this.isTestnet = options?.isTestnet ?? false;
    this.timeout = options?.timeout === undefined ? 10_000 : options.timeout;
    this.apiUrl = options?.apiUrl ?? (this.isTestnet ? TESTNET_API_URL : MAINNET_API_URL);
    this.rpcUrl = options?.rpcUrl ?? (this.isTestnet ? TESTNET_RPC_URL : MAINNET_RPC_URL);
    this.fetchOptions = options?.fetchOptions ?? {};
  }

  /**
   * Sends a request to the Hyperliquid API via {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API | fetch}.
   *
   * @param endpoint - The API endpoint to send the request to.
   * @param payload - The payload to send with the request.
   * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   *
   * @returns A promise that resolves with parsed JSON response body.
   *
   * @throws {HttpRequestError} Thrown when the HTTP request fails.
   */
  async request<T>(endpoint: "info" | "exchange" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T> {
    try {
      // Construct a Request
      const url = new URL(endpoint, endpoint === "explorer" ? this.rpcUrl : this.apiUrl);
      const init = this._mergeRequestInit(
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

      // Send the Request and wait for a Response
      const response = await fetch(url, init);

      // Validate the Response
      if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json")) {
        // Unload the response body to prevent memory leaks
        const body = await response.text().catch(() => undefined);
        throw new HttpRequestError({ response, body });
      }

      // Parse the response body
      const body = await response.json();

      // Check if the response is an error
      if (body?.type === "error") {
        throw new HttpRequestError({ response, body: body?.message });
      }

      // Return the response body
      return body;
    } catch (error) {
      if (error instanceof TransportError) throw error; // Re-throw known errors
      throw new HttpRequestError(undefined, { cause: error });
    }
  }

  /** Merges multiple `HeadersInit` into one {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers | Headers}. */
  protected _mergeHeadersInit(...inits: HeadersInit[]): Headers {
    const merged = new Headers();
    for (const headers of inits) {
      const entries = Symbol.iterator in headers ? headers : Object.entries(headers);
      for (const [key, value] of entries) {
        merged.set(key, value);
      }
    }
    return merged;
  }

  /** Merges multiple {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit | RequestInit} into one {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit | RequestInit}. */
  protected _mergeRequestInit(...inits: RequestInit[]): RequestInit {
    const merged: RequestInit = {};
    const headersList: HeadersInit[] = [];
    const signals: AbortSignal[] = [];

    for (const init of inits) {
      Object.assign(merged, init);
      if (init.headers) headersList.push(init.headers);
      if (init.signal) signals.push(init.signal);
    }
    if (headersList.length > 0) merged.headers = this._mergeHeadersInit(...headersList);
    if (signals.length > 0) merged.signal = signals.length > 1 ? AbortSignal_.any(signals) : signals[0];

    return merged;
  }
}
