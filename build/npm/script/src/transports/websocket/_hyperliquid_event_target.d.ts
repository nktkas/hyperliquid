import type { BlockDetails, TxDetails } from "../../types/mod.js";
/** Response to subscribe to or unsubscribe from an event. */
interface SubscriptionResponse {
    /** Type of subscription operation. */
    method: "subscribe" | "unsubscribe";
    /** Original subscription request. */
    subscription: unknown;
}
/** Response to post request. */
interface PostResponse {
    /** Unique request identifier. */
    id: number;
    /** Server response. */
    response: 
    /** Response containing requested information. */
    {
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
            response: {
                /** Type of operation. */
                type: string;
                /** Specific data for the action. */
                data?: unknown;
            } | string;
        };
    };
}
/** Base system events and dynamic channel events for Hyperliquid WebSocket API. */
export interface HyperliquidEventMap {
    subscriptionResponse: CustomEvent<SubscriptionResponse>;
    post: CustomEvent<PostResponse>;
    error: CustomEvent<string>;
    pong: CustomEvent<undefined>;
    _explorerBlock: CustomEvent<Omit<BlockDetails, "txs">[]>;
    _explorerTxs: CustomEvent<TxDetails[]>;
    [key: string]: CustomEvent<any>;
}
/** Listens for WebSocket messages and sends them as Hyperliquid typed events. */
export declare class HyperliquidEventTarget extends EventTarget {
    constructor(socket: WebSocket);
}
export {};
//# sourceMappingURL=_hyperliquid_event_target.d.ts.map