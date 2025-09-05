import * as v from "valibot";
import { Hex, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import {
    FundingUpdate,
    PerpsClearinghouseState,
    SpotClearinghouseState,
    UserFundingUpdate,
    UserNonFundingLedgerUpdate,
} from "../info/accounts.ts";
import { AllMids, PerpsAssetCtx, PerpsMeta, SpotAssetCtx } from "../info/assets.ts";
import { BookLevel, Fill, FrontendOrder, TwapHistory, TwapSliceFill, TwapState } from "../info/orders.ts";
import { BlockDetails } from "../explorer/responses.ts";

/** Active perpetual asset context. */
export const WsActiveAssetCtx = v.pipe(
    v.object({
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
        /** Context information for the perpetual asset. */
        ctx: v.pipe(
            PerpsAssetCtx,
            v.description("Context information for the perpetual asset."),
        ),
    }),
    v.description("Active perpetual asset context."),
);
export type WsActiveAssetCtx = v.InferOutput<typeof WsActiveAssetCtx>;

/** Active spot asset context. */
export const WsActiveSpotAssetCtx = v.pipe(
    v.object({
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
        /** Context information for the spot asset. */
        ctx: v.pipe(
            SpotAssetCtx,
            v.description("Context information for the spot asset."),
        ),
    }),
    v.description("Active spot asset context."),
);
export type WsActiveSpotAssetCtx = v.InferOutput<typeof WsActiveSpotAssetCtx>;

/** Mid prices for all assets. */
export const WsAllMids = v.pipe(
    v.object({
        /** Mapping of coin symbols to mid prices. */
        mids: v.pipe(
            AllMids,
            v.description("Mapping of coin symbols to mid prices."),
        ),
    }),
    v.description("Mid prices for all assets."),
);
export type WsAllMids = v.InferOutput<typeof WsAllMids>;

/** Asset contexts for all perpetual assets on a specified DEX. */
export const WsAssetCtxs = v.pipe(
    v.object({
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.string(),
            v.description("DEX name (empty string for main dex)."),
        ),
        /** Array of context information for each perpetual asset. */
        ctxs: v.pipe(
            v.array(PerpsAssetCtx),
            v.description("Array of context information for each perpetual asset."),
        ),
    }),
    v.description("Asset contexts for all perpetual assets on a specified DEX."),
);
export type WsAssetCtxs = v.InferOutput<typeof WsAssetCtxs>;

/** Best Bid and Offer. */
export const WsBbo = v.pipe(
    v.object({
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
        /** Time of the BBO update (in ms since epoch). */
        time: v.pipe(
            UnsignedInteger,
            v.description("Time of the BBO update (in ms since epoch)."),
        ),
        /** Best bid and offer tuple [bid, offer], either can be undefined if unavailable. */
        bbo: v.pipe(
            v.tuple([
                v.union([BookLevel, v.undefined()]),
                v.union([BookLevel, v.undefined()]),
            ]),
            v.description("Best bid and offer tuple [bid, offer], either can be undefined if unavailable."),
        ),
    }),
    v.description("Best Bid and Offer."),
);
export type WsBbo = v.InferOutput<typeof WsBbo>;

/** Block details. */
export const WsBlockDetails = v.pipe(
    v.omit(v.object(BlockDetails.entries), ["txs"]),
    v.description("Block details."),
);
export type WsBlockDetails = v.InferOutput<typeof WsBlockDetails>;

/** Clearinghouse state for a specific user. */
export const WsClearinghouseState = v.pipe(
    v.object({
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.string(),
            v.description("DEX name (empty string for main dex)."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Perpetual clearinghouse state. */
        clearinghouseState: v.pipe(
            PerpsClearinghouseState,
            v.description("Perpetual clearinghouse state."),
        ),
    }),
    v.description("Clearinghouse state for a specific user."),
);
export type WsClearinghouseState = v.InferOutput<typeof WsClearinghouseState>;

/** User notifications. */
export const WsNotification = v.pipe(
    v.object({
        /** Notification content. */
        notification: v.pipe(
            v.string(),
            v.description("Notification content."),
        ),
    }),
    v.description("User notifications."),
);
export type WsNotification = v.InferOutput<typeof WsNotification>;

/** Open orders for a specific user. */
export const WsOpenOrders = v.pipe(
    v.object({
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.string(),
            v.description("DEX name (empty string for main dex)."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Array of open orders. */
        orders: v.pipe(
            v.array(FrontendOrder),
            v.description("Array of open orders."),
        ),
    }),
    v.description("Open orders for a specific user."),
);
export type WsOpenOrders = v.InferOutput<typeof WsOpenOrders>;

/** Trade information. */
export const WsTrade = v.pipe(
    v.object({
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
        /** Trade side ("B" = Bid/Buy, "A" = Ask/Sell). */
        side: v.pipe(
            v.union([v.literal("B"), v.literal("A")]),
            v.description('Trade side ("B" = Bid/Buy, "A" = Ask/Sell).'),
        ),
        /** Trade price. */
        px: v.pipe(
            UnsignedDecimal,
            v.description("Trade price."),
        ),
        /** Trade size. */
        sz: v.pipe(
            UnsignedDecimal,
            v.description("Trade size."),
        ),
        /** Trade timestamp (in ms since epoch). */
        time: v.pipe(
            UnsignedInteger,
            v.description("Trade timestamp (in ms since epoch)."),
        ),
        /** Transaction hash. */
        hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("Transaction hash."),
        ),
        /** Trade ID. */
        tid: v.pipe(
            UnsignedInteger,
            v.description("Trade ID."),
        ),
        /** Addresses of users involved in the trade [Maker, Taker]. */
        users: v.pipe(
            v.tuple([v.pipe(Hex, v.length(42)), v.pipe(Hex, v.length(42))]),
            v.description("Addresses of users involved in the trade [Maker, Taker]."),
        ),
    }),
    v.description("Trade information."),
);
export type WsTrade = v.InferOutput<typeof WsTrade>;

/** User fill event. */
export const WsUserEventFill = v.pipe(
    v.object({
        /** Array of trade fills. */
        fills: v.pipe(
            v.array(Fill),
            v.description("Array of trade fills."),
        ),
    }),
    v.description("User fill event."),
);
export type WsUserEventFill = v.InferOutput<typeof WsUserEventFill>;

/** User funding event. */
export const WsUserEventFunding = v.pipe(
    v.object({
        /** Funding update details. */
        funding: v.pipe(
            v.omit(v.object(FundingUpdate.entries), ["type"]),
            v.description("Funding update details."),
        ),
    }),
    v.description("User funding event."),
);
export type WsUserEventFunding = v.InferOutput<typeof WsUserEventFunding>;

/** User liquidation event. */
export const WsUserEventLiquidation = v.pipe(
    v.object({
        /** Liquidation event details. */
        liquidation: v.pipe(
            v.object({
                /** Unique liquidation ID. */
                lid: v.pipe(
                    UnsignedInteger,
                    v.description("Unique liquidation ID."),
                ),
                /** Address of the liquidator. */
                liquidator: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Address of the liquidator."),
                ),
                /** Address of the liquidated user. */
                liquidated_user: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Address of the liquidated user."),
                ),
                /** Notional position size that was liquidated. */
                liquidated_ntl_pos: v.pipe(
                    UnsignedDecimal,
                    v.description("Notional position size that was liquidated."),
                ),
                /** Account value at time of liquidation. */
                liquidated_account_value: v.pipe(
                    UnsignedDecimal,
                    v.description("Account value at time of liquidation."),
                ),
            }),
            v.description("Liquidation event details."),
        ),
    }),
    v.description("User liquidation event."),
);
export type WsUserEventLiquidation = v.InferOutput<typeof WsUserEventLiquidation>;

/** Non-user initiated order cancellation event. */
export const WsUserEventNonUserCancel = v.pipe(
    v.object({
        /** Array of cancelled orders not initiated by the user. */
        nonUserCancel: v.pipe(
            v.array(
                v.object({
                    /** Asset symbol (e.g., BTC). */
                    coin: v.pipe(
                        v.string(),
                        v.description("Asset symbol (e.g., BTC)."),
                    ),
                    /** Order ID. */
                    oid: v.pipe(
                        UnsignedInteger,
                        v.description("Order ID."),
                    ),
                }),
            ),
            v.description("Array of cancelled orders not initiated by the user."),
        ),
    }),
    v.description("Non-user initiated order cancellation event."),
);
export type WsUserEventNonUserCancel = v.InferOutput<typeof WsUserEventNonUserCancel>;

/** User TWAP history event. */
export const WsUserEventTwapHistory = v.pipe(
    v.object({
        /** Array of historical TWAP fills. */
        twapHistory: v.pipe(
            v.array(TwapHistory),
            v.description("Array of historical TWAP fills."),
        ),
    }),
    v.description("User TWAP history event."),
);
export type WsUserEventTwapHistory = v.InferOutput<typeof WsUserEventTwapHistory>;

/** User TWAP slice fills event. */
export const WsUserEventTwapSliceFills = v.pipe(
    v.object({
        /** Array of TWAP slice fills. */
        twapSliceFills: v.pipe(
            v.array(TwapSliceFill),
            v.description("Array of TWAP slice fills."),
        ),
    }),
    v.description("User TWAP slice fills event."),
);
export type WsUserEventTwapSliceFills = v.InferOutput<typeof WsUserEventTwapSliceFills>;

/** User event. */
export const WsUserEvent = v.pipe(
    v.union([
        WsUserEventFill,
        WsUserEventFunding,
        WsUserEventLiquidation,
        WsUserEventNonUserCancel,
        WsUserEventTwapHistory,
        WsUserEventTwapSliceFills,
    ]),
    v.description("User event."),
);
export type WsUserEvent = v.InferOutput<typeof WsUserEvent>;

/** User fills. */
export const WsUserFills = v.pipe(
    v.object({
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Array of fill events. */
        fills: v.pipe(
            v.array(Fill),
            v.description("Array of fill events."),
        ),
        /** Whether this is an initial snapshot. */
        isSnapshot: v.pipe(
            v.optional(v.literal(true)),
            v.description("Whether this is an initial snapshot."),
        ),
    }),
    v.description("User fills."),
);
export type WsUserFills = v.InferOutput<typeof WsUserFills>;

/** User fundings. */
export const WsUserFundings = v.pipe(
    v.object({
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Array of funding events. */
        fundings: v.pipe(
            v.array(
                v.object({
                    ...v.omit(v.object(FundingUpdate.entries), ["type"]).entries,
                    ...v.pick(v.object(UserFundingUpdate.entries), ["time"]).entries,
                }),
            ),
            v.description("Array of funding events."),
        ),
        /** Whether this is an initial snapshot. */
        isSnapshot: v.pipe(
            v.optional(v.literal(true)),
            v.description("Whether this is an initial snapshot."),
        ),
    }),
    v.description("User fundings."),
);
export type WsUserFundings = v.InferOutput<typeof WsUserFundings>;

/** User non-funding ledger updates. */
export const WsUserNonFundingLedgerUpdates = v.pipe(
    v.object({
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Array of non-funding ledger updates. */
        nonFundingLedgerUpdates: v.pipe(
            v.array(UserNonFundingLedgerUpdate),
            v.description("Array of non-funding ledger updates."),
        ),
        /** Whether this is an initial snapshot. */
        isSnapshot: v.pipe(
            v.optional(v.literal(true)),
            v.description("Whether this is an initial snapshot."),
        ),
    }),
    v.description("User non-funding ledger updates."),
);
export type WsUserNonFundingLedgerUpdates = v.InferOutput<typeof WsUserNonFundingLedgerUpdates>;

/** User TWAP history. */
export const WsUserTwapHistory = v.pipe(
    v.object({
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Array of historical TWAP fills. */
        history: v.pipe(
            v.array(TwapHistory),
            v.description("Array of historical TWAP fills."),
        ),
        /** Whether this is an initial snapshot. */
        isSnapshot: v.pipe(
            v.optional(v.literal(true)),
            v.description("Whether this is an initial snapshot."),
        ),
    }),
    v.description("User TWAP history."),
);
export type WsUserTwapHistory = v.InferOutput<typeof WsUserTwapHistory>;

/** User TWAP slice fills. */
export const WsUserTwapSliceFills = v.pipe(
    v.object({
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Array of TWAP slice fills. */
        twapSliceFills: v.pipe(
            v.array(TwapSliceFill),
            v.description("Array of TWAP slice fills."),
        ),
        /** Whether this is an initial snapshot. */
        isSnapshot: v.pipe(
            v.optional(v.literal(true)),
            v.description("Whether this is an initial snapshot."),
        ),
    }),
    v.description("User TWAP slice fills."),
);
export type WsUserTwapSliceFills = v.InferOutput<typeof WsUserTwapSliceFills>;

/** Comprehensive user and market data. */
export const WsWebData2 = v.pipe(
    v.object({
        /** Account summary for perpetual trading. */
        clearinghouseState: v.pipe(
            PerpsClearinghouseState,
            v.description("Account summary for perpetual trading."),
        ),
        /** Leading vaults information. */
        leadingVaults: v.pipe(
            v.array(
                v.object({
                    /** Address of the vault. */
                    address: v.pipe(
                        v.pipe(Hex, v.length(42)),
                        v.description("Address of the vault."),
                    ),
                    /** Name of the vault. */
                    name: v.pipe(
                        v.string(),
                        v.description("Name of the vault."),
                    ),
                }),
            ),
            v.description("Leading vaults information."),
        ),
        /** Total equity in vaults. */
        totalVaultEquity: v.pipe(
            UnsignedDecimal,
            v.description("Total equity in vaults."),
        ),
        /** User open orders with frontend information. */
        openOrders: v.pipe(
            v.array(FrontendOrder),
            v.description("User open orders with frontend information."),
        ),
        /** Agent address if one exists. */
        agentAddress: v.pipe(
            v.union([v.pipe(Hex, v.length(42)), v.null()]),
            v.description("Agent address if one exists."),
        ),
        /** Timestamp until which the agent is valid. */
        agentValidUntil: v.pipe(
            v.union([UnsignedInteger, v.null()]),
            v.description("Timestamp until which the agent is valid."),
        ),
        /** Cumulative ledger value. */
        cumLedger: v.pipe(
            UnsignedDecimal,
            v.description("Cumulative ledger value."),
        ),
        /** Metadata for perpetual assets. */
        meta: v.pipe(
            PerpsMeta,
            v.description("Metadata for perpetual assets."),
        ),
        /** Context information for perpetual assets. */
        assetCtxs: v.pipe(
            v.array(PerpsAssetCtx),
            v.description("Context information for perpetual assets."),
        ),
        /** Server timestamp (in ms since epoch). */
        serverTime: v.pipe(
            UnsignedInteger,
            v.description("Server timestamp (in ms since epoch)."),
        ),
        /** Whether this account is a vault. */
        isVault: v.pipe(
            v.boolean(),
            v.description("Whether this account is a vault."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** TWAP states. */
        twapStates: v.pipe(
            v.array(v.tuple([UnsignedInteger, TwapState])),
            v.description("TWAP states."),
        ),
        /** Account summary for spot trading. */
        spotState: v.pipe(
            v.optional(SpotClearinghouseState),
            v.description("Account summary for spot trading."),
        ),
        /** Context information for spot assets. */
        spotAssetCtxs: v.pipe(
            v.array(SpotAssetCtx),
            v.description("Context information for spot assets."),
        ),
        /** Whether the user has opted out of spot dusting. */
        optOutOfSpotDusting: v.pipe(
            v.optional(v.literal(true)),
            v.description("Whether the user has opted out of spot dusting."),
        ),
        /** Assets currently at their open interest cap. */
        perpsAtOpenInterestCap: v.pipe(
            v.optional(v.array(v.string())),
            v.description("Assets currently at their open interest cap."),
        ),
    }),
    v.description("Comprehensive user and market data."),
);
export type WsWebData2 = v.InferOutput<typeof WsWebData2>;
