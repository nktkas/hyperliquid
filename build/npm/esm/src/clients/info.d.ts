import type { IRequestTransport } from "../transports/base.js";
import type { ActiveAssetData, ActiveAssetDataRequest, AllMids, AllMidsRequest, BlockDetails, BlockDetailsRequest, Book, Candle, CandleSnapshotRequest, ClearinghouseStateRequest, Delegation, DelegationsRequest, DelegatorHistoryRequest, DelegatorReward, DelegatorRewardsRequest, DelegatorSummary, DelegatorSummaryRequest, DelegatorUpdate, DeployAuctionStatus, ExchangeStatus, ExtraAgent, ExtraAgentsRequest, Fill, FrontendOpenOrdersRequest, FrontendOrder, FundingHistory, FundingHistoryRequest, HistoricalOrdersRequest, IsVipRequest, L2BookRequest, LeadingVaultsRequest, LegalCheck, LegalCheckRequest, MarginTable, MarginTableRequest, MaxBuilderFeeRequest, MetaRequest, MultiSigSigners, OpenOrdersRequest, Order, OrderLookup, OrderStatus, OrderStatusRequest, PerpDex, PerpsClearinghouseState, PerpsMeta, PerpsMetaAndAssetCtxs, PortfolioPeriods, PortfolioRequest, PredictedFunding, PreTransferCheck, PreTransferCheckRequest, Referral, ReferralRequest, SpotClearinghouseState, SpotClearinghouseStateRequest, SpotDeployState, SpotDeployStateRequest, SpotMeta, SpotMetaAndAssetCtxs, SubAccount, SubAccountsRequest, TokenDetails, TokenDetailsRequest, TwapHistory, TwapHistoryRequest, TwapSliceFill, TxDetails, TxDetailsRequest, UserDetailsRequest, UserFees, UserFeesRequest, UserFillsByTimeRequest, UserFillsRequest, UserFundingRequest, UserFundingUpdate, UserNonFundingLedgerUpdate, UserNonFundingLedgerUpdatesRequest, UserRateLimit, UserRateLimitRequest, UserRole, UserRoleRequest, UserToMultiSigSignersRequest, UserTwapSliceFillsByTimeRequest, UserTwapSliceFillsRequest, UserVaultEquitiesRequest, ValidatorSummary, VaultDetails, VaultDetailsRequest, VaultEquity, VaultLeading, VaultSummary } from "../types/mod.js";
/** @see https://github.com/microsoft/TypeScript/issues/13923#issuecomment-2191862501 */
type DeepImmutable<T> = {
    readonly [K in keyof T]: DeepImmutable<T[K]>;
};
/** Parameters for the {@linkcode InfoClient} constructor. */
export interface InfoClientParameters<T extends IRequestTransport = IRequestTransport> {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;
}
/** Request parameters for the {@linkcode InfoClient.activeAssetData} method. */
export type ActiveAssetDataParameters = Omit<ActiveAssetDataRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.allMids} method. */
export type AllMidsParameters = Omit<AllMidsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.blockDetails} method. */
export type BlockDetailsParameters = Omit<BlockDetailsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.candleSnapshot} method. */
export type CandleSnapshotParameters = CandleSnapshotRequest["req"];
/** Request parameters for the {@linkcode InfoClient.clearinghouseState} method. */
export type ClearinghouseStateParameters = Omit<ClearinghouseStateRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.delegations} method. */
export type DelegationsParameters = Omit<DelegationsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.delegatorHistory} method. */
export type DelegatorHistoryParameters = Omit<DelegatorHistoryRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.delegatorRewards} method. */
export type DelegatorRewardsParameters = Omit<DelegatorRewardsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.delegatorSummary} method. */
export type DelegatorSummaryParameters = Omit<DelegatorSummaryRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.extraAgents} method. */
export type ExtraAgentsParameters = Omit<ExtraAgentsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.frontendOpenOrders} method. */
export type FrontendOpenOrdersParameters = Omit<FrontendOpenOrdersRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.fundingHistory} method. */
export type FundingHistoryParameters = Omit<FundingHistoryRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.historicalOrders} method. */
export type HistoricalOrdersParameters = Omit<HistoricalOrdersRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.isVip} method. */
export type IsVipParameters = Omit<IsVipRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.l2Book} method. */
export type L2BookParameters = Omit<L2BookRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.leadingVaults} method. */
export type LeadingVaultsParameters = Omit<LeadingVaultsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.legalCheck} method. */
export type LegalCheckParameters = Omit<LegalCheckRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.marginTable} method. */
export type MarginTableParameters = Omit<MarginTableRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.maxBuilderFee} method. */
export type MaxBuilderFeeParameters = Omit<MaxBuilderFeeRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.meta} method. */
export type MetaParameters = Omit<MetaRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.openOrders} method. */
export type OpenOrdersParameters = Omit<OpenOrdersRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.orderStatus} method. */
export type OrderStatusParameters = Omit<OrderStatusRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.portfolio} method. */
export type PortfolioParameters = Omit<PortfolioRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.preTransferCheck} method. */
export type PreTransferCheckParameters = Omit<PreTransferCheckRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.referral} method. */
export type ReferralParameters = Omit<ReferralRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.spotClearinghouseState} method. */
export type SpotClearinghouseStateParameters = Omit<SpotClearinghouseStateRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.spotDeployState} method. */
export type SpotDeployStateParameters = Omit<SpotDeployStateRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.subAccounts} method. */
export type SubAccountsParameters = Omit<SubAccountsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.tokenDetails} method. */
export type TokenDetailsParameters = Omit<TokenDetailsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.twapHistory} method. */
export type TwapHistoryParameters = Omit<TwapHistoryRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.txDetails} method. */
export type TxDetailsParameters = Omit<TxDetailsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userDetails} method. */
export type UserDetailsParameters = Omit<UserDetailsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userFees} method. */
export type UserFeesParameters = Omit<UserFeesRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userFills} method. */
export type UserFillsParameters = Omit<UserFillsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userFillsByTime} method. */
export type UserFillsByTimeParameters = Omit<UserFillsByTimeRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userFunding} method. */
export type UserFundingParameters = Omit<UserFundingRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userNonFundingLedgerUpdates} method. */
export type UserNonFundingLedgerUpdatesParameters = Omit<UserNonFundingLedgerUpdatesRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userRateLimit} method. */
export type UserRateLimitParameters = Omit<UserRateLimitRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userRole} method. */
export type UserRoleParameters = Omit<UserRoleRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userToMultiSigSigners} method. */
export type UserToMultiSigSignersParameters = Omit<UserToMultiSigSignersRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userTwapSliceFills} method. */
export type UserTwapSliceFillsParameters = Omit<UserTwapSliceFillsRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userTwapSliceFillsByTime} method. */
export type UserTwapSliceFillsByTimeParameters = Omit<UserTwapSliceFillsByTimeRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.userVaultEquities} method. */
export type UserVaultEquitiesParameters = Omit<UserVaultEquitiesRequest, "type">;
/** Request parameters for the {@linkcode InfoClient.vaultDetails} method. */
export type VaultDetailsParameters = Omit<VaultDetailsRequest, "type">;
/**
 * Info client for interacting with the Hyperliquid API.
 * @typeParam T The type of transport used to connect to the Hyperliquid API.
 */
export declare class InfoClient<T extends IRequestTransport = IRequestTransport> implements InfoClientParameters<T>, AsyncDisposable {
    transport: T;
    /**
     * Initialises a new instance.
     * @param args - The arguments for initialisation.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     * ```
     */
    constructor(args: InfoClientParameters<T>);
    /**
     * Request user active asset data.
     * @param params - An optional request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User active asset data.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.activeAssetData({ user: "0x...", coin: "BTC" });
     * ```
     */
    activeAssetData(params: DeepImmutable<ActiveAssetDataParameters>, signal?: AbortSignal): Promise<ActiveAssetData>;
    /**
     * Request mid coin prices.
     * @param params - An optional request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Mapping of coin symbols to mid prices.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.allMids();
     * ```
     */
    allMids(params?: DeepImmutable<AllMidsParameters>, signal?: AbortSignal): Promise<AllMids>;
    allMids(signal?: AbortSignal): Promise<AllMids>;
    /**
     * Block details by block height.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Block details.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this method
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.blockDetails({ height: 123 });
     * ```
     */
    blockDetails(this: T extends {
        request(endpoint: "explorer", ...args: unknown[]): unknown;
    } ? this : never, params: DeepImmutable<BlockDetailsParameters>, signal?: AbortSignal): Promise<BlockDetails>;
    /**
     * Request candlestick snapshots.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of candlestick data points.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.candleSnapshot({
     *   coin: "ETH",
     *   interval: "1h",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    candleSnapshot(params: DeepImmutable<CandleSnapshotParameters>, signal?: AbortSignal): Promise<Candle[]>;
    /**
     * Request clearinghouse state.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Account summary for perpetual trading.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.clearinghouseState({ user: "0x..." });
     * ```
     */
    clearinghouseState(params: DeepImmutable<ClearinghouseStateParameters>, signal?: AbortSignal): Promise<PerpsClearinghouseState>;
    /**
     * Request user staking delegations.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's delegations to validators.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.delegations({ user: "0x..." });
     * ```
     */
    delegations(params: DeepImmutable<DelegationsParameters>, signal?: AbortSignal): Promise<Delegation[]>;
    /**
     * Request user staking history.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's staking updates.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.delegatorHistory({ user: "0x..." });
     * ```
     */
    delegatorHistory(params: DeepImmutable<DelegatorHistoryParameters>, signal?: AbortSignal): Promise<DelegatorUpdate[]>;
    /**
     * Request user staking rewards.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's staking rewards.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.delegatorRewards({ user: "0x..." });
     * ```
     */
    delegatorRewards(params: DeepImmutable<DelegatorRewardsParameters>, signal?: AbortSignal): Promise<DelegatorReward[]>;
    /**
     * Request user staking summary.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Summary of a user's staking delegations.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.delegatorSummary({ user: "0x..." });
     * ```
     */
    delegatorSummary(params: DeepImmutable<DelegatorSummaryParameters>, signal?: AbortSignal): Promise<DelegatorSummary>;
    /**
     * Request exchange status information.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Exchange system status information.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.exchangeStatus();
     * ```
     */
    exchangeStatus(signal?: AbortSignal): Promise<ExchangeStatus>;
    /**
     * Request user's extra agents.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User's extra agents.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.extraAgents({ user: "0x..." });
     * ```
     */
    extraAgents(params: DeepImmutable<ExtraAgentsParameters>, signal?: AbortSignal): Promise<ExtraAgent[]>;
    /**
     * Request frontend open orders.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of open orders with additional frontend information.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.frontendOpenOrders({ user: "0x..." });
     * ```
     */
    frontendOpenOrders(params: DeepImmutable<FrontendOpenOrdersParameters>, signal?: AbortSignal): Promise<FrontendOrder[]>;
    /**
     * Request funding history.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of historical funding rate data for an asset.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.fundingHistory({
     *   coin: "ETH",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    fundingHistory(params: DeepImmutable<FundingHistoryParameters>, signal?: AbortSignal): Promise<FundingHistory[]>;
    /**
     * Request user's historical orders.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's historical orders.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.historicalOrders({ user: "0x..." });
     * ```
     */
    historicalOrders(params: DeepImmutable<HistoricalOrdersParameters>, signal?: AbortSignal): Promise<OrderStatus<FrontendOrder>[]>;
    /**
     * Request to check if a user is a VIP.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Boolean indicating user's VIP status.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.isVip({ user: "0x..." });
     * ```
     */
    isVip(params: DeepImmutable<IsVipParameters>, signal?: AbortSignal): Promise<boolean | null>;
    /**
     * Request L2 order book.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns L2 order book snapshot.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.l2Book({ coin: "ETH", nSigFigs: 2 });
     * ```
     */
    l2Book(params: DeepImmutable<L2BookParameters>, signal?: AbortSignal): Promise<Book>;
    /**
     * Request leading vaults for a user.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.leadingVaults({ user: "0x..." });
     * ```
     */
    leadingVaults(params: DeepImmutable<LeadingVaultsParameters>, signal?: AbortSignal): Promise<VaultLeading[]>;
    /**
     * Request legal verification status of a user.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Legal verification status for a user.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.legalCheck({ user: "0x..." });
     * ```
     */
    legalCheck(params: DeepImmutable<LegalCheckParameters>, signal?: AbortSignal): Promise<LegalCheck>;
    /**
     * Request liquidatable.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.liquidatable();
     * ```
     */
    liquidatable(signal?: AbortSignal): Promise<unknown[]>;
    /**
     * Request margin table data.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Margin requirements table with multiple tiers.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.marginTable({ id: 1 });
     * ```
     */
    marginTable(params: DeepImmutable<MarginTableParameters>, signal?: AbortSignal): Promise<MarginTable>;
    /**
     * Request builder fee approval.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Maximum builder fee approval.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.maxBuilderFee({ user: "0x...", builder: "0x..." });
     * ```
     */
    maxBuilderFee(params: DeepImmutable<MaxBuilderFeeParameters>, signal?: AbortSignal): Promise<number>;
    /**
     * Request maximum market order notionals.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.maxMarketOrderNtls();
     * ```
     */
    maxMarketOrderNtls(signal?: AbortSignal): Promise<[number, string][]>;
    /**
     * Request trading metadata.
     * @param params - An optional request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Metadata for perpetual assets.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata-universe-and-margin-tables
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.meta();
     * ```
     */
    meta(params?: DeepImmutable<MetaParameters>, signal?: AbortSignal): Promise<PerpsMeta>;
    meta(signal?: AbortSignal): Promise<PerpsMeta>;
    /**
     * Request metadata and asset contexts.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Metadata and context for perpetual assets.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.metaAndAssetCtxs();
     * ```
     */
    metaAndAssetCtxs(signal?: AbortSignal): Promise<PerpsMetaAndAssetCtxs>;
    /**
     * Request open orders.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of open order.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.openOrders({ user: "0x..." });
     * ```
     */
    openOrders(params: DeepImmutable<OpenOrdersParameters>, signal?: AbortSignal): Promise<Order[]>;
    /**
     * Request order status.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Result of an order status lookup.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.orderStatus({ user: "0x...", oid: 12345 });
     * ```
     */
    orderStatus(params: DeepImmutable<OrderStatusParameters>, signal?: AbortSignal): Promise<OrderLookup>;
    /**
     * Request for the status of the perpetual deploy auction.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Status of the perpetual deploy auction.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-information-about-the-perp-deploy-auction
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.perpDeployAuctionStatus();
     * ```
     */
    perpDeployAuctionStatus(signal?: AbortSignal): Promise<DeployAuctionStatus>;
    /**
     * Request all perpetual dexs.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of perpetual dexes (null is main dex).
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.perpDexs();
     * ```
     */
    perpDexs(signal?: AbortSignal): Promise<(PerpDex | null)[]>;
    /**
     * Request perpetuals at open interest cap.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of perpetuals at open interest caps.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.perpsAtOpenInterestCap();
     * ```
     */
    perpsAtOpenInterestCap(signal?: AbortSignal): Promise<string[]>;
    /**
     * Request user portfolio.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Portfolio metrics grouped by time periods.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-portfolio
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.portfolio({ user: "0x..." });
     * ```
     */
    portfolio(params: DeepImmutable<PortfolioParameters>, signal?: AbortSignal): Promise<PortfolioPeriods>;
    /**
     * Request predicted funding rates.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of predicted funding rates.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.predictedFundings();
     * ```
     */
    predictedFundings(signal?: AbortSignal): Promise<PredictedFunding[]>;
    /**
     * Request user's existence check before transfer.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Pre-transfer user existence check result.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.preTransferCheck({ user: "0x...", source: "0x..." });
     * ```
     */
    preTransferCheck(params: DeepImmutable<PreTransferCheckParameters>, signal?: AbortSignal): Promise<PreTransferCheck>;
    /**
     * Request user referral.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Referral information for a user.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.referral({ user: "0x..." });
     * ```
     */
    referral(params: DeepImmutable<ReferralParameters>, signal?: AbortSignal): Promise<Referral>;
    /**
     * Request spot clearinghouse state.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Account summary for spot trading.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.spotClearinghouseState({ user: "0x..." });
     * ```
     */
    spotClearinghouseState(params: DeepImmutable<SpotClearinghouseStateParameters>, signal?: AbortSignal): Promise<SpotClearinghouseState>;
    /**
     * Request spot deploy state.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Deploy state for spot tokens.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.spotDeployState({ user: "0x..." });
     * ```
     */
    spotDeployState(params: DeepImmutable<SpotDeployStateParameters>, signal?: AbortSignal): Promise<SpotDeployState>;
    /**
     * Request spot trading metadata.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Metadata for spot assets.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.spotMeta();
     * ```
     */
    spotMeta(signal?: AbortSignal): Promise<SpotMeta>;
    /**
     * Request spot metadata and asset contexts.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Metadata and context for spot assets.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.spotMetaAndAssetCtxs();
     * ```
     */
    spotMetaAndAssetCtxs(signal?: AbortSignal): Promise<SpotMetaAndAssetCtxs>;
    /**
     * Request user sub-accounts.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user sub-account or null if the user does not have any sub-accounts.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.subAccounts({ user: "0x..." });
     * ```
     */
    subAccounts(params: DeepImmutable<SubAccountsParameters>, signal?: AbortSignal): Promise<SubAccount[] | null>;
    /**
     * Request token details.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Details of a token.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.tokenDetails({ tokenId: "0x..." });
     * ```
     */
    tokenDetails(params: DeepImmutable<TokenDetailsParameters>, signal?: AbortSignal): Promise<TokenDetails>;
    /**
     * Request twap history of a user.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's TWAP history.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.twapHistory({ user: "0x..." });
     * ```
     */
    twapHistory(params: DeepImmutable<TwapHistoryParameters>, signal?: AbortSignal): Promise<TwapHistory[]>;
    /**
     * Request transaction details by transaction hash.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Transaction details.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this method
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.txDetails({ hash: "0x..." });
     * ```
     */
    txDetails(this: T extends {
        request(endpoint: "explorer", ...args: unknown[]): unknown;
    } ? this : never, params: DeepImmutable<TxDetailsParameters>, signal?: AbortSignal): Promise<TxDetails>;
    /**
     * Request user details by user's address.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User details.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this method
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userDetails({ user: "0x..." });
     * ```
     */
    userDetails(this: T extends {
        request(endpoint: "explorer", ...args: unknown[]): unknown;
    } ? this : never, params: DeepImmutable<UserDetailsParameters>, signal?: AbortSignal): Promise<TxDetails[]>;
    /**
     * Request user fees.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User fees.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userFees({ user: "0x..." });
     * ```
     */
    userFees(params: DeepImmutable<UserFeesParameters>, signal?: AbortSignal): Promise<UserFees>;
    /**
     * Request user fills.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's trade fill.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userFills({ user: "0x..." });
     * ```
     */
    userFills(params: DeepImmutable<UserFillsParameters>, signal?: AbortSignal): Promise<Fill[]>;
    /**
     * Request user fills by time.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's trade fill.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userFillsByTime({
     *   user: "0x...",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    userFillsByTime(params: DeepImmutable<UserFillsByTimeParameters>, signal?: AbortSignal): Promise<Fill[]>;
    /**
     * Request user funding.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's funding ledger update.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userFunding({
     *   user: "0x...",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    userFunding(params: DeepImmutable<UserFundingParameters>, signal?: AbortSignal): Promise<UserFundingUpdate[]>;
    /**
     * Request user non-funding ledger updates.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's non-funding ledger update.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userNonFundingLedgerUpdates({
     *   user: "0x...",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    userNonFundingLedgerUpdates(params: DeepImmutable<UserNonFundingLedgerUpdatesParameters>, signal?: AbortSignal): Promise<UserNonFundingLedgerUpdate[]>;
    /**
     * Request user rate limits.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User's rate limits.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userRateLimit({ user: "0x..." });
     * ```
     */
    userRateLimit(params: DeepImmutable<UserRateLimitParameters>, signal?: AbortSignal): Promise<UserRateLimit>;
    /**
     * Request user role.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User's role.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userRole({ user: "0x..." });
     * ```
     */
    userRole(params: DeepImmutable<UserRoleParameters>, signal?: AbortSignal): Promise<UserRole>;
    /**
     * Request multi-sig signers for a user.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Multi-sig signers for a user or null if the user does not have any multi-sig signers.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userToMultiSigSigners({ user: "0x..." });
     * ```
     */
    userToMultiSigSigners(params: DeepImmutable<UserToMultiSigSignersParameters>, signal?: AbortSignal): Promise<MultiSigSigners | null>;
    /**
     * Request user twap slice fills.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's twap slice fill.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userTwapSliceFills({ user: "0x..." });
     * ```
     */
    userTwapSliceFills(params: DeepImmutable<UserTwapSliceFillsParameters>, signal?: AbortSignal): Promise<TwapSliceFill[]>;
    /**
     * Request user twap slice fills by time.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's twap slice fill.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userTwapSliceFillsByTime({
     *   user: "0x...",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    userTwapSliceFillsByTime(params: DeepImmutable<UserTwapSliceFillsByTimeParameters>, signal?: AbortSignal): Promise<TwapSliceFill[]>;
    /**
     * Request user vault deposits.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's vault deposits.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userVaultEquities({ user: "0x..." });
     * ```
     */
    userVaultEquities(params: DeepImmutable<UserVaultEquitiesParameters>, signal?: AbortSignal): Promise<VaultEquity[]>;
    /**
     * Request validator L1 votes.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.validatorL1Votes();
     * ```
     */
    validatorL1Votes(signal?: AbortSignal): Promise<unknown[]>;
    /**
     * Request validator summaries.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of validator summaries.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.validatorSummaries();
     * ```
     */
    validatorSummaries(signal?: AbortSignal): Promise<ValidatorSummary[]>;
    /**
     * Request details of a vault.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Details of a vault or null if the vault does not exist.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.vaultDetails({ vaultAddress: "0x..." });
     * ```
     */
    vaultDetails(params: DeepImmutable<VaultDetailsParameters>, signal?: AbortSignal): Promise<VaultDetails | null>;
    /**
     * Request a list of vaults less than 2 hours old.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of vault summaries.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.vaultSummaries();
     * ```
     */
    vaultSummaries(signal?: AbortSignal): Promise<VaultSummary[]>;
    [Symbol.asyncDispose](): Promise<void>;
}
export {};
//# sourceMappingURL=info.d.ts.map