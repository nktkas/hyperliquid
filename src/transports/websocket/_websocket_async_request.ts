import type { ReconnectingWebSocket } from "./_reconnecting_websocket.ts";
import type { HyperliquidEventTarget } from "./_hyperliquid_event_target.ts";
import { WebSocketRequestError } from "./websocket_transport.ts";

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
 * Manages WebSocket requests to the Hyperliquid API.
 * Handles request creation, sending, and mapping responses to their corresponding requests.
 */
export class WebSocketAsyncRequest {
    protected lastId: number = 0;
    protected queue: {
        id: number | string;
        // deno-lint-ignore no-explicit-any
        resolve: (value?: any) => void;
        // deno-lint-ignore no-explicit-any
        reject: (reason?: any) => void;
    }[] = [];
    lastRequestTime: number = 0;

    /**
     * Creates a new WebSocket async request handler.
     * @param socket - WebSocket connection instance for sending requests to the Hyperliquid WebSocket API
     * @param hlEvents - Used to recognize Hyperliquid responses and match them with sent requests
     */
    constructor(protected socket: ReconnectingWebSocket, hlEvents: HyperliquidEventTarget) {
        // Monitor responses and match the pending request
        hlEvents.addEventListener("subscriptionResponse", (event) => {
            // Use a stringified request as an id
            const id = WebSocketAsyncRequest.requestToId(event.detail);
            this.queue.findLast((item) => item.id === id)?.resolve(event.detail);
        });
        hlEvents.addEventListener("post", (event) => {
            const data = event.detail.response.type === "info"
                ? event.detail.response.payload.data
                : event.detail.response.payload;
            this.queue.findLast((item) => item.id === event.detail.id)?.resolve(data);
        });
        hlEvents.addEventListener("pong", () => {
            this.queue.findLast((item) => item.id === "ping")?.resolve();
        });
        hlEvents.addEventListener("error", (event) => {
            try {
                // Error event doesn't have an id, use original request to match
                const request = event.detail.match(/{.*}/)?.[0];
                if (!request) return;

                const parsedRequest = JSON.parse(request) as Record<string, unknown>;

                // For `post` requests
                if ("id" in parsedRequest && typeof parsedRequest.id === "number") {
                    this.queue.findLast((item) => item.id === parsedRequest.id)
                        ?.reject(new WebSocketRequestError(`Server error: ${event.detail}`, { cause: event.detail }));
                    return;
                }

                // For `subscribe` and `unsubscribe` requests
                if (
                    "subscription" in parsedRequest &&
                    typeof parsedRequest.subscription === "object" && parsedRequest.subscription !== null
                ) {
                    const id = WebSocketAsyncRequest.requestToId(parsedRequest);
                    this.queue.findLast((item) => item.id === id)
                        ?.reject(new WebSocketRequestError(`Server error: ${event.detail}`, { cause: event.detail }));
                    return;
                }

                // For `Already subscribed` and `Invalid subscription` requests
                if (event.detail.startsWith("Already subscribed") || event.detail.startsWith("Invalid subscription")) {
                    const id = WebSocketAsyncRequest.requestToId({
                        method: "subscribe",
                        subscription: parsedRequest,
                    });
                    this.queue.findLast((item) => item.id === id)
                        ?.reject(new WebSocketRequestError(`Server error: ${event.detail}`, { cause: event.detail }));
                    return;
                }
                // For `Already unsubscribed` requests
                if (event.detail.startsWith("Already unsubscribed")) {
                    const id = WebSocketAsyncRequest.requestToId({
                        method: "unsubscribe",
                        subscription: parsedRequest,
                    });
                    this.queue.findLast((item) => item.id === id)
                        ?.reject(new WebSocketRequestError(`Server error: ${event.detail}`, { cause: event.detail }));
                    return;
                }

                // For unknown requests
                const id = WebSocketAsyncRequest.requestToId(parsedRequest);
                this.queue.findLast((item) => item.id === id)
                    ?.reject(new WebSocketRequestError(`Server error: ${event.detail}`, { cause: event.detail }));
            } catch {
                // Ignore JSON parsing errors
            }
        });

        // Throws all pending requests if the connection is dropped
        socket.addEventListener("close", () => {
            this.queue.forEach(({ reject }) => {
                reject(new WebSocketRequestError("WebSocket connection closed."));
            });
            this.queue = [];
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
            request = { method, subscription: payload };
            id = WebSocketAsyncRequest.requestToId(request);
        }

        // Send the request
        this.socket.send(JSON.stringify(request), signal);
        this.lastRequestTime = Date.now();

        // Wait for a response
        const { promise, resolve, reject } = Promise.withResolvers<T>();
        this.queue.push({ id, resolve, reject });

        const onAbort = () => reject(signal?.reason);
        signal?.addEventListener("abort", onAbort, { once: true });

        return await promise.finally(() => {
            const index = this.queue.findLastIndex((item) => item.id === id);
            if (index !== -1) this.queue.splice(index, 1);

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
