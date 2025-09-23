import { type IRequestTransport, type ISubscriptionTransport, type Subscription, TransportError } from "../base.ts";
import { AbortSignal_ } from "../_polyfills.ts";
import {
  ReconnectingWebSocket,
  ReconnectingWebSocketError,
  type ReconnectingWebSocketOptions,
} from "./_reconnecting_websocket.ts";
import { HyperliquidEventTarget } from "./_hyperliquid_event_target.ts";
import { WebSocketAsyncRequest, WebSocketRequestError } from "./_websocket_async_request.ts";

export { ReconnectingWebSocketError, WebSocketRequestError };

type MaybePromise<T> = T | Promise<T>;

/** Configuration options for the WebSocket transport layer. */
export interface WebSocketTransportOptions {
  /**
   * Indicates this transport uses testnet endpoint.
   * @defaultValue `false`
   */
  isTestnet?: boolean;
  /**
   * Custom WebSocket endpoint for API and Subscription requests.
   * - Mainnet:
   *   - API: `wss://api.hyperliquid.xyz/ws`
   *   - Explorer: `wss://rpc.hyperliquid.xyz/ws`
   * - Testnet:
   *   - API: `wss://api.hyperliquid-testnet.xyz/ws`
   *   - Explorer: `wss://rpc.hyperliquid-testnet.xyz/ws`
   * @defaultValue `wss://api.hyperliquid.xyz/ws` for mainnet, `wss://api.hyperliquid-testnet.xyz/ws` for testnet
   */
  url?: string | URL;
  /**
   * Timeout for requests in ms.
   * Set to `null` to disable.
   * @defaultValue `10_000`
   */
  timeout?: number | null;
  /**
   * Interval between sending ping messages in ms.
   * Set to `null` to disable.
   * @defaultValue `30_000`
   */
  keepAliveInterval?: number | null;
  /** Reconnection policy configuration for closed connections. */
  reconnect?: ReconnectingWebSocketOptions;
  /**
   * Enable automatic re-subscription to Hyperliquid subscription after reconnection.
   * @defaultValue `true`
   */
  resubscribe?: boolean;
  onRequest?: (type: string, payload: unknown) => MaybePromise<unknown | void | null | undefined>;
  onResponse?: (response: unknown) => MaybePromise<unknown | void | null | undefined>;
  onError?: (error: unknown) => MaybePromise<Error | void | null | undefined>;
}

/** WebSocket implementation of the REST and Subscription transport interfaces. */
export class WebSocketTransport implements IRequestTransport, ISubscriptionTransport {
  protected _wsRequester: WebSocketAsyncRequest;
  protected _hlEvents: HyperliquidEventTarget;
  protected _keepAliveTimeout: ReturnType<typeof setTimeout> | undefined;
  protected _subscriptions: Map<
    string, // Unique identifier based on the payload
    {
      listeners: Map<
        (data: CustomEvent) => void, // Event listener function
        () => Promise<void> // Unsubscribe function
      >;
      promise: Promise<unknown>; // Subscription request promise
      promiseFinished: boolean;
      resubscribeAbortController: AbortController; // To monitor reconnection errors
    }
  > = new Map();

  /** Indicates this transport uses testnet endpoint. */
  readonly isTestnet: boolean;
  /**
   * Timeout for requests in ms.
   * Set to `null` to disable.
   */
  timeout: number | null;
  /**
   * Interval between sending ping messages in ms.
   * Set to `null` to disable.
   */
  keepAliveInterval: number | null;
  /** Enable automatic re-subscription to Hyperliquid subscription after reconnection. */
  resubscribe: boolean;

  /** The WebSocket that is used for communication. */
  readonly socket: ReconnectingWebSocket;

  /**
   * Creates a new WebSocket transport instance.
   * @param options - Configuration options for the WebSocket transport layer.
   */
  constructor(options?: WebSocketTransportOptions) {
    this.isTestnet = options?.isTestnet ?? false;
    this.timeout = options?.timeout === undefined ? 10_000 : options.timeout;
    this.keepAliveInterval = options?.keepAliveInterval ?? 30_000;
    this.resubscribe = options?.resubscribe ?? true;

    this.socket = new ReconnectingWebSocket(
      options?.url ?? (this.isTestnet ? "wss://api.hyperliquid-testnet.xyz/ws" : "wss://api.hyperliquid.xyz/ws"),
      options?.reconnect,
    );

    this._hlEvents = new HyperliquidEventTarget(this.socket);
    this._wsRequester = new WebSocketAsyncRequest(this.socket, this._hlEvents);

    // Initialize listeners
    this.socket.addEventListener("open", () => {
      this._keepAliveRun();
      this._resubscribeRun();
    });
    const handleClose = () => {
      this._keepAliveStop();
      this._resubscribeStop();
    };
    this.socket.addEventListener("close", handleClose);
    this.socket.addEventListener("error", handleClose);
  }

  /**
   * Keep the connection alive.
   * Sends ping only when no other requests were sent within the keep-alive interval.
   */
  protected _keepAliveRun(): void {
    if (this.keepAliveInterval === null || this._keepAliveTimeout) return;

    const tick = async () => {
      if (
        this.socket.readyState !== ReconnectingWebSocket.OPEN || !this._keepAliveTimeout ||
        this.keepAliveInterval === null
      ) return;

      // Check if the last request was sent more than the keep-alive interval ago
      if (Date.now() - this._wsRequester.lastRequestTime >= this.keepAliveInterval) {
        const timeoutSignal = this.timeout ? AbortSignal_.timeout(this.keepAliveInterval) : undefined;
        await this._wsRequester.request("ping", timeoutSignal)
          .catch(() => undefined); // Ignore errors
      }

      // Schedule the next ping
      if (
        this.socket.readyState === ReconnectingWebSocket.OPEN && this._keepAliveTimeout &&
        this.keepAliveInterval !== null
      ) {
        const nextDelay = this.keepAliveInterval - (Date.now() - this._wsRequester.lastRequestTime);
        this._keepAliveTimeout = setTimeout(tick, nextDelay);
      }
    };

    this._keepAliveTimeout = setTimeout(tick, this.keepAliveInterval);
  }
  protected _keepAliveStop(): void {
    clearTimeout(this._keepAliveTimeout);
    this._keepAliveTimeout = undefined;
  }

  /** Resubscribe to all existing subscriptions if auto-resubscribe is enabled. */
  protected _resubscribeRun(): void {
    if (this.resubscribe) {
      for (const [id, subscription] of this._subscriptions.entries()) {
        if (subscription.promiseFinished) { // reconnect only previously connected subscriptions to avoid double subscriptions due to message buffering.
          subscription.promise = this._wsRequester.request("subscribe", JSON.parse(id))
            .catch((error) => subscription.resubscribeAbortController.abort(error))
            .finally(() => subscription.promiseFinished = true);
          subscription.promiseFinished = false;
        }
      }
    }
  }
  protected _resubscribeStop(): void {
    if (!this.resubscribe || this.socket.terminateSignal.aborted) {
      for (const subscriptionInfo of this._subscriptions.values()) {
        for (const [_, unsubscribe] of subscriptionInfo.listeners) {
          unsubscribe(); // does not cause an error if used when the connection is closed
        }
      }
    }
  }

  /**
   * Sends a request to the Hyperliquid API via WebSocket.
   * @param endpoint - The API endpoint to send the request to.
   * @param payload - The payload to send with the request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns A promise that resolves with parsed JSON response body.
   * @throws {WebSocketRequestError} - An error that occurs when a WebSocket request fails.
   */
  async request<T>(type: "info" | "exchange", payload: unknown, signal?: AbortSignal): Promise<T> {
    try {
      const timeoutSignal = this.timeout ? AbortSignal_.timeout(this.timeout) : undefined;
      const combinedSignal = signal && timeoutSignal
        ? AbortSignal_.any([signal, timeoutSignal])
        : signal ?? timeoutSignal;

      return await this._wsRequester.request(
        "post",
        { type: type === "exchange" ? "action" : type, payload },
        combinedSignal,
      );
    } catch (error) {
      if (error instanceof TransportError) throw error; // Re-throw known errors
      throw new WebSocketRequestError(
        `Unknown error while making a WebSocket request: ${error}`,
        { cause: error },
      );
    }
  }

  /**
   * Subscribes to a Hyperliquid event channel.
   * Sends a subscription request to the server and listens for events.
   * @param channel - The event channel to listen to.
   * @param payload - A payload to send with the subscription request.
   * @param listener - A function to call when the event is dispatched.
   * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   * @throws {WebSocketRequestError} - An error that occurs when a WebSocket request fails.
   */
  async subscribe<T>(
    channel: string,
    payload: unknown,
    listener: (data: CustomEvent<T>) => void,
  ): Promise<Subscription> {
    try {
      // Create a unique identifier for the subscription
      const id = WebSocketAsyncRequest.requestToId(payload);

      // Initialize new subscription, if it doesn't exist
      let subscription = this._subscriptions.get(id);
      if (!subscription) {
        // Send subscription request
        const promise = this._wsRequester.request("subscribe", payload)
          .finally(() => subscription!.promiseFinished = true);

        // Cache subscription info
        subscription = {
          listeners: new Map(),
          promise,
          promiseFinished: false,
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
              if (this.socket.readyState === ReconnectingWebSocket.OPEN) {
                await this._wsRequester.request("unsubscribe", payload);
              }
            }
          } catch (error) {
            if (error instanceof TransportError) throw error; // Re-throw known errors
            throw new WebSocketRequestError(
              `Unknown error while unsubscribing from a WebSocket channel: ${error}`,
              { cause: error },
            );
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
        resubscribeSignal: subscription.resubscribeAbortController.signal,
      };
    } catch (error) {
      if (error instanceof TransportError) throw error; // Re-throw known errors
      throw new WebSocketRequestError(
        `Unknown error while subscribing to a WebSocket channel: ${error}`,
        { cause: error },
      );
    }
  }

  /**
   * Waits until the WebSocket connection is ready.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the promise by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns A promise that resolves when the connection is ready.
   */
  ready(signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const combinedSignal = signal
        ? AbortSignal_.any([this.socket.terminateSignal, signal])
        : this.socket.terminateSignal;

      if (combinedSignal.aborted) return reject(combinedSignal.reason);
      if (this.socket.readyState === ReconnectingWebSocket.OPEN) return resolve();

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
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the promise by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns A promise that resolves when the connection is fully closed.
   */
  close(signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(signal.reason);
      if (this.socket.readyState === ReconnectingWebSocket.CLOSED) return resolve();

      const handleClose = () => {
        signal?.removeEventListener("abort", handleAbort);
        resolve();
      };
      const handleAbort = () => {
        reject(signal?.reason);
      };

      this.socket.addEventListener("close", handleClose, { once: true, signal });
      this.socket.addEventListener("error", handleClose, { once: true, signal });
      signal?.addEventListener("abort", handleAbort, { once: true });

      this.socket.close();
    });
  }
}
