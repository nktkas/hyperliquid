import { TransportError } from "../base.ts";
import type { HyperliquidEventTarget } from "./_hyperliquid_event_target.ts";

interface PostRequest {
    method: "post";
    id: number;
    request: unknown;
}

interface SubscribeUnsubscribeRequest {
    method: "subscribe" | "unsubscribe";
    subscription: unknown;
}

interface PingRequest {
    method: "ping";
}

/**
 * Error thrown when a WebSocket request fails:
 * - When the WebSocket connection is closed
 * - When the server responds with an error message
 */
export class WebSocketRequestError extends TransportError {
    constructor(message: string) {
        super(message);
        this.name = "WebSocketRequestError";
    }
}

/**
 * Manages WebSocket requests to the Hyperliquid API.
 * Handles request creation, sending, and mapping responses to their corresponding requests.
 */
export class WebSocketAsyncRequest {
    protected lastId: number = 0;
    protected queue: Map<
        number | string,
        {
            // deno-lint-ignore no-explicit-any
            resolve: (value?: any) => void;
            // deno-lint-ignore no-explicit-any
            reject: (reason?: any) => void;
        }
    > = new Map();
    lastRequestTime: number = 0;

    /**
     * Creates a new WebSocket async request handler.
     * @param socket - WebSocket connection instance for sending requests to the Hyperliquid WebSocket API
     * @param hlEvents - Used to recognize Hyperliquid responses and match them with sent requests
     */
    constructor(protected socket: WebSocket, hlEvents: HyperliquidEventTarget) {
        // Monitor responses and match the pending request
        hlEvents.addEventListener("subscriptionResponse", (event) => {
            // Use a stringified request as an id
            const id = WebSocketAsyncRequest.requestToId(event.detail.subscription);
            this.queue.get(id)?.resolve(event.detail);
        });
        hlEvents.addEventListener("post", (event) => {
            const data = event.detail.response.type === "info"
                ? event.detail.response.payload.data
                : event.detail.response.payload;
            this.queue.get(event.detail.id)?.resolve(data);
        });
        hlEvents.addEventListener("pong", () => {
            this.queue.get("ping")?.resolve();
        });
        hlEvents.addEventListener("error", (event) => {
            try {
                // Error event doesn't have an id, use original request to match
                const request = event.detail.match(/{.*}/)?.[0];
                if (request) {
                    const parsedRequest = JSON.parse(request) as Record<string, unknown>;
                    if ("id" in parsedRequest && typeof parsedRequest.id === "number") {
                        // If a post request was sent, it is possible to get the id from the request
                        this.queue.get(parsedRequest.id)?.reject(
                            new WebSocketRequestError(`Cannot complete WebSocket request: ${event.detail}`),
                        );
                    } else if (
                        "subscription" in parsedRequest &&
                        typeof parsedRequest.subscription === "object" &&
                        parsedRequest.subscription !== null
                    ) {
                        // If a subscription/unsubscribe request was sent, use the request as an id
                        const id = WebSocketAsyncRequest.requestToId(parsedRequest.subscription);
                        this.queue.get(id)?.reject(
                            new WebSocketRequestError(`Cannot complete WebSocket request: ${event.detail}`),
                        );
                    } else {
                        // If the request is not recognized, use the parsed request as an id
                        const id = WebSocketAsyncRequest.requestToId(parsedRequest);
                        this.queue.get(id)?.reject(
                            new WebSocketRequestError(`Cannot complete WebSocket request: ${event.detail}`),
                        );
                    }
                }
            } catch {
                // Ignore JSON parsing errors
            }
        });

        // Throws all pending requests if the connection is dropped
        socket.addEventListener("close", () => {
            this.queue.forEach(({ reject }) => {
                reject(new WebSocketRequestError("Cannot complete WebSocket request: connection is closed"));
            });
            this.queue.clear();
        });
    }

    /**
     * Sends a request to the Hyperliquid API.
     * @returns A promise that resolves with the parsed JSON response body.
     */
    async request(method: "ping", signal?: AbortSignal): Promise<void>;
    async request<T>(method: "post" | "subscribe" | "unsubscribe", payload: unknown, signal?: AbortSignal): Promise<T>;
    async request<T>(
        method: "post" | "subscribe" | "unsubscribe" | "ping",
        payload_or_signal?: unknown | AbortSignal,
        maybeSignal?: AbortSignal,
    ): Promise<T> {
        const payload = payload_or_signal instanceof AbortSignal ? undefined : payload_or_signal;
        const signal = payload_or_signal instanceof AbortSignal ? payload_or_signal : maybeSignal;

        // Reject the request if the signal is aborted
        if (signal?.aborted) return Promise.reject(signal.reason);

        // Create a request
        let id: string | number;
        let request: SubscribeUnsubscribeRequest | PostRequest | PingRequest;
        if (method === "post") {
            id = ++this.lastId;
            request = { method, id, request: payload };
        } else if (method === "ping") {
            id = "ping";
            request = { method };
        } else {
            id = WebSocketAsyncRequest.requestToId(payload);
            request = { method, subscription: payload };
        }

        // Send the request
        this.socket.send(JSON.stringify(request));
        this.lastRequestTime = Date.now();

        // Wait for a response
        const { promise, resolve, reject } = Promise.withResolvers<T>();
        this.queue.set(id, { resolve, reject });

        const onAbort = () => reject(signal?.reason);
        signal?.addEventListener("abort", onAbort, { once: true });

        return await promise.finally(() => {
            this.queue.delete(id);
            signal?.removeEventListener("abort", onAbort);
        });
    }

    /** Normalizes an object and then converts it to a string. */
    static requestToId(value: unknown): string {
        const lowerHex = containsUppercaseHex(value) ? deepLowerHex(value) : value;
        const sorted = deepSortKeys(lowerHex);
        return JSON.stringify(sorted); // Also removes undefined
    }
}

/** Deeply converts hexadecimal strings in an object/array to lowercase. */
function deepLowerHex(obj: unknown): unknown {
    if (typeof obj === "string") {
        return /^(0X[0-9a-fA-F]*|0x[0-9a-fA-F]*[A-F][0-9a-fA-F]*)$/.test(obj) ? obj.toLowerCase() : obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepLowerHex);
    }

    if (typeof obj === "object" && obj !== null) {
        const result: Record<string, unknown> = {};
        const entries = Object.entries(obj);

        for (const [key, value] of entries) {
            result[key] = deepLowerHex(value);
        }

        return result;
    }

    return obj;
}

/** Check if an object contains uppercase hexadecimal strings. */
function containsUppercaseHex(obj: unknown): boolean {
    const str = JSON.stringify(obj);
    return /0X[0-9a-fA-F]*|0x[0-9a-fA-F]*[A-F][0-9a-fA-F]*/.test(str);
}

/** Deeply sort the keys of an object. */
function deepSortKeys<T>(obj: T): T {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepSortKeys) as T;
    }

    const result: Record<string, unknown> = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
        result[key] = deepSortKeys((obj as Record<string, unknown>)[key]);
    }

    return result as T;
}
