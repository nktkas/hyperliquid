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

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Subscribes to a Hyperliquid event channel.
   *
   * @throws {WebSocketRequestError} When the subscription request fails or limits are exceeded.
   */
  async subscribe<T>(
    channel: string,
    payload: unknown,
    listener: (data: CustomEvent<T>) => void,
  ): Promise<ISubscription> {
    const id = requestToId(payload);

    // --- Get or create subscription state --------------------
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
        listeners: new Map(),
        promise,
        promiseFinished: false,
        failureController: new AbortController(),
      };
      this._subscriptions.set(id, subscription);
    }

    // --- Get or create listener registration -----------------
    let unsubscribe = subscription.listeners.get(listener);
    if (!unsubscribe) {
      unsubscribe = async () => {
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
      subscription.listeners.set(listener, unsubscribe);
    }

    // --- Await server confirmation ---------------------------
    await subscription.promise;

    return {
      unsubscribe,
      failureSignal: subscription.failureController.signal,
    };
  }

  // ============================================================
  // Event handlers
  // ============================================================

  /** Resubscribes to all completed subscriptions when the socket re-opens. */
  private _handleOpen(): void {
    if (!this.resubscribe) return;
    for (const [id, subscription] of this._subscriptions.entries()) {
      // Reconnect only previously connected subscriptions to avoid double subscriptions
      // due to server-side message buffering during reconnect.
      if (subscription.promiseFinished) {
        subscription.promise = this._dispatcher.request("subscribe", JSON.parse(id))
          .catch((error) => subscription.failureController.abort(error))
          .finally(() => subscription.promiseFinished = true);
        subscription.promiseFinished = false;
      }
    }
  }

  /** Cleans up subscriptions if resubscribe is disabled or the socket is terminated. */
  private _handleClose(): void {
    if (!this.resubscribe || this._socket.terminationSignal.aborted) {
      for (const subscription of this._subscriptions.values()) {
        for (const [, unsubscribe] of subscription.listeners) {
          unsubscribe(); // does not throw when the connection is closed
        }
      }
    }
  }

  // ============================================================
  // Subscription limit checks
  // ============================================================

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
