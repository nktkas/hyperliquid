/** Hexadecimal string starting with `0x`. */
export type Hex = `0x${string}`;

export type MaybePromise<T> = T | Promise<T>;

/**
 * Interface representing a REST transport.
 * Handles communication with Hyperliquid API endpoints.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint | Info endpoint}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint | Exchange endpoint}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests | Websocket post requests}
 */
export interface IRequestTransport extends Partial<AsyncDisposable> {
    /**
     * Sends a request to the Hyperliquid API.
     * @param endpoint - The API endpoint to send the request to.
     * @param payload - The payload to send with the request.
     * @param signal - An ptional abort signal.
     * @returns A promise that resolves with parsed JSON response body.
     */
    request(
        endpoint: "info" | "exchange" | "explorer",
        payload: unknown,
        signal?: AbortSignal,
    ): Promise<unknown>;
}

/**
 * Interface representing an event subscription transport.
 * Handles WebSocket subscriptions for real-time updates.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Websocket subscriptions}
 */
export interface ISubscriptionTransport extends Partial<AsyncDisposable> {
    /**
     * Subscribes to a Hyperliquid event channel.
     * @param channel - The event channel to listen to.
     * @param payload - The payload to send with the subscription request.
     * @param listener - The function to call when the event is dispatched.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     */
    subscribe(
        channel: string,
        payload: unknown,
        listener: (data: CustomEvent) => void,
        signal?: AbortSignal,
    ): Promise<Subscription>;
}

/** Controls event subscription lifecycle. */
export interface Subscription {
    /**
     * Unsubscribes from the event and sends an unsubscribe request to the server.
     * @param signal - An optional abort signal for canceling the unsubscribe request.
     */
    unsubscribe(signal?: AbortSignal): Promise<void>;
}

/** Base class for all Hyperliquid SDK errors. */
export class HyperliquidError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "HyperliquidError";
    }
}

/** Base class for all transport-related errors. */
export class TransportError extends HyperliquidError {
    constructor(message?: string) {
        super(message);
        this.name = "TransportError";
    }
}
