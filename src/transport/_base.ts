import { HyperliquidError } from "../_base.ts";

/**
 * Interface representing a REST transport.
 * Handles communication with Hyperliquid API endpoints.
 *
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint | Info endpoint}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint | Exchange endpoint}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests | Websocket post requests}
 */
export interface IRequestTransport {
  /** Indicates this transport uses testnet endpoint(s). */
  isTestnet: boolean;
  /**
   * Sends a request to the Hyperliquid API.
   *
   * @param endpoint - The API endpoint to send the request to.
   * @param payload - The payload to send with the request.
   * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   *
   * @returns A promise that resolves with parsed JSON response body.
   */
  request<T>(endpoint: "info" | "exchange" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T>;
}

/**
 * Interface representing an event subscription transport.
 * Handles WebSocket subscriptions for real-time updates.
 *
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Websocket subscriptions}
 */
export interface ISubscriptionTransport {
  /**
   * Subscribes to a Hyperliquid event channel.
   *
   * @param channel - The event channel to listen to.
   * @param payload - The payload to send with the subscription request.
   * @param listener - The function to call when the event is dispatched.
   *
   * @returns A promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   */
  subscribe<T>(channel: string, payload: unknown, listener: (data: CustomEvent<T>) => void): Promise<ISubscription>;
}

/** WebSocket subscription with failure signal. */
export interface ISubscription {
  /** Removes the event listener and unsubscribes from the event channel. */
  unsubscribe(): Promise<void>;
  /** {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} that is aborted if the subscription fails to restore after reconnection. */
  failureSignal: AbortSignal;
}

/** Thrown when an error occurs at the transport level (e.g., timeout). */
export class TransportError extends HyperliquidError {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TransportError";
  }
}
