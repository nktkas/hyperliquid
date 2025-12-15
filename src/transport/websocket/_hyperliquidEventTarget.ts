import * as v from "@valibot/valibot";
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
  _explorerBlock: CustomEvent<BlockDetails[]>;
  _explorerTxs: CustomEvent<TxDetails[]>;
  // deno-lint-ignore no-explicit-any
  [key: string]: CustomEvent<any>;
}

const BlockDetailsSchema = /* @__PURE__ */ (() => {
  return v.looseObject({
    blockTime: v.unknown(),
    hash: v.unknown(),
    height: v.unknown(),
    numTxs: v.unknown(),
    proposer: v.unknown(),
  });
})();
const TxDetailsSchema = /* @__PURE__ */ (() => {
  return v.looseObject({
    action: v.unknown(),
    block: v.unknown(),
    error: v.unknown(),
    hash: v.unknown(),
    time: v.unknown(),
    user: v.unknown(),
  });
})();
const HyperliquidEventSchema = /* @__PURE__ */ (() => {
  return v.object({ channel: v.string(), data: v.unknown() });
})();
const PongEventSchema = /* @__PURE__ */ (() => {
  return v.object({ channel: v.literal("pong") });
})();
const ExplorerBlockEventSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.array(BlockDetailsSchema), v.nonEmpty());
})();
const ExplorerTxsEventSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.array(TxDetailsSchema), v.nonEmpty());
})();

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
        if (v.is(HyperliquidEventSchema, msg)) {
          this.dispatchEvent(new CustomEvent_(msg.channel, { detail: msg.data }));
        } else if (v.is(PongEventSchema, msg)) {
          this.dispatchEvent(new CustomEvent_("pong", { detail: undefined }));
        } else if (v.is(ExplorerBlockEventSchema, msg)) {
          this.dispatchEvent(new CustomEvent_("_explorerBlock", { detail: msg }));
        } else if (v.is(ExplorerTxsEventSchema, msg)) {
          this.dispatchEvent(new CustomEvent_("_explorerTxs", { detail: msg }));
        }
      } catch {
        // Ignore JSON parsing errors
      }
    });
  }
}
