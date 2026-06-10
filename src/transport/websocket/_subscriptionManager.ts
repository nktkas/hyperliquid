/**
 * Subscription lifecycle manager: tracks listeners per channel, resubscribes on reconnect,
 * and enforces per-connection subscription limits.
 * @module
 */

import type { ReconnectingWebSocket } from "@nktkas/rews";
import type { ISubscription } from "../_base.ts";
import type { HyperliquidEventTarget } from "./_events.ts";
import { WebSocketDispatcher, WebSocketRequestError } from "./_dispatcher.ts";
import { requestToId } from "./_id.ts";

/** Per-listener registration: its unsubscribe handle and optional error callback. */
interface ListenerRegistration {
  /** Removes this listener and, if it is the last, unsubscribes from the channel. */
  unsubscribe: () => Promise<void>;
  /** Optional callback invoked once on subscription failure (see {@link WebSocketSubscriptionManager.subscribe}). */
  onError?: (error: WebSocketRequestError) => void;
}

/** Internal state for managing a subscription. */
interface SubscriptionState {
  /** Event channel name, used to detach listeners on teardown. */
  channel: string;
  /** Map of event listeners to their registration. */
  listeners: Map<(data: CustomEvent) => void, ListenerRegistration>;
  /** Promise tracking the subscription request. */
  promise: Promise<unknown>;
  /** Whether the subscription request has completed. */
  promiseFinished: boolean;
}

/** Maximum number of subscriptions allowed by Hyperliquid. */
const MAX_SUBSCRIPTIONS = 1000;

/** Maximum number of unique user subscriptions allowed by Hyperliquid. */
const MAX_UNIQUE_USER_SUBSCRIPTIONS = 10;

/** Tracks listeners per channel, resubscribes on reconnect, enforces server-side limits. */
export class WebSocketSubscriptionManager {
  /** Enable automatic re-subscription to Hyperliquid subscription after reconnection. */
  resubscribe: boolean;

  private readonly _socket: ReconnectingWebSocket;
  private readonly _dispatcher: WebSocketDispatcher;
  private readonly _hlEvents: HyperliquidEventTarget;
  private _subscriptions: Map<string, SubscriptionState> = new Map();

  constructor(
    socket: ReconnectingWebSocket,
    dispatcher: WebSocketDispatcher,
    hlEvents: HyperliquidEventTarget,
    resubscribe: boolean,
  ) {
    this._socket = socket;
    this._dispatcher = dispatcher;
    this._hlEvents = hlEvents;
    this.resubscribe = resubscribe;

    socket.addEventListener("open", () => this._handleOpen());
    socket.addEventListener("close", () => this._handleClose());
    socket.addEventListener("error", () => this._handleClose());
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Subscribes to a Hyperliquid event channel.
   *
   * @param onError Optional callback invoked synchronously at most once, when the subscription fails — either a re-subscription after a reconnect is rejected, or the connection is permanently lost.
   *                After it fires, the subscription is removed and no further events or errors follow; create a new subscription to continue.
   *
   * @throws {WebSocketRequestError} When the subscription request fails or limits are exceeded.
   */
  async subscribe<T>(
    channel: string,
    payload: unknown,
    listener: (data: CustomEvent<T>) => void,
    onError?: (error: WebSocketRequestError) => void,
  ): Promise<ISubscription> {
    const id = requestToId(payload);

    // --- Get or create subscription state ------------------------------------
    let subscription = this._subscriptions.get(id);
    if (!subscription) {
      if (this._subscriptions.size >= MAX_SUBSCRIPTIONS) {
        throw new WebSocketRequestError(`Cannot subscribe to more than ${MAX_SUBSCRIPTIONS} channels`);
      }
      if (this._hasUserParam(payload) && this._countUniqueUserSubscriptions() >= MAX_UNIQUE_USER_SUBSCRIPTIONS) {
        throw new WebSocketRequestError(`Cannot track more than ${MAX_UNIQUE_USER_SUBSCRIPTIONS} unique users`);
      }

      const promise = this._dispatcher.request("subscribe", payload)
        .finally(() => subscription!.promiseFinished = true);

      subscription = {
        channel,
        listeners: new Map(),
        promise,
        promiseFinished: false,
      };
      this._subscriptions.set(id, subscription);
    }

    // --- Get or create listener registration ---------------------------------
    let registration = subscription.listeners.get(listener);
    if (!registration) {
      const unsubscribe = async () => {
        this._hlEvents.removeEventListener(channel, listener);
        const subscription = this._subscriptions.get(id);
        subscription?.listeners.delete(listener);

        if (subscription?.listeners.size === 0) {
          this._subscriptions.delete(id);

          if (this._socket.readyState === WebSocket.OPEN) {
            await this._dispatcher.request("unsubscribe", payload);
          }
        }
      };

      this._hlEvents.addEventListener(channel, listener);
      registration = { unsubscribe, onError };
      subscription.listeners.set(listener, registration);
    }

    // --- Await server confirmation -------------------------------------------
    await subscription.promise;

    return {
      unsubscribe: registration.unsubscribe,
    };
  }

  // ===========================================================================
  // Event handlers
  // ===========================================================================

  /** Resubscribes to all completed subscriptions when the socket re-opens. */
  private _handleOpen(): void {
    if (!this.resubscribe) return;
    for (const [id, subscription] of this._subscriptions.entries()) {
      if (subscription.promiseFinished) {
        subscription.promise = this._dispatcher.request("subscribe", JSON.parse(id))
          .catch((error) => {
            this._failSubscription(id, subscription, error);
          })
          .finally(() => subscription.promiseFinished = true);
        subscription.promiseFinished = false;
      }
    }
  }

  /**
   * Cleans up subscriptions when resubscribe is disabled or the socket is terminated.
   * On termination, notifies each listener's `onError` once before removing the subscription.
   */
  private _handleClose(): void {
    const terminal = this._socket.terminationSignal.aborted;
    if (this.resubscribe && !terminal) return;

    // Wrap an external error in a WebSocketRequestError
    let error: WebSocketRequestError | undefined;
    if (terminal) {
      error = new WebSocketRequestError("WebSocket connection permanently terminated", {
        cause: this._socket.terminationSignal.reason,
      });
    }

    // Snapshot before teardown: each call mutates `_subscriptions` during iteration.
    for (const [id, subscription] of [...this._subscriptions.entries()]) {
      if (terminal) {
        this._failSubscription(id, subscription, error!);
      } else {
        // Clean close with resubscribe disabled: drop the subscription without notifying.
        this._removeSubscription(id, subscription);
      }
    }
  }

  // ===========================================================================
  // Teardown
  // ===========================================================================

  /**
   * Detaches every listener of a subscription and removes it locally.
   * Sends nothing to the server: this runs only when the connection is already gone.
   */
  private _removeSubscription(id: string, subscription: SubscriptionState): void {
    if (this._subscriptions.get(id) !== subscription) return;
    this._subscriptions.delete(id);
    for (const listener of subscription.listeners.keys()) {
      this._hlEvents.removeEventListener(subscription.channel, listener);
    }
  }

  /** Notifies each listener's `onError` once, then removes the subscription. */
  private _failSubscription(id: string, subscription: SubscriptionState, error: unknown): void {
    if (this._subscriptions.get(id) !== subscription) return;
    this._removeSubscription(id, subscription);
    for (const registration of subscription.listeners.values()) {
      try {
        registration.onError?.(error as WebSocketRequestError);
      } catch {
        // A throwing onError must not affect other listeners.
      }
    }
  }

  // ===========================================================================
  // Subscription limit checks
  // ===========================================================================

  private _hasUserParam(payload: unknown): boolean {
    return typeof payload === "object" && payload !== null && "user" in payload;
  }

  private _countUniqueUserSubscriptions(): number {
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
