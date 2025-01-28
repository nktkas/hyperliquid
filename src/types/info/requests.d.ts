import type { Hex } from "../common.d.ts";

/**
 * Request mid coin prices.
 * @returns {AllMids} Mid coin prices.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins | Hyperliquid GitBook}
 */
export interface AllMidsRequest {
    /** Type of request. */
    type: "allMids";
}

/**
 * Request candlestick snapshots.
 * @returns {Candle[]} Array of candlestick data points.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot | Hyperliquid GitBook}
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary | Hyperliquid GitBook}
 */
export interface ClearinghouseStateRequest {
    /** Type of request. */
    type: "clearinghouseState";
    /** User's address. */
    user: Hex;
}

/**
 * Request user's extra agents.
 * @returns {ExtraAgent[]} The extra agents of a user.
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info | Hyperliquid GitBook}
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates | Hyperliquid GitBook}
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
 * @returns {OrderStatus[]} Array of user's historical orders.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders | Hyperliquid GitBook}
 */
export interface HistoricalOrdersRequest {
    /** Type of request. */
    type: "historicalOrders";
    /** User's address. */
    user: Hex;
}

/**
 * Request L2 order book ({@link L2Book}).
 * @returns {Book} L2 order book snapshot.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot | Hyperliquid GitBook}
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
 * Request builder fee approval.
 * @returns {number} 1 (means 0.001%)
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval | Hyperliquid GitBook}
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc | Hyperliquid GitBook}
 */
export interface MetaAndAssetCtxsRequest {
    /** Type of request. */
    type: "metaAndAssetCtxs";
}

/**
 * Request trading metadata.
 * @returns {PerpsMeta} Metadata for perpetual assets.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata | Hyperliquid GitBook}
 */
export interface MetaRequest {
    /** Type of request. */
    type: "meta";
}

/**
 * Request open orders.
 * @returns {Order[]} Array of open order.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders | Hyperliquid GitBook}
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid | Hyperliquid GitBook}
 */
export interface OrderStatusRequest {
    /** Type of request. */
    type: "orderStatus";
    /** User's address. */
    user: Hex;
    /** oid (order id) or cloid (client order id). */
    oid: number | Hex;
}

/**
 * Request predicted funding rates.
 * @returns {PredictedFunding[]} Array of predicted funding rates.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues | Hyperliquid GitBook}
 */
export interface PredictedFundingsRequest {
    /** Type of request. */
    type: "predictedFundings";
}

/**
 * Request user referral.
 * @returns {Referral} Referral information for a user.
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances | Hyperliquid GitBook}
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction | Hyperliquid GitBook}
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts | Hyperliquid GitBook}
 */
export interface SpotMetaAndAssetCtxsRequest {
    /** Type of request. */
    type: "spotMetaAndAssetCtxs";
}

/**
 * Request spot trading metadata.
 * @returns {SpotMeta} Metadata for spot assets.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata | Hyperliquid GitBook}
 */
export interface SpotMetaRequest {
    /** Type of request. */
    type: "spotMeta";
}

/**
 * Request user sub-accounts.
 * @returns {SubAccount[]} Array of user sub-account.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts | Hyperliquid GitBook}
 */
export interface SubAccountsRequest {
    /** Type of request. */
    type: "subAccounts";
    /** User's address. */
    user: Hex;
}

/**
 * The request to get the details of a token.
 * @returns {TokenDetails} The details of a token.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token | Hyperliquid GitBook}
 */
export interface TokenDetailsRequest {
    /** Type of request. */
    type: "tokenDetails";
    /** Token ID. */
    tokenId: Hex;
}

/**
 * Request twap history.
 * @returns {TwapHistory[]} The twap history of a user.
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time | Hyperliquid GitBook}
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
    /**
     * When `true`, partial fills are combined when a crossing order gets filled by multiple different resting orders.
     * Resting orders filled by multiple crossing orders will not be aggregated.
     */
    aggregateByTime?: boolean;
}

/**
 * Request user fills.
 * @returns {Fill[]} Array of user's trade fill.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills | Hyperliquid GitBook}
 */
export interface UserFillsRequest {
    /** Type of request. */
    type: "userFills";
    /** User's address. */
    user: Hex;
    /**
     * When `true`, partial fills are combined when a crossing order gets filled by multiple different resting orders.
     * Resting orders filled by multiple crossing orders will not be aggregated.
     */
    aggregateByTime?: boolean;
}

/**
 * Request user funding.
 * @returns {UserFundingUpdate[]} Array of user's funding ledger update.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates | Hyperliquid GitBook}
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
 * @returns {UserNonFundingLedgerUpdates[]} Array of user's non-funding ledger update.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates | Hyperliquid GitBook}
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits | Hyperliquid GitBook}
 */
export interface UserRateLimitRequest {
    /** Type of request. */
    type: "userRateLimit";
    /** User's address. */
    user: Hex;
}

/**
 * Request user twap slice fills.
 * @returns {TwapSliceFill[]} Array of user's twap slice fills.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills | Hyperliquid GitBook}
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits | Hyperliquid GitBook}
 */
export interface UserVaultEquitiesRequest {
    /** Type of request. */
    type: "userVaultEquities";
    /** User's address. */
    user: Hex;
}

/**
 * Request details of a vault.
 * @returns {VaultDetails} Details of a vault.
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault | Hyperliquid GitBook}
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
 */
export interface VaultSummariesRequest {
    /** Type of request. */
    type: "vaultSummaries";
}
