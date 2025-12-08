import { TransportError } from "../../_errors.ts";
import { AbortSignal_ } from "../_polyfills.ts";
import { ReconnectingWebSocket, type ReconnectingWebSocketOptions } from "@nktkas/rews";
import { HyperliquidEventTarget } from "./_hyperliquidEventTarget.ts";
import { WebSocketPostRequest, WebSocketRequestError } from "./_postRequest.ts";
import { type WebSocketSubscription, WebSocketSubscriptionManager } from "./_subscriptionManager.ts";

export { WebSocketRequestError };
export type { WebSocketSubscription };

/** Configuration options for the WebSocket transport layer. */
export interface WebSocketTransportOptions {
  /**
   * Indicates this transport uses testnet endpoint.
   * @default false
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
   * @default `wss://api.hyperliquid.xyz/ws` for mainnet, `wss://api.hyperliquid-testnet.xyz/ws` for testnet
   */
  url?: string | URL;

  /**
   * Timeout for requests in ms.
   * Set to `null` to disable.
   * @default 10_000
   */
  timeout?: number | null;

  /** Reconnection policy configuration for closed connections. */
  reconnect?: ReconnectingWebSocketOptions;

  /**
   * Enable automatic re-subscription to Hyperliquid subscription after reconnection.
   * @default true
   */
  resubscribe?: boolean;
}

/** Mainnet API WebSocket URL. */
export const MAINNET_API_WS_URL = "wss://api.hyperliquid.xyz/ws";
/** Testnet API WebSocket URL. */
export const TESTNET_API_WS_URL = "wss://api.hyperliquid-testnet.xyz/ws";
/** Mainnet RPC WebSocket URL. */
export const MAINNET_RPC_WS_URL = "wss://rpc.hyperliquid.xyz/ws";
/** Testnet RPC WebSocket URL. */
export const TESTNET_RPC_WS_URL = "wss://rpc.hyperliquid-testnet.xyz/ws";

/**
 * WebSocket transport for Hyperliquid API.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests
 */
export class WebSocketTransport implements WebSocketTransportOptions {
  readonly isTestnet: boolean;
  timeout: number | null;
  /** The WebSocket that is used for communication. */
  readonly socket: ReconnectingWebSocket;

  get resubscribe(): boolean {
    return this._subscriptionManager.resubscribe;
  }
  set resubscribe(value: boolean) {
    this._subscriptionManager.resubscribe = value;
  }

  protected _wsRequester: WebSocketPostRequest;
  protected _hlEvents: HyperliquidEventTarget;
  protected _subscriptionManager: WebSocketSubscriptionManager;
  protected _keepAliveInterval: ReturnType<typeof setInterval> | undefined;

  /**
   * Creates a new WebSocket transport instance.
   *
   * @param options - Configuration options for the WebSocket transport layer.
   */
  constructor(options?: WebSocketTransportOptions) {
    this.isTestnet = options?.isTestnet ?? false;
    this.timeout = options?.timeout === undefined ? 10_000 : options.timeout;

    this.socket = new ReconnectingWebSocket(
      options?.url ?? (this.isTestnet ? TESTNET_API_WS_URL : MAINNET_API_WS_URL),
      options?.reconnect,
    );

    this._hlEvents = new HyperliquidEventTarget(this.socket);
    this._wsRequester = new WebSocketPostRequest(this.socket, this._hlEvents);
    this._subscriptionManager = new WebSocketSubscriptionManager(
      this.socket,
      this._wsRequester,
      this._hlEvents,
      options?.resubscribe ?? true,
    );

    this._initKeepAlive();
  }

  protected _initKeepAlive(): void {
    const start = () => {
      if (this._keepAliveInterval) return;
      this._keepAliveInterval = setInterval(() => {
        this.socket.send('{"method":"ping"}');
      }, 30_000);
    };
    const stop = () => {
      clearInterval(this._keepAliveInterval);
      this._keepAliveInterval = undefined;
    };

    this.socket.addEventListener("open", start);
    this.socket.addEventListener("close", stop);
    this.socket.addEventListener("error", stop);
  }

  /**
   * Sends a request to the Hyperliquid API via WebSocket.
   *
   * @param endpoint - The API endpoint to send the request to.
   * @param payload - The payload to send with the request.
   * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
   *
   * @returns A promise that resolves with parsed JSON response body.
   *
   * @throws {WebSocketRequestError} - An error that occurs when a WebSocket request fails.
   */
  async request<T>(endpoint: "info" | "exchange", payload: unknown, signal?: AbortSignal): Promise<T> {
    const timeoutSignal = this.timeout ? AbortSignal_.timeout(this.timeout) : undefined;
    const combinedSignal = signal && timeoutSignal
      ? AbortSignal_.any([signal, timeoutSignal])
      : signal ?? timeoutSignal;

    const payload_ = { type: endpoint === "exchange" ? "action" : endpoint, payload };

    return await this._wsRequester.request<T>("post", payload_, combinedSignal)
      .catch((error) => {
        if (error instanceof TransportError) throw error; // Re-throw known errors
        throw new WebSocketRequestError(
          `Unknown error while making a WebSocket request: ${error}`,
          { cause: error },
        );
      });
  }

  /**
   * Subscribes to a Hyperliquid event channel.
   * Sends a subscription request to the server and listens for events.
   *
   * @param channel - The event channel to listen to.
   * @param payload - A payload to send with the subscription request.
   * @param listener - A function to call when the event is dispatched.
   *
   * @returns A promise that resolves with a {@link WebSocketSubscription} object to manage the subscription lifecycle.
   *
   * @throws {WebSocketRequestError} - An error that occurs when a WebSocket request fails.
   */
  subscribe<T>(
    channel: string,
    payload: unknown,
    listener: (data: CustomEvent<T>) => void,
  ): Promise<WebSocketSubscription> {
    return this._subscriptionManager.subscribe(channel, payload, listener);
  }

  /**
   * Waits until the WebSocket connection is ready.
   *
   * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the promise.
   *
   * @returns A promise that resolves when the connection is ready.
   *
   * @throws {WebSocketRequestError} When the connection cannot be established.
   */
  ready(signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const combinedSignal = signal
        ? AbortSignal_.any([this.socket.terminationSignal, signal])
        : this.socket.terminationSignal;

      if (combinedSignal.aborted) {
        return reject(
          new WebSocketRequestError("Failed to establish WebSocket connection", { cause: combinedSignal.reason }),
        );
      }

      if (this.socket.readyState === ReconnectingWebSocket.OPEN) return resolve();

      const handleOpen = () => {
        combinedSignal.removeEventListener("abort", handleAbort);
        resolve();
      };
      const handleAbort = () => {
        this.socket.removeEventListener("open", handleOpen);
        return reject(
          new WebSocketRequestError("Failed to establish WebSocket connection", { cause: combinedSignal.reason }),
        );
      };

      this.socket.addEventListener("open", handleOpen, { once: true });
      combinedSignal.addEventListener("abort", handleAbort, { once: true });
    });
  }

  /**
   * Closes the WebSocket connection and waits until it is fully closed.
   *
   * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the promise.
   *
   * @returns A promise that resolves when the connection is fully closed.
   *
   * @throws {WebSocketRequestError} When the connection cannot be closed.
   */
  close(signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        return reject(
          new WebSocketRequestError("Failed to close WebSocket connection", { cause: signal.reason }),
        );
      }

      if (this.socket.readyState === ReconnectingWebSocket.CLOSED) return resolve();

      const handleClose = () => {
        signal?.removeEventListener("abort", handleAbort);
        resolve();
      };
      const handleAbort = () => {
        return reject(
          new WebSocketRequestError("Failed to close WebSocket connection", { cause: signal?.reason }),
        );
      };

      this.socket.addEventListener("close", handleClose, { once: true, signal });
      this.socket.addEventListener("error", handleClose, { once: true, signal });
      signal?.addEventListener("abort", handleAbort, { once: true });

      this.socket.close();
    });
  }
}
