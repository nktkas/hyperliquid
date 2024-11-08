import type { IRESTTransport } from "./base.d.ts";

type DeepRequired<T> = Required<
    {
        [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>;
    }
>;

/**
 * The error thrown when the HTTP response status is not ok.
 */
export class HttpRequestError extends Error {
    /** The HTTP response. */
    response: Response;

    /** Creates a new HTTP request error. */
    constructor(response: Response) {
        super(`HTTP request failed with status ${response.status} ${response.statusText}`);
        this.name = this.constructor.name;
        this.response = response;
    }
}

/**
 * Transport configuration.
 */
export interface HttpTransportConfig {
    /**
     * The API base URL.
     * @default "https://api.hyperliquid.xyz"
     */
    url?: string | URL;

    /**
     * The timeout for request. Set to `0` to disable.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static}
     * @default 10_000
     */
    timeout?: number;

    /**
     * Request configuration options.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit}
     */
    fetchOptions?: Omit<RequestInit, "body" | "method">;

    /**
     * Retry policy configuration.
     * @default { maxAttempts: 3, baseDelay: 150, maxDelay: 5000 }
     */
    retry?: {
        /**
         * Maximum number of retry attempts. Set to `0` to disable.
         * @default 3
         */
        maxAttempts?: number;

        /**
         * Base delay between retries in milliseconds.
         * @default 150
         */
        baseDelay?: number;

        /**
         * Maximum delay between retries in milliseconds.
         * @default 5000
         */
        maxDelay?: number;

        /**
         * Custom logic to determine if an error should trigger a retry.
         * @param error - The error that occurred during the request.
         * @returns A boolean indicating if retry should be attempted.
         * @default Retries on network errors, timeouts, and 5xx status codes.
         */
        shouldRetry?: (error: unknown) => boolean | Promise<boolean>;
    };
}

/**
 * The transport connects to the Hyperliquid API via HTTP.
 */
export class HttpTransport implements IRESTTransport {
    /** Transport configuration. */
    config: DeepRequired<Omit<HttpTransportConfig, "fetchOptions">> & {
        fetchOptions?: HttpTransportConfig["fetchOptions"];
    };

    /** API endpoint paths. */
    protected readonly endpointPaths: Record<"info" | "action" | "explorer", string> = {
        info: "/info",
        action: "/exchange",
        explorer: "/explorer",
    };

    /**
     * Creates a new HTTP transport.
     */
    constructor(config: HttpTransportConfig = {}) {
        this.config = {
            url: config.url ?? "https://api.hyperliquid.xyz",
            timeout: config.timeout ?? 10_000,
            fetchOptions: config.fetchOptions,
            retry: {
                maxAttempts: config.retry?.maxAttempts ?? 3,
                baseDelay: config.retry?.baseDelay ?? 150,
                maxDelay: config.retry?.maxDelay ?? 5000,
                shouldRetry: config.retry?.shouldRetry ?? defaultShouldRetry,
            },
        };
    }

    /**
     * Sends an API request.
     * @param endpoint - The endpoint to send the request to.
     * @param body - The request body.
     * @returns The response body.
     *
     * @throws {HttpRequestError} - On non-200 HTTP status.
     * @throws {DOMException} - On `TimeoutError` from {@link HttpTransportConfig.timeout}.
     * @throws {DOMException} - On `AbortError` from {@link HttpTransportConfig.fetchOptions.signal}.
     * @throws {TypeError} - On network error.
     */
    async request<T>(endpoint: "info" | "action" | "explorer", body: unknown): Promise<T> {
        const url: URL = new URL(this.endpointPaths[endpoint], this.config.url);
        const init: RequestInit = {
            method: "POST",
            body: JSON.stringify(body),
            keepalive: true,
            ...this.config.fetchOptions,
            headers: new Headers({
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Connection": "keep-alive",
                "Content-Type": "application/json",
                ...(Array.isArray(this.config.fetchOptions?.headers)
                    ? Object.fromEntries(this.config.fetchOptions.headers)
                    : this.config.fetchOptions?.headers),
            }),
        };

        if (this.config.timeout > 0) {
            const timeoutSignal = AbortSignal.timeout(this.config.timeout);
            init.signal = init.signal ? AbortSignal.any([timeoutSignal, init.signal]) : timeoutSignal;
        }

        return await retry(async () => {
            const response = await fetch(url, init);
            if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json")) {
                await response.body?.cancel();
                throw new HttpRequestError(response);
            }
            return await response.json();
        }, this.config.retry);
    }
}

/**
 * Retries an operation with the given configuration.
 */
async function retry<T>(
    operation: () => T | Promise<T>,
    config: DeepRequired<HttpTransportConfig>["retry"],
): Promise<T> {
    const { maxAttempts, baseDelay, maxDelay, shouldRetry } = config;

    let attempt = 0;
    while (true) {
        try {
            return await operation();
        } catch (error) {
            if (++attempt < maxAttempts && await shouldRetry(error)) {
                const delay = Math.min(
                    Math.floor((1 << attempt) * baseDelay * (0.5 + Math.random())),
                    maxDelay,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
}

/**
 * The default retry policy.
 */
function defaultShouldRetry(error: unknown): boolean {
    if (error instanceof DOMException && error.name === "TimeoutError") {
        return true;
    }

    if (error instanceof TypeError) {
        return true;
    }

    if (error instanceof HttpRequestError) {
        return error.response.status >= 500 && error.response.status < 600;
    }

    return false;
}
