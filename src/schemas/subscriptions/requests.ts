import * as v from "valibot";
import { Hex } from "../_base.ts";

/**
 * Subscription to context events for a specific perpetual asset.
 * @returns {WsActiveAssetCtx | WsActiveSpotAssetCtx}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WsActiveAssetCtxRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("activeAssetCtx"),
            v.description("Type of subscription."),
        ),
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
    }),
    v.description("Subscription to context events for a specific perpetual asset."),
);
export type WsActiveAssetCtxRequest = v.InferOutput<typeof WsActiveAssetCtxRequest>;

/**
 * Subscription to active asset data events for a specific user and coin.
 * @returns {ActiveAssetData}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
 */
export const WsActiveAssetDataRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("activeAssetData"),
            v.description("Type of subscription."),
        ),
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Subscription to active asset data events for a specific user and coin."),
);
export type WsActiveAssetDataRequest = v.InferOutput<typeof WsActiveAssetDataRequest>;

/**
 * Subscription to mid price events for all coins.
 * @returns {AllMids}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
 */
export const WsAllMidsRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("allMids"),
            v.description("Type of subscription."),
        ),
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.optional(v.string()),
            v.description("DEX name (empty string for main dex)."),
        ),
    }),
    v.description("Subscription to mid price events for all coins."),
);
export type WsAllMidsRequest = v.InferOutput<typeof WsAllMidsRequest>;

/**
 * Subscription to context events for all perpetual assets.
 * @returns {WsAssetCtx[]}
 * @see null
 */
export const WsAssetCtxsRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("assetCtxs"),
            v.description("Type of subscription."),
        ),
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.optional(v.string()),
            v.description("DEX name (empty string for main dex)."),
        ),
    }),
    v.description("Subscription to context events for all perpetual assets."),
);
export type WsAssetCtxsRequest = v.InferOutput<typeof WsAssetCtxsRequest>;

/**
 * Subscription to best bid and offer events for a specific asset.
 * @returns {WsBbo}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WsBboRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("bbo"),
            v.description("Type of subscription."),
        ),
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
    }),
    v.description("Subscription to best bid and offer events for a specific asset."),
);
export type WsBboRequest = v.InferOutput<typeof WsBboRequest>;

/**
 * Subscription to candlestick events for a specific asset and time interval.
 * @returns {Candle}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WsCandleRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("candle"),
            v.description("Type of subscription."),
        ),
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
        /** Time interval. */
        interval: v.pipe(
            v.union([
                v.literal("1m"),
                v.literal("3m"),
                v.literal("5m"),
                v.literal("15m"),
                v.literal("30m"),
                v.literal("1h"),
                v.literal("2h"),
                v.literal("4h"),
                v.literal("8h"),
                v.literal("12h"),
                v.literal("1d"),
                v.literal("3d"),
                v.literal("1w"),
                v.literal("1M"),
            ]),
            v.description("Time interval."),
        ),
    }),
    v.description("Subscription to candlestick events for a specific asset and time interval."),
);
export type WsCandleRequest = v.InferOutput<typeof WsCandleRequest>;

/**
 * Subscription to clearinghouse state events for a specific user.
 * @returns {PerpsClearinghouseState}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
 */
export const WsClearinghouseStateRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("clearinghouseState"),
            v.description("Type of subscription."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.optional(v.string()),
            v.description("DEX name (empty string for main dex)."),
        ),
    }),
    v.description("Subscription to clearinghouse state events for a specific user."),
);
export type WsClearinghouseStateRequest = v.InferOutput<typeof WsClearinghouseStateRequest>;

/**
 * Subscription to L2 order book events for a specific asset.
 * @returns {Book}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
 */
export const WsL2BookRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("l2Book"),
            v.description("Type of subscription."),
        ),
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
        /** Number of significant figures. */
        nSigFigs: v.pipe(
            v.nullish(v.union([v.literal(2), v.literal(3), v.literal(4), v.literal(5)])),
            v.description("Number of significant figures."),
        ),
        /** Mantissa for aggregation (if `nSigFigs` is 5). */
        mantissa: v.pipe(
            v.nullish(v.union([v.literal(2), v.literal(5)])),
            v.description("Mantissa for aggregation (if `nSigFigs` is 5)."),
        ),
    }),
    v.description("Subscription to L2 order book events for a specific asset."),
);
export type WsL2BookRequest = v.InferOutput<typeof WsL2BookRequest>;

/**
 * Subscription to explorer block events.
 * @returns {WsBlockDetails[]}
 * @see null
 */
export const WsExplorerBlockRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("explorerBlock"),
            v.description("Type of subscription."),
        ),
    }),
    v.description("Subscription to explorer block events."),
);
export type WsExplorerBlockRequest = v.InferOutput<typeof WsExplorerBlockRequest>;

/**
 * Subscription to explorer transaction events.
 * @returns {TxDetails[]}
 * @see null
 */
export const WsExplorerTxsRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("explorerTxs"),
            v.description("Type of subscription."),
        ),
    }),
    v.description("Subscription to explorer transaction events."),
);
export type WsExplorerTxsRequest = v.InferOutput<typeof WsExplorerTxsRequest>;

/**
 * Subscription to notification events for a specific user.
 * @returns {WsNotification}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WsNotificationRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("notification"),
            v.description("Type of subscription."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Subscription to notification events for a specific user."),
);
export type WsNotificationRequest = v.InferOutput<typeof WsNotificationRequest>;

/**
 * Subscription to open order events for a specific user.
 * @returns {Order[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
 */
export const WsOpenOrdersRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("openOrders"),
            v.description("Type of subscription."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.optional(v.string()),
            v.description("DEX name (empty string for main dex)."),
        ),
    }),
    v.description("Subscription to open order events for a specific user."),
);
export type WsOpenOrdersRequest = v.InferOutput<typeof WsOpenOrdersRequest>;

/**
 * Subscription to order updates for a specific user.
 * @returns {OrderStatus>[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WsOrderUpdatesRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("orderUpdates"),
            v.description("Type of subscription."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Subscription to order updates for a specific user."),
);
export type WsOrderUpdatesRequest = v.InferOutput<typeof WsOrderUpdatesRequest>;

/**
 * Subscription to trade events for a specific asset.
 * @returns {WsTrade[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WsTradesRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("trades"),
            v.description("Type of subscription."),
        ),
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
    }),
    v.description("Subscription to trade events for a specific asset."),
);
export type WsTradesRequest = v.InferOutput<typeof WsTradesRequest>;

/**
 * Subscription to user events for a specific user.
 * @returns {WsUserEvent}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WsUserEventsRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("userEvents"),
            v.description("Type of subscription."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Subscription to user events for a specific user."),
);
export type WsUserEventsRequest = v.InferOutput<typeof WsUserEventsRequest>;

/**
 * Subscription to user fill events for a specific user.
 * @returns {Fill[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 */
export const WsUserFillsRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("userFills"),
            v.description("Type of subscription."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
        aggregateByTime: v.pipe(
            v.optional(v.boolean()),
            v.description("If true, partial fills are aggregated when a crossing order fills multiple resting orders."),
        ),
    }),
    v.description("Subscription to user fill events for a specific user."),
);
export type WsUserFillsRequest = v.InferOutput<typeof WsUserFillsRequest>;

/**
 * Subscription to user funding events for a specific user.
 * @returns {WsUserFundings}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WsUserFundingsRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("userFundings"),
            v.description("Type of subscription."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Subscription to user funding events for a specific user."),
);
export type WsUserFundingsRequest = v.InferOutput<typeof WsUserFundingsRequest>;

/**
 * Subscription to user non-funding ledger updates for a specific user.
 * @returns {WsUserNonFundingLedgerUpdates}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WsUserNonFundingLedgerUpdatesRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("userNonFundingLedgerUpdates"),
            v.description("Type of subscription."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Subscription to user non-funding ledger updates for a specific user."),
);
export type WsUserNonFundingLedgerUpdatesRequest = v.InferOutput<typeof WsUserNonFundingLedgerUpdatesRequest>;

/**
 * Subscription to user TWAP history events for a specific user.
 * @returns {WsUserTwapHistory}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WsUserTwapHistoryRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("userTwapHistory"),
            v.description("Type of subscription."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Subscription to user TWAP history events for a specific user."),
);
export type WsUserTwapHistoryRequest = v.InferOutput<typeof WsUserTwapHistoryRequest>;

/**
 * Subscription to user TWAP slice fill events for a specific user.
 * @returns {TwapSliceFill[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export const WsUserTwapSliceFillsRequest = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("userTwapSliceFills"),
            v.description("Type of subscription."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Subscription to user TWAP slice fill events for a specific user."),
);
export type WsUserTwapSliceFillsRequest = v.InferOutput<typeof WsUserTwapSliceFillsRequest>;

/**
 * Subscription to comprehensive user and market data events.
 * @returns {WsWebData2}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WsWebData2Request = v.pipe(
    v.object({
        /** Type of subscription. */
        type: v.pipe(
            v.literal("webData2"),
            v.description("Type of subscription."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Subscription to comprehensive user and market data events."),
);
export type WsWebData2Request = v.InferOutput<typeof WsWebData2Request>;
