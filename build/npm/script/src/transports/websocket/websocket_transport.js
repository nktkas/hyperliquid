"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketTransport = exports.WebSocketRequestError = exports.preloadWsPackage = exports.requiresWsPackage = exports.getWebSocketEnvironmentInfo = exports.WebSocketCompatibilityError = exports.ReconnectingWebSocketError = void 0;
const base_js_1 = require("../base.js");
const _reconnecting_websocket_js_1 = require("./_reconnecting_websocket.js");
Object.defineProperty(exports, "ReconnectingWebSocketError", { enumerable: true, get: function () { return _reconnecting_websocket_js_1.ReconnectingWebSocketError; } });
const _hyperliquid_event_target_js_1 = require("./_hyperliquid_event_target.js");
const _websocket_async_request_js_1 = require("./_websocket_async_request.js");
const _websocket_factory_js_1 = require("./_websocket_factory.js");
Object.defineProperty(exports, "WebSocketCompatibilityError", { enumerable: true, get: function () { return _websocket_factory_js_1.WebSocketCompatibilityError; } });
Object.defineProperty(exports, "getWebSocketEnvironmentInfo", { enumerable: true, get: function () { return _websocket_factory_js_1.getWebSocketEnvironmentInfo; } });
Object.defineProperty(exports, "requiresWsPackage", { enumerable: true, get: function () { return _websocket_factory_js_1.requiresWsPackage; } });
Object.defineProperty(exports, "preloadWsPackage", { enumerable: true, get: function () { return _websocket_factory_js_1.preloadWsPackage; } });
/** Error thrown when a WebSocket request fails. */
class WebSocketRequestError extends base_js_1.TransportError {
    constructor(message, options) {
        super(message, options);
        this.name = "WebSocketRequestError";
    }
}
exports.WebSocketRequestError = WebSocketRequestError;
/** WebSocket implementation of the REST and Subscription transport interfaces. */
class WebSocketTransport {
    _wsRequester;
    _hlEvents;
    _keepAliveTimeout = null;
    _subscriptions = new Map();
    _isReconnecting = false;
    /**
     * Request timeout in ms.
     * Set to `null` to disable.
     */
    timeout;
    /** Keep-alive configuration. */
    keepAlive;
    /** Enable automatic resubscription after reconnection. */
    autoResubscribe;
    /** The WebSocket that is used for communication. */
    socket;
    /**
     * Creates a new WebSocket transport instance.
     * @param options - Configuration options for the WebSocket transport layer.
     */
    constructor(options) {
        this.socket = new _reconnecting_websocket_js_1.ReconnectingWebSocket(options?.url ?? "wss://api.hyperliquid.xyz/ws", undefined, options?.reconnect);
        this._hlEvents = new _hyperliquid_event_target_js_1.HyperliquidEventTarget(this.socket);
        this._wsRequester = new _websocket_async_request_js_1.WebSocketAsyncRequest(this.socket, this._hlEvents);
        this.timeout = options?.timeout === undefined ? 10_000 : options.timeout;
        this.keepAlive = {
            interval: options?.keepAlive?.interval === undefined ? 30_000 : options.keepAlive?.interval,
            timeout: options?.keepAlive?.timeout === undefined ? this.timeout : options.keepAlive?.timeout,
        };
        this.autoResubscribe = options?.autoResubscribe ?? true;
        // Initialize listeners
        this.socket.addEventListener("open", () => {
            this._keepAliveStart();
            this._resubscribeStart();
        });
        this.socket.addEventListener("close", () => {
            this._keepAliveStop();
            this._resubscribeStop();
            this._isReconnecting = true;
        });
    }
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
    async request(type, payload, signal) {
        try {
            const timeoutSignal = this.timeout ? AbortSignal.timeout(this.timeout) : undefined;
            const combinedSignal = signal && timeoutSignal
                ? AbortSignal.any([signal, timeoutSignal])
                : signal ?? timeoutSignal;
            return await this._wsRequester.request("post", {
                type: type === "exchange" ? "action" : type,
                payload,
            }, combinedSignal);
        }
        catch (error) {
            if (error instanceof WebSocketRequestError)
                throw error; // Re-throw known errors
            throw new WebSocketRequestError(`Unknown error while making a WebSocket request: ${error}`, { cause: error });
        }
    }
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
    async subscribe(channel, payload, listener) {
        try {
            // Create a unique identifier for the subscription
            const id = _websocket_async_request_js_1.WebSocketAsyncRequest.requestToId(payload);
            // Initialize new subscription, if it doesn't exist
            let subscription = this._subscriptions.get(id);
            if (!subscription) {
                // Send subscription request
                const promise = this._wsRequester.request("subscribe", payload);
                // Cache subscription info
                subscription = {
                    listeners: new Map(),
                    promise,
                    resubscribeAbortController: new AbortController(),
                };
                this._subscriptions.set(id, subscription);
            }
            // Initialize new listener, if it doesn't exist
            let unsubscribe = subscription.listeners.get(listener);
            if (!unsubscribe) {
                // Create new unsubscribe function
                unsubscribe = async () => {
                    try {
                        // Remove listener and cleanup
                        this._hlEvents.removeEventListener(channel, listener);
                        const subscription = this._subscriptions.get(id);
                        subscription?.listeners.delete(listener);
                        // If no listeners remain, remove subscription entirely
                        if (subscription?.listeners.size === 0) {
                            // Cleanup subscription
                            this._subscriptions.delete(id);
                            // If the socket is open, send unsubscription request
                            if (this.socket.readyState === _reconnecting_websocket_js_1.ReconnectingWebSocket.OPEN) {
                                await this._wsRequester.request("unsubscribe", payload);
                            }
                        }
                    }
                    catch (error) {
                        if (error instanceof WebSocketRequestError)
                            throw error; // Re-throw known errors
                        throw new WebSocketRequestError(`Unknown error while unsubscribing from a WebSocket channel: ${error}`, { cause: error });
                    }
                };
                // Add listener and cache unsubscribe function
                this._hlEvents.addEventListener(channel, listener);
                subscription.listeners.set(listener, unsubscribe);
            }
            // Wait for the initial subscription request to complete
            await subscription.promise;
            // Return subscription control object
            return {
                unsubscribe,
                resubscribeSignal: subscription.resubscribeAbortController?.signal,
            };
        }
        catch (error) {
            if (error instanceof WebSocketRequestError)
                throw error; // Re-throw known errors
            throw new WebSocketRequestError(`Unknown error while subscribing to a WebSocket channel: ${error}`, { cause: error });
        }
    }
    /**
     * Waits until the WebSocket connection is ready.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the promise can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns A promise that resolves when the connection is ready.
     */
    ready(signal) {
        return new Promise((resolve, reject) => {
            const combinedSignal = signal
                ? AbortSignal.any([this.socket.reconnectAbortController.signal, signal])
                : this.socket.reconnectAbortController.signal;
            if (combinedSignal.aborted)
                return reject(combinedSignal.reason);
            if (this.socket.readyState === _reconnecting_websocket_js_1.ReconnectingWebSocket.OPEN)
                return resolve();
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
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the promise can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns A promise that resolves when the connection is fully closed.
     */
    close(signal) {
        return new Promise((resolve, reject) => {
            if (signal?.aborted)
                return reject(signal.reason);
            if (this.socket.readyState === _reconnecting_websocket_js_1.ReconnectingWebSocket.CLOSED)
                return resolve();
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
    /** Keep the connection alive. Sends ping only when necessary. */
    _keepAliveStart() {
        if (this.keepAlive.interval === null || this._keepAliveTimeout)
            return;
        const tick = async () => {
            if (this.socket.readyState !== _reconnecting_websocket_js_1.ReconnectingWebSocket.OPEN || !this._keepAliveTimeout ||
                this.keepAlive.interval === null)
                return;
            // Check if the last request was sent more than the keep-alive interval ago
            if (Date.now() - this._wsRequester.lastRequestTime >= this.keepAlive.interval) {
                const timeoutSignal = this.keepAlive.timeout ? AbortSignal.timeout(this.keepAlive.timeout) : undefined;
                await this._wsRequester.request("ping", timeoutSignal)
                    .catch(() => undefined); // Ignore errors
            }
            // Schedule the next ping
            if (this.socket.readyState === _reconnecting_websocket_js_1.ReconnectingWebSocket.OPEN && this._keepAliveTimeout &&
                this.keepAlive.interval !== null) {
                const nextDelay = this.keepAlive.interval - (Date.now() - this._wsRequester.lastRequestTime);
                this._keepAliveTimeout = setTimeout(tick, nextDelay);
            }
        };
        this._keepAliveTimeout = setTimeout(tick, this.keepAlive.interval);
    }
    _keepAliveStop() {
        if (this._keepAliveTimeout !== null) {
            clearTimeout(this._keepAliveTimeout);
            this._keepAliveTimeout = null;
        }
    }
    /** Resubscribe to all existing subscriptions if auto-resubscribe is enabled. */
    _resubscribeStart() {
        if (this.autoResubscribe && this._isReconnecting) {
            for (const [id, subscriptionInfo] of this._subscriptions.entries()) {
                subscriptionInfo.promise = this._wsRequester.request("subscribe", JSON.parse(id))
                    .catch((error) => {
                    subscriptionInfo.resubscribeAbortController?.abort(error);
                });
            }
        }
    }
    _resubscribeStop() {
        if (!this.autoResubscribe || this.socket.reconnectAbortController.signal.aborted) {
            for (const subscriptionInfo of this._subscriptions.values()) {
                for (const [_, unsubscribe] of subscriptionInfo.listeners) {
                    unsubscribe(); // does not cause an error if used when the connection is closed
                }
            }
        }
    }
    async [Symbol.asyncDispose]() {
        await this.close();
    }
}
exports.WebSocketTransport = WebSocketTransport;
