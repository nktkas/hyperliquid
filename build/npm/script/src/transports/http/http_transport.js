"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpTransport = exports.HttpRequestError = void 0;
const base_js_1 = require("../base.js");
/** Error thrown when an HTTP request fails. */
class HttpRequestError extends base_js_1.TransportError {
    response;
    body;
    constructor(args, options) {
        const { response, body } = args ?? {};
        let message;
        if (response) {
            message = `${response.status} ${response.statusText}`.trim();
            if (body)
                message += ` - ${body}`;
        }
        else {
            message = `Unknown error while making an HTTP request: ${options?.cause}`;
        }
        super(message, options);
        this.name = "HttpRequestError";
        this.response = response;
        this.body = body;
    }
}
exports.HttpRequestError = HttpRequestError;
/** HTTP implementation of the REST transport interface. */
class HttpTransport {
    isTestnet;
    timeout;
    server;
    fetchOptions;
    onRequest;
    onResponse;
    /**
     * Creates a new HTTP transport instance.
     * @param options - Configuration options for the HTTP transport layer.
     */
    constructor(options) {
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
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns A promise that resolves with parsed JSON response body.
     *
     * @throws {HttpRequestError} Thrown when the HTTP request fails.
     */
    async request(endpoint, payload, signal) {
        try {
            // Construct a Request
            const url = new URL(endpoint, this.server[this.isTestnet ? "testnet" : "mainnet"][endpoint === "explorer" ? "rpc" : "api"]);
            const init = mergeRequestInit({
                body: JSON.stringify(payload),
                headers: {
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Content-Type": "application/json",
                },
                keepalive: true,
                method: "POST",
                signal: this.timeout ? AbortSignal.timeout(this.timeout) : undefined,
            }, this.fetchOptions, { signal });
            let request = new Request(url, init);
            // Call the onRequest callback, if provided
            if (this.onRequest) {
                const customRequest = await this.onRequest(request);
                if (customRequest instanceof Request)
                    request = customRequest;
            }
            // Send the Request and wait for a Response
            let response = await fetch(request);
            // Call the onResponse callback, if provided
            if (this.onResponse) {
                const customResponse = await this.onResponse(response);
                if (customResponse instanceof Response)
                    response = customResponse;
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
        }
        catch (error) {
            if (error instanceof HttpRequestError)
                throw error; // Re-throw known errors
            throw new HttpRequestError(undefined, { cause: error });
        }
    }
}
exports.HttpTransport = HttpTransport;
/** Merges multiple {@linkcode HeadersInit} into one {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers | Headers}. */
function mergeHeadersInit(...inits) {
    if (inits.length === 0 || inits.length === 1) {
        return new Headers(inits[0]);
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
/** Merges multiple {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/RequestInit | RequestInit} into one {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/RequestInit | RequestInit}. */
function mergeRequestInit(...inits) {
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
