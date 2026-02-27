/**
 * Client for the Hyperliquid Info API endpoint.
 * @module
 */

import type { InfoConfig } from "./_methods/_base/types.ts";

// ============================================================
// Methods Imports
// ============================================================

import {
  activeAssetData,
  type ActiveAssetDataParameters,
  type ActiveAssetDataResponse,
} from "./_methods/activeAssetData.ts";
import {
  alignedQuoteTokenInfo,
  type AlignedQuoteTokenInfoParameters,
  type AlignedQuoteTokenInfoResponse,
} from "./_methods/alignedQuoteTokenInfo.ts";
import {
  allBorrowLendReserveStates,
  type AllBorrowLendReserveStatesResponse,
} from "./_methods/allBorrowLendReserveStates.ts";
import { allMids, type AllMidsParameters, type AllMidsResponse } from "./_methods/allMids.ts";
import { allPerpMetas, type AllPerpMetasResponse } from "./_methods/allPerpMetas.ts";
import { blockDetails, type BlockDetailsParameters, type BlockDetailsResponse } from "./_methods/blockDetails.ts";
import {
  borrowLendReserveState,
  type BorrowLendReserveStateParameters,
  type BorrowLendReserveStateResponse,
} from "./_methods/borrowLendReserveState.ts";
import {
  borrowLendUserState,
  type BorrowLendUserStateParameters,
  type BorrowLendUserStateResponse,
} from "./_methods/borrowLendUserState.ts";
import {
  candleSnapshot,
  type CandleSnapshotParameters,
  type CandleSnapshotResponse,
} from "./_methods/candleSnapshot.ts";
import {
  clearinghouseState,
  type ClearinghouseStateParameters,
  type ClearinghouseStateResponse,
} from "./_methods/clearinghouseState.ts";
import { delegations, type DelegationsParameters, type DelegationsResponse } from "./_methods/delegations.ts";
import {
  delegatorHistory,
  type DelegatorHistoryParameters,
  type DelegatorHistoryResponse,
} from "./_methods/delegatorHistory.ts";
import {
  delegatorRewards,
  type DelegatorRewardsParameters,
  type DelegatorRewardsResponse,
} from "./_methods/delegatorRewards.ts";
import {
  delegatorSummary,
  type DelegatorSummaryParameters,
  type DelegatorSummaryResponse,
} from "./_methods/delegatorSummary.ts";
import { exchangeStatus, type ExchangeStatusResponse } from "./_methods/exchangeStatus.ts";
import { extraAgents, type ExtraAgentsParameters, type ExtraAgentsResponse } from "./_methods/extraAgents.ts";
import {
  frontendOpenOrders,
  type FrontendOpenOrdersParameters,
  type FrontendOpenOrdersResponse,
} from "./_methods/frontendOpenOrders.ts";
import {
  fundingHistory,
  type FundingHistoryParameters,
  type FundingHistoryResponse,
} from "./_methods/fundingHistory.ts";
import { gossipRootIps, type GossipRootIpsResponse } from "./_methods/gossipRootIps.ts";
import {
  historicalOrders,
  type HistoricalOrdersParameters,
  type HistoricalOrdersResponse,
} from "./_methods/historicalOrders.ts";
import { isVip, type IsVipParameters, type IsVipResponse } from "./_methods/isVip.ts";
import { l2Book, type L2BookParameters, type L2BookResponse } from "./_methods/l2Book.ts";
import { leadingVaults, type LeadingVaultsParameters, type LeadingVaultsResponse } from "./_methods/leadingVaults.ts";
import { legalCheck, type LegalCheckParameters, type LegalCheckResponse } from "./_methods/legalCheck.ts";
import { liquidatable, type LiquidatableResponse } from "./_methods/liquidatable.ts";
import { marginTable, type MarginTableParameters, type MarginTableResponse } from "./_methods/marginTable.ts";
import { maxBuilderFee, type MaxBuilderFeeParameters, type MaxBuilderFeeResponse } from "./_methods/maxBuilderFee.ts";
import { maxMarketOrderNtls, type MaxMarketOrderNtlsResponse } from "./_methods/maxMarketOrderNtls.ts";
import { meta, type MetaParameters, type MetaResponse } from "./_methods/meta.ts";
import {
  metaAndAssetCtxs,
  type MetaAndAssetCtxsParameters,
  type MetaAndAssetCtxsResponse,
} from "./_methods/metaAndAssetCtxs.ts";
import { openOrders, type OpenOrdersParameters, type OpenOrdersResponse } from "./_methods/openOrders.ts";
import { orderStatus, type OrderStatusParameters, type OrderStatusResponse } from "./_methods/orderStatus.ts";
import { perpDeployAuctionStatus, type PerpDeployAuctionStatusResponse } from "./_methods/perpDeployAuctionStatus.ts";
import { perpDexLimits, type PerpDexLimitsParameters, type PerpDexLimitsResponse } from "./_methods/perpDexLimits.ts";
import { perpDexs, type PerpDexsResponse } from "./_methods/perpDexs.ts";
import { perpDexStatus, type PerpDexStatusParameters, type PerpDexStatusResponse } from "./_methods/perpDexStatus.ts";
import {
  perpsAtOpenInterestCap,
  type PerpsAtOpenInterestCapParameters,
  type PerpsAtOpenInterestCapResponse,
} from "./_methods/perpsAtOpenInterestCap.ts";
import { portfolio, type PortfolioParameters, type PortfolioResponse } from "./_methods/portfolio.ts";
import { predictedFundings, type PredictedFundingsResponse } from "./_methods/predictedFundings.ts";
import {
  preTransferCheck,
  type PreTransferCheckParameters,
  type PreTransferCheckResponse,
} from "./_methods/preTransferCheck.ts";
import { recentTrades, type RecentTradesParameters, type RecentTradesResponse } from "./_methods/recentTrades.ts";
import { referral, type ReferralParameters, type ReferralResponse } from "./_methods/referral.ts";
import {
  spotClearinghouseState,
  type SpotClearinghouseStateParameters,
  type SpotClearinghouseStateResponse,
} from "./_methods/spotClearinghouseState.ts";
import {
  spotDeployState,
  type SpotDeployStateParameters,
  type SpotDeployStateResponse,
} from "./_methods/spotDeployState.ts";
import { spotMeta, type SpotMetaResponse } from "./_methods/spotMeta.ts";
import { spotMetaAndAssetCtxs, type SpotMetaAndAssetCtxsResponse } from "./_methods/spotMetaAndAssetCtxs.ts";
import {
  spotPairDeployAuctionStatus,
  type SpotPairDeployAuctionStatusResponse,
} from "./_methods/spotPairDeployAuctionStatus.ts";
import { subAccounts, type SubAccountsParameters, type SubAccountsResponse } from "./_methods/subAccounts.ts";
import { subAccounts2, type SubAccounts2Parameters, type SubAccounts2Response } from "./_methods/subAccounts2.ts";
import { tokenDetails, type TokenDetailsParameters, type TokenDetailsResponse } from "./_methods/tokenDetails.ts";
import { twapHistory, type TwapHistoryParameters, type TwapHistoryResponse } from "./_methods/twapHistory.ts";
import { txDetails, type TxDetailsParameters, type TxDetailsResponse } from "./_methods/txDetails.ts";
import {
  userAbstraction,
  type UserAbstractionParameters,
  type UserAbstractionResponse,
} from "./_methods/userAbstraction.ts";
import {
  userBorrowLendInterest,
  type UserBorrowLendInterestParameters,
  type UserBorrowLendInterestResponse,
} from "./_methods/userBorrowLendInterest.ts";
import { userDetails, type UserDetailsParameters, type UserDetailsResponse } from "./_methods/userDetails.ts";
import {
  userDexAbstraction,
  type UserDexAbstractionParameters,
  type UserDexAbstractionResponse,
} from "./_methods/userDexAbstraction.ts";
import { userFees, type UserFeesParameters, type UserFeesResponse } from "./_methods/userFees.ts";
import { userFills, type UserFillsParameters, type UserFillsResponse } from "./_methods/userFills.ts";
import {
  userFillsByTime,
  type UserFillsByTimeParameters,
  type UserFillsByTimeResponse,
} from "./_methods/userFillsByTime.ts";
import { userFunding, type UserFundingParameters, type UserFundingResponse } from "./_methods/userFunding.ts";
import {
  userNonFundingLedgerUpdates,
  type UserNonFundingLedgerUpdatesParameters,
  type UserNonFundingLedgerUpdatesResponse,
} from "./_methods/userNonFundingLedgerUpdates.ts";
import { userRateLimit, type UserRateLimitParameters, type UserRateLimitResponse } from "./_methods/userRateLimit.ts";
import { userRole, type UserRoleParameters, type UserRoleResponse } from "./_methods/userRole.ts";
import {
  userToMultiSigSigners,
  type UserToMultiSigSignersParameters,
  type UserToMultiSigSignersResponse,
} from "./_methods/userToMultiSigSigners.ts";
import {
  userTwapSliceFills,
  type UserTwapSliceFillsParameters,
  type UserTwapSliceFillsResponse,
} from "./_methods/userTwapSliceFills.ts";
import {
  userTwapSliceFillsByTime,
  type UserTwapSliceFillsByTimeParameters,
  type UserTwapSliceFillsByTimeResponse,
} from "./_methods/userTwapSliceFillsByTime.ts";
import {
  userVaultEquities,
  type UserVaultEquitiesParameters,
  type UserVaultEquitiesResponse,
} from "./_methods/userVaultEquities.ts";
import { validatorL1Votes, type ValidatorL1VotesResponse } from "./_methods/validatorL1Votes.ts";
import { validatorSummaries, type ValidatorSummariesResponse } from "./_methods/validatorSummaries.ts";
import { vaultDetails, type VaultDetailsParameters, type VaultDetailsResponse } from "./_methods/vaultDetails.ts";
import { vaultSummaries, type VaultSummariesResponse } from "./_methods/vaultSummaries.ts";
import { webData2, type WebData2Parameters, type WebData2Response } from "./_methods/webData2.ts";

// ============================================================
// Client
// ============================================================

/**
 * Read-only access to market data, user state, and other public information.
 *
 * Corresponds to the {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint | Info endpoint}.
 */
export class InfoClient<C extends InfoConfig = InfoConfig> {
  config_: C;

  /**
   * Creates an instance of the InfoClient.
   *
   * @param config Configuration for Info API requests. See {@link InfoConfig}.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const infoClient = new hl.InfoClient({ transport });
   * ```
   */
  constructor(config: C) {
    this.config_ = config;
  }

  /**
   * Request user active asset data.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return User active asset data.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.activeAssetData({ user: "0x...", coin: "ETH" });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
   */
  activeAssetData(
    params: ActiveAssetDataParameters,
    signal?: AbortSignal,
  ): Promise<ActiveAssetDataResponse> {
    return activeAssetData(this.config_, params, signal);
  }

  /**
   * Request supply, rate, and pending payment information for an aligned quote token.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Supply, rate, and pending payment information for an aligned quote token.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.alignedQuoteTokenInfo({ token: 1328 });
   * ```
   *
   * @see null
   */
  alignedQuoteTokenInfo(
    params: AlignedQuoteTokenInfoParameters,
    signal?: AbortSignal,
  ): Promise<AlignedQuoteTokenInfoResponse> {
    return alignedQuoteTokenInfo(this.config_, params, signal);
  }

  /**
   * Request all borrow/lend reserve states.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of tuples of reserve IDs and their borrow/lend reserve state.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.allBorrowLendReserveStates();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-all-borrow-lend-reserve-states
   */
  allBorrowLendReserveStates(
    signal?: AbortSignal,
  ): Promise<AllBorrowLendReserveStatesResponse> {
    return allBorrowLendReserveStates(this.config_, signal);
  }

  /**
   * Request mid coin prices.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Mapping of coin symbols to mid prices.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.allMids();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
   */
  allMids(
    params?: AllMidsParameters,
    signal?: AbortSignal,
  ): Promise<AllMidsResponse>;
  allMids(
    signal?: AbortSignal,
  ): Promise<AllMidsResponse>;
  allMids(
    paramsOrSignal?: AllMidsParameters | AbortSignal,
    maybeSignal?: AbortSignal,
  ): Promise<AllMidsResponse> {
    const params = paramsOrSignal instanceof AbortSignal ? {} : paramsOrSignal;
    const signal = paramsOrSignal instanceof AbortSignal ? paramsOrSignal : maybeSignal;
    return allMids(this.config_, params, signal);
  }

  /**
   * Request trading metadata for all DEXes.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Metadata for perpetual assets across all DEXes.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.allPerpMetas();
   * ```
   *
   * @see null
   */
  allPerpMetas(
    signal?: AbortSignal,
  ): Promise<AllPerpMetasResponse> {
    return allPerpMetas(this.config_, signal);
  }

  /**
   * Request block details by block height.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Response containing block information.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.blockDetails({ height: 123 });
   * ```
   *
   * @see null
   */
  blockDetails(
    params: BlockDetailsParameters,
    signal?: AbortSignal,
  ): Promise<BlockDetailsResponse> {
    return blockDetails(this.config_, params, signal);
  }

  /**
   * Request borrow/lend reserve state.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Borrow/lend reserve state.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.borrowLendReserveState({ token: 0 });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-reserve-state
   */
  borrowLendReserveState(
    params: BorrowLendReserveStateParameters,
    signal?: AbortSignal,
  ): Promise<BorrowLendReserveStateResponse> {
    return borrowLendReserveState(this.config_, params, signal);
  }

  /**
   * Request borrow/lend user state.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return User's borrow/lend state.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.borrowLendUserState({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
   */
  borrowLendUserState(
    params: BorrowLendUserStateParameters,
    signal?: AbortSignal,
  ): Promise<BorrowLendUserStateResponse> {
    return borrowLendUserState(this.config_, params, signal);
  }

  /**
   * Request candlestick snapshots.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of candlestick data points.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.candleSnapshot({
   *   coin: "ETH",
   *   interval: "1h",
   *   startTime: Date.now() - 1000 * 60 * 60 * 24,
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
   */
  candleSnapshot(
    params: CandleSnapshotParameters,
    signal?: AbortSignal,
  ): Promise<CandleSnapshotResponse> {
    return candleSnapshot(this.config_, params, signal);
  }

  /**
   * Request clearinghouse state.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Account summary for perpetual trading.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.clearinghouseState({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
   */
  clearinghouseState(
    params: ClearinghouseStateParameters,
    signal?: AbortSignal,
  ): Promise<ClearinghouseStateResponse> {
    return clearinghouseState(this.config_, params, signal);
  }

  /**
   * Request user staking delegations.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user's delegations to validators.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.delegations({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
   */
  delegations(
    params: DelegationsParameters,
    signal?: AbortSignal,
  ): Promise<DelegationsResponse> {
    return delegations(this.config_, params, signal);
  }

  /**
   * Request user staking history.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of records of staking events by a delegator.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.delegatorHistory({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
   */
  delegatorHistory(
    params: DelegatorHistoryParameters,
    signal?: AbortSignal,
  ): Promise<DelegatorHistoryResponse> {
    return delegatorHistory(this.config_, params, signal);
  }

  /**
   * Request user staking rewards.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of rewards received from staking activities.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.delegatorRewards({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards
   */
  delegatorRewards(
    params: DelegatorRewardsParameters,
    signal?: AbortSignal,
  ): Promise<DelegatorRewardsResponse> {
    return delegatorRewards(this.config_, params, signal);
  }

  /**
   * Request user's staking summary.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return User's staking summary.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.delegatorSummary({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
   */
  delegatorSummary(
    params: DelegatorSummaryParameters,
    signal?: AbortSignal,
  ): Promise<DelegatorSummaryResponse> {
    return delegatorSummary(this.config_, params, signal);
  }

  /**
   * Request exchange system status information.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Exchange system status information.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.exchangeStatus();
   * ```
   *
   * @see null
   */
  exchangeStatus(
    signal?: AbortSignal,
  ): Promise<ExchangeStatusResponse> {
    return exchangeStatus(this.config_, signal);
  }

  /**
   * Request user extra agents.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of extra agent details for a user.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.extraAgents({ user: "0x..." });
   * ```
   *
   * @see null
   */
  extraAgents(
    params: ExtraAgentsParameters,
    signal?: AbortSignal,
  ): Promise<ExtraAgentsResponse> {
    return extraAgents(this.config_, params, signal);
  }

  /**
   * Request frontend open orders.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of open orders with additional display information.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.frontendOpenOrders({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info
   */
  frontendOpenOrders(
    params: FrontendOpenOrdersParameters,
    signal?: AbortSignal,
  ): Promise<FrontendOpenOrdersResponse> {
    return frontendOpenOrders(this.config_, params, signal);
  }

  /**
   * Request funding history.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of historical funding rate records for an asset.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.fundingHistory({
   *   coin: "ETH",
   *   startTime: Date.now() - 1000 * 60 * 60 * 24,
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
   */
  fundingHistory(
    params: FundingHistoryParameters,
    signal?: AbortSignal,
  ): Promise<FundingHistoryResponse> {
    return fundingHistory(this.config_, params, signal);
  }

  /**
   * Request gossip root IPs.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of gossip root IPs.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.gossipRootIps();
   * ```
   *
   * @see null
   */
  gossipRootIps(
    signal?: AbortSignal,
  ): Promise<GossipRootIpsResponse> {
    return gossipRootIps(this.config_, signal);
  }

  /**
   * Request user historical orders.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of frontend orders with current processing status.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.historicalOrders({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
   */
  historicalOrders(
    params: HistoricalOrdersParameters,
    signal?: AbortSignal,
  ): Promise<HistoricalOrdersResponse> {
    return historicalOrders(this.config_, params, signal);
  }

  /**
   * Request to check if a user is a VIP.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Boolean indicating user's VIP status.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.isVip({ user: "0x..." });
   * ```
   *
   * @see null
   */
  isVip(
    params: IsVipParameters,
    signal?: AbortSignal,
  ): Promise<IsVipResponse> {
    return isVip(this.config_, params, signal);
  }

  /**
   * Request L2 order book.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return L2 order book snapshot.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.l2Book({ coin: "ETH", nSigFigs: 2 });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
   */
  l2Book(
    params: L2BookParameters,
    signal?: AbortSignal,
  ): Promise<L2BookResponse> {
    return l2Book(this.config_, params, signal);
  }

  /**
   * Request leading vaults for a user.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of leading vaults for a user.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.leadingVaults({ user: "0x..." });
   * ```
   *
   * @see null
   */
  leadingVaults(
    params: LeadingVaultsParameters,
    signal?: AbortSignal,
  ): Promise<LeadingVaultsResponse> {
    return leadingVaults(this.config_, params, signal);
  }

  /**
   * Request legal verification status of a user.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Legal verification status for a user.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.legalCheck({ user: "0x..." });
   * ```
   *
   * @see null
   */
  legalCheck(
    params: LegalCheckParameters,
    signal?: AbortSignal,
  ): Promise<LegalCheckResponse> {
    return legalCheck(this.config_, params, signal);
  }

  /**
   * Request liquidatable.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Unknown array.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.liquidatable();
   * ```
   *
   * @see null
   */
  liquidatable(
    signal?: AbortSignal,
  ): Promise<LiquidatableResponse> {
    return liquidatable(this.config_, signal);
  }

  /**
   * Request margin table data.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Margin requirements table with multiple tiers.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.marginTable({ id: 1 });
   * ```
   *
   * @see null
   */
  marginTable(
    params: MarginTableParameters,
    signal?: AbortSignal,
  ): Promise<MarginTableResponse> {
    return marginTable(this.config_, params, signal);
  }

  /**
   * Request builder fee approval.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Maximum builder fee approval.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.maxBuilderFee({ user: "0x...", builder: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval
   */
  maxBuilderFee(
    params: MaxBuilderFeeParameters,
    signal?: AbortSignal,
  ): Promise<MaxBuilderFeeResponse> {
    return maxBuilderFee(this.config_, params, signal);
  }

  /**
   * Request maximum market order notionals.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Maximum market order notionals.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.maxMarketOrderNtls();
   * ```
   *
   * @see null
   */
  maxMarketOrderNtls(
    signal?: AbortSignal,
  ): Promise<MaxMarketOrderNtlsResponse> {
    return maxMarketOrderNtls(this.config_, signal);
  }

  /**
   * Request trading metadata.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Metadata for perpetual assets.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.meta();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata-universe-and-margin-tables
   */
  meta(
    params?: MetaParameters,
    signal?: AbortSignal,
  ): Promise<MetaResponse>;
  meta(
    signal?: AbortSignal,
  ): Promise<MetaResponse>;
  meta(
    paramsOrSignal?: MetaParameters | AbortSignal,
    maybeSignal?: AbortSignal,
  ): Promise<MetaResponse> {
    const params = paramsOrSignal instanceof AbortSignal ? {} : paramsOrSignal;
    const signal = paramsOrSignal instanceof AbortSignal ? paramsOrSignal : maybeSignal;
    return meta(this.config_, params, signal);
  }

  /**
   * Request metadata and asset contexts.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Metadata and context for perpetual assets.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.metaAndAssetCtxs();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
   */
  metaAndAssetCtxs(
    params?: MetaAndAssetCtxsParameters,
    signal?: AbortSignal,
  ): Promise<MetaAndAssetCtxsResponse>;
  metaAndAssetCtxs(
    signal?: AbortSignal,
  ): Promise<MetaAndAssetCtxsResponse>;
  metaAndAssetCtxs(
    paramsOrSignal?: MetaAndAssetCtxsParameters | AbortSignal,
    maybeSignal?: AbortSignal,
  ): Promise<MetaAndAssetCtxsResponse> {
    const params = paramsOrSignal instanceof AbortSignal ? {} : paramsOrSignal;
    const signal = paramsOrSignal instanceof AbortSignal ? paramsOrSignal : maybeSignal;
    return metaAndAssetCtxs(this.config_, params, signal);
  }

  /**
   * Request open orders.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of open orders.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.openOrders({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
   */
  openOrders(
    params: OpenOrdersParameters,
    signal?: AbortSignal,
  ): Promise<OpenOrdersResponse> {
    return openOrders(this.config_, params, signal);
  }

  /**
   * Request order status.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Order status response.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.orderStatus({ user: "0x...", oid: 12345 });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
   */
  orderStatus(
    params: OrderStatusParameters,
    signal?: AbortSignal,
  ): Promise<OrderStatusResponse> {
    return orderStatus(this.config_, params, signal);
  }

  /**
   * Request for the status of the perpetual deploy auction.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Status of the perpetual deploy auction.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.perpDeployAuctionStatus();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-information-about-the-perp-deploy-auction
   */
  perpDeployAuctionStatus(
    signal?: AbortSignal,
  ): Promise<PerpDeployAuctionStatusResponse> {
    return perpDeployAuctionStatus(this.config_, signal);
  }

  /**
   * Request builder deployed perpetual market limits.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Builder deployed perpetual market limits.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.perpDexLimits({ dex: "test" });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-builder-deployed-perp-market-limits
   */
  perpDexLimits(
    params: PerpDexLimitsParameters,
    signal?: AbortSignal,
  ): Promise<PerpDexLimitsResponse> {
    return perpDexLimits(this.config_, params, signal);
  }

  /**
   * Request all perpetual dexs.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of perpetual dexes (null is main dex).
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.perpDexs();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
   */
  perpDexs(
    signal?: AbortSignal,
  ): Promise<PerpDexsResponse> {
    return perpDexs(this.config_, signal);
  }

  /**
   * Request perp DEX status.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Status of a perp DEX.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.perpDexStatus({ dex: "test" });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#get-perp-market-status
   */
  perpDexStatus(
    params: PerpDexStatusParameters,
    signal?: AbortSignal,
  ): Promise<PerpDexStatusResponse> {
    return perpDexStatus(this.config_, params, signal);
  }

  /**
   * Request perpetuals at open interest cap.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of perpetuals at open interest caps.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.perpsAtOpenInterestCap();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
   */
  perpsAtOpenInterestCap(
    params?: PerpsAtOpenInterestCapParameters,
    signal?: AbortSignal,
  ): Promise<PerpsAtOpenInterestCapResponse>;
  perpsAtOpenInterestCap(
    signal?: AbortSignal,
  ): Promise<PerpsAtOpenInterestCapResponse>;
  perpsAtOpenInterestCap(
    paramsOrSignal?: PerpsAtOpenInterestCapParameters | AbortSignal,
    maybeSignal?: AbortSignal,
  ): Promise<PerpsAtOpenInterestCapResponse> {
    const params = paramsOrSignal instanceof AbortSignal ? {} : paramsOrSignal;
    const signal = paramsOrSignal instanceof AbortSignal ? paramsOrSignal : maybeSignal;
    return perpsAtOpenInterestCap(this.config_, params, signal);
  }

  /**
   * Request user portfolio.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Portfolio metrics grouped by time periods.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.portfolio({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-portfolio
   */
  portfolio(
    params: PortfolioParameters,
    signal?: AbortSignal,
  ): Promise<PortfolioResponse> {
    return portfolio(this.config_, params, signal);
  }

  /**
   * Request predicted funding rates.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of predicted funding rates.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.predictedFundings();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
   */
  predictedFundings(
    signal?: AbortSignal,
  ): Promise<PredictedFundingsResponse> {
    return predictedFundings(this.config_, signal);
  }

  /**
   * Request user existence check before transfer.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Pre-transfer user existence check result.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.preTransferCheck({ user: "0x...", source: "0x..." });
   * ```
   *
   * @see null
   */
  preTransferCheck(
    params: PreTransferCheckParameters,
    signal?: AbortSignal,
  ): Promise<PreTransferCheckResponse> {
    return preTransferCheck(this.config_, params, signal);
  }

  /**
   * Request recent trades.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of recent trades.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.recentTrades({ coin: "ETH" });
   * ```
   *
   * @see null
   */
  recentTrades(
    params: RecentTradesParameters,
    signal?: AbortSignal,
  ): Promise<RecentTradesResponse> {
    return recentTrades(this.config_, params, signal);
  }

  /**
   * Request user referral.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Referral details for a user.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.referral({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
   */
  referral(
    params: ReferralParameters,
    signal?: AbortSignal,
  ): Promise<ReferralResponse> {
    return referral(this.config_, params, signal);
  }

  /**
   * Request spot clearinghouse state.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Account summary for spot trading.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.spotClearinghouseState({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
   */
  spotClearinghouseState(
    params: SpotClearinghouseStateParameters,
    signal?: AbortSignal,
  ): Promise<SpotClearinghouseStateResponse> {
    return spotClearinghouseState(this.config_, params, signal);
  }

  /**
   * Request spot deploy state.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Deploy state for spot tokens.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.spotDeployState({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
   */
  spotDeployState(
    params: SpotDeployStateParameters,
    signal?: AbortSignal,
  ): Promise<SpotDeployStateResponse> {
    return spotDeployState(this.config_, params, signal);
  }

  /**
   * Request spot trading metadata.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Metadata for spot assets.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.spotMeta();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
   */
  spotMeta(
    signal?: AbortSignal,
  ): Promise<SpotMetaResponse> {
    return spotMeta(this.config_, signal);
  }

  /**
   * Request spot metadata and asset contexts.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Metadata and context for spot assets.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.spotMetaAndAssetCtxs();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
   */
  spotMetaAndAssetCtxs(
    signal?: AbortSignal,
  ): Promise<SpotMetaAndAssetCtxsResponse> {
    return spotMetaAndAssetCtxs(this.config_, signal);
  }

  /**
   * Request for the status of the spot deploy auction.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Status of the spot deploy auction.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.spotPairDeployAuctionStatus();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-pair-deploy-auction
   */
  spotPairDeployAuctionStatus(
    signal?: AbortSignal,
  ): Promise<SpotPairDeployAuctionStatusResponse> {
    return spotPairDeployAuctionStatus(this.config_, signal);
  }

  /**
   * Request user sub-accounts.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user sub-account or null if the user does not have any sub-accounts.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.subAccounts({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
   */
  subAccounts(
    params: SubAccountsParameters,
    signal?: AbortSignal,
  ): Promise<SubAccountsResponse> {
    return subAccounts(this.config_, params, signal);
  }

  /**
   * Request user sub-accounts V2.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user sub-account or null if the user does not have any sub-accounts.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.subAccounts2({ user: "0x..." });
   * ```
   *
   * @see null
   */
  subAccounts2(
    params: SubAccounts2Parameters,
    signal?: AbortSignal,
  ): Promise<SubAccounts2Response> {
    return subAccounts2(this.config_, params, signal);
  }

  /**
   * Request token details.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Details of a token.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.tokenDetails({ tokenId: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token
   */
  tokenDetails(
    params: TokenDetailsParameters,
    signal?: AbortSignal,
  ): Promise<TokenDetailsResponse> {
    return tokenDetails(this.config_, params, signal);
  }

  /**
   * Request TWAP history of a user.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user's TWAP history.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.twapHistory({ user: "0x..." });
   * ```
   *
   * @see null
   */
  twapHistory(
    params: TwapHistoryParameters,
    signal?: AbortSignal,
  ): Promise<TwapHistoryResponse> {
    return twapHistory(this.config_, params, signal);
  }

  /**
   * Request transaction details by transaction hash.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Transaction details.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.txDetails({ hash: "0x..." });
   * ```
   *
   * @see null
   */
  txDetails(
    params: TxDetailsParameters,
    signal?: AbortSignal,
  ): Promise<TxDetailsResponse> {
    return txDetails(this.config_, params, signal);
  }

  /**
   * Request user abstraction state.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return User abstraction state.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userAbstraction({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-abstraction-state
   */
  userAbstraction(
    params: UserAbstractionParameters,
    signal?: AbortSignal,
  ): Promise<UserAbstractionResponse> {
    return userAbstraction(this.config_, params, signal);
  }

  /**
   * Request borrow/lend user interest.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return User's borrow/lend interest.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userBorrowLendInterest({
   *   user: "0x...",
   *   startTime: Date.now() - 1000 * 60 * 60 * 24,
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
   */
  userBorrowLendInterest(
    params: UserBorrowLendInterestParameters,
    signal?: AbortSignal,
  ): Promise<UserBorrowLendInterestResponse> {
    return userBorrowLendInterest(this.config_, params, signal);
  }

  /**
   * Request array of user transaction details.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user transaction details.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userDetails({ user: "0x..." });
   * ```
   *
   * @see null
   */
  userDetails(
    params: UserDetailsParameters,
    signal?: AbortSignal,
  ): Promise<UserDetailsResponse> {
    return userDetails(this.config_, params, signal);
  }

  /**
   * Request user HIP-3 DEX abstraction state.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return User HIP-3 DEX abstraction state.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userDexAbstraction({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-hip-3-dex-abstraction-state
   */
  userDexAbstraction(
    params: UserDexAbstractionParameters,
    signal?: AbortSignal,
  ): Promise<UserDexAbstractionResponse> {
    return userDexAbstraction(this.config_, params, signal);
  }

  /**
   * Request user fees.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return User fees.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userFees({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
   */
  userFees(
    params: UserFeesParameters,
    signal?: AbortSignal,
  ): Promise<UserFeesResponse> {
    return userFees(this.config_, params, signal);
  }

  /**
   * Request array of user fills.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user trade fills.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userFills({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
   */
  userFills(
    params: UserFillsParameters,
    signal?: AbortSignal,
  ): Promise<UserFillsResponse> {
    return userFills(this.config_, params, signal);
  }

  /**
   * Request array of user fills by time.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user trade fills by time.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userFillsByTime({
   *   user: "0x...",
   *   startTime: Date.now() - 1000 * 60 * 60 * 24,
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
   */
  userFillsByTime(
    params: UserFillsByTimeParameters,
    signal?: AbortSignal,
  ): Promise<UserFillsByTimeResponse> {
    return userFillsByTime(this.config_, params, signal);
  }

  /**
   * Request array of user funding ledger updates.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user funding ledger updates.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userFunding({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
   */
  userFunding(
    params: UserFundingParameters,
    signal?: AbortSignal,
  ): Promise<UserFundingResponse> {
    return userFunding(this.config_, params, signal);
  }

  /**
   * Request user non-funding ledger updates.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user's non-funding ledger update.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userNonFundingLedgerUpdates({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
   */
  userNonFundingLedgerUpdates(
    params: UserNonFundingLedgerUpdatesParameters,
    signal?: AbortSignal,
  ): Promise<UserNonFundingLedgerUpdatesResponse> {
    return userNonFundingLedgerUpdates(this.config_, params, signal);
  }

  /**
   * Request user rate limits.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return User rate limits.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userRateLimit({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
   */
  userRateLimit(
    params: UserRateLimitParameters,
    signal?: AbortSignal,
  ): Promise<UserRateLimitResponse> {
    return userRateLimit(this.config_, params, signal);
  }

  /**
   * Request user role.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return User role.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userRole({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
   */
  userRole(
    params: UserRoleParameters,
    signal?: AbortSignal,
  ): Promise<UserRoleResponse> {
    return userRole(this.config_, params, signal);
  }

  /**
   * Request multi-sig signers for a user.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Multi-sig signers for a user or null if the user does not have any multi-sig signers.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userToMultiSigSigners({ user: "0x..." });
   * ```
   *
   * @see null
   */
  userToMultiSigSigners(
    params: UserToMultiSigSignersParameters,
    signal?: AbortSignal,
  ): Promise<UserToMultiSigSignersResponse> {
    return userToMultiSigSigners(this.config_, params, signal);
  }

  /**
   * Request user TWAP slice fills.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user's TWAP slice fills.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userTwapSliceFills({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
   */
  userTwapSliceFills(
    params: UserTwapSliceFillsParameters,
    signal?: AbortSignal,
  ): Promise<UserTwapSliceFillsResponse> {
    return userTwapSliceFills(this.config_, params, signal);
  }

  /**
   * Request user TWAP slice fills by time.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user's TWAP slice fill by time.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userTwapSliceFillsByTime({
   *   user: "0x...",
   *   startTime: Date.now() - 1000 * 60 * 60 * 24,
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
   */
  userTwapSliceFillsByTime(
    params: UserTwapSliceFillsByTimeParameters,
    signal?: AbortSignal,
  ): Promise<UserTwapSliceFillsByTimeResponse> {
    return userTwapSliceFillsByTime(this.config_, params, signal);
  }

  /**
   * Request user vault deposits.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of user's vault deposits.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.userVaultEquities({ user: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
   */
  userVaultEquities(
    params: UserVaultEquitiesParameters,
    signal?: AbortSignal,
  ): Promise<UserVaultEquitiesResponse> {
    return userVaultEquities(this.config_, params, signal);
  }

  /**
   * Request validator L1 votes.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of L1 governance votes cast by validators.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.validatorL1Votes();
   * ```
   *
   * @see null
   */
  validatorL1Votes(
    signal?: AbortSignal,
  ): Promise<ValidatorL1VotesResponse> {
    return validatorL1Votes(this.config_, signal);
  }

  /**
   * Request validator summaries.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of validator performance statistics.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.validatorSummaries();
   * ```
   *
   * @see null
   */
  validatorSummaries(
    signal?: AbortSignal,
  ): Promise<ValidatorSummariesResponse> {
    return validatorSummaries(this.config_, signal);
  }

  /**
   * Request details of a vault.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Details of a vault or null if the vault does not exist.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.vaultDetails({ vaultAddress: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
   */
  vaultDetails(
    params: VaultDetailsParameters,
    signal?: AbortSignal,
  ): Promise<VaultDetailsResponse> {
    return vaultDetails(this.config_, params, signal);
  }

  /**
   * Request a list of vaults less than 2 hours old.
   *
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Array of vaults less than 2 hours old.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.vaultSummaries();
   * ```
   *
   * @see null
   */
  vaultSummaries(
    signal?: AbortSignal,
  ): Promise<VaultSummariesResponse> {
    return vaultSummaries(this.config_, signal);
  }

  /**
   * Request comprehensive user and market data.
   *
   * @param params Parameters specific to the API request.
   * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
   * @return Comprehensive user and market data.
   *
   * @throws {ValidationError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.InfoClient({ transport });
   *
   * const data = await client.webData2({ user: "0x..." });
   * ```
   *
   * @see null
   */
  webData2(
    params: WebData2Parameters,
    signal?: AbortSignal,
  ): Promise<WebData2Response> {
    return webData2(this.config_, params, signal);
  }
}

// ============================================================
// Type Re-exports
// ============================================================

export type { InfoConfig } from "./_methods/_base/types.ts";

export type { ActiveAssetDataParameters, ActiveAssetDataResponse } from "./_methods/activeAssetData.ts";
export type {
  AlignedQuoteTokenInfoParameters,
  AlignedQuoteTokenInfoResponse,
} from "./_methods/alignedQuoteTokenInfo.ts";
export type { AllBorrowLendReserveStatesResponse } from "./_methods/allBorrowLendReserveStates.ts";
export type { AllMidsParameters, AllMidsResponse } from "./_methods/allMids.ts";
export type { AllPerpMetasResponse } from "./_methods/allPerpMetas.ts";
export type { BlockDetailsParameters, BlockDetailsResponse } from "./_methods/blockDetails.ts";
export type {
  BorrowLendReserveStateParameters,
  BorrowLendReserveStateResponse,
} from "./_methods/borrowLendReserveState.ts";
export type { BorrowLendUserStateParameters, BorrowLendUserStateResponse } from "./_methods/borrowLendUserState.ts";
export type { CandleSnapshotParameters, CandleSnapshotResponse } from "./_methods/candleSnapshot.ts";
export type { ClearinghouseStateParameters, ClearinghouseStateResponse } from "./_methods/clearinghouseState.ts";
export type { DelegationsParameters, DelegationsResponse } from "./_methods/delegations.ts";
export type { DelegatorHistoryParameters, DelegatorHistoryResponse } from "./_methods/delegatorHistory.ts";
export type { DelegatorRewardsParameters, DelegatorRewardsResponse } from "./_methods/delegatorRewards.ts";
export type { DelegatorSummaryParameters, DelegatorSummaryResponse } from "./_methods/delegatorSummary.ts";
export type { ExchangeStatusResponse } from "./_methods/exchangeStatus.ts";
export type { ExtraAgentsParameters, ExtraAgentsResponse } from "./_methods/extraAgents.ts";
export type { FrontendOpenOrdersParameters, FrontendOpenOrdersResponse } from "./_methods/frontendOpenOrders.ts";
export type { FundingHistoryParameters, FundingHistoryResponse } from "./_methods/fundingHistory.ts";
export type { GossipRootIpsResponse } from "./_methods/gossipRootIps.ts";
export type { HistoricalOrdersParameters, HistoricalOrdersResponse } from "./_methods/historicalOrders.ts";
export type { IsVipParameters, IsVipResponse } from "./_methods/isVip.ts";
export type { L2BookParameters, L2BookResponse } from "./_methods/l2Book.ts";
export type { LeadingVaultsParameters, LeadingVaultsResponse } from "./_methods/leadingVaults.ts";
export type { LegalCheckParameters, LegalCheckResponse } from "./_methods/legalCheck.ts";
export type { LiquidatableResponse } from "./_methods/liquidatable.ts";
export type { MarginTableParameters, MarginTableResponse } from "./_methods/marginTable.ts";
export type { MaxBuilderFeeParameters, MaxBuilderFeeResponse } from "./_methods/maxBuilderFee.ts";
export type { MaxMarketOrderNtlsResponse } from "./_methods/maxMarketOrderNtls.ts";
export type { MetaParameters, MetaResponse } from "./_methods/meta.ts";
export type { MetaAndAssetCtxsParameters, MetaAndAssetCtxsResponse } from "./_methods/metaAndAssetCtxs.ts";
export type { OpenOrdersParameters, OpenOrdersResponse } from "./_methods/openOrders.ts";
export type { OrderStatusParameters, OrderStatusResponse } from "./_methods/orderStatus.ts";
export type { PerpDeployAuctionStatusResponse } from "./_methods/perpDeployAuctionStatus.ts";
export type { PerpDexLimitsParameters, PerpDexLimitsResponse } from "./_methods/perpDexLimits.ts";
export type { PerpDexsResponse } from "./_methods/perpDexs.ts";
export type { PerpDexStatusParameters, PerpDexStatusResponse } from "./_methods/perpDexStatus.ts";
export type {
  PerpsAtOpenInterestCapParameters,
  PerpsAtOpenInterestCapResponse,
} from "./_methods/perpsAtOpenInterestCap.ts";
export type { PortfolioParameters, PortfolioResponse } from "./_methods/portfolio.ts";
export type { PredictedFundingsResponse } from "./_methods/predictedFundings.ts";
export type { PreTransferCheckParameters, PreTransferCheckResponse } from "./_methods/preTransferCheck.ts";
export type { RecentTradesParameters, RecentTradesResponse } from "./_methods/recentTrades.ts";
export type { ReferralParameters, ReferralResponse } from "./_methods/referral.ts";
export type {
  SpotClearinghouseStateParameters,
  SpotClearinghouseStateResponse,
} from "./_methods/spotClearinghouseState.ts";
export type { SpotDeployStateParameters, SpotDeployStateResponse } from "./_methods/spotDeployState.ts";
export type { SpotMetaResponse } from "./_methods/spotMeta.ts";
export type { SpotMetaAndAssetCtxsResponse } from "./_methods/spotMetaAndAssetCtxs.ts";
export type { SpotPairDeployAuctionStatusResponse } from "./_methods/spotPairDeployAuctionStatus.ts";
export type { SubAccountsParameters, SubAccountsResponse } from "./_methods/subAccounts.ts";
export type { SubAccounts2Parameters, SubAccounts2Response } from "./_methods/subAccounts2.ts";
export type { TokenDetailsParameters, TokenDetailsResponse } from "./_methods/tokenDetails.ts";
export type { TwapHistoryParameters, TwapHistoryResponse } from "./_methods/twapHistory.ts";
export type { TxDetailsParameters, TxDetailsResponse } from "./_methods/txDetails.ts";
export type { UserAbstractionParameters, UserAbstractionResponse } from "./_methods/userAbstraction.ts";
export type {
  UserBorrowLendInterestParameters,
  UserBorrowLendInterestResponse,
} from "./_methods/userBorrowLendInterest.ts";
export type { UserDetailsParameters, UserDetailsResponse } from "./_methods/userDetails.ts";
export type {
  UserDexAbstractionParameters as UserDexAbstractionInfoParameters,
  UserDexAbstractionResponse as UserDexAbstractionInfoResponse,
} from "./_methods/userDexAbstraction.ts";
export type { UserFeesParameters, UserFeesResponse } from "./_methods/userFees.ts";
export type { UserFillsParameters, UserFillsResponse } from "./_methods/userFills.ts";
export type { UserFillsByTimeParameters, UserFillsByTimeResponse } from "./_methods/userFillsByTime.ts";
export type { UserFundingParameters, UserFundingResponse } from "./_methods/userFunding.ts";
export type {
  UserNonFundingLedgerUpdatesParameters,
  UserNonFundingLedgerUpdatesResponse,
} from "./_methods/userNonFundingLedgerUpdates.ts";
export type { UserRateLimitParameters, UserRateLimitResponse } from "./_methods/userRateLimit.ts";
export type { UserRoleParameters, UserRoleResponse } from "./_methods/userRole.ts";
export type {
  UserToMultiSigSignersParameters,
  UserToMultiSigSignersResponse,
} from "./_methods/userToMultiSigSigners.ts";
export type { UserTwapSliceFillsParameters, UserTwapSliceFillsResponse } from "./_methods/userTwapSliceFills.ts";
export type {
  UserTwapSliceFillsByTimeParameters,
  UserTwapSliceFillsByTimeResponse,
} from "./_methods/userTwapSliceFillsByTime.ts";
export type { UserVaultEquitiesParameters, UserVaultEquitiesResponse } from "./_methods/userVaultEquities.ts";
export type { ValidatorL1VotesResponse } from "./_methods/validatorL1Votes.ts";
export type { ValidatorSummariesResponse } from "./_methods/validatorSummaries.ts";
export type { VaultDetailsParameters, VaultDetailsResponse } from "./_methods/vaultDetails.ts";
export type { VaultSummariesResponse } from "./_methods/vaultSummaries.ts";
export type { WebData2Parameters, WebData2Response } from "./_methods/webData2.ts";
