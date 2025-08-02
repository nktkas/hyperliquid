import { type IRequestTransport, type ISubscriptionTransport, type Subscription, TransportError } from "../base.js";
import { type MessageBufferStrategy, ReconnectingWebSocket, ReconnectingWebSocketError, type ReconnectingWebSocketOptions } from "./_reconnecting_websocket.js";
import { HyperliquidEventTarget } from "./_hyperliquid_event_target.js";
import { WebSocketAsyncRequest } from "./_websocket_async_request.js";
import { WebSocketCompatibilityError, getWebSocketEnvironmentInfo, requiresWsPackage, preloadWsPackage } from "./_websocket_factory.js";
export { type MessageBufferStrategy, ReconnectingWebSocketError, type ReconnectingWebSocketOptions, WebSocketCompatibilityError, getWebSocketEnvironmentInfo, requiresWsPackage, preloadWsPackage };
/** Configuration options for the WebSocket transport layer. */
export interface WebSocketTransportOptions {
    /**
     * The WebSocket URL.
     * - Mainnet:
     *   - API: `wss://api.hyperliquid.xyz/ws`
     *   - Explorer: `wss://rpc.hyperliquid.xyz/ws`
     * - Testnet:
     *   - API: `wss://api.hyperliquid-testnet.xyz/ws`
     *   - Explorer: `wss://rpc.hyperliquid-testnet.xyz/ws`
     * @defaultValue `wss://api.hyperliquid.xyz/ws`
     */
    url?: string | URL;
    /**
     * Timeout for requests in ms.
     * Set to `null` to disable.
     * @defaultValue `10_000`
     */
    timeout?: number | null;
    /** Keep-alive configuration. */
    keepAlive?: {
        /**
         * Interval between sending ping messages in ms.
         * Set to `null` to disable.
         * @defaultValue `30_000`
         */
        interval?: number | null;
        /**
         * Timeout for the ping request in ms.
         * Set to `null` to disable.
         * @defaultValue same as {@link timeout} for requests.
         */
        timeout?: number | null;
    };
    /** Reconnection policy configuration for closed connections. */
    reconnect?: ReconnectingWebSocketOptions;
    /**
     * Enable automatic event resubscription after reconnection.
     * @defaultValue `true`
     */
    autoResubscribe?: boolean;
}
/** Error thrown when a WebSocket request fails. */
export declare class WebSocketRequestError extends TransportError {
    constructor(message?: string, options?: ErrorOptions);
}
/** WebSocket implementation of the REST and Subscription transport interfaces. */
export declare class WebSocketTransport implements IRequestTransport, ISubscriptionTransport, AsyncDisposable {
    protected _wsRequester: WebSocketAsyncRequest;
    protected _hlEvents: HyperliquidEventTarget;
    protected _keepAliveTimeout: ReturnType<typeof setTimeout> | null;
    protected _subscriptions: Map<string, // Unique identifier based on the payload
    {
        listeners: Map<(data: CustomEvent) => void, // Event listener function
        () => Promise<void>>;
        promise: Promise<unknown>;
        resubscribeAbortController?: AbortController;
    }>;
    protected _isReconnecting: boolean;
    /**
     * Request timeout in ms.
     * Set to `null` to disable.
     */
    timeout: number | null;
    /** Keep-alive configuration. */
    keepAlive: {
        /**
         * Interval between sending ping messages in ms.
         * Set to `null` to disable.
         */
        interval: number | null;
        /**
         * Timeout for the ping request in ms.
         * Set to `null` to disable.
         */
        timeout?: number | null;
    };
    /** Enable automatic resubscription after reconnection. */
    autoResubscribe: boolean;
    /** The WebSocket that is used for communication. */
    readonly socket: ReconnectingWebSocket;
    /**
     * Creates a new WebSocket transport instance.
     * @param options - Configuration options for the WebSocket transport layer.
     */
    constructor(options?: WebSocketTransportOptions);
    /**
     * Sends a request to the Hyperliquid API via WebSocket.
     *
     * Note: Explorer requests are not supported in the Hyperliquid WebSocket API.
     *
     * @param endpoint - The API endpoint to send the request to (`explorer` requests are not supported).
     * @param payload - The payload to send with the request.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns A promise that resolves with parsed JSON response body.
     *
     * @throws {WebSocketRequestError} - An error that occurs when a WebSocket request fails.
     */
    request<T>(type: "info" | "exchange", payload: unknown, signal?: AbortSignal): Promise<T>;
    /**
     * Subscribes to a Hyperliquid event channel.
     * Sends a subscription request to the server and listens for events.
     *
     * @param channel - The event channel to listen to.
     * @param payload - A payload to send with the subscription request.
     * @param listener - A function to call when the event is dispatched.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @throws {WebSocketRequestError} - An error that occurs when a WebSocket request fails.
     */
    subscribe<T>(channel: string, payload: unknown, listener: (data: CustomEvent<T>) => void): Promise<Subscription>;
    /**
     * Waits until the WebSocket connection is ready.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the promise can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns A promise that resolves when the connection is ready.
     */
    ready(signal?: AbortSignal): Promise<void>;
    /**
     * Closes the WebSocket connection and waits until it is fully closed.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the promise can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns A promise that resolves when the connection is fully closed.
     */
    close(signal?: AbortSignal): Promise<void>;
    /** Keep the connection alive. Sends ping only when necessary. */
    protected _keepAliveStart(): void;
    protected _keepAliveStop(): void;
    /** Resubscribe to all existing subscriptions if auto-resubscribe is enabled. */
    protected _resubscribeStart(): void;
    protected _resubscribeStop(): void;
    [Symbol.asyncDispose](): Promise<void>;
}
//# sourceMappingURL=websocket_transport.d.ts.map