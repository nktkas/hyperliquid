import type { Hex } from "../mod.ts";

/**
 * Request user active asset data.
 * @returns {ActiveAssetData}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
 */
export interface ActiveAssetDataRequest {
    /** Type of request. */
    type: "activeAssetData";
    /** Asset symbol (e.g., BTC). */
    coin: string;
    /** User address. */
    user: Hex;
}

/**
 * Request mid coin prices.
 * @returns {AllMids}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
 */
export interface AllMidsRequest {
    /** Type of request. */
    type: "allMids";
    /** DEX name (empty string for main dex). */
    dex?: string;
}

/**
 * Request candlestick snapshots.
 * @returns {Candle[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
 */
export interface CandleSnapshotRequest {
    /** Type of request. */
    type: "candleSnapshot";
    /** Request parameters. */
    req: {
        /** Asset symbol (e.g., BTC). */
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
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
 */
export interface ClearinghouseStateRequest {
    /** Type of request. */
    type: "clearinghouseState";
    /** User address. */
    user: Hex;
}

/**
 * Request user staking delegations.
 * @returns {Delegation[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
 */
export interface DelegationsRequest {
    /** Type of request. */
    type: "delegations";
    /** User address. */
    user: Hex;
}

/**
 * Request user staking history.
 * @returns {DelegatorUpdate[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
 */
export interface DelegatorHistoryRequest {
    /** Type of request. */
    type: "delegatorHistory";
    /** User address. */
    user: Hex;
}

/**
 * Request user staking rewards.
 * @returns {DelegatorReward[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards
 */
export interface DelegatorRewardsRequest {
    /** Type of request. */
    type: "delegatorRewards";
    /** User address. */
    user: Hex;
}

/**
 * Request user staking summary.
 * @returns {DelegatorSummary}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
 */
export interface DelegatorSummaryRequest {
    /** Type of request. */
    type: "delegatorSummary";
    /** User address. */
    user: Hex;
}

/**
 * Request exchange status information.
 * @returns {ExchangeStatus}
 * @see null
 */
export interface ExchangeStatusRequest {
    /** Type of request. */
    type: "exchangeStatus";
}

/**
 * Request user extra agents.
 * @returns {ExtraAgent[]}
 * @see null
 */
export interface ExtraAgentsRequest {
    /** Type of request. */
    type: "extraAgents";
    /** User address. */
    user: Hex;
}

/**
 * Request frontend open orders.
 * @returns {FrontendOrder[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info
 */
export interface FrontendOpenOrdersRequest {
    /** Type of request. */
    type: "frontendOpenOrders";
    /** User address. */
    user: Hex;
    /** DEX name (empty string for main dex). */
    dex?: string;
}

/**
 * Request funding history.
 * @returns {FundingHistory[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
 */
export interface FundingHistoryRequest {
    /** Type of request. */
    type: "fundingHistory";
    /** Asset symbol (e.g., BTC). */
    coin: string;
    /** Start time (in ms since epoch). */
    startTime: number;
    /** End time (in ms since epoch). */
    endTime?: number | null;
}

/**
 * Request user historical orders.
 * @returns {OrderStatus<FrontendOrder>[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
 */
export interface HistoricalOrdersRequest {
    /** Type of request. */
    type: "historicalOrders";
    /** User address. */
    user: Hex;
}

/**
 * Request to check if a user is a VIP.
 * @returns {boolean | null}
 * @see null
 */
export interface IsVipRequest {
    /** Type of request. */
    type: "isVip";
    /** User address. */
    user: Hex;
}

/**
 * Request L2 order book.
 * @returns {Book}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
 */
export interface L2BookRequest {
    /** Type of request. */
    type: "l2Book";
    /** Asset symbol (e.g., BTC). */
    coin: string;
    /** Number of significant figures. */
    nSigFigs?: 2 | 3 | 4 | 5 | null;
    /** Mantissa for aggregation (if {@link nSigFigs} is 5). */
    mantissa?: 2 | 5 | null;
}

/**
 * Request leading vaults for a user.
 * @returns {VaultLeading[]}
 * @see null
 */
export interface LeadingVaultsRequest {
    /** Type of request. */
    type: "leadingVaults";
    /** User address. */
    user: Hex;
}

/**
 * Request legal verification status of a user.
 * @returns {LegalCheck}
 * @see null
 */
export interface LegalCheckRequest {
    /** Type of request. */
    type: "legalCheck";
    /** User address. */
    user: Hex;
}

/**
 * Request liquidatable.
 * @returns {unknown[]} FIXME: Define the return type
 * @see null
 */
export interface LiquidatableRequest {
    /** Type of request. */
    type: "liquidatable";
}

/**
 * Request margin table data.
 * @returns {MarginTable}
 * @see null
 */
export interface MarginTableRequest {
    /** Type of request. */
    type: "marginTable";
    /** Margin requirements table. */
    id: number;
}

/**
 * Request builder fee approval.
 * @returns {number}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval
 */
export interface MaxBuilderFeeRequest {
    /** Type of request. */
    type: "maxBuilderFee";
    /** User address. */
    user: Hex;
    /** Builder address. */
    builder: Hex;
}

/**
 * Request maximum market order notionals.
 * @returns {[number, string][]}
 * @see null
 */
export interface MaxMarketOrderNtlsRequest {
    /** Type of request. */
    type: "maxMarketOrderNtls";
}

/**
 * Request trading metadata.
 * @returns {PerpsMeta}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata-universe-and-margin-tables
 */
export interface MetaRequest {
    /** Type of request. */
    type: "meta";
    /** DEX name (empty string for main dex). */
    dex?: string;
}

/**
 * Request metadata and asset contexts.
 * @returns {PerpsMetaAndAssetCtxs}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
 */
export interface MetaAndAssetCtxsRequest {
    /** Type of request. */
    type: "metaAndAssetCtxs";
}

/**
 * Request open orders.
 * @returns {Order[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
 */
export interface OpenOrdersRequest {
    /** Type of request. */
    type: "openOrders";
    /** User address. */
    user: Hex;
    /** DEX name (empty string for main dex). */
    dex?: string;
}

/**
 * Request order status.
 * @returns {OrderLookup}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
 */
export interface OrderStatusRequest {
    /** Type of request. */
    type: "orderStatus";
    /** User address. */
    user: Hex;
    /** Order ID or Client Order ID. */
    oid: number | Hex;
}

/**
 * Request for the status of the perpetual deploy auction.
 * @returns {DeployAuctionStatus}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-information-about-the-perp-deploy-auction
 */
export interface PerpDeployAuctionStatusRequest {
    /** Type of request. */
    type: "perpDeployAuctionStatus";
}

/**
 * Request all perpetual dexs.
 * @returns {PerpDexs}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
 */
export interface PerpDexsRequest {
    /** Type of request. */
    type: "perpDexs";
}

/**
 * Request perpetuals at open interest cap.
 * @returns {string[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
 */
export interface PerpsAtOpenInterestCapRequest {
    /** Type of request. */
    type: "perpsAtOpenInterestCap";
}

/**
 * Request user portfolio.
 * @returns {PortfolioPeriods}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-portfolio
 */
export interface PortfolioRequest {
    /** Type of request. */
    type: "portfolio";
    /** User address. */
    user: Hex;
}

/**
 * Request predicted funding rates.
 * @returns {PredictedFunding[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
 */
export interface PredictedFundingsRequest {
    /** Type of request. */
    type: "predictedFundings";
}

/**
 * Request user existence check before transfer.
 * @returns {PreTransferCheck}
 * @see null
 */
export interface PreTransferCheckRequest {
    /** Type of request. */
    type: "preTransferCheck";
    /** User address. */
    user: Hex;
    /** Source address. */
    source: Hex;
}

/**
 * Request user referral.
 * @returns {Referral}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
 */
export interface ReferralRequest {
    /** Type of request. */
    type: "referral";
    /** User address. */
    user: Hex;
}

/**
 * Request spot clearinghouse state.
 * @returns {SpotClearinghouseState}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
 */
export interface SpotClearinghouseStateRequest {
    /** Type of request. */
    type: "spotClearinghouseState";
    /** User address. */
    user: Hex;
    /** DEX name (empty string for main dex). */
    dex?: string;
}

/**
 * Request spot deploy state.
 * @returns {SpotDeployState}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
 */
export interface SpotDeployStateRequest {
    /** Type of request. */
    type: "spotDeployState";
    /** User address. */
    user: Hex;
}

/**
 * Request spot trading metadata.
 * @returns {SpotMeta}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
 */
export interface SpotMetaRequest {
    /** Type of request. */
    type: "spotMeta";
}

/**
 * Request spot metadata and asset contexts.
 * @returns {SpotMetaAndAssetCtxs}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
 */
export interface SpotMetaAndAssetCtxsRequest {
    /** Type of request. */
    type: "spotMetaAndAssetCtxs";
}

/**
 * Request user sub-accounts.
 * @returns {SubAccount[] | null}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 */
export interface SubAccountsRequest {
    /** Type of request. */
    type: "subAccounts";
    /** User address. */
    user: Hex;
}

/**
 * Request token details.
 * @returns {TokenDetails}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token
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
 * @see null
 */
export interface TwapHistoryRequest {
    /** Type of request. */
    type: "twapHistory";
    /** User address. */
    user: Hex;
}

/**
 * Request user fees.
 * @returns {UserFees}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
 */
export interface UserFeesRequest {
    /** Type of request. */
    type: "userFees";
    /** User address. */
    user: Hex;
}

/**
 * Request user fills.
 * @returns {Fill[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 */
export interface UserFillsRequest {
    /** Type of request. */
    type: "userFills";
    /** User address. */
    user: Hex;
    /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
    aggregateByTime?: boolean;
}

/**
 * Request user fills by time.
 * @returns {Fill[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
 */
export interface UserFillsByTimeRequest {
    /** Type of request. */
    type: "userFillsByTime";
    /** User address. */
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
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export interface UserFundingRequest {
    /** Type of request. */
    type: "userFunding";
    /** User address. */
    user: Hex;
    /** Start time (in ms since epoch). */
    startTime: number;
    /** End time (in ms since epoch). */
    endTime?: number | null;
}

/**
 * Request user non-funding ledger updates.
 * @returns {UserNonFundingLedgerUpdate[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export interface UserNonFundingLedgerUpdatesRequest {
    /** Type of request. */
    type: "userNonFundingLedgerUpdates";
    /** User address. */
    user: Hex;
    /** Start time (in ms since epoch). */
    startTime: number;
    /** End time (in ms since epoch). */
    endTime?: number | null;
}

/**
 * Request user rate limits.
 * @returns {UserRateLimit}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
 */
export interface UserRateLimitRequest {
    /** Type of request. */
    type: "userRateLimit";
    /** User address. */
    user: Hex;
}

/**
 * Request user role.
 * @returns {UserRole}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
 */
export interface UserRoleRequest {
    /** Type of request. */
    type: "userRole";
    /** User address. */
    user: Hex;
}

/**
 * Request multi-sig signers for a user.
 * @returns {MultiSigSigners | null}
 * @see null
 */
export interface UserToMultiSigSignersRequest {
    /** Type of request. */
    type: "userToMultiSigSigners";
    /** User address. */
    user: Hex;
}

/**
 * Request user TWAP slice fills.
 * @returns {TwapSliceFill[]}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export interface UserTwapSliceFillsRequest {
    /** Type of request. */
    type: "userTwapSliceFills";
    /** User address. */
    user: Hex;
}

/**
 * Request user TWAP slice fills by time.
 * @returns {TwapSliceFill[]}
 * @see null
 */
export interface UserTwapSliceFillsByTimeRequest {
    /** Type of request. */
    type: "userTwapSliceFillsByTime";
    /** User address. */
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
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
 */
export interface UserVaultEquitiesRequest {
    /** Type of request. */
    type: "userVaultEquities";
    /** User address. */
    user: Hex;
}

/**
 * Request validator L1 votes.
 * @returns {unknown[]} FIXME: Define the return type
 * @see null
 */
export interface ValidatorL1VotesRequest {
    /** Type of request. */
    type: "validatorL1Votes";
}

/**
 * Request validator summaries.
 * @returns {ValidatorSummary[]}
 * @see null
 */
export interface ValidatorSummariesRequest {
    /** Type of request. */
    type: "validatorSummaries";
}

/**
 * Request details of a vault.
 * @returns {VaultDetails | null}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
 */
export interface VaultDetailsRequest {
    /** Type of request. */
    type: "vaultDetails";
    /** Vault address. */
    vaultAddress: Hex;
    /** User address. */
    user?: Hex | null;
}

/**
 * Request a list of vaults less than 2 hours old.
 * @returns {VaultSummary[]}
 * @see null
 */
export interface VaultSummariesRequest {
    /** Type of request. */
    type: "vaultSummaries";
}
