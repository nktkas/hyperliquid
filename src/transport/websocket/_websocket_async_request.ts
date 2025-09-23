import { TransportError } from "../base.ts";
import { Promise_ } from "../_polyfills.ts";
import type { ReconnectingWebSocket } from "./_reconnecting_websocket.ts";
import type { HyperliquidEventTarget } from "./_hyperliquid_event_target.ts";

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
  protected lastId = 0;
  protected queue: {
    id: number | string;
    // deno-lint-ignore no-explicit-any
    resolve: (value?: any) => void;
    // deno-lint-ignore no-explicit-any
    reject: (reason?: any) => void;
  }[] = [];
  /** Timestamp of the last request sent. */
  lastRequestTime = 0;

  /**
   * Creates a new WebSocket async request handler.
   * @param socket - WebSocket connection instance for sending requests to the Hyperliquid WebSocket API
   * @param hlEvents - Used to recognize Hyperliquid responses and match them with sent requests
   */
  constructor(protected socket: ReconnectingWebSocket, hlEvents: HyperliquidEventTarget) {
    // Monitor responses and match the pending request
    hlEvents.addEventListener("subscriptionResponse", (event) => {
      const id = WebSocketAsyncRequest.requestToId(event.detail);
      this.queue.find((x) => x.id === id)?.resolve(event.detail);
    });
    hlEvents.addEventListener("post", (event) => {
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
    if (this.socket.terminateSignal.aborted) {
      return Promise.reject(this.socket.terminateSignal.reason);
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
    this.socket.send(JSON.stringify(request), signal);
    this.lastRequestTime = Date.now();

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
    const transformed = deepTransform(value, [
      // sort object keys
      (v) => {
        if (typeof v !== "object" || v === null || Array.isArray(v)) return v;

        const out: Record<string, unknown> = {};
        for (const key of Object.keys(v).sort()) {
          out[key] = (v as Record<string, unknown>)[key];
        }
        return out;
      },
      // hex to lowercase
      (v) => typeof v === "string" && /^0[xX][0-9a-fA-F]+$/.test(v) ? v.toLowerCase() : v,
    ]);
    return JSON.stringify(transformed); // also removes undefined values
  }
}

/**
 * Recursively transforms object/array values using a sequence of transformers.
 *
 * Issues:
 * - does not support circular references
 * - Symbol-keys are not preserved
 */
function deepTransform(obj: unknown, transformers: ((value: unknown, key?: string) => unknown)[]): unknown {
  const transform = (val: unknown, key?: string): unknown => {
    // Apply all transformers in sequence
    const transformed = transformers.reduce((acc, fn) => acc === undefined ? undefined : fn(acc, key), val);

    // Recurse into arrays and objects
    if (typeof transformed !== "object" || transformed === null) return transformed; // skip primitives
    if (Array.isArray(transformed)) return transformed.map((v) => transform(v));

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(transformed)) {
      const transformedValue = transform(v, k);
      out[k] = transformedValue;
    }
    return out;
  };

  return transform(obj);
}
