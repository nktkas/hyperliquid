import type { IRESTTransport } from "./base.d.ts";

type DeepRequired<T> = Required<
    {
        [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>;
    }
>;

/**
 * The error thrown when the HTTP request fails.
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
     * @default 10_000
     */
    timeout?: number;

    /**
     * Request configuration options.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/RequestInit}
     */
    fetchOptions?: Omit<RequestInit, "body" | "method">;

    /** Retry policy configuration for failed requests. */
    retry?: {
        /**
         * Maximum number of retry attempts. Set to `0` to disable.
         * @default 0
         */
        maxAttempts?: number;

        /**
         * Delay between retries in milliseconds.
         * @default (attempt) => ~~(1 << attempt) * 150 // Exponential backoff
         */
        delay: number | ((attempt: number) => number | Promise<number>);

        /**
         * Custom logic to determine if an error should trigger a retry.
         * @param error - The error that occurred during the request.
         * @returns A boolean indicating if retry should be attempted.
         * @default (error) => error instanceof TypeError || (error instanceof HttpRequestError && error.response.status >= 500 && error.response.status < 600)
         */
        shouldReattempt?: (error: unknown) => boolean | Promise<boolean>;
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
    protected endpointPaths: Record<"info" | "action" | "explorer", string> = {
        info: "/info",
        action: "/exchange",
        explorer: "/explorer",
    };

    /** Creates a new HTTP transport. */
    constructor(config: HttpTransportConfig = {}) {
        this.config = {
            url: config.url ?? "https://api.hyperliquid.xyz",
            timeout: config.timeout ?? 10_000,
            fetchOptions: config.fetchOptions,
            retry: {
                maxAttempts: config.retry?.maxAttempts ?? 0,
                delay: config.retry?.delay ?? ((attempt) => ~~(1 << attempt) * 150),
                shouldReattempt: config.retry?.shouldReattempt ??
                    ((error) =>
                        error instanceof TypeError ||
                        (error instanceof HttpRequestError && error.response.status >= 500 && error.response.status < 600)),
            },
        };
    }

    /**
     * Sends an API request.
     * @param endpoint - The endpoint to send the request to.
     * @param payload - The request payload.
     * @param signal - An optional abort signal.
     * @returns The response data.
     * @throws {HttpRequestError} - On non-OK HTTP response status or invalid content type.
     */
    request<T>(endpoint: "info" | "action" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T> {
        return retry(async (signal) => {
            const url = new URL(this.endpointPaths[endpoint], this.config.url);
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
                    signal: this.config.timeout > 0 ? AbortSignal.timeout(this.config.timeout) : undefined,
                },
                this.config.fetchOptions ?? {},
                { signal },
            );

            const response = await fetch(url, init);
            if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json")) {
                await response.body?.cancel();
                throw new HttpRequestError(response);
            }
            return await response.json();
        }, { ...this.config.retry, signal });
    }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(signal.reason);
            return;
        }

        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);

        const onAbort = () => {
            clearTimeout(timer);
            reject(signal!.reason);
        };

        signal?.addEventListener("abort", onAbort, { once: true });
    });
}

async function retry<T>(
    fn: (signal?: AbortSignal) => T | Promise<T>,
    config: {
        maxAttempts: number;
        delay: number | ((attempt: number) => number | Promise<number>);
        shouldReattempt?: (error: unknown) => boolean | Promise<boolean>;
        signal?: AbortSignal;
    },
): Promise<T> {
    const {
        maxAttempts,
        delay,
        shouldReattempt = () => true,
        signal,
    } = config;

    if (signal?.aborted) {
        throw signal.reason;
    }

    let attempt = 0;
    while (true) {
        try {
            return await fn(signal);
        } catch (error) {
            if (signal?.aborted) {
                throw signal.reason;
            }

            if (++attempt >= maxAttempts || !await shouldReattempt(error)) {
                throw error;
            }

            const delayDuration = typeof delay === "number" ? delay : await delay(attempt);
            await sleep(delayDuration, signal);
        }
    }
}

function mergeHeaders(...headersList: HeadersInit[]): Headers {
    const merged = new Headers();
    for (const headers of headersList) {
        const entries = Symbol.iterator in headers ? headers : Object.entries(headers);
        for (const [key, value] of entries) {
            merged.set(key, value);
        }
    }
    return merged;
}

function mergeRequestInit(...inits: RequestInit[]): RequestInit {
    const merged = inits.reduce((acc, init) => ({ ...acc, ...init }), {});

    const headersList = inits.map((init) => init.headers).filter((headers) => !!headers);
    merged.headers = headersList.length > 1 ? mergeHeaders(...headersList) : headersList[0] as Headers | undefined;

    const signals = inits.map((init) => init.signal).filter((signal) => !!signal);
    merged.signal = signals.length > 1 ? AbortSignal.any(signals) : signals[0] as AbortSignal | undefined;

    return merged;
}
