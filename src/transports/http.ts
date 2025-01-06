import { type IRESTTransport, TransportError } from "./base.ts";

type MaybePromise<T> = T | Promise<T>;

/**
 * The error thrown when the HTTP request fails.
 */
export class HttpRequestError extends TransportError {
    /**
     * Creates a new HTTP request error.
     * @param response - The HTTP response.
     * @param responseBody - The response body.
     */
    constructor(public response: Response, public responseBody?: string) {
        super(`HTTP request failed with status "${response.status} ${response.statusText}" and body: ${responseBody}`);
        this.name = this.constructor.name;
    }
}

/**
 * Transport configuration.
 */
export interface HttpTransportConfig {
    /**
     * The API base URL.
     * @mainnet https://api.hyperliquid.xyz
     * @testnet https://api.hyperliquid-testnet.xyz
     * @default "https://api.hyperliquid.xyz"
     */
    url?: string | URL;

    /**
     * The timeout for request. Set to `0` to disable.
     * @default 10_000
     */
    timeout?: number;

    /**
     * Request configuration options.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit}
     */
    fetchOptions?: Omit<RequestInit, "body" | "method">;

    /**
     * A callback function that is called before the request is sent.
     * @param request - The request to send.
     * @returns The request to send.
     */
    onRequest?: (request: Request) => MaybePromise<Request | void | null | undefined>;

    /**
     * A callback function that is called after the response is received.
     * @param response - The response to process.
     * @returns The response to process.
     */
    onResponse?: (response: Response) => MaybePromise<Response | void | null | undefined>;
}

/**
 * The transport connects to the Hyperliquid API via HTTP.
 */
export class HttpTransport implements IRESTTransport {
    /** The API base URL. */
    url: string | URL;

    /** The timeout for request. Set to `0` to disable. */
    timeout: number;

    /**
     * Request configuration options.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit}
     */
    fetchOptions: Omit<RequestInit, "body" | "method">;

    /**
     * A callback function that is called before the request is sent.
     * @param request - The request to send.
     * @returns The request to send.
     */
    onRequest?: (request: Request) => MaybePromise<Request | void | null | undefined>;

    /**
     * A callback function that is called after the response is received.
     * @param response - The response to process.
     * @returns The response to process.
     */
    onResponse?: (response: Response) => MaybePromise<Response | void | null | undefined>;

    /** API endpoint paths. */
    protected endpointPaths: Record<"info" | "action" | "explorer", string> = {
        info: "/info",
        action: "/exchange",
        explorer: "/explorer",
    };

    /**
     * Creates a new HTTP transport.
     * @param config - The transport configuration.
     */
    constructor(config?: HttpTransportConfig) {
        this.url = config?.url ?? "https://api.hyperliquid.xyz";
        this.timeout = config?.timeout ?? 10_000;
        this.fetchOptions = config?.fetchOptions ?? {};
        this.onRequest = config?.onRequest;
        this.onResponse = config?.onResponse;
    }

    /**
     * Sends an API request.
     * @param endpoint - The endpoint to send the request to.
     * @param payload - The request payload.
     * @param signal - An optional abort signal.
     * @returns The response data.
     * @throws {HttpRequestError} - On non-OK HTTP response status or invalid content type.
     */
    async request<T>(endpoint: "info" | "action" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T> {
        const url = new URL(this.endpointPaths[endpoint], this.url);
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
                signal: this.timeout > 0 ? AbortSignal.timeout(this.timeout) : undefined,
            },
            this.fetchOptions,
            { signal },
        );
        let request = new Request(url, init);

        request = await this.onRequest?.(request) ?? request;
        let response = await fetch(request);
        response = await this.onResponse?.(response) ?? response;

        if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json")) {
            const body = await response.text().catch(() => undefined);
            throw new HttpRequestError(response, body);
        }

        return await response.json();
    }
}

/**
 * Merges multiple headers objects into a single headers object.
 * @param headersList - The headers objects to merge.
 * @returns The merged headers object.
 */
function mergeHeaders(...headersList: HeadersInit[]): Headers {
    if (headersList.length === 0 || headersList.length === 1) {
        return new Headers(headersList[0] as HeadersInit | undefined);
    }

    const merged = new Headers();
    for (const headers of headersList) {
        const entries = Symbol.iterator in headers ? headers : Object.entries(headers);
        for (const [key, value] of entries) {
            merged.set(key, value);
        }
    }
    return merged;
}

/**
 * Merges multiple request init objects into a single request init object.
 * @param inits - The request init objects to merge.
 * @returns The merged request init object.
 */
function mergeRequestInit(...inits: RequestInit[]): RequestInit {
    const merged = inits.reduce((acc, init) => ({ ...acc, ...init }), {});

    const headersList = inits.map((init) => init.headers).filter((headers) => typeof headers === "object");
    if (headersList.length > 0) {
        merged.headers = mergeHeaders(...headersList);
    }

    const signals = inits.map((init) => init.signal).filter((signal) => signal instanceof AbortSignal);
    if (signals.length > 0) {
        merged.signal = signals.length > 1 ? AbortSignal.any(signals) : signals[0];
    }

    return merged;
}
