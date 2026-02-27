import { CustomEvent_ } from "../_polyfills.ts";

interface SubscribeUnsubscribeResponse {
  method: "subscribe" | "unsubscribe";
  /** Original subscription request payload. */
  subscription: unknown;
}

interface PostResponse {
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
      /** Error message, e.g. "Cannot track more than 10 total users." */
      payload: string;
    };
}

interface BlockDetails {
  blockTime: number;
  hash: string;
  height: number;
  numTxs: number;
  proposer: string;
}

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

/** Base system events and dynamic channel events for Hyperliquid WebSocket API. */
interface HyperliquidEventMap {
  subscriptionResponse: CustomEvent<SubscribeUnsubscribeResponse>;
  post: CustomEvent<PostResponse>;
  error: CustomEvent<string>;
  pong: CustomEvent<undefined>;
  explorerBlock_: CustomEvent<BlockDetails[]>;
  explorerTxs_: CustomEvent<TxDetails[]>;
  // deno-lint-ignore no-explicit-any
  [key: string]: CustomEvent<any>;
}

function isHyperliquidEvent(msg: unknown): msg is { channel: string; data: unknown } {
  return typeof msg === "object" && msg !== null &&
    "channel" in msg && typeof msg.channel === "string" &&
    "data" in msg;
}

function isPongEvent(msg: unknown): msg is { channel: "pong" } {
  return typeof msg === "object" && msg !== null &&
    "channel" in msg && msg.channel === "pong";
}

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

/** Listens for WebSocket messages and sends them as Hyperliquid typed events. */
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
  dispatchEvent(event: HyperliquidEventMap[keyof HyperliquidEventMap]): boolean;
}
export class HyperliquidEventTarget extends EventTarget {
  constructor(socket: WebSocket) {
    super();
    socket.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (isHyperliquidEvent(msg)) {
          this.dispatchEvent(new CustomEvent_(msg.channel, { detail: msg.data }));
        } else if (isPongEvent(msg)) {
          this.dispatchEvent(new CustomEvent_("pong", { detail: undefined }));
        } else if (isExplorerBlockEvent(msg)) {
          this.dispatchEvent(new CustomEvent_("explorerBlock_", { detail: msg }));
        } else if (isExplorerTxsEvent(msg)) {
          this.dispatchEvent(new CustomEvent_("explorerTxs_", { detail: msg }));
        }
      } catch {
        // Ignore JSON parsing errors
      }
    });
  }
}
