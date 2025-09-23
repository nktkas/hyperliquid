import type { OmitFirst, OverloadedParameters } from "../_common.ts";
import type { IRequestTransport } from "../../transport/base.ts";
import type { InfoRequestConfig } from "./_common.ts";

import { activeAssetData } from "./activeAssetData.ts";
import { allMids } from "./allMids.ts";
import { blockDetails } from "./blockDetails.ts";
import { candleSnapshot } from "./candleSnapshot.ts";
import { clearinghouseState } from "./clearinghouseState.ts";
import { delegations } from "./delegations.ts";
import { delegatorHistory } from "./delegatorHistory.ts";
import { delegatorRewards } from "./delegatorRewards.ts";
import { delegatorSummary } from "./delegatorSummary.ts";
import { exchangeStatus } from "./exchangeStatus.ts";
import { extraAgents } from "./extraAgents.ts";
import { frontendOpenOrders } from "./frontendOpenOrders.ts";
import { fundingHistory } from "./fundingHistory.ts";
import { gossipRootIps } from "./gossipRootIps.ts";
import { historicalOrders } from "./historicalOrders.ts";
import { isVip } from "./isVip.ts";
import { l2Book } from "./l2Book.ts";
import { leadingVaults } from "./leadingVaults.ts";
import { legalCheck } from "./legalCheck.ts";
import { liquidatable } from "./liquidatable.ts";
import { marginTable } from "./marginTable.ts";
import { maxBuilderFee } from "./maxBuilderFee.ts";
import { maxMarketOrderNtls } from "./maxMarketOrderNtls.ts";
import { meta } from "./meta.ts";
import { metaAndAssetCtxs } from "./metaAndAssetCtxs.ts";
import { openOrders } from "./openOrders.ts";
import { orderStatus } from "./orderStatus.ts";
import { perpDeployAuctionStatus } from "./perpDeployAuctionStatus.ts";
import { perpDexLimits } from "./perpDexLimits.ts";
import { perpDexs } from "./perpDexs.ts";
import { perpsAtOpenInterestCap } from "./perpsAtOpenInterestCap.ts";
import { portfolio } from "./portfolio.ts";
import { predictedFundings } from "./predictedFundings.ts";
import { preTransferCheck } from "./preTransferCheck.ts";
import { recentTrades } from "./recentTrades.ts";
import { referral } from "./referral.ts";
import { spotClearinghouseState } from "./spotClearinghouseState.ts";
import { spotDeployState } from "./spotDeployState.ts";
import { spotMeta } from "./spotMeta.ts";
import { spotMetaAndAssetCtxs } from "./spotMetaAndAssetCtxs.ts";
import { spotPairDeployAuctionStatus } from "./spotPairDeployAuctionStatus.ts";
import { subAccounts } from "./subAccounts.ts";
import { tokenDetails } from "./tokenDetails.ts";
import { twapHistory } from "./twapHistory.ts";
import { txDetails } from "./txDetails.ts";
import { userDetails } from "./userDetails.ts";
import { userFees } from "./userFees.ts";
import { userFills } from "./userFills.ts";
import { userFillsByTime } from "./userFillsByTime.ts";
import { userFunding } from "./userFunding.ts";
import { userNonFundingLedgerUpdates } from "./userNonFundingLedgerUpdates.ts";
import { userRateLimit } from "./userRateLimit.ts";
import { userRole } from "./userRole.ts";
import { userToMultiSigSigners } from "./userToMultiSigSigners.ts";
import { userTwapSliceFills } from "./userTwapSliceFills.ts";
import { userTwapSliceFillsByTime } from "./userTwapSliceFillsByTime.ts";
import { userVaultEquities } from "./userVaultEquities.ts";
import { validatorL1Votes } from "./validatorL1Votes.ts";
import { validatorSummaries } from "./validatorSummaries.ts";
import { vaultDetails } from "./vaultDetails.ts";
import { vaultSummaries } from "./vaultSummaries.ts";
import { webData2 } from "./webData2.ts";

export type { ActiveAssetDataParameters, ActiveAssetDataResponse } from "./activeAssetData.ts";
export type { AllMidsParameters, AllMidsResponse } from "./allMids.ts";
export type { BlockDetailsParameters, BlockDetailsResponse } from "./blockDetails.ts";
export type { CandleSnapshotParameters, CandleSnapshotResponse } from "./candleSnapshot.ts";
export type { ClearinghouseStateParameters, ClearinghouseStateResponse } from "./clearinghouseState.ts";
export type { DelegationsParameters, DelegationsResponse } from "./delegations.ts";
export type { DelegatorHistoryParameters, DelegatorHistoryResponse } from "./delegatorHistory.ts";
export type { DelegatorRewardsParameters, DelegatorRewardsResponse } from "./delegatorRewards.ts";
export type { DelegatorSummaryParameters, DelegatorSummaryResponse } from "./delegatorSummary.ts";
export type { ExchangeStatusResponse } from "./exchangeStatus.ts";
export type { ExtraAgentsParameters, ExtraAgentsResponse } from "./extraAgents.ts";
export type { FrontendOpenOrdersParameters, FrontendOpenOrdersResponse } from "./frontendOpenOrders.ts";
export type { FundingHistoryParameters, FundingHistoryResponse } from "./fundingHistory.ts";
export type { GossipRootIpsResponse } from "./gossipRootIps.ts";
export type { HistoricalOrdersParameters, HistoricalOrdersResponse } from "./historicalOrders.ts";
export type { IsVipParameters, IsVipResponse } from "./isVip.ts";
export type { L2BookParameters, L2BookResponse } from "./l2Book.ts";
export type { LeadingVaultsParameters, LeadingVaultsResponse } from "./leadingVaults.ts";
export type { LegalCheckParameters, LegalCheckResponse } from "./legalCheck.ts";
export type { LiquidatableResponse } from "./liquidatable.ts";
export type { MarginTableParameters, MarginTableResponse } from "./marginTable.ts";
export type { MaxBuilderFeeParameters, MaxBuilderFeeResponse } from "./maxBuilderFee.ts";
export type { MaxMarketOrderNtlsParameters, MaxMarketOrderNtlsResponse } from "./maxMarketOrderNtls.ts";
export type { MetaParameters, MetaResponse } from "./meta.ts";
export type { MetaAndAssetCtxsParameters, MetaAndAssetCtxsResponse } from "./metaAndAssetCtxs.ts";
export type { OpenOrdersParameters, OpenOrdersResponse } from "./openOrders.ts";
export type { OrderStatusParameters, OrderStatusResponse } from "./orderStatus.ts";
export type { PerpDeployAuctionStatusResponse } from "./perpDeployAuctionStatus.ts";
export type { PerpDexLimitsParameters, PerpDexLimitsResponse } from "./perpDexLimits.ts";
export type { PerpDexsResponse } from "./perpDexs.ts";
export type { PerpsAtOpenInterestCapParameters, PerpsAtOpenInterestCapResponse } from "./perpsAtOpenInterestCap.ts";
export type { PortfolioParameters, PortfolioResponse } from "./portfolio.ts";
export type { PredictedFundingsResponse } from "./predictedFundings.ts";
export type { PreTransferCheckParameters, PreTransferCheckResponse } from "./preTransferCheck.ts";
export type { RecentTradesParameters, RecentTradesResponse } from "./recentTrades.ts";
export type { ReferralParameters, ReferralResponse } from "./referral.ts";
export type { SpotClearinghouseStateParameters, SpotClearinghouseStateResponse } from "./spotClearinghouseState.ts";
export type { SpotDeployStateParameters, SpotDeployStateResponse } from "./spotDeployState.ts";
export type { SpotMetaResponse } from "./spotMeta.ts";
export type { SpotMetaAndAssetCtxsResponse } from "./spotMetaAndAssetCtxs.ts";
export type { SpotPairDeployAuctionStatusResponse } from "./spotPairDeployAuctionStatus.ts";
export type { SubAccountsParameters, SubAccountsResponse } from "./subAccounts.ts";
export type { TokenDetailsParameters, TokenDetailsResponse } from "./tokenDetails.ts";
export type { TwapHistoryParameters, TwapHistoryResponse } from "./twapHistory.ts";
export type { TxDetailsParameters, TxDetailsResponse } from "./txDetails.ts";
export type { UserDetailsParameters, UserDetailsResponse } from "./userDetails.ts";
export type { UserFeesParameters, UserFeesResponse } from "./userFees.ts";
export type { UserFillsParameters, UserFillsResponse } from "./userFills.ts";
export type { UserFillsByTimeParameters, UserFillsByTimeResponse } from "./userFillsByTime.ts";
export type { UserFundingParameters, UserFundingResponse } from "./userFunding.ts";
export type {
  UserNonFundingLedgerUpdatesParameters,
  UserNonFundingLedgerUpdatesResponse,
} from "./userNonFundingLedgerUpdates.ts";
export type { UserRateLimitParameters, UserRateLimitResponse } from "./userRateLimit.ts";
export type { UserRoleParameters, UserRoleResponse } from "./userRole.ts";
export type { UserToMultiSigSignersParameters, UserToMultiSigSignersResponse } from "./userToMultiSigSigners.ts";
export type { UserTwapSliceFillsParameters, UserTwapSliceFillsResponse } from "./userTwapSliceFills.ts";
export type {
  UserTwapSliceFillsByTimeParameters,
  UserTwapSliceFillsByTimeResponse,
} from "./userTwapSliceFillsByTime.ts";
export type { UserVaultEquitiesParameters, UserVaultEquitiesResponse } from "./userVaultEquities.ts";
export type { ValidatorL1VotesResponse } from "./validatorL1Votes.ts";
export type { ValidatorSummariesResponse } from "./validatorSummaries.ts";
export type { VaultDetailsParameters, VaultDetailsResponse } from "./vaultDetails.ts";
export type { VaultSummariesResponse } from "./vaultSummaries.ts";
export type { WebData2Parameters, WebData2Response } from "./webData2.ts";

/**
 * A client for interacting with the Hyperliquid Info API.
 * @typeParam T - The transport (extends {@linkcode IRequestTransport}) used to connect to the Hyperliquid API.
 */
export class InfoClient<T extends IRequestTransport = IRequestTransport> implements InfoRequestConfig<T> {
  transport: T;

  /**
   * Initialises a new instance.
   * @param args - The arguments for initialisation.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport();
   * const infoClient = new hl.InfoClient({ transport });
   * ```
   */
  constructor(args: InfoRequestConfig<T>) {
    this.transport = args.transport;
  }

  /**
   * Request user active asset data.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns User active asset data.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.activeAssetData({ user: "0x...", coin: "ETH" });
   * ```
   */
  activeAssetData(...args: OmitFirst<OverloadedParameters<typeof activeAssetData>>) {
    return activeAssetData(this, ...args);
  }

  /**
   * Request mid coin prices.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Mapping of coin symbols to mid prices.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.allMids();
   * ```
   */
  allMids(...args: OmitFirst<OverloadedParameters<typeof allMids>>) {
    return allMids(
      this,
      // @ts-ignore: TypeScript can't resolve overloaded signatures from parameter unions
      ...args,
    );
  }

  /**
   * Request block details by block height.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Response containing block information.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this API
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.blockDetails({ height: 123 });
   * ```
   */
  blockDetails(
    this: T extends { request(endpoint: "explorer", ...args: unknown[]): unknown } ? InfoRequestConfig<T> : never,
    ...args: OmitFirst<OverloadedParameters<typeof blockDetails>>
  ) {
    return blockDetails(this, ...args);
  }

  /**
   * Request candlestick snapshots.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of candlestick data points.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.candleSnapshot({
   *   coin: "ETH",
   *   interval: "1h",
   *   startTime: Date.now() - 1000 * 60 * 60 * 24,
   * });
   * ```
   */
  candleSnapshot(...args: OmitFirst<OverloadedParameters<typeof candleSnapshot>>) {
    return candleSnapshot(this, ...args);
  }

  /**
   * Request clearinghouse state.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Account summary for perpetual trading.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.clearinghouseState({ user: "0x..." });
   * ```
   */
  clearinghouseState(...args: OmitFirst<OverloadedParameters<typeof clearinghouseState>>) {
    return clearinghouseState(this, ...args);
  }

  /**
   * Request user staking delegations.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of user's delegations to validators.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.delegations({ user: "0x..." });
   * ```
   */
  delegations(...args: OmitFirst<OverloadedParameters<typeof delegations>>) {
    return delegations(this, ...args);
  }

  /**
   * Request user staking history.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of records of staking events by a delegator.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.delegatorHistory({ user: "0x..." });
   * ```
   */
  delegatorHistory(...args: OmitFirst<OverloadedParameters<typeof delegatorHistory>>) {
    return delegatorHistory(this, ...args);
  }

  /**
   * Request user staking rewards.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of rewards received from staking activities.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.delegatorRewards({ user: "0x..." });
   * ```
   */
  delegatorRewards(...args: OmitFirst<OverloadedParameters<typeof delegatorRewards>>) {
    return delegatorRewards(this, ...args);
  }

  /**
   * Request user's staking summary.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns User's staking summary.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.delegatorSummary({ user: "0x..." });
   * ```
   */
  delegatorSummary(...args: OmitFirst<OverloadedParameters<typeof delegatorSummary>>) {
    return delegatorSummary(this, ...args);
  }

  /**
   * Request exchange system status information.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Exchange system status information.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.exchangeStatus();
   * ```
   */
  exchangeStatus(...args: OmitFirst<OverloadedParameters<typeof exchangeStatus>>) {
    return exchangeStatus(this, ...args);
  }

  /**
   * Request user extra agents.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of extra agent details for a user.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.extraAgents({ user: "0x..." });
   * ```
   */
  extraAgents(...args: OmitFirst<OverloadedParameters<typeof extraAgents>>) {
    return extraAgents(this, ...args);
  }

  /**
   * Request frontend open orders.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of open orders with additional display information.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.frontendOpenOrders({ user: "0x..." });
   * ```
   */
  frontendOpenOrders(...args: OmitFirst<OverloadedParameters<typeof frontendOpenOrders>>) {
    return frontendOpenOrders(this, ...args);
  }

  /**
   * Request funding history.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of historical funding rate records for an asset.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.fundingHistory({
   *   coin: "ETH",
   *   startTime: Date.now() - 1000 * 60 * 60 * 24,
   * });
   * ```
   */
  fundingHistory(...args: OmitFirst<OverloadedParameters<typeof fundingHistory>>) {
    return fundingHistory(this, ...args);
  }

  /**
   * Request gossip root IPs.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of gossip root IPs.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.gossipRootIps();
   * ```
   */
  gossipRootIps(...args: OmitFirst<OverloadedParameters<typeof gossipRootIps>>) {
    return gossipRootIps(this, ...args);
  }

  /**
   * Request user historical orders.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of frontend orders with current processing status.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.historicalOrders({ user: "0x..." });
   * ```
   */
  historicalOrders(...args: OmitFirst<OverloadedParameters<typeof historicalOrders>>) {
    return historicalOrders(this, ...args);
  }

  /**
   * Request to check if a user is a VIP.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Boolean indicating user's VIP status.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.isVip({ user: "0x..." });
   * ```
   */
  isVip(...args: OmitFirst<OverloadedParameters<typeof isVip>>) {
    return isVip(this, ...args);
  }

  /**
   * Request L2 order book.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns L2 order book snapshot.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.l2Book({ coin: "ETH", nSigFigs: 2 });
   * ```
   */
  l2Book(...args: OmitFirst<OverloadedParameters<typeof l2Book>>) {
    return l2Book(this, ...args);
  }

  /**
   * Request leading vaults for a user.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of leading vaults for a user.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.leadingVaults({ user: "0x..." });
   * ```
   */
  leadingVaults(...args: OmitFirst<OverloadedParameters<typeof leadingVaults>>) {
    return leadingVaults(this, ...args);
  }

  /**
   * Request legal verification status of a user.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Legal verification status for a user.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.legalCheck({ user: "0x..." });
   * ```
   */
  legalCheck(...args: OmitFirst<OverloadedParameters<typeof legalCheck>>) {
    return legalCheck(this, ...args);
  }

  /**
   * Request liquidatable.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.liquidatable();
   * ```
   */
  liquidatable(...args: OmitFirst<OverloadedParameters<typeof liquidatable>>) {
    return liquidatable(this, ...args);
  }

  /**
   * Request margin table data.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Margin requirements table with multiple tiers.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.marginTable({ id: 1 });
   * ```
   */
  marginTable(...args: OmitFirst<OverloadedParameters<typeof marginTable>>) {
    return marginTable(this, ...args);
  }

  /**
   * Request builder fee approval.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Maximum builder fee approval.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.maxBuilderFee({ user: "0x...", builder: "0x..." });
   * ```
   */
  maxBuilderFee(...args: OmitFirst<OverloadedParameters<typeof maxBuilderFee>>) {
    return maxBuilderFee(this, ...args);
  }

  /**
   * Request maximum market order notionals.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Maximum market order notionals.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.maxMarketOrderNtls();
   * ```
   */
  maxMarketOrderNtls(...args: OmitFirst<OverloadedParameters<typeof maxMarketOrderNtls>>) {
    return maxMarketOrderNtls(this, ...args);
  }

  /**
   * Request trading metadata.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Metadata for perpetual assets.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata-universe-and-margin-tables
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.meta();
   * ```
   */
  meta(...args: OmitFirst<OverloadedParameters<typeof meta>>) {
    return meta(
      this,
      // @ts-ignore: TypeScript can't resolve overloaded signatures from parameter unions
      ...args,
    );
  }

  /**
   * Request metadata and asset contexts.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Metadata and context for perpetual assets.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.metaAndAssetCtxs();
   * ```
   */
  metaAndAssetCtxs(...args: OmitFirst<OverloadedParameters<typeof metaAndAssetCtxs>>) {
    return metaAndAssetCtxs(
      this,
      // @ts-ignore: TypeScript can't resolve overloaded signatures from parameter unions
      ...args,
    );
  }

  /**
   * Request open orders.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of open orders.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.openOrders({ user: "0x..." });
   * ```
   */
  openOrders(...args: OmitFirst<OverloadedParameters<typeof openOrders>>) {
    return openOrders(this, ...args);
  }

  /**
   * Request order status.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Order status response.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.orderStatus({ user: "0x...", oid: 12345 });
   * ```
   */
  orderStatus(...args: OmitFirst<OverloadedParameters<typeof orderStatus>>) {
    return orderStatus(this, ...args);
  }

  /**
   * Request for the status of the perpetual deploy auction.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Status of the perpetual deploy auction.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-information-about-the-perp-deploy-auction
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.perpDeployAuctionStatus();
   * ```
   */
  perpDeployAuctionStatus(...args: OmitFirst<OverloadedParameters<typeof perpDeployAuctionStatus>>) {
    return perpDeployAuctionStatus(this, ...args);
  }

  /**
   * Request builder deployed perpetual market limits.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Builder deployed perpetual market limits.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-builder-deployed-perp-market-limits
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.perpDexLimits({ dex: "test" });
   * ```
   */
  perpDexLimits(...args: OmitFirst<OverloadedParameters<typeof perpDexLimits>>) {
    return perpDexLimits(this, ...args);
  }

  /**
   * Request all perpetual dexs.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of perpetual dexes (null is main dex).
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.perpDexs();
   * ```
   */
  perpDexs(...args: OmitFirst<OverloadedParameters<typeof perpDexs>>) {
    return perpDexs(this, ...args);
  }

  /**
   * Request perpetuals at open interest cap.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of perpetuals at open interest caps.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.perpsAtOpenInterestCap();
   * ```
   */
  perpsAtOpenInterestCap(...args: OmitFirst<OverloadedParameters<typeof perpsAtOpenInterestCap>>) {
    return perpsAtOpenInterestCap(
      this,
      // @ts-ignore: TypeScript can't resolve overloaded signatures from parameter unions
      ...args,
    );
  }

  /**
   * Request user portfolio.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Portfolio metrics grouped by time periods.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-portfolio
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.portfolio({ user: "0x..." });
   * ```
   */
  portfolio(...args: OmitFirst<OverloadedParameters<typeof portfolio>>) {
    return portfolio(this, ...args);
  }

  /**
   * Request predicted funding rates.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of predicted funding rates.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.predictedFundings();
   * ```
   */
  predictedFundings(...args: OmitFirst<OverloadedParameters<typeof predictedFundings>>) {
    return predictedFundings(this, ...args);
  }

  /**
   * Request user existence check before transfer.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Pre-transfer user existence check result.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.preTransferCheck({ user: "0x...", source: "0x..." });
   * ```
   */
  preTransferCheck(...args: OmitFirst<OverloadedParameters<typeof preTransferCheck>>) {
    return preTransferCheck(this, ...args);
  }

  /**
   * Request recent trades.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of recent trades.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.recentTrades({ coin: "ETH" });
   * ```
   */
  recentTrades(...args: OmitFirst<OverloadedParameters<typeof recentTrades>>) {
    return recentTrades(this, ...args);
  }

  /**
   * Request user referral.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Referral details for a user.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.referral({ user: "0x..." });
   * ```
   */
  referral(...args: OmitFirst<OverloadedParameters<typeof referral>>) {
    return referral(this, ...args);
  }

  /**
   * Request spot clearinghouse state.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Account summary for spot trading.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.spotClearinghouseState({ user: "0x..." });
   * ```
   */
  spotClearinghouseState(...args: OmitFirst<OverloadedParameters<typeof spotClearinghouseState>>) {
    return spotClearinghouseState(this, ...args);
  }

  /**
   * Request spot deploy state.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Deploy state for spot tokens.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.spotDeployState({ user: "0x..." });
   * ```
   */
  spotDeployState(...args: OmitFirst<OverloadedParameters<typeof spotDeployState>>) {
    return spotDeployState(this, ...args);
  }

  /**
   * Request spot trading metadata.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Metadata for spot assets.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.spotMeta();
   * ```
   */
  spotMeta(...args: OmitFirst<OverloadedParameters<typeof spotMeta>>) {
    return spotMeta(this, ...args);
  }

  /**
   * Request spot metadata and asset contexts.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Metadata and context for spot assets.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.spotMetaAndAssetCtxs();
   * ```
   */
  spotMetaAndAssetCtxs(...args: OmitFirst<OverloadedParameters<typeof spotMetaAndAssetCtxs>>) {
    return spotMetaAndAssetCtxs(this, ...args);
  }

  /**
   * Request for the status of the spot deploy auction.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Status of the spot deploy auction.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-pair-deploy-auction
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.spotPairDeployAuctionStatus();
   * ```
   */
  spotPairDeployAuctionStatus(...args: OmitFirst<OverloadedParameters<typeof spotPairDeployAuctionStatus>>) {
    return spotPairDeployAuctionStatus(this, ...args);
  }

  /**
   * Request user sub-accounts.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of user sub-account or null if the user does not have any sub-accounts.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.subAccounts({ user: "0x..." });
   * ```
   */
  subAccounts(...args: OmitFirst<OverloadedParameters<typeof subAccounts>>) {
    return subAccounts(this, ...args);
  }

  /**
   * Request token details.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Details of a token.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.tokenDetails({ tokenId: "0x..." });
   * ```
   */
  tokenDetails(...args: OmitFirst<OverloadedParameters<typeof tokenDetails>>) {
    return tokenDetails(this, ...args);
  }

  /**
   * Request twap history of a user.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of user's TWAP history.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.twapHistory({ user: "0x..." });
   * ```
   */
  twapHistory(...args: OmitFirst<OverloadedParameters<typeof twapHistory>>) {
    return twapHistory(this, ...args);
  }

  /**
   * Request transaction details by transaction hash.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Transaction details.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this API
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.txDetails({ hash: "0x..." });
   * ```
   */
  txDetails(
    this: T extends { request(endpoint: "explorer", ...args: unknown[]): unknown } ? InfoRequestConfig<T> : never,
    ...args: OmitFirst<OverloadedParameters<typeof txDetails>>
  ) {
    return txDetails(this, ...args);
  }

  /**
   * Request array of user transaction details.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of user transaction details.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this API
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userDetails({ user: "0x..." });
   * ```
   */
  userDetails(
    this: T extends { request(endpoint: "explorer", ...args: unknown[]): unknown } ? InfoRequestConfig<T> : never,
    ...args: OmitFirst<OverloadedParameters<typeof userDetails>>
  ) {
    return userDetails(this, ...args);
  }

  /**
   * Request user fees.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns User fees.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userFees({ user: "0x..." });
   * ```
   */
  userFees(...args: OmitFirst<OverloadedParameters<typeof userFees>>) {
    return userFees(this, ...args);
  }

  /**
   * Request array of user fills.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of user trade fills.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userFills({ user: "0x..." });
   * ```
   */
  userFills(...args: OmitFirst<OverloadedParameters<typeof userFills>>) {
    return userFills(this, ...args);
  }

  /**
   * Request array of user fills by time.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of user trade fills by time.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userFillsByTime({
   *   user: "0x...",
   *   startTime: Date.now() - 1000 * 60 * 60 * 24,
   * });
   * ```
   */
  userFillsByTime(...args: OmitFirst<OverloadedParameters<typeof userFillsByTime>>) {
    return userFillsByTime(this, ...args);
  }

  /**
   * Request array of user funding ledger updates.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of user funding ledger updates.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userFunding({
   *   user: "0x...",
   *   startTime: Date.now() - 1000 * 60 * 60 * 24,
   * });
   * ```
   */
  userFunding(...args: OmitFirst<OverloadedParameters<typeof userFunding>>) {
    return userFunding(this, ...args);
  }

  /**
   * Request user non-funding ledger updates.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of user's non-funding ledger update.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userNonFundingLedgerUpdates({
   *   user: "0x...",
   *   startTime: Date.now() - 1000 * 60 * 60 * 24,
   * });
   * ```
   */
  userNonFundingLedgerUpdates(...args: OmitFirst<OverloadedParameters<typeof userNonFundingLedgerUpdates>>) {
    return userNonFundingLedgerUpdates(this, ...args);
  }

  /**
   * Request user rate limits.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns User rate limits.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userRateLimit({ user: "0x..." });
   * ```
   */
  userRateLimit(...args: OmitFirst<OverloadedParameters<typeof userRateLimit>>) {
    return userRateLimit(this, ...args);
  }

  /**
   * Request user role.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns User role.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userRole({ user: "0x..." });
   * ```
   */
  userRole(...args: OmitFirst<OverloadedParameters<typeof userRole>>) {
    return userRole(this, ...args);
  }

  /**
   * Request multi-sig signers for a user.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Multi-sig signers for a user or null if the user does not have any multi-sig signers.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userToMultiSigSigners({ user: "0x..." });
   * ```
   */
  userToMultiSigSigners(...args: OmitFirst<OverloadedParameters<typeof userToMultiSigSigners>>) {
    return userToMultiSigSigners(this, ...args);
  }

  /**
   * Request user TWAP slice fills.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of user's twap slice fill.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userTwapSliceFills({ user: "0x..." });
   * ```
   */
  userTwapSliceFills(...args: OmitFirst<OverloadedParameters<typeof userTwapSliceFills>>) {
    return userTwapSliceFills(this, ...args);
  }

  /**
   * Request user TWAP slice fills by time.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of user's twap slice fill by time.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userTwapSliceFillsByTime({
   *   user: "0x...",
   *   startTime: Date.now() - 1000 * 60 * 60 * 24,
   * });
   * ```
   */
  userTwapSliceFillsByTime(...args: OmitFirst<OverloadedParameters<typeof userTwapSliceFillsByTime>>) {
    return userTwapSliceFillsByTime(this, ...args);
  }

  /**
   * Request user vault deposits.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of user's vault deposits.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.userVaultEquities({ user: "0x..." });
   * ```
   */
  userVaultEquities(...args: OmitFirst<OverloadedParameters<typeof userVaultEquities>>) {
    return userVaultEquities(this, ...args);
  }

  /**
   * Request validator L1 votes.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of L1 governance votes cast by validators.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.validatorL1Votes();
   * ```
   */
  validatorL1Votes(...args: OmitFirst<OverloadedParameters<typeof validatorL1Votes>>) {
    return validatorL1Votes(this, ...args);
  }

  /**
   * Request validator summaries.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of validator performance statistics.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.validatorSummaries();
   * ```
   */
  validatorSummaries(...args: OmitFirst<OverloadedParameters<typeof validatorSummaries>>) {
    return validatorSummaries(this, ...args);
  }

  /**
   * Request details of a vault.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Details of a vault or null if the vault does not exist.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.vaultDetails({ vaultAddress: "0x..." });
   * ```
   */
  vaultDetails(...args: OmitFirst<OverloadedParameters<typeof vaultDetails>>) {
    return vaultDetails(this, ...args);
  }

  /**
   * Request a list of vaults less than 2 hours old.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Array of vaults less than 2 hours old.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.vaultSummaries();
   * ```
   */
  vaultSummaries(...args: OmitFirst<OverloadedParameters<typeof vaultSummaries>>) {
    return vaultSummaries(this, ...args);
  }

  /**
   * Request comprehensive user and market data.
   * @param params - Parameters specific to the API request.
   * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
   * @returns Comprehensive user and market data.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.InfoClient({ transport });
   * const data = await client.webData2({ user: "0x..." });
   * ```
   */
  webData2(...args: OmitFirst<OverloadedParameters<typeof webData2>>) {
    return webData2(this, ...args);
  }
}
