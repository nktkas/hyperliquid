import { TransportError } from "../../_errors.ts";
import { Promise_ } from "../_polyfills.ts";
import type { ReconnectingWebSocket } from "@nktkas/rews";
import type { HyperliquidEventTarget } from "./_hyperliquidEventTarget.ts";

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
  // deno-lint-ignore no-explicit-any
  resolve: (value?: any) => void;
  // deno-lint-ignore no-explicit-any
  reject: (reason?: any) => void;
}

/** Error thrown when a WebSocket request fails. */
export class WebSocketRequestError extends TransportError {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "WebSocketRequestError";
  }
}

/**
 * Manages WebSocket requests to the Hyperliquid API.
 * Handles request creation, sending, and mapping responses to their corresponding requests.
 */
export class WebSocketAsyncRequest {
  protected socket: ReconnectingWebSocket;
  protected lastId = 0;
  protected queue: PendingRequest[] = [];

  /**
   * Creates a new WebSocket async request handler.
   * @param socket - WebSocket connection instance for sending requests to the Hyperliquid WebSocket API
   * @param hlEvents - Used to recognize Hyperliquid responses and match them with sent requests
   */
  constructor(socket: ReconnectingWebSocket, hlEvents: HyperliquidEventTarget) {
    this.socket = socket;

    // Monitor responses and match the pending request
    hlEvents.addEventListener("subscriptionResponse", (event) => {
      this.queue
        // NOTE: API may add new fields over time, so perform a loose check of the payload.
        .find((x) => typeof x.id === "string" && isSubset(JSON.parse(x.id), event.detail))
        ?.resolve(event.detail);
    });
    hlEvents.addEventListener("post", (event) => {
      if (event.detail.response.type === "error") {
        this.queue
          .find((x) => x.id === event.detail.id)
          ?.reject(new WebSocketRequestError(event.detail.response.payload));
        return;
      }
      const data = event.detail.response.type === "info"
        ? event.detail.response.payload.data
        : event.detail.response.payload;
      this.queue.find((x) => x.id === event.detail.id)?.resolve(data);
    });
    hlEvents.addEventListener("pong", () => {
      this.queue.find((x) => x.id === "ping")?.resolve();
    });
    hlEvents.addEventListener("error", (event) => {
      try {
        // For errors with `id=` suffix (e.g., `too many pending post requests id=1234`)
        const idMatch = event.detail.match(/id=(\d+)$/);
        if (idMatch) {
          const id = parseInt(idMatch[1], 10);
          this.queue.find((x) => x.id === id)
            ?.reject(new WebSocketRequestError(event.detail));
          return;
        }

        // Error event doesn't have an id, use original request to match
        const request = event.detail.match(/{.*}/)?.[0];
        if (!request) return;

        const parsedRequest = JSON.parse(request);

        // For `post` requests
        if ("id" in parsedRequest && typeof parsedRequest.id === "number") {
          this.queue.find((x) => x.id === parsedRequest.id)
            ?.reject(new WebSocketRequestError(event.detail));
          return;
        }

        // For `subscribe` and `unsubscribe` requests
        if (
          "subscription" in parsedRequest &&
          typeof parsedRequest.subscription === "object" && parsedRequest.subscription !== null
        ) {
          const id = WebSocketAsyncRequest.requestToId(parsedRequest);
          this.queue.find((x) => x.id === id)
            ?.reject(new WebSocketRequestError(event.detail));
          return;
        }

        // For `Already subscribed` and `Invalid subscription` requests
        if (
          event.detail.startsWith("Already subscribed") ||
          event.detail.startsWith("Invalid subscription")
        ) {
          const id = WebSocketAsyncRequest.requestToId({
            method: "subscribe",
            subscription: parsedRequest,
          });
          this.queue.find((x) => x.id === id)
            ?.reject(new WebSocketRequestError(event.detail));
          return;
        }

        // For `Already unsubscribed` requests
        if (event.detail.startsWith("Already unsubscribed")) {
          const id = WebSocketAsyncRequest.requestToId({
            method: "unsubscribe",
            subscription: parsedRequest,
          });
          this.queue.find((x) => x.id === id)
            ?.reject(new WebSocketRequestError(event.detail));
          return;
        }

        // For unknown requests
        const id = WebSocketAsyncRequest.requestToId(parsedRequest);
        this.queue.find((x) => x.id === id)
          ?.reject(new WebSocketRequestError(event.detail));
      } catch {
        // Ignore JSON parsing errors
      }
    });

    // Throws all pending requests if the connection is dropped
    const handleClose = () => {
      this.queue.forEach(({ reject }) => {
        reject(new WebSocketRequestError("WebSocket connection closed."));
      });
      this.queue = [];
    };
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", handleClose);
  }

  /**
   * Sends a request to the Hyperliquid API.
   * @returns A promise that resolves with the parsed JSON response body.
   */
  async request(method: "ping", signal?: AbortSignal): Promise<void>;
  async request<T>(method: "post" | "subscribe" | "unsubscribe", payload: unknown, signal?: AbortSignal): Promise<T>;
  async request<T>(
    method: "post" | "subscribe" | "unsubscribe" | "ping",
    payloadOrSignal?: unknown | AbortSignal,
    maybeSignal?: AbortSignal,
  ): Promise<T> {
    const payload = payloadOrSignal instanceof AbortSignal ? undefined : payloadOrSignal;
    const signal = payloadOrSignal instanceof AbortSignal ? payloadOrSignal : maybeSignal;

    // Reject the request if the signal is aborted
    if (signal?.aborted) return Promise.reject(signal.reason);
    // or if the WebSocket connection is permanently closed
    if (this.socket.terminationSignal.aborted) {
      return Promise.reject(this.socket.terminationSignal.reason);
    }

    // Create a request
    let id: string | number;
    let request: SubscribeUnsubscribeRequest | PostRequest | PingRequest;
    if (method === "post") {
      id = ++this.lastId;
      request = { method, id, request: payload };
    } else if (method === "ping") {
      id = "ping";
      request = { method };
    } else {
      request = { method, subscription: payload };
      id = WebSocketAsyncRequest.requestToId(request);
    }

    // Send the request
    this.socket.send(JSON.stringify(request));

    // Wait for a response
    const { promise, resolve, reject } = Promise_.withResolvers<T>();
    this.queue.push({ id, resolve, reject });

    const onAbort = () => reject(signal?.reason);
    signal?.addEventListener("abort", onAbort, { once: true });

    return await promise.finally(() => {
      const index = this.queue.findIndex((item) => item.id === id);
      if (index !== -1) this.queue.splice(index, 1);

      signal?.removeEventListener("abort", onAbort);
    });
  }

  /** Normalizes an object and then converts it to a string. */
  static requestToId(value: unknown): string {
    const sortedKeys = recursiveSortObjectKeys(value);
    const lowercasedHex = recursiveHexToLowercase(sortedKeys);
    return JSON.stringify(lowercasedHex);
  }
}

function recursiveSortObjectKeys<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(recursiveSortObjectKeys) as T;
  }
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      result[key] = recursiveSortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return result as T;
  }
  return obj;
}

function recursiveHexToLowercase(value: unknown): unknown {
  if (typeof value === "string" && /^0[xX][0-9a-fA-F]+$/.test(value)) {
    return value.toLowerCase();
  }
  if (Array.isArray(value)) {
    return value.map(recursiveHexToLowercase);
  }
  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const k in value) {
      result[k] = recursiveHexToLowercase((value as Record<string, unknown>)[k]);
    }
    return result;
  }
  return value;
}

/** Checks if `subset` is a subset of `superset` (all fields in subset exist in superset with same values). */
function isSubset(subset: unknown, superset: unknown): boolean {
  // Strings: compare hex addresses case-insensitively, others strictly
  if (typeof subset === "string" && typeof superset === "string") {
    const hexRegex = /^0x[0-9a-f]+$/i;
    return hexRegex.test(subset) && hexRegex.test(superset)
      ? subset.toLowerCase() === superset.toLowerCase()
      : subset === superset;
  }

  // Primitives or type mismatch
  if (typeof subset !== "object" || typeof superset !== "object" || subset === null || superset === null) {
    return subset === superset;
  }

  // Arrays: must match element by element
  if (Array.isArray(subset)) {
    return Array.isArray(superset) &&
      subset.length === superset.length &&
      subset.every((item, i) => isSubset(item, superset[i]));
  }

  // Objects: all keys in subset must exist in superset with matching values
  const sub = subset as Record<string, unknown>;
  const sup = superset as Record<string, unknown>;
  return Object.keys(sub).every((key) => key in sup && isSubset(sub[key], sup[key]));
}
