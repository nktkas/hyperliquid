import type { InfoConfig } from "./_methods/_base/types.ts";

// =============================================================
// Methods Imports
// =============================================================

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

// =============================================================
// Client
// =============================================================

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
   * @param config - Configuration for Info API requests. See {@link InfoConfig}.
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

  /** @see {@link activeAssetData} */
  activeAssetData(
    params: ActiveAssetDataParameters,
    signal?: AbortSignal,
  ): Promise<ActiveAssetDataResponse> {
    return activeAssetData(this.config_, params, signal);
  }

  /** @see {@link alignedQuoteTokenInfo} */
  alignedQuoteTokenInfo(
    params: AlignedQuoteTokenInfoParameters,
    signal?: AbortSignal,
  ): Promise<AlignedQuoteTokenInfoResponse> {
    return alignedQuoteTokenInfo(this.config_, params, signal);
  }

  /** @see {@link allBorrowLendReserveStates} */
  allBorrowLendReserveStates(
    signal?: AbortSignal,
  ): Promise<AllBorrowLendReserveStatesResponse> {
    return allBorrowLendReserveStates(this.config_, signal);
  }

  /** @see {@link allMids} */
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

  /** @see {@link allPerpMetas} */
  allPerpMetas(
    signal?: AbortSignal,
  ): Promise<AllPerpMetasResponse> {
    return allPerpMetas(this.config_, signal);
  }

  /** @see {@link blockDetails} */
  blockDetails(
    params: BlockDetailsParameters,
    signal?: AbortSignal,
  ): Promise<BlockDetailsResponse> {
    return blockDetails(this.config_, params, signal);
  }

  /** @see {@link borrowLendReserveState} */
  borrowLendReserveState(
    params: BorrowLendReserveStateParameters,
    signal?: AbortSignal,
  ): Promise<BorrowLendReserveStateResponse> {
    return borrowLendReserveState(this.config_, params, signal);
  }

  /** @see {@link borrowLendUserState} */
  borrowLendUserState(
    params: BorrowLendUserStateParameters,
    signal?: AbortSignal,
  ): Promise<BorrowLendUserStateResponse> {
    return borrowLendUserState(this.config_, params, signal);
  }

  /** @see {@link candleSnapshot} */
  candleSnapshot(
    params: CandleSnapshotParameters,
    signal?: AbortSignal,
  ): Promise<CandleSnapshotResponse> {
    return candleSnapshot(this.config_, params, signal);
  }

  /** @see {@link clearinghouseState} */
  clearinghouseState(
    params: ClearinghouseStateParameters,
    signal?: AbortSignal,
  ): Promise<ClearinghouseStateResponse> {
    return clearinghouseState(this.config_, params, signal);
  }

  /** @see {@link delegations} */
  delegations(
    params: DelegationsParameters,
    signal?: AbortSignal,
  ): Promise<DelegationsResponse> {
    return delegations(this.config_, params, signal);
  }

  /** @see {@link delegatorHistory} */
  delegatorHistory(
    params: DelegatorHistoryParameters,
    signal?: AbortSignal,
  ): Promise<DelegatorHistoryResponse> {
    return delegatorHistory(this.config_, params, signal);
  }

  /** @see {@link delegatorRewards} */
  delegatorRewards(
    params: DelegatorRewardsParameters,
    signal?: AbortSignal,
  ): Promise<DelegatorRewardsResponse> {
    return delegatorRewards(this.config_, params, signal);
  }

  /** @see {@link delegatorSummary} */
  delegatorSummary(
    params: DelegatorSummaryParameters,
    signal?: AbortSignal,
  ): Promise<DelegatorSummaryResponse> {
    return delegatorSummary(this.config_, params, signal);
  }

  /** @see {@link exchangeStatus} */
  exchangeStatus(
    signal?: AbortSignal,
  ): Promise<ExchangeStatusResponse> {
    return exchangeStatus(this.config_, signal);
  }

  /** @see {@link extraAgents} */
  extraAgents(
    params: ExtraAgentsParameters,
    signal?: AbortSignal,
  ): Promise<ExtraAgentsResponse> {
    return extraAgents(this.config_, params, signal);
  }

  /** @see {@link frontendOpenOrders} */
  frontendOpenOrders(
    params: FrontendOpenOrdersParameters,
    signal?: AbortSignal,
  ): Promise<FrontendOpenOrdersResponse> {
    return frontendOpenOrders(this.config_, params, signal);
  }

  /** @see {@link fundingHistory} */
  fundingHistory(
    params: FundingHistoryParameters,
    signal?: AbortSignal,
  ): Promise<FundingHistoryResponse> {
    return fundingHistory(this.config_, params, signal);
  }

  /** @see {@link gossipRootIps} */
  gossipRootIps(
    signal?: AbortSignal,
  ): Promise<GossipRootIpsResponse> {
    return gossipRootIps(this.config_, signal);
  }

  /** @see {@link historicalOrders} */
  historicalOrders(
    params: HistoricalOrdersParameters,
    signal?: AbortSignal,
  ): Promise<HistoricalOrdersResponse> {
    return historicalOrders(this.config_, params, signal);
  }

  /** @see {@link isVip} */
  isVip(
    params: IsVipParameters,
    signal?: AbortSignal,
  ): Promise<IsVipResponse> {
    return isVip(this.config_, params, signal);
  }

  /** @see {@link l2Book} */
  l2Book(
    params: L2BookParameters,
    signal?: AbortSignal,
  ): Promise<L2BookResponse> {
    return l2Book(this.config_, params, signal);
  }

  /** @see {@link leadingVaults} */
  leadingVaults(
    params: LeadingVaultsParameters,
    signal?: AbortSignal,
  ): Promise<LeadingVaultsResponse> {
    return leadingVaults(this.config_, params, signal);
  }

  /** @see {@link legalCheck} */
  legalCheck(
    params: LegalCheckParameters,
    signal?: AbortSignal,
  ): Promise<LegalCheckResponse> {
    return legalCheck(this.config_, params, signal);
  }

  /** @see {@link liquidatable} */
  liquidatable(
    signal?: AbortSignal,
  ): Promise<LiquidatableResponse> {
    return liquidatable(this.config_, signal);
  }

  /** @see {@link marginTable} */
  marginTable(
    params: MarginTableParameters,
    signal?: AbortSignal,
  ): Promise<MarginTableResponse> {
    return marginTable(this.config_, params, signal);
  }

  /** @see {@link maxBuilderFee} */
  maxBuilderFee(
    params: MaxBuilderFeeParameters,
    signal?: AbortSignal,
  ): Promise<MaxBuilderFeeResponse> {
    return maxBuilderFee(this.config_, params, signal);
  }

  /** @see {@link maxMarketOrderNtls} */
  maxMarketOrderNtls(
    signal?: AbortSignal,
  ): Promise<MaxMarketOrderNtlsResponse> {
    return maxMarketOrderNtls(this.config_, signal);
  }

  /** @see {@link meta} */
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

  /** @see {@link metaAndAssetCtxs} */
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

  /** @see {@link openOrders} */
  openOrders(
    params: OpenOrdersParameters,
    signal?: AbortSignal,
  ): Promise<OpenOrdersResponse> {
    return openOrders(this.config_, params, signal);
  }

  /** @see {@link orderStatus} */
  orderStatus(
    params: OrderStatusParameters,
    signal?: AbortSignal,
  ): Promise<OrderStatusResponse> {
    return orderStatus(this.config_, params, signal);
  }

  /** @see {@link perpDeployAuctionStatus} */
  perpDeployAuctionStatus(
    signal?: AbortSignal,
  ): Promise<PerpDeployAuctionStatusResponse> {
    return perpDeployAuctionStatus(this.config_, signal);
  }

  /** @see {@link perpDexLimits} */
  perpDexLimits(
    params: PerpDexLimitsParameters,
    signal?: AbortSignal,
  ): Promise<PerpDexLimitsResponse> {
    return perpDexLimits(this.config_, params, signal);
  }

  /** @see {@link perpDexs} */
  perpDexs(
    signal?: AbortSignal,
  ): Promise<PerpDexsResponse> {
    return perpDexs(this.config_, signal);
  }

  /** @see {@link perpDexStatus} */
  perpDexStatus(
    params: PerpDexStatusParameters,
    signal?: AbortSignal,
  ): Promise<PerpDexStatusResponse> {
    return perpDexStatus(this.config_, params, signal);
  }

  /** @see {@link perpsAtOpenInterestCap} */
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

  /** @see {@link portfolio} */
  portfolio(
    params: PortfolioParameters,
    signal?: AbortSignal,
  ): Promise<PortfolioResponse> {
    return portfolio(this.config_, params, signal);
  }

  /** @see {@link predictedFundings} */
  predictedFundings(
    signal?: AbortSignal,
  ): Promise<PredictedFundingsResponse> {
    return predictedFundings(this.config_, signal);
  }

  /** @see {@link preTransferCheck} */
  preTransferCheck(
    params: PreTransferCheckParameters,
    signal?: AbortSignal,
  ): Promise<PreTransferCheckResponse> {
    return preTransferCheck(this.config_, params, signal);
  }

  /** @see {@link recentTrades} */
  recentTrades(
    params: RecentTradesParameters,
    signal?: AbortSignal,
  ): Promise<RecentTradesResponse> {
    return recentTrades(this.config_, params, signal);
  }

  /** @see {@link referral} */
  referral(
    params: ReferralParameters,
    signal?: AbortSignal,
  ): Promise<ReferralResponse> {
    return referral(this.config_, params, signal);
  }

  /** @see {@link spotClearinghouseState} */
  spotClearinghouseState(
    params: SpotClearinghouseStateParameters,
    signal?: AbortSignal,
  ): Promise<SpotClearinghouseStateResponse> {
    return spotClearinghouseState(this.config_, params, signal);
  }

  /** @see {@link spotDeployState} */
  spotDeployState(
    params: SpotDeployStateParameters,
    signal?: AbortSignal,
  ): Promise<SpotDeployStateResponse> {
    return spotDeployState(this.config_, params, signal);
  }

  /** @see {@link spotMeta} */
  spotMeta(
    signal?: AbortSignal,
  ): Promise<SpotMetaResponse> {
    return spotMeta(this.config_, signal);
  }

  /** @see {@link spotMetaAndAssetCtxs} */
  spotMetaAndAssetCtxs(
    signal?: AbortSignal,
  ): Promise<SpotMetaAndAssetCtxsResponse> {
    return spotMetaAndAssetCtxs(this.config_, signal);
  }

  /** @see {@link spotPairDeployAuctionStatus} */
  spotPairDeployAuctionStatus(
    signal?: AbortSignal,
  ): Promise<SpotPairDeployAuctionStatusResponse> {
    return spotPairDeployAuctionStatus(this.config_, signal);
  }

  /** @see {@link subAccounts} */
  subAccounts(
    params: SubAccountsParameters,
    signal?: AbortSignal,
  ): Promise<SubAccountsResponse> {
    return subAccounts(this.config_, params, signal);
  }

  /** @see {@link subAccounts2} */
  subAccounts2(
    params: SubAccounts2Parameters,
    signal?: AbortSignal,
  ): Promise<SubAccounts2Response> {
    return subAccounts2(this.config_, params, signal);
  }

  /** @see {@link tokenDetails} */
  tokenDetails(
    params: TokenDetailsParameters,
    signal?: AbortSignal,
  ): Promise<TokenDetailsResponse> {
    return tokenDetails(this.config_, params, signal);
  }

  /** @see {@link twapHistory} */
  twapHistory(
    params: TwapHistoryParameters,
    signal?: AbortSignal,
  ): Promise<TwapHistoryResponse> {
    return twapHistory(this.config_, params, signal);
  }

  /** @see {@link txDetails} */
  txDetails(
    params: TxDetailsParameters,
    signal?: AbortSignal,
  ): Promise<TxDetailsResponse> {
    return txDetails(this.config_, params, signal);
  }

  /** @see {@link userBorrowLendInterest} */
  userBorrowLendInterest(
    params: UserBorrowLendInterestParameters,
    signal?: AbortSignal,
  ): Promise<UserBorrowLendInterestResponse> {
    return userBorrowLendInterest(this.config_, params, signal);
  }

  /** @see {@link userDetails} */
  userDetails(
    params: UserDetailsParameters,
    signal?: AbortSignal,
  ): Promise<UserDetailsResponse> {
    return userDetails(this.config_, params, signal);
  }

  /** @see {@link userDexAbstraction} */
  userDexAbstraction(
    params: UserDexAbstractionParameters,
    signal?: AbortSignal,
  ): Promise<UserDexAbstractionResponse> {
    return userDexAbstraction(this.config_, params, signal);
  }

  /** @see {@link userFees} */
  userFees(
    params: UserFeesParameters,
    signal?: AbortSignal,
  ): Promise<UserFeesResponse> {
    return userFees(this.config_, params, signal);
  }

  /** @see {@link userFills} */
  userFills(
    params: UserFillsParameters,
    signal?: AbortSignal,
  ): Promise<UserFillsResponse> {
    return userFills(this.config_, params, signal);
  }

  /** @see {@link userFillsByTime} */
  userFillsByTime(
    params: UserFillsByTimeParameters,
    signal?: AbortSignal,
  ): Promise<UserFillsByTimeResponse> {
    return userFillsByTime(this.config_, params, signal);
  }

  /** @see {@link userFunding} */
  userFunding(
    params: UserFundingParameters,
    signal?: AbortSignal,
  ): Promise<UserFundingResponse> {
    return userFunding(this.config_, params, signal);
  }

  /** @see {@link userNonFundingLedgerUpdates} */
  userNonFundingLedgerUpdates(
    params: UserNonFundingLedgerUpdatesParameters,
    signal?: AbortSignal,
  ): Promise<UserNonFundingLedgerUpdatesResponse> {
    return userNonFundingLedgerUpdates(this.config_, params, signal);
  }

  /** @see {@link userRateLimit} */
  userRateLimit(
    params: UserRateLimitParameters,
    signal?: AbortSignal,
  ): Promise<UserRateLimitResponse> {
    return userRateLimit(this.config_, params, signal);
  }

  /** @see {@link userRole} */
  userRole(
    params: UserRoleParameters,
    signal?: AbortSignal,
  ): Promise<UserRoleResponse> {
    return userRole(this.config_, params, signal);
  }

  /** @see {@link userToMultiSigSigners} */
  userToMultiSigSigners(
    params: UserToMultiSigSignersParameters,
    signal?: AbortSignal,
  ): Promise<UserToMultiSigSignersResponse> {
    return userToMultiSigSigners(this.config_, params, signal);
  }

  /** @see {@link userTwapSliceFills} */
  userTwapSliceFills(
    params: UserTwapSliceFillsParameters,
    signal?: AbortSignal,
  ): Promise<UserTwapSliceFillsResponse> {
    return userTwapSliceFills(this.config_, params, signal);
  }

  /** @see {@link userTwapSliceFillsByTime} */
  userTwapSliceFillsByTime(
    params: UserTwapSliceFillsByTimeParameters,
    signal?: AbortSignal,
  ): Promise<UserTwapSliceFillsByTimeResponse> {
    return userTwapSliceFillsByTime(this.config_, params, signal);
  }

  /** @see {@link userVaultEquities} */
  userVaultEquities(
    params: UserVaultEquitiesParameters,
    signal?: AbortSignal,
  ): Promise<UserVaultEquitiesResponse> {
    return userVaultEquities(this.config_, params, signal);
  }

  /** @see {@link validatorL1Votes} */
  validatorL1Votes(
    signal?: AbortSignal,
  ): Promise<ValidatorL1VotesResponse> {
    return validatorL1Votes(this.config_, signal);
  }

  /** @see {@link validatorSummaries} */
  validatorSummaries(
    signal?: AbortSignal,
  ): Promise<ValidatorSummariesResponse> {
    return validatorSummaries(this.config_, signal);
  }

  /** @see {@link vaultDetails} */
  vaultDetails(
    params: VaultDetailsParameters,
    signal?: AbortSignal,
  ): Promise<VaultDetailsResponse> {
    return vaultDetails(this.config_, params, signal);
  }

  /** @see {@link vaultSummaries} */
  vaultSummaries(
    signal?: AbortSignal,
  ): Promise<VaultSummariesResponse> {
    return vaultSummaries(this.config_, signal);
  }

  /** @see {@link webData2} */
  webData2(
    params: WebData2Parameters,
    signal?: AbortSignal,
  ): Promise<WebData2Response> {
    return webData2(this.config_, params, signal);
  }
}

// =============================================================
// Type Re-exports
// =============================================================

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
