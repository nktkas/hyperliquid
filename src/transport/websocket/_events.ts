/**
 * Typed event target for Hyperliquid WebSocket messages.
 *
 * The frame types below are a trusted contract with the server: handlers
 * consume them without re-validating the shape.
 *
 * @module
 */

import { CustomEvent_ } from "../_polyfills.ts";

/**
 * Confirmation frame of a `subscribe` / `unsubscribe` request.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export interface SubscribeUnsubscribeResponse {
  method: "subscribe" | "unsubscribe";
  /** Subscription payload echoed by the server: normalized, possibly with server-added fields. */
  subscription: unknown;
}

/**
 * Response frame of a `post` request.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests
 */
export interface PostResponse {
  id: number;
  response:
    | {
      type: "info";
      payload: { type: string; data: unknown };
    }
    | {
      type: "action";
      payload: {
        status: "ok" | "err";
        response:
          | { type: string; data?: unknown }
          | string;
      };
    }
    | {
      type: "error";
      /** Error message, e.g. "Cannot track more than 15 total users." */
      payload: string;
    };
}

/**
 * Block summary pushed by the explorer RPC.
 *
 * @see null
 */
interface BlockDetails {
  blockTime: number;
  hash: string;
  height: number;
  numTxs: number;
  proposer: string;
}

/**
 * Transaction details pushed by the explorer RPC.
 *
 * @see null
 */
interface TxDetails {
  action: {
    type: string;
    [key: string]: unknown;
  };
  block: number;
  error: string | null;
  hash: string;
  time: number;
  user: string;
}

/** Base system events and dynamic channel events for the Hyperliquid WebSocket API. */
interface HyperliquidEventMap {
  subscriptionResponse: CustomEvent<SubscribeUnsubscribeResponse>;
  post: CustomEvent<PostResponse>;
  /** Error text; any embedded `{…}` body is valid JSON. */
  error: CustomEvent<string>;
  pong: CustomEvent<undefined>;
  explorerBlock_: CustomEvent<BlockDetails[]>;
  explorerTxs_: CustomEvent<TxDetails[]>;
  // deno-lint-ignore no-explicit-any
  [key: string]: CustomEvent<any>;
}

/** Matches the `{ channel, data? }` envelope; `pong` is the only frame without `data`. */
function isHyperliquidEvent(msg: unknown): msg is { channel: string; data?: unknown } {
  return typeof msg === "object" && msg !== null &&
    "channel" in msg && typeof msg.channel === "string";
}

// The explorer RPC pushes raw arrays without a { channel, data } envelope:
// detect them by shape and route them to synthetic "_"-suffixed channels.
function isExplorerBlockEvent(msg: unknown): msg is BlockDetails[] {
  return Array.isArray(msg) && msg.length > 0 &&
    typeof msg[0] === "object" && msg[0] !== null &&
    "blockTime" in msg[0] && "hash" in msg[0] &&
    "height" in msg[0] && "numTxs" in msg[0] &&
    "proposer" in msg[0];
}

function isExplorerTxsEvent(msg: unknown): msg is TxDetails[] {
  return Array.isArray(msg) && msg.length > 0 &&
    typeof msg[0] === "object" && msg[0] !== null &&
    "action" in msg[0] && "block" in msg[0] &&
    "error" in msg[0] && "hash" in msg[0] &&
    "time" in msg[0] && "user" in msg[0];
}

/**
 * Listens for WebSocket messages and re-dispatches them as typed Hyperliquid events.
 *
 * @example
 * ```ts ignore
 * const hlEvents = new HyperliquidEventTarget(socket);
 * hlEvents.addEventListener("l2Book", (event) => {
 *   event.detail; // data of every '{"channel":"l2Book","data":{...}}' frame
 * });
 * ```
 */
export interface HyperliquidEventTarget {
  addEventListener<K extends keyof HyperliquidEventMap>(
    type: K,
    listener: ((event: HyperliquidEventMap[K]) => void) | EventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof HyperliquidEventMap>(
    type: K,
    listener: ((event: HyperliquidEventMap[K]) => void) | EventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void;
}
export class HyperliquidEventTarget extends EventTarget {
  constructor(socket: WebSocket) {
    super();
    socket.addEventListener("message", (event) => {
      let msg: unknown;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return; // Ignore non-JSON frames
      }

      if (isHyperliquidEvent(msg)) {
        this.dispatchEvent(new CustomEvent_(msg.channel, { detail: msg.data }));
      } else if (isExplorerBlockEvent(msg)) {
        this.dispatchEvent(new CustomEvent_("explorerBlock_", { detail: msg }));
      } else if (isExplorerTxsEvent(msg)) {
        this.dispatchEvent(new CustomEvent_("explorerTxs_", { detail: msg }));
      }
    });
  }
}
