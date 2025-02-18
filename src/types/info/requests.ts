import type { Hex } from "../../base.ts";

/**
 * Request mid coin prices.
 * @returns {AllMids} Mid coin prices.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
 */
export interface AllMidsRequest {
    /** Type of request. */
    type: "allMids";
}

/**
 * Request candlestick snapshots.
 * @returns {Candle[]} Array of candlestick data points.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
 */
export interface CandleSnapshotRequest {
    /** Type of request. */
    type: "candleSnapshot";
    /** Request parameters. */
    req: {
        /** Asset symbol. */
        coin: string;
        /** Time interval (e.g., "15m"). */
        interval: string;
        /** Start time (in ms since epoch). */
        startTime: number;
        /** End time (in ms since epoch). */
        endTime?: number | null;
    };
}

/**
 * Request clearinghouse state.
 * @returns {PerpsClearinghouseState} Account summary for perpetual trading.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
 */
export interface ClearinghouseStateRequest {
    /** Type of request. */
    type: "clearinghouseState";
    /** User's address. */
    user: Hex;
}

/**
 * Request user staking delegations.
 * @returns {Delegation[]} Array of user's delegations to validators.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-staking-delegations
 */
export interface DelegationsRequest {
    /** Type of request. */
    type: "delegations";
    /** User's address. */
    user: Hex;
}

/**
 * Request user staking history.
 * @returns {DelegatorUpdate[]} Array of user's staking updates.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-staking-history
 */
export interface DelegatorHistoryRequest {
    /** Type of request. */
    type: "delegatorHistory";
    /** User's address. */
    user: Hex;
}

/**
 * Request user staking rewards.
 * @returns {DelegatorReward[]} Array of user's staking rewards.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-staking-rewards
 */
export interface DelegatorRewardsRequest {
    /** Type of request. */
    type: "delegatorRewards";
    /** User's address. */
    user: Hex;
}

/**
 * Request user staking summary.
 * @returns {DelegatorSummary} Summary of a user's staking delegations.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-staking-summary
 */
export interface DelegatorSummaryRequest {
    /** Type of request. */
    type: "delegatorSummary";
    /** User's address. */
    user: Hex;
}

/**
 * Request user's extra agents.
 * @returns {ExtraAgent[]} User's extra agents.
 * @see null - no documentation
 */
export interface ExtraAgentsRequest {
    /** Type of request. */
    type: "extraAgents";
    /** User's address. */
    user: Hex;
}

/**
 * Request frontend open orders.
 * @returns {FrontendOrder[]} Array of open orders with additional frontend information.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info
 */
export interface FrontendOpenOrdersRequest {
    /** Type of request. */
    type: "frontendOpenOrders";
    /** User's address. */
    user: Hex;
}

/**
 * Request funding history.
 * @returns {FundingHistory[]} Array of historical funding rate data for an asset.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
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
 * Request user historical orders.
 * @returns {OrderStatus<FrontendOrder>[]} Array of user's historical orders.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
 */
export interface HistoricalOrdersRequest {
    /** Type of request. */
    type: "historicalOrders";
    /** User's address. */
    user: Hex;
}

/**
 * Request to check if a user is a VIP.
 * @returns {boolean} Boolean indicating user's VIP status.
 * @see null - no documentation
 */
export interface IsVipRequest {
    /** Type of request. */
    type: "isVip";
    /** User's address. */
    user: Hex;
}

/**
 * Request L2 order book ({@link L2Book}).
 * @returns {Book} L2 order book snapshot.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
 */
export interface L2BookRequest {
    /** Type of request. */
    type: "l2Book";
    /** Asset symbol. */
    coin: string;
    /** Number of significant figures. */
    nSigFigs?: 2 | 3 | 4 | 5 | null;
    /** Mantissa for aggregation (if {@linkcode nSigFigs} is 5). */
    mantissa?: 2 | 5 | null;
}

/**
 * Request legal verification status of a user.
 * @returns {LegalCheck} Legal verification status for a user.
 * @see null - no documentation
 */
export interface LegalCheckRequest {
    /** Type of request. */
    type: "legalCheck";
    /** User's address. */
    user: Hex;
}

/**
 * Request builder fee approval.
 * @returns {number} Maximum builder fee approval.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval
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
 * Request metadata and asset contexts.
 * @returns {PerpsMetaAndAssetCtxs} Metadata and context information for each perpetual asset.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
 */
export interface MetaAndAssetCtxsRequest {
    /** Type of request. */
    type: "metaAndAssetCtxs";
}

/**
 * Request trading metadata.
 * @returns {PerpsMeta} Metadata for perpetual assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata
 */
export interface MetaRequest {
    /** Type of request. */
    type: "meta";
}

/**
 * Request open orders.
 * @returns {Order[]} Array of open order.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
 */
export interface OpenOrdersRequest {
    /** Type of request. */
    type: "openOrders";
    /** User's address. */
    user: Hex;
}

/**
 * Request order status.
 * @returns {OrderLookup} Result of an order status lookup.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
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
 * Request perpetuals at open interest cap.
 * @returns {string[]} Array of perpetuals at open interest caps.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
 */
export interface PerpsAtOpenInterestCapRequest {
    /** Type of request. */
    type: "perpsAtOpenInterestCap";
}

/**
 * Request user portfolio.
 * @returns {PortfolioPeriods} User's portfolio.
 * @see null - no documentation
 */
export interface PortfolioRequest {
    /** Type of request. */
    type: "portfolio";
    /** User's address. */
    user: Hex;
}

/**
 * Request predicted funding rates.
 * @returns {PredictedFunding[]} Array of predicted funding rates.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
 */
export interface PredictedFundingsRequest {
    /** Type of request. */
    type: "predictedFundings";
}

/**
 * Request user's existence check before transfer.
 * @returns {PreTransferCheck} Pre-transfer user existence check result.
 * @see null - no documentation
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
 * @returns {Referral} Referral information for a user.
 * @see null - no documentation
 */
export interface ReferralRequest {
    /** Type of request. */
    type: "referral";
    /** User's address. */
    user: Hex;
}

/**
 * Request spot clearinghouse state.
 * @returns {SpotClearinghouseState} Balances for spot tokens.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
 */
export interface SpotClearinghouseStateRequest {
    /** Type of request. */
    type: "spotClearinghouseState";
    /** User's address. */
    user: Hex;
}

/**
 * Request spot deploy state.
 * @returns {SpotDeployState} The deploy state of a user.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
 */
export interface SpotDeployStateRequest {
    /** Type of request. */
    type: "spotDeployState";
    /** User's address. */
    user: Hex;
}

/**
 * Request spot metadata and asset contexts.
 * @returns {SpotMetaAndAssetCtxs} Metadata and context information for each spot asset.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
 */
export interface SpotMetaAndAssetCtxsRequest {
    /** Type of request. */
    type: "spotMetaAndAssetCtxs";
}

/**
 * Request spot trading metadata.
 * @returns {SpotMeta} Metadata for spot assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
 */
export interface SpotMetaRequest {
    /** Type of request. */
    type: "spotMeta";
}

/**
 * Request user sub-accounts.
 * @returns {SubAccount[] | null} Array of user sub-account or null if the user does not have any sub-accounts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 */
export interface SubAccountsRequest {
    /** Type of request. */
    type: "subAccounts";
    /** User's address. */
    user: Hex;
}

/**
 * Request token details.
 * @returns {TokenDetails} The details of a token.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token
 */
export interface TokenDetailsRequest {
    /** Type of request. */
    type: "tokenDetails";
    /** Token ID. */
    tokenId: Hex;
}

/**
 * Request TWAP history.
 * @returns {TwapHistory[]} The TWAP history of a user.
 * @see null - no documentation
 */
export interface TwapHistoryRequest {
    /** Type of request. */
    type: "twapHistory";
    /** User's address. */
    user: Hex;
}

/**
 * Request user fees.
 * @returns {UserFees} User fees.
 * @see null - no documentation
 */
export interface UserFeesRequest {
    /** Type of request. */
    type: "userFees";
    /** User's address. */
    user: Hex;
}

/**
 * Request user fills by time.
 * @returns {Fill[]} Array of user's trade fill.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
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
 * Request user fills.
 * @returns {Fill[]} Array of user's trade fill.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
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
 * Request user funding.
 * @returns {UserFundingUpdate[]} Array of user's funding ledger update.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
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
 * @returns {UserNonFundingLedgerUpdate[]} Array of user's non-funding ledger update.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
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
 * @returns {UserRateLimit} User's rate limits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
 */
export interface UserRateLimitRequest {
    /** Type of request. */
    type: "userRateLimit";
    /** User's address. */
    user: Hex;
}

/**
 * Request user role.
 * @returns {UserRole} User's role.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
 */
export interface UserRoleRequest {
    /** Type of request. */
    type: "userRole";
    /** User's address. */
    user: Hex;
}

/**
 * Request user to multi-sig signers.
 * @returns {MultiSigSigners | null} Multi-sig signers for a user or null if the user does not have any multi-sig signers.
 * @see null - no documentation
 */
export interface UserToMultiSigSignersRequest {
    /** Type of request. */
    type: "userToMultiSigSigners";
    /** User's address. */
    user: Hex;
}

/**
 * Request user TWAP slice fills by time.
 * @returns {TwapSliceFill[]} Array of user's twap slice fill.
 * @see null - no documentation
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
 * Request user TWAP slice fills.
 * @returns {TwapSliceFill[]} Array of user's twap slice fill.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export interface UserTwapSliceFillsRequest {
    /** Type of request. */
    type: "userTwapSliceFills";
    /** User's address. */
    user: Hex;
}

/**
 * Request user vault deposits.
 * @returns {VaultEquity[]} Array of user's vault deposits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
 */
export interface UserVaultEquitiesRequest {
    /** Type of request. */
    type: "userVaultEquities";
    /** User's address. */
    user: Hex;
}

/**
 * Request validator summaries.
 * @returns {ValidatorSummary[]} Array of validator summaries.
 * @see null - no documentation
 */
export interface ValidatorSummariesRequest {
    /** Type of request. */
    type: "validatorSummaries";
}

/**
 * Request details of a vault.
 * @returns {VaultDetails | null} Details of a vault or null if the vault does not exist.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
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
 * @returns {VaultSummary[]} Array of vault summaries.
 * @see null - no documentation
 */
export interface VaultSummariesRequest {
    /** Type of request. */
    type: "vaultSummaries";
}
