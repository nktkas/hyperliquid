import type { ReconnectingWebSocket } from "@nktkas/rews";
import type { HyperliquidEventTarget } from "./_hyperliquidEventTarget.ts";
import { WebSocketPostRequest, WebSocketRequestError } from "./_postRequest.ts";

/** Maximum number of subscriptions allowed by Hyperliquid. */
const MAX_SUBSCRIPTIONS = 1000;

/** Maximum number of unique user subscriptions allowed by Hyperliquid. */
const MAX_UNIQUE_USER_SUBSCRIPTIONS = 10;

/** WebSocket subscription with failure signal. */
export interface WebSocketSubscription {
  /** Removes the event listener and unsubscribes from the event channel. */
  unsubscribe(): Promise<void>;

  /** {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} that is aborted if the subscription fails to restore after reconnection. */
  failureSignal: AbortSignal;
}

/** Internal state for managing a subscription. */
interface SubscriptionState {
  /** Map of event listeners to their unsubscribe functions. */
  listeners: Map<(data: CustomEvent) => void, () => Promise<void>>;
  /** Promise tracking the subscription request. */
  promise: Promise<unknown>;
  /** Whether the subscription request has completed. */
  promiseFinished: boolean;
  /** Controller to signal subscription failure. */
  failureController: AbortController;
}

/**
 * Manages WebSocket subscriptions to Hyperliquid event channels.
 * Handles subscription lifecycle, resubscription on reconnect, and cleanup.
 */
export class WebSocketSubscriptionManager {
  /** Enable automatic re-subscription to Hyperliquid subscription after reconnection. */
  resubscribe: boolean;

  protected _socket: ReconnectingWebSocket;
  protected _postRequest: WebSocketPostRequest;
  protected _hlEvents: HyperliquidEventTarget;
  protected _subscriptions: Map<string, SubscriptionState> = new Map();

  constructor(
    socket: ReconnectingWebSocket,
    postRequest: WebSocketPostRequest,
    hlEvents: HyperliquidEventTarget,
    resubscribe: boolean,
  ) {
    this._socket = socket;
    this._postRequest = postRequest;
    this._hlEvents = hlEvents;
    this.resubscribe = resubscribe;

    // Subscribe to socket events
    socket.addEventListener("open", () => this._handleOpen());
    socket.addEventListener("close", () => this._handleClose());
    socket.addEventListener("error", () => this._handleClose());
  }

  // ============================================================
  // Public methods
  // ============================================================

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
  async subscribe<T>(
    channel: string,
    payload: unknown,
    listener: (data: CustomEvent<T>) => void,
  ): Promise<WebSocketSubscription> {
    // Create a unique identifier for the subscription
    const id = WebSocketPostRequest.requestToId(payload);

    // Initialize new subscription, if it doesn't exist
    let subscription = this._subscriptions.get(id);
    if (!subscription) {
      // Check unique subscription limits
      if (this._subscriptions.size >= MAX_SUBSCRIPTIONS) {
        throw new WebSocketRequestError("Cannot subscribe to more than 1000 channels");
      }
      // Check unique user subscription limits
      if (this._hasUserParam(payload) && this._countUniqueUserSubscriptions() >= MAX_UNIQUE_USER_SUBSCRIPTIONS) {
        throw new WebSocketRequestError("Cannot track more than 10 unique users");
      }

      // Send subscription request
      const promise = this._postRequest.request("subscribe", payload)
        .finally(() => subscription!.promiseFinished = true);

      // Cache subscription info
      subscription = {
        listeners: new Map(),
        promise,
        promiseFinished: false,
        failureController: new AbortController(),
      };
      this._subscriptions.set(id, subscription);
    }

    // Initialize new listener, if it doesn't exist
    let unsubscribe = subscription.listeners.get(listener);
    if (!unsubscribe) {
      // Create new unsubscribe function
      unsubscribe = async () => {
        // Remove listener and cleanup
        this._hlEvents.removeEventListener(channel, listener);
        const subscription = this._subscriptions.get(id);
        subscription?.listeners.delete(listener);

        // If no listeners remain, remove subscription entirely
        if (subscription?.listeners.size === 0) {
          // Cleanup subscription
          this._subscriptions.delete(id);

          // If the socket is open, send unsubscription request
          if (this._socket.readyState === 1) { // OPEN
            await this._postRequest.request("unsubscribe", payload);
          }
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
      failureSignal: subscription.failureController.signal,
    };
  }

  // ============================================================
  // Socket event handlers
  // ============================================================

  /** Resubscribe to all existing subscriptions if auto-resubscribe is enabled. */
  protected _handleOpen(): void {
    if (this.resubscribe) {
      for (const [id, subscription] of this._subscriptions.entries()) {
        // reconnect only previously connected subscriptions to avoid double subscriptions due to message buffering
        if (subscription.promiseFinished) {
          subscription.promise = this._postRequest.request("subscribe", JSON.parse(id))
            .catch((error) => subscription.failureController.abort(error))
            .finally(() => subscription.promiseFinished = true);
          subscription.promiseFinished = false;
        }
      }
    }
  }

  /** Cleanup subscriptions if resubscribe is disabled or socket is terminated. */
  protected _handleClose(): void {
    if (!this.resubscribe || this._socket.terminationSignal.aborted) {
      for (const subscriptionInfo of this._subscriptions.values()) {
        for (const [_, unsubscribe] of subscriptionInfo.listeners) {
          unsubscribe(); // does not cause an error if used when the connection is closed
        }
      }
    }
  }

  // ============================================================
  // Subscription limit checks
  // ============================================================

  /** Checks if a payload contains a user parameter. */
  protected _hasUserParam(payload: unknown): boolean {
    return typeof payload === "object" && payload !== null && "user" in payload;
  }

  /** Counts the number of unique users across all active subscriptions. */
  protected _countUniqueUserSubscriptions(): number {
    const users = new Set<string>();
    for (const id of this._subscriptions.keys()) {
      try {
        const payload = JSON.parse(id);
        if (this._hasUserParam(payload)) {
          users.add(payload.user);
        }
      } catch {
        // Ignore parsing errors
      }
    }
    return users.size;
  }
}
