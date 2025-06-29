import type { MaybePromise } from "../../base.ts";
import { type IRequestTransport, TransportError } from "../base.ts";

/** Error thrown when an HTTP request fails. */
export class HttpRequestError extends TransportError {
    response?: Response;
    body?: string;

    constructor(args?: { response?: Response; body?: string }, options?: ErrorOptions) {
        const { response, body } = args ?? {};

        let message: string;
        if (response) {
            message = `${response.status} ${response.statusText}`.trim();
            if (body) message += ` - ${body}`;
        } else {
            message = "Unknown error while making an HTTP request. See the `cause` for more details.";
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
     * Specifies whether to use the testnet API endpoints.
     * @defaultValue `false`
     */
    isTestnet?: boolean;

    /**
     * Request timeout in ms. Set to `null` to disable.
     * @defaultValue `10_000`
     */
    timeout?: number | null;

    /**
     * Custom server to use for API requests.
     * @defaultValue `https://api.hyperliquid.xyz` for mainnet and `https://api.hyperliquid-testnet.xyz` for testnet.
     */
    server?: {
        mainnet?: { api?: string | URL; rpc?: string | URL };
        testnet?: { api?: string | URL; rpc?: string | URL };
    };

    /** A custom {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/RequestInit | RequestInit} that is merged with a fetch request. */
    fetchOptions?: Omit<RequestInit, "body" | "method">;

    /**
     * A callback function that is called before the request is sent.
     * @param request - An original request to send.
     * @returns If returned a {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Request/Request | Request}, it will replace the original request.
     */
    onRequest?: (request: Request) => MaybePromise<Request | void | null | undefined>;

    /**
     * A callback function that is called after the response is received.
     * @param response - An original response to process.
     * @returns If returned a {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Response/Response | Response}, it will replace the original response.
     */
    onResponse?: (response: Response) => MaybePromise<Response | void | null | undefined>;
}

/** HTTP implementation of the REST transport interface. */
export class HttpTransport implements IRequestTransport, HttpTransportOptions {
    isTestnet: boolean;
    timeout: number | null;
    server: {
        mainnet: { api: string | URL; rpc: string | URL };
        testnet: { api: string | URL; rpc: string | URL };
    };
    fetchOptions: Omit<RequestInit, "body" | "method">;
    onRequest?: (request: Request) => MaybePromise<Request | void | null | undefined>;
    onResponse?: (response: Response) => MaybePromise<Response | void | null | undefined>;

    /**
     * Creates a new HTTP transport instance.
     * @param options - Configuration options for the HTTP transport layer.
     */
    constructor(options?: HttpTransportOptions) {
        this.isTestnet = options?.isTestnet ?? false;
        this.timeout = options?.timeout === undefined ? 10_000 : options.timeout;
        this.server = {
            mainnet: {
                api: options?.server?.mainnet?.api ?? "https://api.hyperliquid.xyz",
                rpc: options?.server?.mainnet?.rpc ?? "https://rpc.hyperliquid.xyz",
            },
            testnet: {
                api: options?.server?.testnet?.api ?? "https://api.hyperliquid-testnet.xyz",
                rpc: options?.server?.testnet?.rpc ?? "https://rpc.hyperliquid-testnet.xyz",
            },
        };
        this.fetchOptions = options?.fetchOptions ?? {};
        this.onRequest = options?.onRequest;
        this.onResponse = options?.onResponse;
    }

    /**
     * Sends a request to the Hyperliquid API via fetch.
     * @param endpoint - The API endpoint to send the request to.
     * @param payload - The payload to send with the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
     * @returns A promise that resolves with parsed JSON response body.
     *
     * @throws {HttpRequestError} Thrown when the HTTP request fails.
     */
    async request<T>(endpoint: "info" | "exchange" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T> {
        try {
            // Construct a Request
            const url = new URL(
                endpoint,
                this.server[this.isTestnet ? "testnet" : "mainnet"][endpoint === "explorer" ? "rpc" : "api"],
            );
            const init = mergeRequestInit(
                {
                    body: JSON.stringify(payload),
                    headers: {
                        "Accept-Encoding": "gzip, deflate, br, zstd",
                        "Content-Type": "application/json",
                    },
                    keepalive: true,
                    method: "POST",
                    signal: this.timeout ? AbortSignal.timeout(this.timeout) : undefined,
                },
                this.fetchOptions,
                { signal },
            );
            let request = new Request(url, init);

            // Call the onRequest callback, if provided
            if (this.onRequest) {
                const customRequest = await this.onRequest(request);
                if (customRequest instanceof Request) request = customRequest;
            }

            // Send the Request and wait for a Response
            let response = await fetch(request);

            // Call the onResponse callback, if provided
            if (this.onResponse) {
                const customResponse = await this.onResponse(response);
                if (customResponse instanceof Response) response = customResponse;
            }

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
            if (error instanceof HttpRequestError) throw error; // Re-throw known errors
            throw new HttpRequestError(undefined, { cause: error });
        }
    }
}

/** Merges multiple {@linkcode HeadersInit} into one {@linkcode Headers}. */
function mergeHeadersInit(...inits: HeadersInit[]): Headers {
    if (inits.length === 0 || inits.length === 1) {
        return new Headers(inits[0] as HeadersInit | undefined);
    }

    const merged = new Headers();
    for (const headers of inits) {
        const iterator = Symbol.iterator in headers ? headers : Object.entries(headers);
        for (const [key, value] of iterator) {
            merged.set(key, value);
        }
    }
    return merged;
}

/** Merges multiple {@linkcode RequestInit} into one {@linkcode RequestInit}. */
function mergeRequestInit(...inits: RequestInit[]): RequestInit {
    const merged = inits.reduce((acc, init) => ({ ...acc, ...init }), {});

    const headersList = inits.map((init) => init.headers)
        .filter((headers) => typeof headers === "object");
    if (headersList.length > 0) {
        merged.headers = mergeHeadersInit(...headersList);
    }

    const signals = inits.map((init) => init.signal)
        .filter((signal) => signal instanceof AbortSignal);
    if (signals.length > 0) {
        merged.signal = signals.length > 1 ? AbortSignal.any(signals) : signals[0];
    }

    return merged;
}
