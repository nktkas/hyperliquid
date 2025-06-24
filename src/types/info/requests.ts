import type { Hex } from "../../base.ts";

/**
 * Request mid coin prices.
 * @returns {AllMids}
 */
export interface AllMidsRequest {
    /** Type of request. */
    type: "allMids";
    /** Name of perp dex. */
    dex?: string;
}

/**
 * Request candlestick snapshots.
 * @returns {Candle[]}
 */
export interface CandleSnapshotRequest {
    /** Type of request. */
    type: "candleSnapshot";
    /** Request parameters. */
    req: {
        /** Asset symbol. */
        coin: string;
        /** Time interval. */
        interval: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
        /** Start time (in ms since epoch). */
        startTime: number;
        /** End time (in ms since epoch). */
        endTime?: number | null;
    };
}

/**
 * Request clearinghouse state.
 * @returns {PerpsClearinghouseState}
 */
export interface ClearinghouseStateRequest {
    /** Type of request. */
    type: "clearinghouseState";
    /** User's address. */
    user: Hex;
}

/**
 * Request user staking delegations.
 * @returns {Delegation[]}
 */
export interface DelegationsRequest {
    /** Type of request. */
    type: "delegations";
    /** User's address. */
    user: Hex;
}

/**
 * Request user staking history.
 * @returns {DelegatorUpdate[]}
 */
export interface DelegatorHistoryRequest {
    /** Type of request. */
    type: "delegatorHistory";
    /** User's address. */
    user: Hex;
}

/**
 * Request user staking rewards.
 * @returns {DelegatorReward[]}
 */
export interface DelegatorRewardsRequest {
    /** Type of request. */
    type: "delegatorRewards";
    /** User's address. */
    user: Hex;
}

/**
 * Request user staking summary.
 * @returns {DelegatorSummary}
 */
export interface DelegatorSummaryRequest {
    /** Type of request. */
    type: "delegatorSummary";
    /** User's address. */
    user: Hex;
}

/**
 * Request exchange status information.
 * @returns {ExchangeStatus}
 */
export interface ExchangeStatusRequest {
    /** Type of request. */
    type: "exchangeStatus";
}

/**
 * Request user's extra agents.
 * @returns {ExtraAgent[]}
 */
export interface ExtraAgentsRequest {
    /** Type of request. */
    type: "extraAgents";
    /** User's address. */
    user: Hex;
}

/**
 * Request frontend open orders.
 * @returns {FrontendOrder[]}
 */
export interface FrontendOpenOrdersRequest {
    /** Type of request. */
    type: "frontendOpenOrders";
    /** User's address. */
    user: Hex;
    /** Name of perp dex. */
    dex?: string;
}

/**
 * Request funding history.
 * @returns {FundingHistory[]}
 */
export interface FundingHistoryRequest {
    /** Type of request. */
    type: "fundingHistory";
    /** Asset symbol. */
    coin: string;
    /** Start time (in ms since epoch). */
    startTime: number;
    /** End time (in ms since epoch). */
    endTime?: number | null;
}

/**
 * Request user's historical orders.
 * @returns {OrderStatus<FrontendOrder>[]}
 */
export interface HistoricalOrdersRequest {
    /** Type of request. */
    type: "historicalOrders";
    /** User's address. */
    user: Hex;
}

/**
 * Request to check if a user is a VIP.
 * @returns {boolean}
 */
export interface IsVipRequest {
    /** Type of request. */
    type: "isVip";
    /** User's address. */
    user: Hex;
}

/**
 * Request L2 order book.
 * @returns {Book}
 */
export interface L2BookRequest {
    /** Type of request. */
    type: "l2Book";
    /** Asset symbol. */
    coin: string;
    /** Number of significant figures. */
    nSigFigs?: 2 | 3 | 4 | 5 | null;
    /** Mantissa for aggregation (if {@link nSigFigs} is 5). */
    mantissa?: 2 | 5 | null;
}

/**
 * Request leading vaults for a user.
 * @returns {VaultLeading[]}
 */
export interface LeadingVaultsRequest {
    /** Type of request. */
    type: "leadingVaults";
    /** User's address. */
    user: Hex;
}

/**
 * Request legal verification status of a user.
 * @returns {LegalCheck}
 */
export interface LegalCheckRequest {
    /** Type of request. */
    type: "legalCheck";
    /** User's address. */
    user: Hex;
}

/**
 * Request liquidatable (unknown).
 * @returns {unknown[]}
 */
export interface LiquidatableRequest {
    /** Type of request. */
    type: "liquidatable";
}

/**
 * Request margin table data.
 * @returns {MarginTable}
 */
export interface MarginTableRequest {
    /** Type of request. */
    type: "marginTable";
    /** Unique identifier for the margin requirements table. */
    id: number;
}

/**
 * Request builder fee approval.
 * @returns {number}
 */
export interface MaxBuilderFeeRequest {
    /** Type of request. */
    type: "maxBuilderFee";
    /** User's address. */
    user: Hex;
    /** Builder address. */
    builder: Hex;
}

/**
 * Request maximum market order notionals.
 * @returns {[number, string][]}
 */
export interface MaxMarketOrderNtlsRequest {
    /** Type of request. */
    type: "maxMarketOrderNtls";
}

/**
 * Request trading metadata.
 * @returns {PerpsMeta}
 */
export interface MetaRequest {
    /** Type of request. */
    type: "meta";
    /** Name of perp dex. */
    dex?: string;
}

/**
 * Request metadata and asset contexts.
 * @returns {PerpsMetaAndAssetCtxs}
 */
export interface MetaAndAssetCtxsRequest {
    /** Type of request. */
    type: "metaAndAssetCtxs";
}

/**
 * Request open orders.
 * @returns {Order[]}
 */
export interface OpenOrdersRequest {
    /** Type of request. */
    type: "openOrders";
    /** User's address. */
    user: Hex;
    /** Name of perp dex. */
    dex?: string;
}

/**
 * Request order status.
 * @returns {OrderLookup}
 */
export interface OrderStatusRequest {
    /** Type of request. */
    type: "orderStatus";
    /** User's address. */
    user: Hex;
    /** Order ID or client order ID. */
    oid: number | Hex;
}

/**
 * Request for the status of the perpetual deploy auction.
 * @returns {DeployAuctionStatus}
 */
export interface PerpDeployAuctionStatusRequest {
    /** Type of request. */
    type: "perpDeployAuctionStatus";
}

/**
 * Request all perpetual dexs.
 * @returns {PerpDexs}
 */
export interface PerpDexsRequest {
    /** Type of request. */
    type: "perpDexs";
}

/**
 * Request perpetuals at open interest cap.
 * @returns {string[]}
 */
export interface PerpsAtOpenInterestCapRequest {
    /** Type of request. */
    type: "perpsAtOpenInterestCap";
}

/**
 * Request user portfolio.
 * @returns {PortfolioPeriods}
 */
export interface PortfolioRequest {
    /** Type of request. */
    type: "portfolio";
    /** User's address. */
    user: Hex;
}

/**
 * Request predicted funding rates.
 * @returns {PredictedFunding[]}
 */
export interface PredictedFundingsRequest {
    /** Type of request. */
    type: "predictedFundings";
}

/**
 * Request user's existence check before transfer.
 * @returns {PreTransferCheck}
 */
export interface PreTransferCheckRequest {
    /** Type of request. */
    type: "preTransferCheck";
    /** Destination address. */
    user: Hex;
    /** Source address. */
    source: Hex;
}

/**
 * Request user referral.
 * @returns {Referral}
 */
export interface ReferralRequest {
    /** Type of request. */
    type: "referral";
    /** User's address. */
    user: Hex;
}

/**
 * Request spot clearinghouse state.
 * @returns {SpotClearinghouseState}
 */
export interface SpotClearinghouseStateRequest {
    /** Type of request. */
    type: "spotClearinghouseState";
    /** User's address. */
    user: Hex;
    /** Name of perp dex. */
    dex?: string;
}

/**
 * Request spot deploy state.
 * @returns {SpotDeployState}
 */
export interface SpotDeployStateRequest {
    /** Type of request. */
    type: "spotDeployState";
    /** User's address. */
    user: Hex;
}

/**
 * Request spot trading metadata.
 * @returns {SpotMeta}
 */
export interface SpotMetaRequest {
    /** Type of request. */
    type: "spotMeta";
}

/**
 * Request spot metadata and asset contexts.
 * @returns {SpotMetaAndAssetCtxs}
 */
export interface SpotMetaAndAssetCtxsRequest {
    /** Type of request. */
    type: "spotMetaAndAssetCtxs";
}

/**
 * Request user sub-accounts.
 * @returns {SubAccount[] | null}
 */
export interface SubAccountsRequest {
    /** Type of request. */
    type: "subAccounts";
    /** User's address. */
    user: Hex;
}

/**
 * Request token details.
 * @returns {TokenDetails}
 */
export interface TokenDetailsRequest {
    /** Type of request. */
    type: "tokenDetails";
    /** Token ID. */
    tokenId: Hex;
}

/**
 * Request twap history of a user.
 * @returns {TwapHistory[]}
 */
export interface TwapHistoryRequest {
    /** Type of request. */
    type: "twapHistory";
    /** User's address. */
    user: Hex;
}

/**
 * Request user fees.
 * @returns {UserFees}
 */
export interface UserFeesRequest {
    /** Type of request. */
    type: "userFees";
    /** User's address. */
    user: Hex;
}

/**
 * Request user fills.
 * @returns {Fill[]}
 */
export interface UserFillsRequest {
    /** Type of request. */
    type: "userFills";
    /** User's address. */
    user: Hex;
    /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
    aggregateByTime?: boolean;
}

/**
 * Request user fills by time.
 * @returns {Fill[]}
 */
export interface UserFillsByTimeRequest {
    /** Type of request. */
    type: "userFillsByTime";
    /** User's address. */
    user: Hex;
    /** Start time (in ms since epoch). */
    startTime: number;
    /** End time (in ms since epoch). */
    endTime?: number | null;
    /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
    aggregateByTime?: boolean;
}

/**
 * Request user funding.
 * @returns {UserFundingUpdate[]}
 */
export interface UserFundingRequest {
    /** Type of request. */
    type: "userFunding";
    /** User's address. */
    user: Hex;
    /** Start time (in ms since epoch). */
    startTime: number;
    /** End time (in ms since epoch). */
    endTime?: number | null;
}

/**
 * Request user non-funding ledger updates.
 * @returns {UserNonFundingLedgerUpdate[]}
 */
export interface UserNonFundingLedgerUpdatesRequest {
    /** Type of request. */
    type: "userNonFundingLedgerUpdates";
    /** User's address. */
    user: Hex;
    /** Start time (in ms since epoch). */
    startTime: number;
    /** End time (in ms since epoch). */
    endTime?: number | null;
}

/**
 * Request user rate limits.
 * @returns {UserRateLimit}
 */
export interface UserRateLimitRequest {
    /** Type of request. */
    type: "userRateLimit";
    /** User's address. */
    user: Hex;
}

/**
 * Request user role.
 * @returns {UserRole}
 */
export interface UserRoleRequest {
    /** Type of request. */
    type: "userRole";
    /** User's address. */
    user: Hex;
}

/**
 * Request multi-sig signers for a user.
 * @returns {MultiSigSigners | null}
 */
export interface UserToMultiSigSignersRequest {
    /** Type of request. */
    type: "userToMultiSigSigners";
    /** User's address. */
    user: Hex;
}

/**
 * Request user TWAP slice fills.
 * @returns {TwapSliceFill[]}
 */
export interface UserTwapSliceFillsRequest {
    /** Type of request. */
    type: "userTwapSliceFills";
    /** User's address. */
    user: Hex;
}

/**
 * Request user TWAP slice fills by time.
 * @returns {TwapSliceFill[]}
 */
export interface UserTwapSliceFillsByTimeRequest {
    /** Type of request. */
    type: "userTwapSliceFillsByTime";
    /** User's address. */
    user: Hex;
    /** Start time (in ms since epoch). */
    startTime: number;
    /** End time (in ms since epoch). */
    endTime?: number | null;
    /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
    aggregateByTime?: boolean;
}

/**
 * Request user vault deposits.
 * @returns {VaultEquity[]}
 */
export interface UserVaultEquitiesRequest {
    /** Type of request. */
    type: "userVaultEquities";
    /** User's address. */
    user: Hex;
}

/**
 * Request validator L1 votes.
 * @returns {unknown[]}
 */
export interface ValidatorL1VotesRequest {
    /** Type of request. */
    type: "validatorL1Votes";
}

/**
 * Request validator summaries.
 * @returns {ValidatorSummary[]}
 */
export interface ValidatorSummariesRequest {
    /** Type of request. */
    type: "validatorSummaries";
}

/**
 * Request details of a vault.
 * @returns {VaultDetails | null}
 */
export interface VaultDetailsRequest {
    /** Type of request. */
    type: "vaultDetails";
    /** Vault address. */
    vaultAddress: Hex;
    /** User's address. */
    user?: Hex | null;
}

/**
 * Request a list of vaults less than 2 hours old.
 * @returns {VaultSummary[]}
 */
export interface VaultSummariesRequest {
    /** Type of request. */
    type: "vaultSummaries";
}
