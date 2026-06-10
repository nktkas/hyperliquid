import { HyperliquidError } from "../_base.ts";

/**
 * Transport interface for executing requests to the Hyperliquid API.
 *
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint | Info endpoint}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint | Exchange endpoint}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests | WebSocket POST requests}
 */
export interface IRequestTransport<E extends "info" | "exchange" | "explorer" = "info" | "exchange"> {
  /** Indicates this transport uses testnet endpoint(s). */
  readonly isTestnet: boolean;
  /**
   * Sends a request to the Hyperliquid API.
   *
   * @param endpoint The API endpoint to send the request to.
   * @param payload The payload to send with the request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return A promise that resolves with the parsed JSON response body.
   */
  request<T>(endpoint: E, payload: unknown, signal?: AbortSignal): Promise<T>;
}

/**
 * Transport interface for WebSocket subscriptions (real-time updates).
 *
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | WebSocket subscriptions}
 */
export interface ISubscriptionTransport {
  /**
   * Subscribes to a Hyperliquid event channel.
   *
   * @param channel The event channel to listen to.
   * @param payload The payload to send with the subscription request.
   * @param listener The function to call when the event is dispatched.
   * @param onError Optional callback invoked synchronously at most once, when the subscription fails — either a re-subscription after a reconnect is rejected, or the connection is permanently lost.
   *                After it fires, the subscription is removed and no further events or errors follow; create a new subscription to continue.
   * @return A promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   */
  subscribe<T>(
    channel: string,
    payload: unknown,
    listener: (data: CustomEvent<T>) => void,
    onError?: (error: TransportError) => void,
  ): Promise<ISubscription>;
}

/** Subscription handle. */
export interface ISubscription {
  /** Removes the event listener and unsubscribes from the event channel. */
  unsubscribe(): Promise<void>;
}

/** Thrown when an error occurs at the transport level (e.g., timeout). */
export class TransportError extends HyperliquidError {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TransportError";
  }
}
