import { TypedEventTarget } from "typescript-event-target";
import * as v from "valibot";
import { CustomEvent_ } from "../_polyfills.ts";
import { BlockDetails, TxDetails } from "../../schemas/mod.ts";

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
    _explorerBlock: CustomEvent<Omit<BlockDetails, "txs">[]>;
    _explorerTxs: CustomEvent<TxDetails[]>;
    // deno-lint-ignore no-explicit-any
    [key: string]: CustomEvent<any>;
}

const HyperliquidEventSchema = v.object({ channel: v.string(), data: v.unknown() });
const ExplorerBlockEventSchema = v.pipe(
    v.array(v.omit(v.object({ ...BlockDetails.entries }), ["txs"])),
    v.minLength(1),
);
const ExplorerTxsEventSchema = v.pipe(v.array(TxDetails), v.minLength(1));

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
