/**
 * WebSocket request dispatcher: sends `post`, `subscribe`, `unsubscribe`, and `ping`
 * messages, matches responses by id, and runs the keep-alive ping loop.
 * @module
 */

import type { ReconnectingWebSocket } from "@nktkas/rews";
import { TransportError } from "../_base.ts";
import { AbortSignal_, Promise_ } from "../_polyfills.ts";
import type { HyperliquidEventTarget, PostResponse, SubscribeUnsubscribeResponse } from "./_events.ts";
import { isSubset, requestToId } from "./_id.ts";

// =============================================================================
// Errors
// =============================================================================

/** Error thrown when a WebSocket request fails. */
export class WebSocketRequestError extends TransportError {
  /** The original request payload that triggered the error, if available. */
  request?: unknown;

  constructor(message?: string, options?: ErrorOptions & { request?: unknown }) {
    super(message, options);
    this.name = "WebSocketRequestError";
    this.request = options?.request;
  }
}

// =============================================================================
// Internal types
// =============================================================================

interface PostRequest {
  method: "post";
  id: number;
  request: unknown;
}
interface SubscribeUnsubscribeRequest {
  method: "subscribe" | "unsubscribe";
  subscription: unknown;
}
interface PingRequest {
  method: "ping";
}

interface PendingRequest {
  id: number | string;
  request: unknown;
  // deno-lint-ignore no-explicit-any
  resolve: (value?: any) => void;
  // deno-lint-ignore no-explicit-any
  reject: (reason?: any) => void;
}

const KEEP_ALIVE_INTERVAL_MS = 30_000;

// =============================================================================
// Dispatcher
// =============================================================================

/**
 * Owns the WebSocket request queue and matches server responses back to in-flight
 * requests. Co-locates the keep-alive ping loop with pong matching.
 */
export class WebSocketDispatcher {
  /** Timeout for requests in ms. Set to `null` to disable. */
  timeout: number | null;

  private readonly _socket: ReconnectingWebSocket;
  private _lastId = 0;
  private _queue: PendingRequest[] = [];
  private _keepAliveInterval: ReturnType<typeof setInterval> | undefined;

  constructor(socket: ReconnectingWebSocket, hlEvents: HyperliquidEventTarget, timeout: number | null) {
    this.timeout = timeout;
    this._socket = socket;

    // --- Hyperliquid event handlers ------------------------------------------
    hlEvents.addEventListener("subscriptionResponse", (event) => this._handleSubscriptionResponse(event.detail));
    hlEvents.addEventListener("post", (event) => this._handlePostResponse(event.detail));
    hlEvents.addEventListener("pong", () => this._handlePong());
    hlEvents.addEventListener("error", (event) => this._handleErrorEvent(event.detail));

    // --- Reject pending requests on disconnect -------------------------------
    const handleClose = () => {
      this._queue.forEach(({ reject }) => reject(new WebSocketRequestError("WebSocket connection closed")));
      this._queue = [];
    };
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", handleClose);

    // --- Keep-alive lifecycle ------------------------------------------------
    socket.addEventListener("open", () => this._startKeepAlive());
    socket.addEventListener("close", () => this._stopKeepAlive());
    socket.addEventListener("error", () => this._stopKeepAlive());
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  request(method: "ping", signal?: AbortSignal): Promise<void>;
  request<T>(method: "post" | "subscribe" | "unsubscribe", payload: unknown, signal?: AbortSignal): Promise<T>;
  async request<T>(
    method: "post" | "subscribe" | "unsubscribe" | "ping",
    payloadOrSignal?: unknown | AbortSignal,
    maybeSignal?: AbortSignal,
  ): Promise<T> {
    try {
      // --- Resolve overload arguments ----------------------------------------
      const payload = payloadOrSignal instanceof AbortSignal ? undefined : payloadOrSignal;
      const userSignal = payloadOrSignal instanceof AbortSignal ? payloadOrSignal : maybeSignal;

      // --- Combine user + timeout signals ------------------------------------
      const timeoutSignal = this.timeout ? AbortSignal_.timeout(this.timeout) : undefined;
      const signal = userSignal && timeoutSignal
        ? AbortSignal_.any([userSignal, timeoutSignal])
        : userSignal ?? timeoutSignal;

      // --- Fast-fail on aborted/terminated state -----------------------------
      if (signal?.aborted) return Promise.reject(signal.reason);
      if (this._socket.terminationSignal.aborted) {
        return Promise.reject(this._socket.terminationSignal.reason);
      }

      // --- Build request envelope --------------------------------------------
      let id: string | number;
      let request: SubscribeUnsubscribeRequest | PostRequest | PingRequest;
      if (method === "post") {
        id = ++this._lastId;
        request = { method, id, request: payload };
      } else if (method === "ping") {
        id = "ping";
        request = { method };
      } else {
        request = { method, subscription: payload };
        id = requestToId(request);
      }

      // --- Send and register pending response --------------------------------
      this._socket.send(JSON.stringify(request));

      const { promise, resolve, reject } = Promise_.withResolvers<T>();
      this._queue.push({ id, request, resolve, reject });

      const onAbort = () => reject(signal?.reason);
      signal?.addEventListener("abort", onAbort, { once: true });

      // --- Await with cleanup ------------------------------------------------
      return await promise.finally(() => {
        const index = this._queue.findIndex((item) => item.id === id);
        if (index !== -1) this._queue.splice(index, 1);

        signal?.removeEventListener("abort", onAbort);
      });
    } catch (error) {
      if (error instanceof TransportError) throw error;
      throw new WebSocketRequestError(
        `Unknown error while making a WebSocket request: ${error}`,
        { cause: error },
      );
    }
  }

  // ===========================================================================
  // Keep-Alive
  // ===========================================================================

  private _startKeepAlive(): void {
    if (this._keepAliveInterval) return;
    this._keepAliveInterval = setInterval(() => {
      this._socket.send('{"method":"ping"}');
    }, KEEP_ALIVE_INTERVAL_MS);
  }

  private _stopKeepAlive(): void {
    clearInterval(this._keepAliveInterval);
    this._keepAliveInterval = undefined;
  }

  // ===========================================================================
  // Event handlers
  // ===========================================================================

  private _handleSubscriptionResponse(detail: SubscribeUnsubscribeResponse): void {
    this._queue
      // NOTE: API may add new fields over time, so perform a loose check of the payload.
      // Skip the literal "ping" id — it's not a JSON-encoded payload, so JSON.parse would throw.
      .find((x) => typeof x.id === "string" && x.id !== "ping" && isSubset(JSON.parse(x.id), detail))
      ?.resolve(detail);
  }

  private _handlePostResponse(detail: PostResponse): void {
    if (detail.response.type === "error") {
      this._queue
        .find((x) => x.id === detail.id)
        ?.reject(new WebSocketRequestError(detail.response.payload));
      return;
    }
    const data = detail.response.type === "info" ? detail.response.payload.data : detail.response.payload;
    this._queue.find((x) => x.id === detail.id)?.resolve(data);
  }

  private _handlePong(): void {
    this._queue.find((x) => x.id === "ping")?.resolve();
  }

  private _handleErrorEvent(detail: string): void {
    try {
      // --- `id=` suffix (e.g., `too many pending post requests id=1234`)
      const idMatch = detail.match(/id=(\d+)$/);
      if (idMatch) {
        const id = parseInt(idMatch[1], 10);
        this._reject(id, detail);
        return;
      }

      // --- Parse embedded JSON -----------------------------------------------
      const requestMatch = detail.match(/{.*}/)?.[0];
      if (!requestMatch) return;
      const parsedRequest = JSON.parse(requestMatch);

      // --- `post` requests ---------------------------------------------------
      if ("id" in parsedRequest && typeof parsedRequest.id === "number") {
        this._reject(parsedRequest.id, detail);
        return;
      }

      // --- `subscribe` / `unsubscribe` requests ------------------------------
      if (
        "subscription" in parsedRequest &&
        typeof parsedRequest.subscription === "object" && parsedRequest.subscription !== null
      ) {
        this._reject(requestToId(parsedRequest), detail);
        return;
      }

      // --- `Already subscribed` / `Invalid subscription` ---------------------
      if (detail.startsWith("Already subscribed") || detail.startsWith("Invalid subscription")) {
        this._reject(requestToId({ method: "subscribe", subscription: parsedRequest }), detail);
        return;
      }

      // --- `Already unsubscribed` --------------------------------------------
      if (detail.startsWith("Already unsubscribed")) {
        this._reject(requestToId({ method: "unsubscribe", subscription: parsedRequest }), detail);
        return;
      }

      // --- Unknown shape: best-effort match by full body ---------------------
      this._reject(requestToId(parsedRequest), detail);
    } catch {
      // Ignore JSON parsing errors
    }
  }

  private _reject(id: number | string, detail: string): void {
    const pending = this._queue.find((x) => x.id === id);
    if (pending) {
      pending.reject(new WebSocketRequestError(detail, { request: pending.request }));
    }
  }
}
