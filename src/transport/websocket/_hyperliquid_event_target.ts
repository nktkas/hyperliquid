import { TypedEventTarget } from "typescript-event-target";
import * as v from "valibot";
import { CustomEvent_ } from "../_polyfills.ts";

/** Response to subscribe to or unsubscribe from an event. */
interface SubscribeUnsubscribeResponse {
  /** Type of response */
  method: "subscribe" | "unsubscribe";
  /** Original request. */
  subscription: unknown;
}

/** Response to post request. */
interface PostResponse {
  /** Unique request identifier. */
  id: number;
  /** Server response. */
  response:
    /** Response containing requested information. */
    | {
      /** Indicates that this is an informational response. */
      type: "info";
      /** Contains the information data. */
      payload: {
        /** Type of information being returned. */
        type: string;
        /** Information specific data. */
        data: unknown;
      };
    }
    /** Response containing action result. */
    | {
      /** Indicates that this is an action response. */
      type: "action";
      /** Action result. */
      payload: {
        /** Response status indicating success or failure of the action. */
        status: "ok" | "err";
        /** Success data or error message. */
        response:
          | {
            /** Type of operation. */
            type: string;
            /** Specific data for the action. */
            data?: unknown;
          }
          | string;
      };
    };
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

const BlockDetails = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      blockTime: v.pipe(v.number(), v.integer(), v.minValue(0)),
      hash: v.pipe(v.string(), v.regex(/^0[xX][0-9a-fA-F]+$/), v.length(66)),
      height: v.pipe(v.number(), v.integer(), v.minValue(0)),
      numTxs: v.pipe(v.number(), v.integer(), v.minValue(0)),
      proposer: v.pipe(v.string(), v.regex(/^0[xX][0-9a-fA-F]+$/), v.length(42)),
    }),
  );
})();
type BlockDetails = v.InferOutput<typeof BlockDetails>;
const TxDetails = /* @__PURE__ */ (() => {
  return v.object({
    action: v.looseObject({ type: v.string() }),
    block: v.pipe(v.number(), v.integer(), v.minValue(0)),
    error: v.nullable(v.string()),
    hash: v.pipe(v.string(), v.regex(/^0[xX][0-9a-fA-F]+$/), v.length(66)),
    time: v.pipe(v.number(), v.integer(), v.minValue(0)),
    user: v.pipe(v.string(), v.regex(/^0[xX][0-9a-fA-F]+$/), v.length(42)),
  });
})();
type TxDetails = v.InferOutput<typeof TxDetails>;

const HyperliquidEventSchema = /* @__PURE__ */ (() => {
  return v.object({ channel: v.string(), data: v.unknown() });
})();
const ExplorerBlockEventSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.array(BlockDetails), v.minLength(1));
})();
const ExplorerTxsEventSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.array(TxDetails), v.minLength(1));
})();

/** Listens for WebSocket messages and sends them as Hyperliquid typed events. */
export class HyperliquidEventTarget extends TypedEventTarget<HyperliquidEventMap> {
  constructor(socket: WebSocket) {
    super();
    socket.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (v.is(HyperliquidEventSchema, msg)) {
          this.dispatchEvent(new CustomEvent_(msg.channel, { detail: msg.data }));
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
