import * as v from "valibot";
import { Hex, UnsignedIntegerMayInputString } from "../_base.ts";

/**
 * Request user active asset data.
 * @returns {ActiveAssetData}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
 */
export const ActiveAssetDataRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("activeAssetData"),
            v.description("Type of request."),
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
    v.description("Request user active asset data."),
);
export type ActiveAssetDataRequest = v.InferOutput<typeof ActiveAssetDataRequest>;

/**
 * Request mid coin prices.
 * @returns {AllMids}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
 */
export const AllMidsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("allMids"),
            v.description("Type of request."),
        ),
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.optional(v.string()),
            v.description("DEX name (empty string for main dex)."),
        ),
    }),
    v.description("Request mid coin prices."),
);
export type AllMidsRequest = v.InferOutput<typeof AllMidsRequest>;

/**
 * Request candlestick snapshots.
 * @returns {Candle[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
 */
export const CandleSnapshotRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("candleSnapshot"),
            v.description("Type of request."),
        ),
        /** Request parameters. */
        req: v.pipe(
            v.object({
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
                /** Start time (in ms since epoch). */
                startTime: v.pipe(
                    UnsignedIntegerMayInputString,
                    v.description("Start time (in ms since epoch)."),
                ),
                /** End time (in ms since epoch). */
                endTime: v.pipe(
                    v.nullish(UnsignedIntegerMayInputString),
                    v.description("End time (in ms since epoch)."),
                ),
            }),
            v.description("Request parameters."),
        ),
    }),
    v.description("Request candlestick snapshots."),
);
export type CandleSnapshotRequest = v.InferOutput<typeof CandleSnapshotRequest>;

/**
 * Request clearinghouse state.
 * @returns {PerpsClearinghouseState}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
 */
export const ClearinghouseStateRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("clearinghouseState"),
            v.description("Type of request."),
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
    v.description("Request clearinghouse state."),
);
export type ClearinghouseStateRequest = v.InferOutput<typeof ClearinghouseStateRequest>;

/**
 * Request user staking delegations.
 * @returns {Delegation[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
 */
export const DelegationsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("delegations"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user staking delegations."),
);
export type DelegationsRequest = v.InferOutput<typeof DelegationsRequest>;

/**
 * Request user staking history.
 * @returns {DelegatorUpdate[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
 */
export const DelegatorHistoryRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("delegatorHistory"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user staking history."),
);
export type DelegatorHistoryRequest = v.InferOutput<typeof DelegatorHistoryRequest>;

/**
 * Request user staking rewards.
 * @returns {DelegatorReward[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards
 */
export const DelegatorRewardsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("delegatorRewards"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user staking rewards."),
);
export type DelegatorRewardsRequest = v.InferOutput<typeof DelegatorRewardsRequest>;

/**
 * Request user staking summary.
 * @returns {DelegatorSummary}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
 */
export const DelegatorSummaryRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("delegatorSummary"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user staking summary."),
);
export type DelegatorSummaryRequest = v.InferOutput<typeof DelegatorSummaryRequest>;

/**
 * Request exchange status information.
 * @returns {ExchangeStatus}
 * @see null
 */
export const ExchangeStatusRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("exchangeStatus"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request exchange status information."),
);
export type ExchangeStatusRequest = v.InferOutput<typeof ExchangeStatusRequest>;

/**
 * Request user extra agents.
 * @returns {ExtraAgent[]}
 * @see null
 */
export const ExtraAgentsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("extraAgents"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user extra agents."),
);
export type ExtraAgentsRequest = v.InferOutput<typeof ExtraAgentsRequest>;

/**
 * Request frontend open orders.
 * @returns {FrontendOrder[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info
 */
export const FrontendOpenOrdersRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("frontendOpenOrders"),
            v.description("Type of request."),
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
    v.description("Request frontend open orders."),
);
export type FrontendOpenOrdersRequest = v.InferOutput<typeof FrontendOpenOrdersRequest>;

/**
 * Request funding history.
 * @returns {FundingHistory[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
 */
export const FundingHistoryRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("fundingHistory"),
            v.description("Type of request."),
        ),
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
        /** Start time (in ms since epoch). */
        startTime: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Start time (in ms since epoch)."),
        ),
        /** End time (in ms since epoch). */
        endTime: v.pipe(
            v.nullish(UnsignedIntegerMayInputString),
            v.description("End time (in ms since epoch)."),
        ),
    }),
    v.description("Request funding history."),
);
export type FundingHistoryRequest = v.InferOutput<typeof FundingHistoryRequest>;

/**
 * Request user historical orders.
 * @returns {FrontendOrderStatus[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
 */
export const HistoricalOrdersRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("historicalOrders"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user historical orders."),
);
export type HistoricalOrdersRequest = v.InferOutput<typeof HistoricalOrdersRequest>;

/**
 * Request to check if a user is a VIP.
 * @returns {boolean | null}
 * @see null
 */
export const IsVipRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("isVip"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request to check if a user is a VIP."),
);
export type IsVipRequest = v.InferOutput<typeof IsVipRequest>;

/**
 * Request L2 order book.
 * @returns {Book}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
 */
export const L2BookRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("l2Book"),
            v.description("Type of request."),
        ),
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
        /** Number of significant figures. */
        nSigFigs: v.pipe(
            v.nullish(
                v.pipe(
                    UnsignedIntegerMayInputString,
                    v.union([v.literal(2), v.literal(3), v.literal(4), v.literal(5)]),
                ),
            ),
            v.description("Number of significant figures."),
        ),
        /** Mantissa for aggregation (if `nSigFigs` is 5). */
        mantissa: v.pipe(
            v.nullish(
                v.pipe(
                    UnsignedIntegerMayInputString,
                    v.union([v.literal(2), v.literal(5)]),
                ),
            ),
            v.description("Mantissa for aggregation (if `nSigFigs` is 5)."),
        ),
    }),
    v.description("Request L2 order book."),
);
export type L2BookRequest = v.InferOutput<typeof L2BookRequest>;

/**
 * Request leading vaults for a user.
 * @returns {VaultLeading[]}
 * @see null
 */
export const LeadingVaultsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("leadingVaults"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request leading vaults for a user."),
);
export type LeadingVaultsRequest = v.InferOutput<typeof LeadingVaultsRequest>;

/**
 * Request legal verification status of a user.
 * @returns {LegalCheck}
 * @see null
 */
export const LegalCheckRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("legalCheck"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request legal verification status of a user."),
);
export type LegalCheckRequest = v.InferOutput<typeof LegalCheckRequest>;

/**
 * Request liquidatable.
 * @returns {unknown[]} FIXME: Define the return type
 * @see null
 */
export const LiquidatableRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("liquidatable"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request liquidatable."),
);
export type LiquidatableRequest = v.InferOutput<typeof LiquidatableRequest>;

/**
 * Request margin table data.
 * @returns {MarginTable}
 * @see null
 */
export const MarginTableRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("marginTable"),
            v.description("Type of request."),
        ),
        /** Margin requirements table. */
        id: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Margin requirements table."),
        ),
    }),
    v.description("Request margin table data."),
);
export type MarginTableRequest = v.InferOutput<typeof MarginTableRequest>;

/**
 * Request builder fee approval.
 * @returns {number}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval
 */
export const MaxBuilderFeeRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("maxBuilderFee"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Builder address. */
        builder: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Builder address."),
        ),
    }),
    v.description("Request builder fee approval."),
);
export type MaxBuilderFeeRequest = v.InferOutput<typeof MaxBuilderFeeRequest>;

/**
 * Request maximum market order notionals.
 * @returns {[number, string][]}
 * @see null
 */
export const MaxMarketOrderNtlsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("maxMarketOrderNtls"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request maximum market order notionals."),
);
export type MaxMarketOrderNtlsRequest = v.InferOutput<typeof MaxMarketOrderNtlsRequest>;

/**
 * Request trading metadata.
 * @returns {PerpsMeta}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata-universe-and-margin-tables
 */
export const MetaRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("meta"),
            v.description("Type of request."),
        ),
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.optional(v.string()),
            v.description("DEX name (empty string for main dex)."),
        ),
    }),
    v.description("Request trading metadata."),
);
export type MetaRequest = v.InferOutput<typeof MetaRequest>;

/**
 * Request metadata and asset contexts.
 * @returns {PerpsMetaAndAssetCtxs}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
 */
export const MetaAndAssetCtxsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("metaAndAssetCtxs"),
            v.description("Type of request."),
        ),
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.optional(v.string()),
            v.description("DEX name (empty string for main dex)."),
        ),
    }),
    v.description("Request metadata and asset contexts."),
);
export type MetaAndAssetCtxsRequest = v.InferOutput<typeof MetaAndAssetCtxsRequest>;

/**
 * Request open orders.
 * @returns {Order[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
 */
export const OpenOrdersRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("openOrders"),
            v.description("Type of request."),
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
    v.description("Request open orders."),
);
export type OpenOrdersRequest = v.InferOutput<typeof OpenOrdersRequest>;

/**
 * Request order status.
 * @returns {OrderLookup}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
 */
export const OrderStatusRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("orderStatus"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Order ID or Client Order ID. */
        oid: v.pipe(
            v.union([UnsignedIntegerMayInputString, v.pipe(Hex, v.length(34))]),
            v.description("Order ID or Client Order ID."),
        ),
    }),
    v.description("Request order status."),
);
export type OrderStatusRequest = v.InferOutput<typeof OrderStatusRequest>;

/**
 * Request for the status of the perpetual deploy auction.
 * @returns {DeployAuctionStatus}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-information-about-the-perp-deploy-auction
 */
export const PerpDeployAuctionStatusRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("perpDeployAuctionStatus"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request for the status of the perpetual deploy auction."),
);
export type PerpDeployAuctionStatusRequest = v.InferOutput<typeof PerpDeployAuctionStatusRequest>;

/**
 * Request all perpetual dexs.
 * @returns {PerpDexs}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
 */
export const PerpDexsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("perpDexs"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request all perpetual dexs."),
);
export type PerpDexsRequest = v.InferOutput<typeof PerpDexsRequest>;

/**
 * Request perpetuals at open interest cap.
 * @returns {string[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
 */
export const PerpsAtOpenInterestCapRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("perpsAtOpenInterestCap"),
            v.description("Type of request."),
        ),
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.optional(v.string()),
            v.description("DEX name (empty string for main dex)."),
        ),
    }),
    v.description("Request perpetuals at open interest cap."),
);
export type PerpsAtOpenInterestCapRequest = v.InferOutput<typeof PerpsAtOpenInterestCapRequest>;

/**
 * Request user portfolio.
 * @returns {PortfolioPeriods}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-portfolio
 */
export const PortfolioRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("portfolio"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user portfolio."),
);
export type PortfolioRequest = v.InferOutput<typeof PortfolioRequest>;

/**
 * Request predicted funding rates.
 * @returns {PredictedFunding[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
 */
export const PredictedFundingsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("predictedFundings"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request predicted funding rates."),
);
export type PredictedFundingsRequest = v.InferOutput<typeof PredictedFundingsRequest>;

/**
 * Request user existence check before transfer.
 * @returns {PreTransferCheck}
 * @see null
 */
export const PreTransferCheckRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("preTransferCheck"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Source address. */
        source: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Source address."),
        ),
    }),
    v.description("Request user existence check before transfer."),
);
export type PreTransferCheckRequest = v.InferOutput<typeof PreTransferCheckRequest>;

/**
 * Request user referral.
 * @returns {Referral}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
 */
export const ReferralRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("referral"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user referral."),
);
export type ReferralRequest = v.InferOutput<typeof ReferralRequest>;

/**
 * Request spot clearinghouse state.
 * @returns {SpotClearinghouseState}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
 */
export const SpotClearinghouseStateRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("spotClearinghouseState"),
            v.description("Type of request."),
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
    v.description("Request spot clearinghouse state."),
);
export type SpotClearinghouseStateRequest = v.InferOutput<typeof SpotClearinghouseStateRequest>;

/**
 * Request spot deploy state.
 * @returns {SpotDeployState}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
 */
export const SpotDeployStateRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("spotDeployState"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request spot deploy state."),
);
export type SpotDeployStateRequest = v.InferOutput<typeof SpotDeployStateRequest>;

/**
 * Request spot trading metadata.
 * @returns {SpotMeta}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
 */
export const SpotMetaRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("spotMeta"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request spot trading metadata."),
);
export type SpotMetaRequest = v.InferOutput<typeof SpotMetaRequest>;

/**
 * Request spot metadata and asset contexts.
 * @returns {SpotMetaAndAssetCtxs}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
 */
export const SpotMetaAndAssetCtxsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("spotMetaAndAssetCtxs"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request spot metadata and asset contexts."),
);
export type SpotMetaAndAssetCtxsRequest = v.InferOutput<typeof SpotMetaAndAssetCtxsRequest>;

/**
 * Request for the status of the spot deploy auction.
 * @returns {DeployAuctionStatus}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-pair-deploy-auction
 */
export const SpotPairDeployAuctionStatusRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("spotPairDeployAuctionStatus"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request for the status of the spot deploy auction."),
);
export type SpotPairDeployAuctionStatusRequest = v.InferOutput<typeof SpotPairDeployAuctionStatusRequest>;

/**
 * Request user sub-accounts.
 * @returns {SubAccount[] | null}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 */
export const SubAccountsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("subAccounts"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user sub-accounts."),
);
export type SubAccountsRequest = v.InferOutput<typeof SubAccountsRequest>;

/**
 * Request token details.
 * @returns {TokenDetails}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token
 */
export const TokenDetailsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("tokenDetails"),
            v.description("Type of request."),
        ),
        /** Token ID. */
        tokenId: v.pipe(
            v.pipe(Hex, v.length(34)),
            v.description("Token ID."),
        ),
    }),
    v.description("Request token details."),
);
export type TokenDetailsRequest = v.InferOutput<typeof TokenDetailsRequest>;

/**
 * Request twap history of a user.
 * @returns {TwapHistory[]}
 * @see null
 */
export const TwapHistoryRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("twapHistory"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request twap history of a user."),
);
export type TwapHistoryRequest = v.InferOutput<typeof TwapHistoryRequest>;

/**
 * Request user fees.
 * @returns {UserFees}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
 */
export const UserFeesRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("userFees"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user fees."),
);
export type UserFeesRequest = v.InferOutput<typeof UserFeesRequest>;

/**
 * Request user fills.
 * @returns {Fill[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 */
export const UserFillsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("userFills"),
            v.description("Type of request."),
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
    v.description("Request user fills."),
);
export type UserFillsRequest = v.InferOutput<typeof UserFillsRequest>;

/**
 * Request user fills by time.
 * @returns {Fill[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
 */
export const UserFillsByTimeRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("userFillsByTime"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Start time (in ms since epoch). */
        startTime: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Start time (in ms since epoch)."),
        ),
        /** End time (in ms since epoch). */
        endTime: v.pipe(
            v.nullish(UnsignedIntegerMayInputString),
            v.description("End time (in ms since epoch)."),
        ),
        /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
        aggregateByTime: v.pipe(
            v.optional(v.boolean()),
            v.description("If true, partial fills are aggregated when a crossing order fills multiple resting orders."),
        ),
    }),
    v.description("Request user fills by time."),
);
export type UserFillsByTimeRequest = v.InferOutput<typeof UserFillsByTimeRequest>;

/**
 * Request user funding.
 * @returns {UserFundingUpdate[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export const UserFundingRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("userFunding"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Start time (in ms since epoch). */
        startTime: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Start time (in ms since epoch)."),
        ),
        /** End time (in ms since epoch). */
        endTime: v.pipe(
            v.nullish(UnsignedIntegerMayInputString),
            v.description("End time (in ms since epoch)."),
        ),
    }),
    v.description("Request user funding."),
);
export type UserFundingRequest = v.InferOutput<typeof UserFundingRequest>;

/**
 * Request user non-funding ledger updates.
 * @returns {UserNonFundingLedgerUpdate[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export const UserNonFundingLedgerUpdatesRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("userNonFundingLedgerUpdates"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Start time (in ms since epoch). */
        startTime: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Start time (in ms since epoch)."),
        ),
        /** End time (in ms since epoch). */
        endTime: v.pipe(
            v.nullish(UnsignedIntegerMayInputString),
            v.description("End time (in ms since epoch)."),
        ),
    }),
    v.description("Request user non-funding ledger updates."),
);
export type UserNonFundingLedgerUpdatesRequest = v.InferOutput<typeof UserNonFundingLedgerUpdatesRequest>;

/**
 * Request user rate limits.
 * @returns {UserRateLimit}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
 */
export const UserRateLimitRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("userRateLimit"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user rate limits."),
);
export type UserRateLimitRequest = v.InferOutput<typeof UserRateLimitRequest>;

/**
 * Request user role.
 * @returns {UserRole}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
 */
export const UserRoleRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("userRole"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user role."),
);
export type UserRoleRequest = v.InferOutput<typeof UserRoleRequest>;

/**
 * Request multi-sig signers for a user.
 * @returns {MultiSigSigners | null}
 * @see null
 */
export const UserToMultiSigSignersRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("userToMultiSigSigners"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request multi-sig signers for a user."),
);
export type UserToMultiSigSignersRequest = v.InferOutput<typeof UserToMultiSigSignersRequest>;

/**
 * Request user TWAP slice fills.
 * @returns {TwapSliceFill[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export const UserTwapSliceFillsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("userTwapSliceFills"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user TWAP slice fills."),
);
export type UserTwapSliceFillsRequest = v.InferOutput<typeof UserTwapSliceFillsRequest>;

/**
 * Request user TWAP slice fills by time.
 * @returns {TwapSliceFill[]}
 * @see null
 */
export const UserTwapSliceFillsByTimeRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("userTwapSliceFillsByTime"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Start time (in ms since epoch). */
        startTime: v.pipe(
            UnsignedIntegerMayInputString,
            v.description("Start time (in ms since epoch)."),
        ),
        /** End time (in ms since epoch). */
        endTime: v.pipe(
            v.nullish(UnsignedIntegerMayInputString),
            v.description("End time (in ms since epoch)."),
        ),
        /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
        aggregateByTime: v.pipe(
            v.optional(v.boolean()),
            v.description("If true, partial fills are aggregated when a crossing order fills multiple resting orders."),
        ),
    }),
    v.description("Request user TWAP slice fills by time."),
);
export type UserTwapSliceFillsByTimeRequest = v.InferOutput<typeof UserTwapSliceFillsByTimeRequest>;

/**
 * Request user vault deposits.
 * @returns {VaultEquity[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
 */
export const UserVaultEquitiesRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("userVaultEquities"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user vault deposits."),
);
export type UserVaultEquitiesRequest = v.InferOutput<typeof UserVaultEquitiesRequest>;

/**
 * Request validator L1 votes.
 * @returns {unknown[]} FIXME: Define the return type
 * @see null
 */
export const ValidatorL1VotesRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("validatorL1Votes"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request validator L1 votes."),
);
export type ValidatorL1VotesRequest = v.InferOutput<typeof ValidatorL1VotesRequest>;

/**
 * Request validator summaries.
 * @returns {ValidatorSummary[]}
 * @see null
 */
export const ValidatorSummariesRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("validatorSummaries"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request validator summaries."),
);
export type ValidatorSummariesRequest = v.InferOutput<typeof ValidatorSummariesRequest>;

/**
 * Request details of a vault.
 * @returns {VaultDetails | null}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
 */
export const VaultDetailsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("vaultDetails"),
            v.description("Type of request."),
        ),
        /** Vault address. */
        vaultAddress: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Vault address."),
        ),
        /** User address. */
        user: v.pipe(
            v.nullish(v.pipe(Hex, v.length(42))),
            v.description("User address."),
        ),
    }),
    v.description("Request details of a vault."),
);
export type VaultDetailsRequest = v.InferOutput<typeof VaultDetailsRequest>;

/**
 * Request a list of vaults less than 2 hours old.
 * @returns {VaultSummary[]}
 * @see null
 */
export const VaultSummariesRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("vaultSummaries"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request a list of vaults less than 2 hours old."),
);
export type VaultSummariesRequest = v.InferOutput<typeof VaultSummariesRequest>;

/**
 * Request gossip root IPs.
 * @returns {GossipRootIps[]}
 * @see null
 */
export const GossipRootIpsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("gossipRootIps"),
            v.description("Type of request."),
        ),
    }),
    v.description("Request gossip root IPs."),
);
export type GossipRootIpsRequest = v.InferOutput<typeof GossipRootIpsRequest>;

/**
 * Request recent trades.
 * @returns {Trade[]}
 * @see null
 */
export const RecentTradesRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("recentTrades"),
            v.description("Type of request."),
        ),
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
    }),
    v.description("Request recent trades."),
);
export type RecentTradesRequest = v.InferOutput<typeof RecentTradesRequest>;

/**
 * Request builder deployed perpetual market limits.
 * @returns {PerpDexLimits}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-builder-deployed-perp-market-limits
 */
export const PerpDexLimitsRequest = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("perpDexLimits"),
            v.description("Type of request."),
        ),
        /** DEX name (empty string for main dex). */
        dex: v.pipe(
            v.string(),
            v.description("DEX name (empty string for main dex)."),
        ),
    }),
    v.description("Request perpetual DEX limits."),
);
export type PerpDexLimitsRequest = v.InferOutput<typeof PerpDexLimitsRequest>;

/**
 * Request comprehensive user and market data.
 * @returns {WebData2}
 * @see null
 */
export const WebData2Request = v.pipe(
    v.object({
        /** Type of request. */
        type: v.pipe(
            v.literal("webData2"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request web data v2."),
);
export type WebData2Request = v.InferOutput<typeof WebData2Request>;
