import { type IRequestTransport, TransportError } from "../../base.ts";

type MaybePromise<T> = T | Promise<T>;

/**
 * Error thrown when an HTTP response is deemed invalid:
 * - Non-200 status code
 * - Unexpected content type
 */
export class HttpRequestError extends TransportError {
    /**
     * Creates a new HTTP request error.
     * @param response - The failed HTTP response.
     * @param responseBody - The raw response body content, if available.
     */
    constructor(public response: Response, public responseBody?: string) {
        let message = `HTTP request failed: status ${response.status}`;
        if (responseBody) message += `, body "${responseBody}"`;

        super(message);
        this.name = "HttpRequestError";
    }
}

/**
 * Configuration options for the HTTP transport layer.
 */
export interface HttpTransportOptions {
    /**
     * Base URL for API endpoints.
     * - Mainnet: `https://api.hyperliquid.xyz`
     * - Testnet: `https://api.hyperliquid-testnet.xyz`
     * @defaultValue `https://api.hyperliquid.xyz`
     */
    url?: string | URL;

    /**
     * Request timeout in ms.
     * Set to `null` to disable.
     * @defaultValue `10_000`
     */
    timeout?: number | null;

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

/**
 * HTTP implementation of the REST transport interface.
 */
export class HttpTransport implements IRequestTransport, HttpTransportOptions {
    url: string | URL;
    timeout: number | null;
    fetchOptions: Omit<RequestInit, "body" | "method">;
    onRequest?: (request: Request) => MaybePromise<Request | void | null | undefined>;
    onResponse?: (response: Response) => MaybePromise<Response | void | null | undefined>;

    /**
     * Creates a new HTTP transport instance.
     * @param options - Configuration options for the HTTP transport layer.
     */
    constructor(options?: HttpTransportOptions) {
        this.url = options?.url ?? "https://api.hyperliquid.xyz";
        this.timeout = options?.timeout === undefined ? 10_000 : options.timeout;
        this.fetchOptions = options?.fetchOptions ?? {};
        this.onRequest = options?.onRequest;
        this.onResponse = options?.onResponse;
    }

    /**
     * Sends a request to the Hyperliquid API via fetch.
     * @param endpoint - The API endpoint to send the request to.
     * @param payload - The payload to send with the request.
     * @param signal - An optional abort signal.
     * @returns A promise that resolves with parsed JSON response body.
     * @throws {HttpRequestError} - Thrown when an HTTP response is deemed invalid.
     * @throws May throw {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#exceptions | fetch errors}.
     */
    async request(
        endpoint: "info" | "exchange" | "explorer",
        payload: unknown,
        signal?: AbortSignal,
    ): Promise<unknown> {
        // Construct a Request
        const url = new URL(endpoint, this.url);

        // FIXME: Temporary hack: replace `api.hyperliquid-testnet.xyz/explorer` with `rpc.hyperliquid-testnet.xyz/explorer`
        // until the new rpc url becomes the standard for mainnet.
        // Maybe after that should split the url property into api and rpc variants.
        if (url.hostname === "api.hyperliquid-testnet.xyz" && url.pathname === "/explorer") {
            url.hostname = "rpc.hyperliquid-testnet.xyz";
        }

        const init = mergeRequestInit(
            {
                body: JSON.stringify(payload),
                headers: {
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Connection": "keep-alive",
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
            throw new HttpRequestError(response, body);
        }

        // Parse and return the response body
        return await response.json();
    }
}

/**
 * Merges multiple `HeadersInit` objects into one.
 * @param inits - A list of `HeadersInit` objects to merge.
 * @returns A new `Headers` object that contains all headers from the input objects.
 */
function mergeHeadersInit(...inits: HeadersInit[]): Headers {
    if (inits.length === 0 || inits.length === 1) {
        return new Headers(inits[0] as HeadersInit | undefined);
    }

    const merged = new Headers();
    for (const headers of inits) {
        const entries = Symbol.iterator in headers ? headers : Object.entries(headers);
        for (const [key, value] of entries) {
            merged.set(key, value);
        }
    }
    return merged;
}

/**
 * Merges multiple `RequestInit` objects into one.
 * @param inits - A list of `RequestInit` objects to merge.
 * @returns A new `RequestInit` object that contains all properties from the input objects.
 */
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
