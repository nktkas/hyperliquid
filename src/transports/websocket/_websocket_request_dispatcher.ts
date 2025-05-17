import { TransportError } from "../../base.ts";
import type { HyperliquidEventTarget } from "./_hyperliquid_event_target.ts";

interface PostRequest {
    method: "post";
    id: number;
    request: unknown;
}
interface SubscribeRequest {
    method: "subscribe" | "unsubscribe";
    subscription: unknown;
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
export class WebSocketRequestDispatcher {
    /** Last used post request ID */
    private lastId: number = 0;

    /** Map of pending requests waiting for responses */
    private pending: Map<
        number | string,
        {
            resolve: (value: unknown) => void;
            reject: (reason: unknown) => void;
        }
    > = new Map();

    /**
     * Creates a new WebSocket request dispatcher.
     * @param socket - WebSocket connection instance for sending requests to the Hyperliquid WebSocket API
     * @param hlEvents - Used to recognize Hyperliquid responses and match them with sent requests
     */
    constructor(private socket: WebSocket, hlEvents: HyperliquidEventTarget) {
        // Monitor responses and match the pending request
        hlEvents.addEventListener("subscriptionResponse", (event) => {
            // Use a stringified request as an id
            const id = WebSocketRequestDispatcher.requestToId(event.detail.subscription);
            this.pending.get(id)?.resolve(event.detail);
        });
        hlEvents.addEventListener("post", (event) => {
            const data = event.detail.response.type === "info"
                ? event.detail.response.payload.data
                : event.detail.response.payload;
            this.pending.get(event.detail.id)?.resolve(data);
        });
        hlEvents.addEventListener("error", (event) => {
            try {
                // Error event doesn't have an id, use original request to match
                const request = event.detail.match(/{.*}/)?.[0];
                if (request) {
                    const parsedRequest = JSON.parse(request) as Record<string, unknown>;
                    if ("id" in parsedRequest && typeof parsedRequest.id === "number") {
                        // If a post request was sent, it is possible to get the id from the request
                        this.pending.get(parsedRequest.id)?.reject(
                            new WebSocketRequestError(`Cannot complete WebSocket request: ${event.detail}`),
                        );
                    } else if (
                        "subscription" in parsedRequest &&
                        typeof parsedRequest.subscription === "object" &&
                        parsedRequest.subscription !== null
                    ) {
                        // If a subscription/unsubscribe request was sent, use the request as an id
                        const id = WebSocketRequestDispatcher.requestToId(parsedRequest.subscription);
                        this.pending.get(id)?.reject(
                            new WebSocketRequestError(`Cannot complete WebSocket request: ${event.detail}`),
                        );
                    } else {
                        // If the request is not recognized, use the parsed request as an id
                        const id = WebSocketRequestDispatcher.requestToId(parsedRequest);
                        this.pending.get(id)?.reject(
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
            this.pending.forEach(({ reject }) => {
                reject(new WebSocketRequestError("Cannot complete WebSocket request: connection is closed"));
            });
            this.pending.clear();
        });
    }

    /**
     * Sends a request to the Hyperliquid API.
     * @param method - The method of websocket request.
     * @param payload - The payload to send with the request.
     * @param signal - An optional abort signal.
     * @returns A promise that resolves with the parsed JSON response body.
     */
    async request(
        method: "post" | "subscribe" | "unsubscribe",
        payload: unknown,
        signal?: AbortSignal,
    ): Promise<unknown> {
        // Reject the request if the signal is aborted
        if (signal?.aborted) return Promise.reject(signal.reason);

        // Create a request object
        let id: number | string;
        let request: PostRequest | SubscribeRequest;
        if (method === "post") {
            id = ++this.lastId;
            request = { method, id, request: payload };
        } else {
            id = WebSocketRequestDispatcher.requestToId(payload);
            request = { method, subscription: payload };
        }

        // Send the request
        this.socket.send(JSON.stringify(request));

        // Wait for a response
        let onAbort: () => void;
        return await new Promise((resolve, reject) => {
            // Add an abort listener
            onAbort = () => reject(signal?.reason);
            signal?.addEventListener("abort", onAbort, { once: true });

            // Add the promise to the pending list
            this.pending.set(id, { resolve, reject });
        }).finally(() => {
            // Remove the abort listener when the promise is settled
            signal?.removeEventListener("abort", onAbort);

            // Clean up the pending list
            this.pending.delete(id);
        });
    }

    /**
     * Normalizes a request object to an ID.
     * @param value - A request object.
     * @returns A stringified request.
     */
    static requestToId(value: unknown): string {
        const lowerHex = containsUppercaseHex(value) ? deepLowerHex(value) : value;
        const sorted = deepSortKeys(lowerHex);
        return JSON.stringify(sorted); // Also removes undefined
    }
}

/**
 * Deeply converts hexadecimal strings in an object/array to lowercase.
 * @param obj - The object/array to convert hexadecimal strings to lowercase.
 * @returns A new object/array with hexadecimal strings converted to lowercase.
 */
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

/**
 * Check if an object contains uppercase hexadecimal strings.
 * @param obj - The object to check.
 * @returns True if the object contains uppercase hexadecimal strings, false otherwise.
 */
function containsUppercaseHex(obj: unknown): boolean {
    const str = JSON.stringify(obj);
    return /0X[0-9a-fA-F]*|0x[0-9a-fA-F]*[A-F][0-9a-fA-F]*/.test(str);
}

/**
 * Deeply sort the keys of an object.
 * @param obj - An object to sort the keys of.
 * @returns A new object with sorted keys.
 */
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
