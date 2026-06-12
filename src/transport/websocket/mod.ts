/**
 * WebSocket transport for {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | subscriptions} and {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests | POST requests}.
 *
 * Use {@link WebSocketTransport} for real-time subscriptions and for lower-latency API requests.
 *
 * @example
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
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 *
 * const transport = new WebSocketTransport();
 * const mids = await transport.request("info", { type: "allMids" });
 * transport.close();
 * ```
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

  /** Creates the transport and immediately starts connecting. */
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
   * @param endpoint The API endpoint to send the request to.
   * @param payload The payload to send with the request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return A promise that resolves with the parsed response payload.
   *
   * @throws {WebSocketRequestError} An error that occurs when a WebSocket request fails.
   *
   * @example
   * ```ts
   * import { WebSocketTransport } from "@nktkas/hyperliquid";
   *
   * const transport = new WebSocketTransport();
   * const mids = await transport.request("info", { type: "allMids" });
   * ```
   */
  async request<T>(endpoint: "info" | "exchange", payload: unknown, signal?: AbortSignal): Promise<T> {
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
   * @param signal Stops waiting for the connection; the connection itself keeps establishing.
   * @return A promise that resolves once the connection is open.
   *
   * @throws {WebSocketRequestError} When the connection is permanently terminated, or when `signal` aborts the waiting.
   *
   * @example
   * ```ts
   * import { WebSocketTransport } from "@nktkas/hyperliquid";
   *
   * const transport = new WebSocketTransport();
   * await transport.ready(AbortSignal.timeout(5_000));
   * ```
   */
  ready(signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const failTerminated = () =>
        reject(
          new WebSocketRequestError("Failed to establish WebSocket connection", {
            cause: this.socket.terminationSignal.reason,
          }),
        );
      const failAborted = () =>
        reject(new WebSocketRequestError("Waiting for the connection was aborted", { cause: signal?.reason }));

      if (signal?.aborted) return failAborted();
      if (this.socket.terminationSignal.aborted) return failTerminated();
      if (this.socket.readyState === ReconnectingWebSocket.OPEN) return resolve();

      const done = new AbortController();
      const settle = (fn: () => void) => () => {
        done.abort();
        fn();
      };

      this.socket.addEventListener("open", settle(resolve), { signal: done.signal });
      this.socket.terminationSignal.addEventListener("abort", settle(failTerminated), { signal: done.signal });
      signal?.addEventListener("abort", settle(failAborted), { signal: done.signal });
    });
  }

  /**
   * Permanently closes the WebSocket connection.
   *
   * @example
   * ```ts
   * import { WebSocketTransport } from "@nktkas/hyperliquid";
   *
   * const transport = new WebSocketTransport();
   * transport.close();
   * ```
   */
  close(): void {
    // socket.close() terminates synchronously on every path: when it returns,
    // the termination signal is already aborted — there is nothing to await.
    //
    // Subscribing to the final "close" event instead would deadlock in one
    // case: when this method runs inside a "close" listener, the socket treats
    // the event being dispatched as its final one and never fires another, so
    // a listener added here would never be invoked.
    this.socket.close();
  }
}
