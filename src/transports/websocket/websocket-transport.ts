import { ReconnectingWebSocket, type ReconnectingWebSocketOptions } from "./reconnecting-websocket.ts";
import { HyperliquidEventTarget } from "./hyperliquid-event-target.ts";
import { WebSocketRequestDispatcher } from "./websocket-request-dispatcher.ts";
import type { IRequestTransport, ISubscriptionTransport, Subscription } from "../base.ts";

/**
 * Configuration options for the WebSocket transport layer.
 */
export interface WebSocketTransportOptions {
    /**
     * The WebSocket URL.
     * - Mainnet: `wss://api.hyperliquid.xyz/ws`
     * - Testnet: `wss://api.hyperliquid-testnet.xyz/ws`
     * @defaultValue `wss://api.hyperliquid.xyz/ws`
     */
    url?: string | URL;

    /**
     * Request timeout in ms.
     * Set to `null` to disable.
     * @defaultValue `10_000`
     */
    timeout?: number | null;

    /**
     * Keep-alive configuration.
     * @defaultValue `{ interval: 20_000 }`
     */
    keepAlive?: {
        /**
         * The interval in ms to send keep-alive messages.
         * Set to `null` to disable.
         * @defaultValue `20_000`
         */
        interval?: number | null;
    };

    /**
     * Reconnection policy configuration for closed connections.
     */
    reconnect?: ReconnectingWebSocketOptions;
}

/**
 * WebSocket implementation of the REST and Subscription transport interfaces.
 */
export class WebSocketTransport implements IRequestTransport, ISubscriptionTransport {
    /** The interval timer ID for keep-alive messages. */
    protected _keepAliveTimer: number | undefined;

    /** The WebSocket request dispatcher instance. */
    protected _wsRequester: WebSocketRequestDispatcher;

    /** The Hyperliquid event target instance. */
    protected _hlEvents: HyperliquidEventTarget;

    /**
     * Map of active subscriptions.
     * - Key: Unique subscription identifier (stringified payload)
     * - Value: Subscription info containing payload and listener mappings
     */
    protected _subscriptions: Map<
        string,
        {
            channel: string;
            listeners: Map<(data: CustomEvent) => void, () => Promise<void>>;
            requestPromise: Promise<unknown>;
        }
    > = new Map<
        string,
        {
            /** The event channel that being listened to. */
            channel: string;
            /** Map of listeners and their corresponding unsubscribe functions. */
            listeners: Map<(data: CustomEvent) => void, () => Promise<void>>;
            /** The initial subscription request promise. */
            requestPromise: Promise<unknown>;
        }
    >();

    /**
     * Request timeout in ms.
     * Set to `null` to disable.
     */
    timeout: number | null;

    /** Keep-alive configuration settings. */
    readonly keepAlive: {
        /**
         * The interval in ms to send keep-alive messages.
         * Set to `null` to disable.
         */
        readonly interval: number | null;
    };

    /** The WebSocket that is used for communication. */
    readonly socket: ReconnectingWebSocket;

    /**
     * Creates a new WebSocket transport instance.
     * @param options - Configuration options for the WebSocket transport layer.
     */
    constructor(options?: WebSocketTransportOptions) {
        this.socket = new ReconnectingWebSocket(
            options?.url ?? "wss://api.hyperliquid.xyz/ws",
            undefined,
            options?.reconnect,
        );
        this._hlEvents = new HyperliquidEventTarget(this.socket);
        this._wsRequester = new WebSocketRequestDispatcher(this.socket, this._hlEvents);

        this.timeout = options?.timeout === undefined ? 10_000 : options.timeout;
        this.keepAlive = {
            interval: options?.keepAlive?.interval === undefined ? 20_000 : options.keepAlive.interval,
        };

        // Initialize listeners
        this.socket.addEventListener("open", () => {
            // Start keep-alive timer
            if (this.keepAlive.interval && !this._keepAliveTimer) {
                this._keepAliveTimer = setInterval(() => {
                    this.socket.send(JSON.stringify({ method: "ping" }));
                }, this.keepAlive.interval);
            }
        });
        this.socket.addEventListener("close", () => {
            // Clear keep-alive timer
            if (this._keepAliveTimer) {
                clearInterval(this._keepAliveTimer);
                this._keepAliveTimer = undefined;
            }

            // Clear all subscriptions
            for (const [_, { channel, listeners }] of this._subscriptions.entries()) {
                for (const [listener] of listeners) {
                    this._hlEvents.removeEventListener(channel, listener);
                }
            }
            this._subscriptions.clear();
        });
    }

    /**
     * Sends a request to the Hyperliquid API via WebSocket.
     * @param endpoint - The API endpoint to send the request to.
     * @param payload - The payload to send with the request.
     * @param signal - An optional abort signal.
     * @returns A promise that resolves with parsed JSON response body.
     * @throws {WebSocketRequestError} - An error that occurs when a WebSocket request fails.
     * @note Explorer requests are not supported in the Hyperliquid WebSocket API.
     */
    request(type: "info" | "action" | "explorer", payload: unknown, signal?: AbortSignal): Promise<unknown> {
        // Reject explorer requests because they are not supported by the Hyperliquid WebSocket API
        if (type === "explorer") {
            throw new Error("Explorer requests are not supported in the Hyperliquid WebSocket API.");
        }

        // Send the request and wait for a response
        return this._wsRequester.request("post", { type, payload }, this.combineSignals(signal));
    }

    /**
     * Subscribes to a Hyperliquid event channel.
     * @param channel - The event channel to listen to.
     * @param payload - A payload to send with the subscription request.
     * @param listener - A function to call when the event is dispatched.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     */
    async subscribe(
        channel: string,
        payload: unknown,
        listener: (data: CustomEvent) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        // Create a unique identifier for the subscription
        const id = `${channel}::${WebSocketRequestDispatcher.requestToId(payload)}`;

        // Initialize new subscription, if it doesn't exist
        let subscriptionInfo = this._subscriptions.get(id);
        if (!subscriptionInfo) {
            // Send subscription request
            const requestPromise = this._wsRequester.request("subscribe", payload, this.combineSignals(signal))
                .catch((error) => {
                    this._subscriptions.delete(id);
                    throw error;
                });

            // Cache subscription info
            subscriptionInfo = { channel, listeners: new Map(), requestPromise };
            this._subscriptions.set(id, subscriptionInfo);
        }

        // Check if we already have an unsubscribe function for this listener
        let unsubscribe = subscriptionInfo.listeners.get(listener);
        if (!unsubscribe) {
            // Create new unsubscribe function if none exists
            unsubscribe = async (signal?: AbortSignal) => {
                // Remove listener and cleanup
                this._hlEvents.removeEventListener(channel, listener);
                const isDeleted = subscriptionInfo.listeners.delete(listener);

                // If no listeners remain, remove subscription entirely
                // `isDeleted` means that the map had a listener before and became 0 after that
                if (subscriptionInfo.listeners.size === 0 && isDeleted) {
                    this._subscriptions.delete(id);
                    await this._wsRequester.request("unsubscribe", payload, this.combineSignals(signal));
                }
            };

            // Add event listener & Cache unsubscribe function
            this._hlEvents.addEventListener(channel, listener);
            subscriptionInfo.listeners.set(listener, unsubscribe);
        }

        // Wait for the initial subscription request to complete
        await subscriptionInfo.requestPromise.catch((error) => {
            // Cleanup the subscription and rethrow the error
            this._hlEvents.removeEventListener(channel, listener);
            subscriptionInfo.listeners.delete(listener);
            throw error;
        });

        // Return subscription control object
        return { unsubscribe };
    }

    /**
     * Waits until the WebSocket connection is ready.
     * @param signal - An optional abort signal.
     * @returns A promise that resolves when the connection is ready.
     */
    ready(signal?: AbortSignal): Promise<void> {
        return new Promise((resolve, reject) => {
            const combinedSignal = signal
                ? AbortSignal.any([this.socket.terminationSignal, signal])
                : this.socket.terminationSignal;

            if (combinedSignal.aborted) return reject(combinedSignal.reason);
            if (this.socket.readyState === WebSocket.OPEN) return resolve();

            const handleOpen = () => {
                combinedSignal.removeEventListener("abort", handleAbort);
                resolve();
            };
            const handleAbort = () => {
                this.socket.removeEventListener("open", handleOpen);
                reject(combinedSignal.reason);
            };

            this.socket.addEventListener("open", handleOpen, { once: true });
            combinedSignal.addEventListener("abort", handleAbort, { once: true });
        });
    }

    /**
     * Closes the WebSocket connection and waits until it is fully closed.
     * @param signal - An optional abort signal.
     * @returns A promise that resolves when the connection is fully closed.
     */
    close(signal?: AbortSignal): Promise<void> {
        return new Promise((resolve, reject) => {
            if (signal?.aborted) return reject(signal.reason);
            if (this.socket.readyState === WebSocket.CLOSED) return resolve();

            const handleClose = () => {
                signal?.removeEventListener("abort", handleAbort);
                resolve();
            };
            const handleAbort = () => {
                this.socket.removeEventListener("close", handleClose);
                reject(signal?.reason);
            };

            this.socket.addEventListener("close", handleClose, { once: true });
            signal?.addEventListener("abort", handleAbort, { once: true });

            this.socket.close();
        });
    }

    /**
     * Combines timeout and user-provided signal.
     * @param signal - A user-provided signal.
     * @returns An AbortSignal that triggers when either the timeout or user-provided signal aborts.
     */
    protected combineSignals(signal?: AbortSignal): AbortSignal {
        const signals: AbortSignal[] = [];
        if (this.timeout) signals.push(AbortSignal.timeout(this.timeout));
        if (signal) signals.push(signal);
        return signals.length > 1 ? AbortSignal.any(signals) : signals[0];
    }
}
