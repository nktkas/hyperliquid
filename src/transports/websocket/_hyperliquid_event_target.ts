import { TypedEventTarget } from "@derzade/typescript-event-target";
import type { BlockDetails, TxDetails } from "../../types/explorer/responses.ts";

/** Represents a message from the Hyperliquid WebSocket API. */
interface HyperliquidMsg {
    /** Event channel name. */
    channel: string;
    /** Channel-specific data. */
    data: unknown;
}

/** Base system events and dynamic channel events for Hyperliquid WebSocket API. */
interface HyperliquidEventMap {
    /** Subscription created/removed event. */
    subscriptionResponse: CustomEvent<{
        /** Type of subscription operation. */
        method: "subscribe" | "unsubscribe";
        /** Original subscription request. */
        subscription: unknown;
    }>;

    /** Response to post request event. */
    post: CustomEvent<{
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
                /** Contains the action result data. */
                payload: {
                    /** Response status indicating success or failure of the action. */
                    status: "ok" | "err";
                    /** Success data or error message. */
                    response:
                        | {
                            /** Type of operation. */
                            type: string;
                            /** Specific data for the operation. */
                            data?: unknown;
                        }
                        | string;
                };
            };
    }>;

    /** Error response for message event. */
    error: CustomEvent<string>;

    /** Pong response event. */
    pong: CustomEvent<undefined>;

    /** Block explorer update event. */
    _explorerBlock: CustomEvent<Omit<BlockDetails, "txs">[]>;

    /** Transaction explorer update event. */
    _explorerTxs: CustomEvent<TxDetails[]>;

    /** Subscribed channel event. */
    [key: string]: CustomEvent<unknown>;
}

/** Listens for WebSocket messages and sends them as Hyperliquid typed events. */
export class HyperliquidEventTarget extends TypedEventTarget<HyperliquidEventMap> {
    constructor(socket: WebSocket) {
        super();
        socket.addEventListener("message", (event) => {
            try {
                const msg = JSON.parse(event.data) as unknown;
                if (isHyperliquidMsg(msg)) {
                    this.dispatchEvent(new CustomEvent(msg.channel, { detail: msg.data }));
                } else if (isExplorerBlockMsg(msg)) {
                    this.dispatchEvent(new CustomEvent("_explorerBlock", { detail: msg }));
                } else if (isExplorerTxsMsg(msg)) {
                    this.dispatchEvent(new CustomEvent("_explorerTxs", { detail: msg }));
                }
            } catch {
                // Ignore JSON parsing errors
            }
        });
    }
}

/** Type guard for Hyperliquid messages. */
function isHyperliquidMsg(value: unknown): value is HyperliquidMsg {
    return typeof value === "object" && value !== null &&
        "channel" in value && typeof value.channel === "string";
}

/** Type guard for explorer block messages. */
function isExplorerBlockMsg(value: unknown): value is Omit<BlockDetails, "txs">[] {
    return Array.isArray(value) && value.length > 0 &&
        value.every((block) =>
            typeof block === "object" && block !== null && !Array.isArray(block) &&
            "height" in block && typeof block.height === "number" &&
            "blockTime" in block && typeof block.blockTime === "number" &&
            "hash" in block && typeof block.hash === "string" &&
            "proposer" in block && typeof block.proposer === "string" &&
            "numTxs" in block && typeof block.numTxs === "number"
        );
}

/** Type guard for explorer transactions messages. */
function isExplorerTxsMsg(value: unknown): value is TxDetails[] {
    return Array.isArray(value) && value.length > 0 &&
        value.every((tx) => {
            return typeof tx === "object" && tx !== null && !Array.isArray(tx) &&
                "action" in tx && typeof tx.action === "object" && tx.action !== null &&
                "block" in tx && typeof tx.block === "number" &&
                "error" in tx && (typeof tx.error === "string" || tx.error === null) &&
                "hash" in tx && typeof tx.hash === "string" &&
                "time" in tx && typeof tx.time === "number" &&
                "user" in tx && typeof tx.user === "string";
        });
}
