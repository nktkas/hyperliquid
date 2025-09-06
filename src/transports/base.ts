import { HyperliquidError } from "../errors.ts";

/**
 * Interface representing a REST transport.
 * Handles communication with Hyperliquid API endpoints.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint | Info endpoint}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint | Exchange endpoint}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests | Websocket post requests}
 */
export interface IRequestTransport extends Partial<AsyncDisposable> {
    /** Indicates this transport uses testnet endpoint(s). */
    isTestnet: boolean;
    /**
     * Sends a request to the Hyperliquid API.
     * @param endpoint - The API endpoint to send the request to.
     * @param payload - The payload to send with the request.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns A promise that resolves with parsed JSON response body.
     */
    request<T>(endpoint: "info" | "exchange", payload: unknown, signal?: AbortSignal): Promise<T>;
    request<T>(endpoint: "info" | "exchange" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T>;
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
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     */
    subscribe<T>(channel: string, payload: unknown, listener: (data: CustomEvent<T>) => void): Promise<Subscription>;
}

/** Controls event subscription lifecycle. */
export interface Subscription {
    /** Unsubscribes from the event and sends an unsubscribe request to the server. */
    unsubscribe(): Promise<void>;
    /** Signal that aborts when resubscription fails during reconnection. */
    resubscribeSignal?: AbortSignal;
}

/** Thrown when a transport error occurs. */
export class TransportError extends HyperliquidError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "TransportError";
    }
}
