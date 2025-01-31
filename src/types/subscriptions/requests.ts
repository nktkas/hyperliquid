import type { Hex } from "../common.ts";

/** Subscribe to context updates for a specific perpetual asset. */
export interface WsActiveAssetCtxRequest {
    /** Type of subscription. */
    type: "activeAssetCtx";
    /** Asset symbol. */
    coin: string;
}

/** Subscribe to trading data updates for a specific asset and user. */
export interface WsActiveAssetDataRequest {
    /** Type of subscription. */
    type: "activeAssetData";
    /** Asset symbol. */
    coin: string;
    /** User's address. */
    user: Hex;
}

/** Subscribe to mid prices for all actively traded assets. */
export interface WsAllMidsRequest {
    /** Type of subscription. */
    type: "allMids";
}

/** Subscribe to candlestick data updates for a specific asset. */
export interface WsCandleRequest {
    /** Type of subscription. */
    type: "candle";
    /** Asset symbol. */
    coin: string;
    /** Time interval (e.g., "15m"). */
    interval: string;
}

/** Subscribe to explorer block updates. */
export interface WsExplorerBlockRequest {
    /** Type of subscription. */
    type: "explorerBlock";
}

/** Subscribe to explorer transaction updates. */
export interface WsExplorerTxsRequest {
    /** Type of subscription. */
    type: "explorerTxs";
}

/** Subscribe to L2 order book updates for a specific asset. */
export interface WsL2BookRequest {
    /** Type of subscription. */
    type: "l2Book";
    /** Asset symbol. */
    coin: string;
    /**
     * Number of significant figures.
     * @defaultValue `null`
     */
    nSigFigs?: 2 | 3 | 4 | 5 | null;
    /**
     * Mantissa for aggregation.
     * @defaultValue `null`
     */
    mantissa?: 2 | 5 | null;
}

/** Subscribe to notification updates for a specific user. */
export interface WsNotificationRequest {
    /** Type of subscription. */
    type: "notification";
    /** User's address. */
    user: Hex;
}

/** Subscribe to order status updates for a specific user. */
export interface WsOrderUpdatesRequest {
    /** Type of subscription. */
    type: "orderUpdates";
    /** User's address. */
    user: Hex;
}

/** Subscribe to real-time trade updates for a specific asset. */
export interface WsTradesRequest {
    /** Type of subscription. */
    type: "trades";
    /** Asset symbol. */
    coin: string;
}

/** Subscribe to non-order events for a specific user. */
export interface WsUserEventsRequest {
    /** Type of subscription. */
    type: "userEvents";
    /** User's address. */
    user: Hex;
}

/** Subscribe to trade fill updates for a specific user. */
export interface WsUserFillsRequest {
    /** Type of subscription. */
    type: "userFills";
    /** User's address. */
    user: Hex;
    /**
     * Whether to aggregate fills by time.
     * @defaultValue `false`
     */
    aggregateByTime?: boolean;
}

/** Subscribe to funding payment updates for a specific user. */
export interface WsUserFundingsRequest {
    /** Type of subscription. */
    type: "userFundings";
    /** User's address. */
    user: Hex;
}

/** Subscribe to non-funding ledger updates for a specific user. */
export interface WsUserNonFundingLedgerUpdatesRequest {
    /** Type of subscription. */
    type: "userNonFundingLedgerUpdates";
    /** User's address. */
    user: Hex;
}

/** Subscribe to TWAP order history updates for a specific user. */
export interface WsUserTwapHistoryRequest {
    /** Type of subscription. */
    type: "userTwapHistory";
    /** User's address. */
    user: Hex;
}

/** Subscribe to TWAP execution updates for a specific user. */
export interface WsUserTwapSliceFillsRequest {
    /** Type of subscription. */
    type: "userTwapSliceFills";
    /** User's address. */
    user: Hex;
}

/** Subscribe to comprehensive user and market data updates. */
export interface WsWebData2Request {
    /** Type of subscription. */
    type: "webData2";
    /** User's address. */
    user: Hex;
}
