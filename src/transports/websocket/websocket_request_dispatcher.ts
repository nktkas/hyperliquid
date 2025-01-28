import { TransportError } from "../base.ts";
import type { HyperliquidEventTarget } from "./hyperliquid_event_target.ts";

/**
 * Error thrown when a WebSocket request fails:
 * - When the WebSocket connection is closed
 * - When the server responds with an error message
 */
export class WebSocketRequestError extends TransportError {
    /**
     * Creates a new WebSocket request error.
     * @param message - The error message.
     */
    constructor(message: string) {
        super(message);
        this.name = "WebSocketRequestError";
    }
}

/**
 * Manages WebSocket requests to the Hyperliquid API.
 * Handles request creation, sending, and mapping responses to their corresponding requests.
 */
export class WebSocketRequestDispatcher {
    /** Last used request ID */
    protected lastId: number = 0;

    /** Map of pending requests waiting for responses */
    protected pending: Map<
        number | string,
        { resolve: (value: unknown) => void; reject: (reason: unknown) => void }
    > = new Map();

    /**
     * Creates a new WebSocket request dispatcher.
     * @param socket - WebSocket connection instance for sending requests to the Hyperliquid WebSocket API
     * @param hlEvents - Used to recognize Hyperliquid responses and match them with sent requests
     */
    constructor(protected socket: WebSocket, hlEvents: HyperliquidEventTarget) {
        // Monitor responses and match the pending request
        hlEvents.addEventListener("subscriptionResponse", (event) => {
            // Use a stringified request as an id
            const id = WebSocketRequestDispatcher.requestToId(event.detail.subscription);
            this.resolve(id, event.detail);
        });
        hlEvents.addEventListener("post", (event) => {
            const data = event.detail.response.type === "info"
                ? event.detail.response.payload.data
                : event.detail.response.payload;
            this.resolve(event.detail.id, data);
        });
        hlEvents.addEventListener("error", (event) => {
            try {
                // Error event doesn't have an id, use original request to match
                const request = event.detail.match(/{.*}/)?.[0];
                if (request) {
                    const parsedRequest = JSON.parse(request) as Record<string, unknown>;
                    if ("id" in parsedRequest && typeof parsedRequest.id === "number") {
                        // If a post request was sent, it is possible to get the id from the request
                        this.reject(parsedRequest.id, new WebSocketRequestError(event.detail));
                    } else if (
                        "subscription" in parsedRequest &&
                        typeof parsedRequest.subscription === "object" &&
                        parsedRequest.subscription !== null
                    ) {
                        // If a subscription/unsubscribe request was sent, use the request as an id
                        const id = WebSocketRequestDispatcher.requestToId(parsedRequest.subscription);
                        this.reject(id, new WebSocketRequestError(event.detail));
                    } else {
                        // If the request is not recognized, use the parsed request as an id
                        const id = WebSocketRequestDispatcher.requestToId(parsedRequest);
                        this.reject(id, new WebSocketRequestError(event.detail));
                    }
                }
            } catch {
                // Ignore JSON parsing errors
            }
        });

        // Throws all pending requests if the connection is dropped
        socket.addEventListener("close", () => {
            this.pending.forEach(({ reject }) => {
                reject(new WebSocketRequestError("The WebSocket connection has been closed."));
            });
            this.pending.clear();
        });
    }

    /** Gets the next request ID */
    protected get nextId(): number {
        return ++this.lastId;
    }

    /**
     * Sends a request to the Hyperliquid API.
     * @param method - The method of websocket request.
     * @param payload - The payload to send with the request.
     * @param signal - An optional abort signal.
     * @returns A promise that resolves with the parsed JSON response body.
     */
    request(
        method: "post" | "subscribe" | "unsubscribe",
        payload: unknown,
        signal?: AbortSignal,
    ): Promise<unknown> {
        signal?.throwIfAborted();

        // Create a request object
        let id: number | string;
        let request:
            | { method: "post"; id: number; request: unknown }
            | { method: "subscribe" | "unsubscribe"; subscription: unknown };
        if (method === "post") {
            id = this.nextId;
            request = { method, id, request: payload };
        } else {
            id = WebSocketRequestDispatcher.requestToId(payload);
            request = { method, subscription: payload };
        }

        // Send the request
        this.socket.send(JSON.stringify(request));

        // Wait for a response
        let onAbort: () => void;
        return new Promise((resolve, reject) => {
            // Add an abort listener
            onAbort = () => reject(signal?.reason);
            signal?.addEventListener("abort", onAbort, { once: true });

            // Add the promise to the pending list
            this.pending.set(id, { resolve, reject });
        }).finally(() => {
            // Remove the abort listener when the promise is settled
            signal?.removeEventListener("abort", onAbort);
        });
    }

    /**
     * Resolves a pending request.
     * @param id - A request ID or a stringified request.
     * @param value - A resolution value.
     */
    protected resolve(id: number | string, value: unknown): void {
        this.pending.get(id)?.resolve(value);
        this.pending.delete(id);
    }

    /**
     * Rejects a pending request.
     * @param id - A request ID or a stringified request.
     * @param reason - A rejection reason.
     */
    protected reject(id: number | string, reason: unknown): void {
        this.pending.get(id)?.reject(reason);
        this.pending.delete(id);
    }

    /**
     * Normalizes a request object to an ID.
     * @param value - A request object.
     * @returns A stringified request.
     */
    static requestToId(value: unknown): string {
        const lowerHex = deepLowerHex(value);
        const sorted = deepSortKeys(lowerHex);
        return JSON.stringify(sorted);
    }
}

/**
 * Convert all hexadecimal strings to lowercase in an object/array.
 * @param obj - The object/array to convert hexadecimal strings to lowercase.
 * @returns A new object/array with hexadecimal strings converted to lowercase.
 */
function deepLowerHex(obj: unknown): unknown {
    if (Array.isArray(obj)) {
        return obj.map(deepLowerHex);
    } else if (obj && typeof obj === "object") {
        return Object.entries(obj).reduce((acc, [key, val]) => ({
            ...acc,
            [key]: deepLowerHex(val),
        }), {});
    } else if (typeof obj === "string" && /^0x[0-9A-Fa-f]+$/.test(obj)) {
        return obj.toLowerCase();
    } else {
        return obj;
    }
}

/**
 * Deeply sort the keys of an object.
 * @param obj - An object to sort the keys of.
 * @returns A new object with sorted keys.
 */
function deepSortKeys<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(deepSortKeys) as T;
    }
    return Object.fromEntries(
        Object.entries(obj)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => [k, deepSortKeys(v)]),
    ) as T;
}
