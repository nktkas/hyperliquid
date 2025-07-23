import type { Hex } from "../mod.ts";

/**
 * Context events for a specific perpetual asset.
 * @returns {WsActiveAssetCtx | WsActiveSpotAssetCtx}
 */
export interface WsActiveAssetCtxRequest {
    /** Type of subscription. */
    type: "activeAssetCtx";
    /** Asset symbol (e.g., BTC). */
    coin: string;
}

/**
 * Best bid and offer events for a specific asset.
 * @returns {WsBbo}
 */
export interface WsBboRequest {
    /** Type of subscription. */
    type: "bbo";
    /** Asset symbol (e.g., BTC). */
    coin: string;
}

/**
 * Candlestick data events for a specific asset.
 * @returns {Candle}
 */
export interface WsCandleRequest {
    /** Type of subscription. */
    type: "candle";
    /** Asset symbol (e.g., BTC). */
    coin: string;
    /** Time interval. */
    interval: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
}

/**
 * Explorer block events.
 * @returns {WsBlockDetails[]}
 */
export interface WsExplorerBlockRequest {
    /** Type of subscription. */
    type: "explorerBlock";
}

/**
 * Explorer transaction events.
 * @returns {TxDetails[]}
 */
export interface WsExplorerTxsRequest {
    /** Type of subscription. */
    type: "explorerTxs";
}

/**
 * Notification events for a specific user.
 * @returns {WsNotification}
 */
export interface WsNotificationRequest {
    /** Type of subscription. */
    type: "notification";
    /** User address. */
    user: Hex;
}

/**
 * Order status events for a specific user.
 * @returns {OrderStatus<Order>[]}
 */
export interface WsOrderUpdatesRequest {
    /** Type of subscription. */
    type: "orderUpdates";
    /** User address. */
    user: Hex;
}

/**
 * Real-time trade updates for a specific asset.
 * @returns {WsTrade[]}
 */
export interface WsTradesRequest {
    /** Type of subscription. */
    type: "trades";
    /** Asset symbol (e.g., BTC). */
    coin: string;
}

/**
 * Non-order events for a specific user.
 * @returns {WsUserEvent}
 */
export interface WsUserEventsRequest {
    /** Type of subscription. */
    type: "userEvents";
    /** User address. */
    user: Hex;
}

/**
 * Funding payment events for a specific user.
 * @returns {WsUserFundings}
 */
export interface WsUserFundingsRequest {
    /** Type of subscription. */
    type: "userFundings";
    /** User address. */
    user: Hex;
}

/**
 * Non-funding ledger events for a specific user.
 * @returns {WsUserNonFundingLedgerUpdates}
 */
export interface WsUserNonFundingLedgerUpdatesRequest {
    /** Type of subscription. */
    type: "userNonFundingLedgerUpdates";
    /** User address. */
    user: Hex;
}

/**
 * TWAP order history events for a specific user.
 * @returns {WsUserTwapHistory}
 */
export interface WsUserTwapHistoryRequest {
    /** Type of subscription. */
    type: "userTwapHistory";
    /** User address. */
    user: Hex;
}

/**
 * Comprehensive user and market data events.
 * @returns {WsWebData2}
 */
export interface WsWebData2Request {
    /** Type of subscription. */
    type: "webData2";
    /** User address. */
    user: Hex;
}
