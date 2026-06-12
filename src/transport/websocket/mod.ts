/**
 * WebSocket transport for {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | subscriptions} and {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests | POST requests}.
 *
 * Use {@link WebSocketTransport} for real-time subscriptions and for lower-latency API requests.
 *
 * @example Subscriptions
 * ```ts
 * import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";
 *
 * const transport = new WebSocketTransport();
 * const client = new SubscriptionClient({ transport });
 *
 * const subscription = await client.allMids((data) => {
 *   console.log(data.mids);
 * });
 *
 * await subscription.unsubscribe();
 * ```
 *
 * @module
 */

import { ReconnectingWebSocket, type ReconnectingWebSocketOptions } from "@nktkas/rews";
import type { IRequestTransport, ISubscription, ISubscriptionTransport } from "../_base.ts";
import { AbortSignal_ } from "../_polyfills.ts";
import { WebSocketDispatcher, WebSocketRequestError } from "./_dispatcher.ts";
import { HyperliquidEventTarget } from "./_events.ts";
import { WebSocketKeepAlive, type WebSocketKeepAliveOptions } from "./_keepAlive.ts";
import { WebSocketSubscriptionManager } from "./_subscriptionManager.ts";

export { WebSocketRequestError };

/** Configuration options for the WebSocket transport layer. */
export interface WebSocketTransportOptions {
  /**
   * Indicates this transport uses testnet endpoint.
   *
   * Default: `false`
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
   *
   * Default: `wss://api.hyperliquid.xyz/ws` for mainnet, `wss://api.hyperliquid-testnet.xyz/ws` for testnet
   */
  url?: string | URL;
  /**
   * Timeout for requests in ms. Set to `null` to disable.
   *
   * Default: `10_000`
   */
  timeout?: number | null;
  /** Reconnection policy configuration for closed connections. */
  reconnect?: ReconnectingWebSocketOptions;
  /** Keep-alive ping/pong watchdog configuration. */
  keepAlive?: WebSocketKeepAliveOptions;
  /**
   * Enable automatic re-subscription to Hyperliquid subscription after reconnection.
   *
   * Default: `true`
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
 * WebSocket transport for the Hyperliquid API.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests
 */
export class WebSocketTransport implements IRequestTransport<"info" | "exchange">, ISubscriptionTransport {
  /** Indicates this transport uses testnet endpoint. */
  readonly isTestnet: boolean;
  /** The WebSocket that is used for communication. */
  readonly socket: ReconnectingWebSocket;
  /** Enable automatic re-subscription to Hyperliquid subscription after reconnection. */
  get resubscribe(): boolean {
    return this._subscriptionManager.resubscribe;
  }
  set resubscribe(value: boolean) {
    this._subscriptionManager.resubscribe = value;
  }
  /** Timeout for requests in ms. Set to `null` to disable. */
  get timeout(): number | null {
    return this._dispatcher.timeout;
  }
  set timeout(value: number | null) {
    this._dispatcher.timeout = value;
  }

  private readonly _hlEvents: HyperliquidEventTarget;
  private readonly _dispatcher: WebSocketDispatcher;
  private readonly _keepAlive: WebSocketKeepAlive; // self-contained
  private readonly _subscriptionManager: WebSocketSubscriptionManager;

  constructor(options?: WebSocketTransportOptions) {
    this.isTestnet = options?.isTestnet ?? false;

    this.socket = new ReconnectingWebSocket(
      options?.url ?? (this.isTestnet ? TESTNET_API_WS_URL : MAINNET_API_WS_URL),
      options?.reconnect,
    );

    this._hlEvents = new HyperliquidEventTarget(this.socket);
    this._dispatcher = new WebSocketDispatcher(
      this.socket,
      this._hlEvents,
      options?.timeout === undefined ? 10_000 : options.timeout,
    );
    this._keepAlive = new WebSocketKeepAlive(this.socket, this._hlEvents, options?.keepAlive);
    this._subscriptionManager = new WebSocketSubscriptionManager(
      this.socket,
      this._dispatcher,
      this._hlEvents,
      options?.resubscribe ?? true,
    );
  }

  /**
   * Sends a request to the Hyperliquid API via WebSocket.
   *
   * The `explorer` endpoint is HTTP-only and not supported by this transport.
   *
   * @throws {WebSocketRequestError} An error that occurs when a WebSocket request fails.
   */
  async request<T>(
    endpoint: "info" | "exchange",
    payload: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    // `explorer` is HTTP-only and not supported on this transport
    if ((endpoint as string) === "explorer") {
      throw new WebSocketRequestError("WebSocket transport does not support the `explorer` endpoint");
    }
    const wrapped = { type: endpoint === "exchange" ? "action" : endpoint, payload };
    return await this._dispatcher.request<T>("post", wrapped, signal);
  }

  /**
   * Subscribes to a Hyperliquid event channel.
   *
   * @param channel The event channel to listen to.
   * @param payload The payload to send with the subscription request.
   * @param listener The function to call when the event is dispatched.
   * @param options Subscription options; see {@linkcode WebSocketSubscriptionManager.subscribe}.
   * @return A promise that resolves with a subscription handle once the server confirms the subscription.
   *
   * @throws {WebSocketRequestError} An error that occurs when the subscription request fails.
   *
   * @example
   * ```ts
   * import { WebSocketTransport } from "@nktkas/hyperliquid";
   *
   * const transport = new WebSocketTransport();
   * const subscription = await transport.subscribe("allMids", { type: "allMids" }, (event) => {
   *   console.log(event.detail);
   * });
   *
   * await subscription.unsubscribe();
   * ```
   */
  subscribe<T>(
    channel: string,
    payload: unknown,
    listener: (data: CustomEvent<T>) => void,
    options?: {
      /** Stops waiting for the confirmation and detaches the listener. */
      signal?: AbortSignal;
      /**
       * Callback invoked at most once, when an already confirmed subscription fails:
       * - the server rejects a re-subscription after a reconnect;
       * - the connection is permanently terminated;
       * - the connection goes down while re-subscription is disabled.
       *
       * Failures before the confirmation reject the `subscribe()` promise instead.
       * After the callback fires, the subscription is removed and no further
       * events or errors follow.
       */
      onError?: (error: WebSocketRequestError) => void;
    },
  ): Promise<ISubscription> {
    return this._subscriptionManager.subscribe(channel, payload, listener, options);
  }

  /**
   * Waits until the WebSocket connection is ready.
   *
   * @throws {WebSocketRequestError} When the connection cannot be established.
   */
  ready(signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      // --- Combine user + termination signals --------------------------------
      const combinedSignal = signal
        ? AbortSignal_.any([this.socket.terminationSignal, signal])
        : this.socket.terminationSignal;

      // --- Fast-paths --------------------------------------------------------
      if (combinedSignal.aborted) {
        return reject(
          new WebSocketRequestError("Failed to establish WebSocket connection", { cause: combinedSignal.reason }),
        );
      }

      if (this.socket.readyState === ReconnectingWebSocket.OPEN) return resolve();

      // --- Wait for "open" or abort ------------------------------------------
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
   * @throws {WebSocketRequestError} When the connection cannot be closed.
   */
  close(signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      // --- Fast-paths --------------------------------------------------------
      if (signal?.aborted) {
        return reject(
          new WebSocketRequestError("Failed to close WebSocket connection", { cause: signal.reason }),
        );
      }

      if (this.socket.readyState === ReconnectingWebSocket.CLOSED) return resolve();

      // --- Wait for "close"/"error" or abort ---------------------------------
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

      // --- Initiate close ----------------------------------------------------
      this.socket.close();
    });
  }
}
