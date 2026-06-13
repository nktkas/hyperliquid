/**
 * Subscription lifecycle manager: tracks listeners per subscription payload,
 * resubscribes on reconnect, and enforces per-connection subscription limits.
 *
 * @module
 */

import { ReconnectingWebSocket } from "@nktkas/rews";
import * as abort from "../_abort.ts";
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
  /**
   * Whether this listener's `subscribe()` call has resolved. A failure is
   * reported through exactly one channel: the pending `subscribe()` promise
   * before that, `onError` after.
   */
  confirmed: boolean;
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

/**
 * Maximum number of subscriptions; the server rejects the excess without
 * echoing the request, so the guard must run client-side.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/rate-limits-and-user-limits
 */
const MAX_SUBSCRIPTIONS = 1000;

/**
 * Maximum number of unique users across subscriptions; the server rejects the
 * excess without echoing the request, so the guard must run client-side.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/rate-limits-and-user-limits
 */
const MAX_UNIQUE_USERS = 15;

/** Tracks listeners per subscription payload, resubscribes on reconnect, enforces server-side limits. */
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
   * @param options.signal Stops waiting for the confirmation and detaches the listener.
   * @param options.onError Callback invoked at most once, when an already confirmed subscription fails:
   *                        - the server rejects a re-subscription after a reconnect;
   *                        - the connection is permanently terminated;
   *                        - the connection goes down while re-subscription is disabled.
   *
   *                        Failures before the confirmation reject the `subscribe()` promise instead.
   *                        After the callback fires, the subscription is removed and no further events or errors follow.
   *
   * @throws {WebSocketRequestError} When the subscription request fails or limits are exceeded.
   */
  async subscribe<T>(
    channel: string,
    payload: unknown,
    listener: (data: CustomEvent<T>) => void,
    options?: {
      signal?: AbortSignal;
      onError?: (error: WebSocketRequestError) => void;
    },
  ): Promise<ISubscription> {
    const { signal, onError } = options ?? {};
    if (signal?.aborted) {
      throw new WebSocketRequestError("Subscription was aborted", { cause: signal.reason, request: payload });
    }
    const id = requestToId(payload);

    // --- Subscription state --------------------------------------------------
    let subscription = this._subscriptions.get(id);
    if (!subscription) {
      if (this._subscriptions.size >= MAX_SUBSCRIPTIONS) {
        throw new WebSocketRequestError(`Cannot subscribe to more than ${MAX_SUBSCRIPTIONS} channels.`, {
          request: payload,
        });
      }
      if (this._exceedsUserLimit(payload)) {
        throw new WebSocketRequestError(`Cannot track more than ${MAX_UNIQUE_USERS} total users.`, {
          request: payload,
        });
      }

      const promise = this._dispatcher.request("subscribe", payload)
        .finally(() => created.promiseFinished = true);
      const created: SubscriptionState = { channel, listeners: new Map(), promise, promiseFinished: false };
      this._subscriptions.set(id, created);
      subscription = created;

      // Each subscriber awaits this promise through its own abort.race below,
      // and an aborting subscriber stops awaiting early. If every subscriber
      // aborts before the request settles, a later rejection would have no
      // handler left and crash the process as an unhandled rejection; this
      // no-op handler absorbs exactly that case.
      promise.catch(() => {});
    }

    // --- Listener registration -----------------------------------------------
    let registration = subscription.listeners.get(listener);
    const createdRegistration = registration === undefined;
    if (!registration) {
      const unsubscribe = async () => {
        this._hlEvents.removeEventListener(channel, listener);
        const current = this._subscriptions.get(id);
        current?.listeners.delete(listener);

        if (current?.listeners.size === 0) {
          this._subscriptions.delete(id);

          if (this._socket.readyState === ReconnectingWebSocket.OPEN) {
            await this._dispatcher.request("unsubscribe", payload);
          }
        }
      };

      this._hlEvents.addEventListener(channel, listener);
      registration = { unsubscribe, onError, confirmed: false };
      subscription.listeners.set(listener, registration);
    }

    // --- Server confirmation -------------------------------------------------
    try {
      await abort.race(subscription.promise, signal);
      registration.confirmed = true;
    } catch (error) {
      // Roll back only what this call registered: the subscription entry itself
      // may legitimately survive (a re-subscription rejected by a disconnect is
      // retried on the next open), but a listener whose subscribe() failed must
      // never receive events — its caller holds no handle to remove it.
      if (createdRegistration) {
        this._hlEvents.removeEventListener(channel, listener);
        const current = this._subscriptions.get(id);
        if (current === subscription) {
          subscription.listeners.delete(listener);
          if (subscription.listeners.size === 0) {
            this._subscriptions.delete(id);
            // On abort the shared request stays in flight and may still confirm:
            // free the server-side slot nobody is listening to.
            if (signal && error === signal.reason && this._socket.readyState === ReconnectingWebSocket.OPEN) {
              this._dispatcher.request("unsubscribe", payload).catch(() => {});
            }
          }
        }
      }
      if (signal && error === signal.reason) {
        throw new WebSocketRequestError("Subscription was aborted", { cause: error, request: payload });
      }
      throw error;
    }

    return {
      unsubscribe: registration.unsubscribe,
    };
  }

  // ===========================================================================
  // Event handlers
  // ===========================================================================

  /** Resubscribes to every completed subscription when the socket re-opens. */
  private _handleOpen(): void {
    // Snapshot before iterating: _failSubscription mutates `_subscriptions`.
    for (const [id, subscription] of [...this._subscriptions.entries()]) {
      if (!subscription.promiseFinished) continue;

      // A subscription that survived a disconnect cannot be served when
      // re-subscription was disabled while the socket was down.
      if (!this.resubscribe) {
        this._failSubscription(
          id,
          subscription,
          new WebSocketRequestError("WebSocket connection closed", { request: JSON.parse(id) }),
        );
        continue;
      }

      const promise = this._dispatcher.request("subscribe", JSON.parse(id));
      subscription.promise = promise;
      subscription.promiseFinished = false;

      promise
        .catch((error) => {
          // A rejection on a live socket means the server refused the
          // re-subscription or it timed out — either way the channel cannot be
          // trusted anymore. A rejection on a dead socket is the disconnect
          // clearing the queue; the next open retries.
          if (this._socket.readyState === ReconnectingWebSocket.OPEN) {
            // The dispatcher rejects only with WebSocketRequestError.
            this._failSubscription(id, subscription, error as WebSocketRequestError);
          }
        })
        .finally(() => subscription.promiseFinished = true);
    }
  }

  /**
   * Fails every subscription when the connection stops serving them: the socket is
   * terminated, or it closes while re-subscription is disabled.
   */
  private _handleClose(): void {
    const terminal = this._socket.terminationSignal.aborted;
    if (this.resubscribe && !terminal) return;

    // Snapshot before teardown: each call mutates `_subscriptions` during iteration.
    for (const [id, subscription] of [...this._subscriptions.entries()]) {
      const error = terminal
        ? new WebSocketRequestError("WebSocket connection permanently terminated", {
          cause: this._socket.terminationSignal.reason,
          request: JSON.parse(id),
        })
        : new WebSocketRequestError("WebSocket connection closed", { request: JSON.parse(id) });
      this._failSubscription(id, subscription, error);
    }
  }

  // ===========================================================================
  // Teardown
  // ===========================================================================

  /**
   * Removes the subscription with all its listeners, then notifies each
   * confirmed listener's `onError` once. Sends nothing to the server: every
   * caller deals with a subscription the server no longer serves — refused,
   * or cut off by a close.
   */
  private _failSubscription(id: string, subscription: SubscriptionState, error: WebSocketRequestError): void {
    if (this._subscriptions.get(id) !== subscription) return;
    this._subscriptions.delete(id);

    for (const [listener, registration] of subscription.listeners) {
      this._hlEvents.removeEventListener(subscription.channel, listener);
      // An unconfirmed listener observes the failure through its still-pending
      // subscribe() call instead.
      if (!registration.confirmed) continue;
      try {
        registration.onError?.(error);
      } catch {
        // A throwing onError must not affect other listeners.
      }
    }
  }

  // ===========================================================================
  // Subscription limit checks
  // ===========================================================================

  /** True when subscribing `payload` would track one user above the limit. */
  private _exceedsUserLimit(payload: unknown): boolean {
    const userOf = (p: unknown): string | undefined =>
      typeof p === "object" && p !== null && "user" in p && typeof p.user === "string"
        ? p.user.toLowerCase()
        : undefined;

    const user = userOf(payload);
    if (user === undefined) return false;

    const users = new Set<string>();
    for (const id of this._subscriptions.keys()) {
      const tracked = userOf(JSON.parse(id));
      if (tracked !== undefined) users.add(tracked);
    }
    return !users.has(user) && users.size >= MAX_UNIQUE_USERS;
  }
}
