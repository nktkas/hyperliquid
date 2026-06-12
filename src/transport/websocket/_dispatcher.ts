/**
 * WebSocket request dispatcher: sends `post`, `subscribe`, and `unsubscribe`
 * messages and matches responses by id.
 *
 * @module
 */

import { ReconnectingWebSocket } from "@nktkas/rews";
import * as abort from "../_abort.ts";
import { TransportError } from "../_base.ts";
import { Promise_ } from "../_polyfills.ts";
import type { HyperliquidEventTarget, PostResponse, SubscribeUnsubscribeResponse } from "./_events.ts";
import { isSubset, requestToId, specificity } from "./_id.ts";

// =============================================================================
// Errors
// =============================================================================

/**
 * Error thrown when a WebSocket request fails.
 *
 * @example
 * ```ts
 * import { WebSocketRequestError, WebSocketTransport } from "@nktkas/hyperliquid";
 *
 * const transport = new WebSocketTransport();
 * try {
 *   // Throws on a server rejection, a timeout, an abort, or a lost connection.
 *   await transport.request("info", { type: "allMids" });
 * } catch (error) {
 *   if (error instanceof WebSocketRequestError) {
 *     console.error(error.message, error.request);
 *   }
 * }
 * ```
 */
export class WebSocketRequestError extends TransportError {
  /** The original request payload that triggered the error, if available. */
  request?: unknown;

  /**
   * Creates a WebSocket request error.
   *
   * The failed request payload goes into `options.request`.
   */
  constructor(message?: string, options?: ErrorOptions & { request?: unknown }) {
    super(message, options);
    this.name = "WebSocketRequestError";
    this.request = options?.request;
  }
}

// =============================================================================
// Internal types
// =============================================================================

/**
 * Outgoing `post` envelope.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests
 */
interface PostRequest {
  method: "post";
  id: number;
  request: unknown;
}

/**
 * Outgoing `subscribe` / `unsubscribe` envelope.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
interface SubscribeUnsubscribeRequest {
  method: "subscribe" | "unsubscribe";
  subscription: unknown;
}

/** A queued request awaiting its response. */
interface PendingRequest {
  id: number | string;
  payload: unknown;
  /** The wire frame, kept until the connection can actually carry it. */
  frame: string;
  sent: boolean;
  // deno-lint-ignore no-explicit-any
  resolve: (value?: any) => void;
  // deno-lint-ignore no-explicit-any
  reject: (reason?: any) => void;
}

// =============================================================================
// Dispatcher
// =============================================================================

/**
 * Owns the WebSocket request queue and matches server responses back to
 * in-flight requests.
 */
export class WebSocketDispatcher {
  /** Timeout for requests in ms. Set to `null` to disable. */
  timeout: number | null;

  private readonly _socket: ReconnectingWebSocket;
  private _lastId = 0;
  private _queue: PendingRequest[] = [];

  constructor(socket: ReconnectingWebSocket, hlEvents: HyperliquidEventTarget, timeout: number | null) {
    this.timeout = timeout;
    this._socket = socket;

    // --- Hyperliquid event handlers ------------------------------------------
    hlEvents.addEventListener("subscriptionResponse", (event) => this._handleSubscriptionResponse(event.detail));
    hlEvents.addEventListener("post", (event) => this._handlePostResponse(event.detail));
    hlEvents.addEventListener("error", (event) => this._handleErrorEvent(event.detail));

    // --- Socket lifecycle ----------------------------------------------------
    // A rejected unsent request is guaranteed to never reach the server.
    const handleDisconnect = () => {
      this._queue.forEach(({ sent, payload, reject }) =>
        reject(
          new WebSocketRequestError(
            sent ? "WebSocket connection closed" : "WebSocket connection closed before the request was sent",
            { request: payload },
          ),
        )
      );
      this._queue = [];
    };
    socket.addEventListener("close", handleDisconnect);
    socket.addEventListener("error", handleDisconnect);
    socket.addEventListener("open", () => {
      // Everything still queued at this point was held back while disconnected.
      for (const entry of this._queue) {
        entry.sent = true;
        this._socket.send(entry.frame);
      }
    });
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Sends a request and resolves with the matched server response.
   *
   * @param signal Cancels the request from the caller's side.
   */
  async request<T>(
    method: "post" | "subscribe" | "unsubscribe",
    payload: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    // One controller per request: the timeout timer, the user signal, and the
    // socket termination relay into it, and `finally` detaches everything, so
    // no listener or timer outlives the request.
    const controller = new AbortController();
    const timeoutMs = this.timeout; // for correct error message after user changes
    const timeout = timeoutMs !== null ? abort.scheduleTimeout(controller, timeoutMs) : undefined;
    const detachRelay = abort.relay([signal, this._socket.terminationSignal], controller);

    let entry: PendingRequest | undefined;
    try {
      if (controller.signal.aborted) throw controller.signal.reason;

      // --- Build request envelope --------------------------------------------
      const request: SubscribeUnsubscribeRequest | PostRequest = method === "post"
        ? { method, id: ++this._lastId, request: payload }
        : { method, subscription: payload };
      const id = "id" in request ? request.id : requestToId(request);

      // --- Send or queue -----------------------------------------------------
      const frame = JSON.stringify(request);
      const sent = this._socket.readyState === ReconnectingWebSocket.OPEN;
      if (sent) this._socket.send(frame);

      const { promise, resolve, reject } = Promise_.withResolvers<T>();
      const pending = entry = { id, payload, frame, sent, resolve, reject };
      this._queue.push(pending);

      controller.signal.addEventListener("abort", () => {
        // Dequeue synchronously: an `open` flush between the abort and the
        // `finally` microtask must not send a frame the caller saw rejected.
        const index = this._queue.indexOf(pending);
        if (index !== -1) this._queue.splice(index, 1);
        reject(controller.signal.reason);
      }, { once: true });

      return await promise;
    } catch (error) {
      if (error instanceof TransportError) throw error;
      if (timeout !== undefined && error === timeout.reason) {
        throw new WebSocketRequestError(`Request timed out after ${timeoutMs} ms`, {
          cause: error,
          request: payload,
        });
      }
      if (this._socket.terminationSignal.aborted && error === this._socket.terminationSignal.reason) {
        throw new WebSocketRequestError("WebSocket connection permanently terminated", {
          cause: error,
          request: payload,
        });
      }
      if (controller.signal.aborted && error === controller.signal.reason) {
        throw new WebSocketRequestError("Request aborted", { cause: error, request: payload });
      }
      throw new WebSocketRequestError(`Unknown error while making a WebSocket request: ${error}`, {
        cause: error,
        request: payload,
      });
    } finally {
      if (entry) {
        const index = this._queue.indexOf(entry);
        if (index !== -1) this._queue.splice(index, 1);
      }
      timeout?.cancel();
      detachRelay();
    }
  }

  // ===========================================================================
  // Event handlers
  // ===========================================================================

  private _handleSubscriptionResponse(detail: SubscribeUnsubscribeResponse): void {
    this._findByEcho(detail)?.resolve(detail);
  }

  private _handlePostResponse(detail: PostResponse): void {
    const pending = this._queue.find((x) => x.id === detail.id);
    if (!pending) return;

    if (detail.response.type === "error") {
      pending.reject(new WebSocketRequestError(detail.response.payload, { request: pending.payload }));
    } else {
      const data = detail.response.type === "info" ? detail.response.payload.data : detail.response.payload;
      pending.resolve(data);
    }
  }

  private _handleErrorEvent(detail: string): void {
    // Reject by the trailing id, e.g. `too many pending post requests id=1234`.
    const idMatch = detail.match(/id=(\d+)$/);
    if (idMatch) {
      this._reject(this._queue.find((x) => x.id === parseInt(idMatch[1], 10)), detail);
      return;
    }

    // The remaining heuristics match by the request echoed in the message body;
    // an embedded `{…}` body is valid JSON by the server contract.
    const requestMatch = detail.match(/{.*}/)?.[0];
    if (!requestMatch) return;
    const parsedRequest = JSON.parse(requestMatch) as Record<string, unknown>;

    // A `post` envelope echo carries a numeric id.
    if (typeof parsedRequest.id === "number") {
      this._reject(this._queue.find((x) => x.id === parsedRequest.id), detail);
      return;
    }

    // A `subscribe` / `unsubscribe` envelope echo carries the subscription.
    if (typeof parsedRequest.subscription === "object" && parsedRequest.subscription !== null) {
      this._reject(this._findByEcho(parsedRequest), detail);
      return;
    }

    // These prefixes echo only the subscription payload, without an envelope.
    if (detail.startsWith("Already subscribed") || detail.startsWith("Invalid subscription")) {
      this._reject(this._findByEcho({ method: "subscribe", subscription: parsedRequest }), detail);
      return;
    }
    if (detail.startsWith("Already unsubscribed")) {
      this._reject(this._findByEcho({ method: "unsubscribe", subscription: parsedRequest }), detail);
    }
  }

  /** Rejects `pending`, when found, with the server text as the message. */
  private _reject(pending: PendingRequest | undefined, detail: string): void {
    pending?.reject(new WebSocketRequestError(detail, { request: pending.payload }));
  }

  /**
   * Finds the pending request matching an echoed body.
   *
   * The server normalizes the echo — fields can be added to the payload and
   * unknown ones dropped — so the queue is searched by subset. Among several
   * subset matches the most specific pending wins: when one in-flight payload
   * is a subset of another, the looser one must not swallow the echo meant
   * for the stricter one.
   */
  private _findByEcho(echo: unknown): PendingRequest | undefined {
    let best: PendingRequest | undefined;
    let bestSpecificity = -1;
    for (const pending of this._queue) {
      if (typeof pending.id !== "string") continue;
      const payload = JSON.parse(pending.id);
      if (!isSubset(payload, echo)) continue;
      const score = specificity(payload);
      if (score > bestSpecificity) {
        best = pending;
        bestSpecificity = score;
      }
    }
    return best;
  }
}
