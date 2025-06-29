import type { IRequestTransport } from "../transports/base.ts";
import type { BlockDetailsRequest, TxDetailsRequest, UserDetailsRequest } from "../types/explorer/requests.ts";
import type {
    BlockDetails,
    BlockDetailsResponse,
    TxDetails,
    TxDetailsResponse,
    UserDetailsResponse,
} from "../types/explorer/responses.ts";
import type {
    ExtraAgent,
    LegalCheck,
    MultiSigSigners,
    PerpsClearinghouseState,
    PortfolioPeriods,
    PreTransferCheck,
    Referral,
    SpotClearinghouseState,
    SubAccount,
    UserFees,
    UserFundingUpdate,
    UserNonFundingLedgerUpdate,
    UserRateLimit,
    UserRole,
} from "../types/info/accounts.ts";
import type {
    AllMids,
    Candle,
    FundingHistory,
    MarginTable,
    PerpDex,
    PerpsMeta,
    PerpsMetaAndAssetCtxs,
    PredictedFunding,
    SpotMeta,
    SpotMetaAndAssetCtxs,
    TokenDetails,
} from "../types/info/assets.ts";
import type {
    Delegation,
    DelegatorReward,
    DelegatorSummary,
    DelegatorUpdate,
    ValidatorSummary,
} from "../types/info/validators.ts";
import type { DeployAuctionStatus, ExchangeStatus, SpotDeployState } from "../types/info/markets.ts";
import type {
    Book,
    Fill,
    FrontendOrder,
    Order,
    OrderLookup,
    OrderStatus,
    TwapHistory,
    TwapSliceFill,
} from "../types/info/orders.ts";
import type {
    AllMidsRequest,
    CandleSnapshotRequest,
    ClearinghouseStateRequest,
    DelegationsRequest,
    DelegatorHistoryRequest,
    DelegatorRewardsRequest,
    DelegatorSummaryRequest,
    ExchangeStatusRequest,
    ExtraAgentsRequest,
    FrontendOpenOrdersRequest,
    FundingHistoryRequest,
    HistoricalOrdersRequest,
    IsVipRequest,
    L2BookRequest,
    LeadingVaultsRequest,
    LegalCheckRequest,
    LiquidatableRequest,
    MarginTableRequest,
    MaxBuilderFeeRequest,
    MaxMarketOrderNtlsRequest,
    MetaAndAssetCtxsRequest,
    MetaRequest,
    OpenOrdersRequest,
    OrderStatusRequest,
    PerpDeployAuctionStatusRequest,
    PerpDexsRequest,
    PerpsAtOpenInterestCapRequest,
    PortfolioRequest,
    PredictedFundingsRequest,
    PreTransferCheckRequest,
    ReferralRequest,
    SpotClearinghouseStateRequest,
    SpotDeployStateRequest,
    SpotMetaAndAssetCtxsRequest,
    SpotMetaRequest,
    SubAccountsRequest,
    TokenDetailsRequest,
    TwapHistoryRequest,
    UserFeesRequest,
    UserFillsByTimeRequest,
    UserFillsRequest,
    UserFundingRequest,
    UserNonFundingLedgerUpdatesRequest,
    UserRateLimitRequest,
    UserRoleRequest,
    UserToMultiSigSignersRequest,
    UserTwapSliceFillsByTimeRequest,
    UserTwapSliceFillsRequest,
    UserVaultEquitiesRequest,
    ValidatorL1VotesRequest,
    ValidatorSummariesRequest,
    VaultDetailsRequest,
    VaultSummariesRequest,
} from "../types/info/requests.ts";
import type { VaultDetails, VaultEquity, VaultLeading, VaultSummary } from "../types/info/vaults.ts";

/** Parameters for the {@linkcode InfoClient} constructor. */
export interface InfoClientParameters<T extends IRequestTransport = IRequestTransport> {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;
}

/** Parameters for the {@linkcode InfoClient.allMids} method. */
export type AllMidsParameters = Omit<AllMidsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.blockDetails} method. */
export type BlockDetailsParameters = Omit<BlockDetailsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.candleSnapshot} method. */
export type CandleSnapshotParameters = CandleSnapshotRequest["req"];

/** Parameters for the {@linkcode InfoClient.clearinghouseState} method. */
export type ClearinghouseStateParameters = Omit<ClearinghouseStateRequest, "type">;

/** Parameters for the {@linkcode InfoClient.delegations} method. */
export type DelegationsParameters = Omit<DelegationsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.delegatorHistory} method. */
export type DelegatorHistoryParameters = Omit<DelegatorHistoryRequest, "type">;

/** Parameters for the {@linkcode InfoClient.delegatorRewards} method. */
export type DelegatorRewardsParameters = Omit<DelegatorRewardsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.delegatorSummary} method. */
export type DelegatorSummaryParameters = Omit<DelegatorSummaryRequest, "type">;

/** Parameters for the {@linkcode InfoClient.extraAgents} method. */
export type ExtraAgentsParameters = Omit<ExtraAgentsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.frontendOpenOrders} method. */
export type FrontendOpenOrdersParameters = Omit<FrontendOpenOrdersRequest, "type">;

/** Parameters for the {@linkcode InfoClient.fundingHistory} method. */
export type FundingHistoryParameters = Omit<FundingHistoryRequest, "type">;

/** Parameters for the {@linkcode InfoClient.historicalOrders} method. */
export type HistoricalOrdersParameters = Omit<HistoricalOrdersRequest, "type">;

/** Parameters for the {@linkcode InfoClient.isVip} method. */
export type IsVipParameters = Omit<IsVipRequest, "type">;

/** Parameters for the {@linkcode InfoClient.l2Book} method. */
export type L2BookParameters = Omit<L2BookRequest, "type">;

/** Parameters for the {@linkcode InfoClient.leadingVaults} method. */
export type LeadingVaultsParameters = Omit<LeadingVaultsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.legalCheck} method. */
export type LegalCheckParameters = Omit<LegalCheckRequest, "type">;

/** Parameters for the {@linkcode InfoClient.marginTable} method. */
export type MarginTableParameters = Omit<MarginTableRequest, "type">;

/** Parameters for the {@linkcode InfoClient.maxBuilderFee} method. */
export type MaxBuilderFeeParameters = Omit<MaxBuilderFeeRequest, "type">;

/** Parameters for the {@linkcode InfoClient.meta} method. */
export type MetaParameters = Omit<MetaRequest, "type">;

/** Parameters for the {@linkcode InfoClient.openOrders} method. */
export type OpenOrdersParameters = Omit<OpenOrdersRequest, "type">;

/** Parameters for the {@linkcode InfoClient.orderStatus} method. */
export type OrderStatusParameters = Omit<OrderStatusRequest, "type">;

/** Parameters for the {@linkcode InfoClient.portfolio} method. */
export type PortfolioParameters = Omit<PortfolioRequest, "type">;

/** Parameters for the {@linkcode InfoClient.preTransferCheck} method. */
export type PreTransferCheckParameters = Omit<PreTransferCheckRequest, "type">;

/** Parameters for the {@linkcode InfoClient.referral} method. */
export type ReferralParameters = Omit<ReferralRequest, "type">;

/** Parameters for the {@linkcode InfoClient.spotClearinghouseState} method. */
export type SpotClearinghouseStateParameters = Omit<SpotClearinghouseStateRequest, "type">;

/** Parameters for the {@linkcode InfoClient.spotDeployState} method. */
export type SpotDeployStateParameters = Omit<SpotDeployStateRequest, "type">;

/** Parameters for the {@linkcode InfoClient.subAccounts} method. */
export type SubAccountsParameters = Omit<SubAccountsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.tokenDetails} method. */
export type TokenDetailsParameters = Omit<TokenDetailsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.twapHistory} method. */
export type TwapHistoryParameters = Omit<TwapHistoryRequest, "type">;

/** Parameters for the {@linkcode InfoClient.txDetails} method. */
export type TxDetailsParameters = Omit<TxDetailsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userDetails} method. */
export type UserDetailsParameters = Omit<UserDetailsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userFees} method. */
export type UserFeesParameters = Omit<UserFeesRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userFills} method. */
export type UserFillsParameters = Omit<UserFillsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userFillsByTime} method. */
export type UserFillsByTimeParameters = Omit<UserFillsByTimeRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userFunding} method. */
export type UserFundingParameters = Omit<UserFundingRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userNonFundingLedgerUpdates} method. */
export type UserNonFundingLedgerUpdatesParameters = Omit<UserNonFundingLedgerUpdatesRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userRateLimit} method. */
export type UserRateLimitParameters = Omit<UserRateLimitRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userRole} method. */
export type UserRoleParameters = Omit<UserRoleRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userToMultiSigSigners} method. */
export type UserToMultiSigSignersParameters = Omit<UserToMultiSigSignersRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userTwapSliceFills} method. */
export type UserTwapSliceFillsParameters = Omit<UserTwapSliceFillsRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userTwapSliceFillsByTime} method. */
export type UserTwapSliceFillsByTimeParameters = Omit<UserTwapSliceFillsByTimeRequest, "type">;

/** Parameters for the {@linkcode InfoClient.userVaultEquities} method. */
export type UserVaultEquitiesParameters = Omit<UserVaultEquitiesRequest, "type">;

/** Parameters for the {@linkcode InfoClient.vaultDetails} method. */
export type VaultDetailsParameters = Omit<VaultDetailsRequest, "type">;

/**
 * Info client for interacting with the Hyperliquid API.
 * @typeParam T The type of transport used to connect to the Hyperliquid API.
 */
export class InfoClient<
    T extends IRequestTransport = IRequestTransport,
> implements InfoClientParameters<T>, AsyncDisposable {
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
    constructor(args: InfoClientParameters<T>) {
        this.transport = args.transport;
    }

    /**
     * Request mid coin prices.
     * @param args - An optional parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    allMids(args?: AllMidsParameters, signal?: AbortSignal): Promise<AllMids>;
    allMids(signal?: AbortSignal): Promise<AllMids>;
    allMids(args_or_signal?: AllMidsParameters | AbortSignal, maybeSignal?: AbortSignal): Promise<AllMids> {
        const args = args_or_signal instanceof AbortSignal ? {} : args_or_signal;
        const signal = args_or_signal instanceof AbortSignal ? args_or_signal : maybeSignal;

        const request: AllMidsRequest = {
            type: "allMids",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Block details by block height.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
     * @returns Block details.
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
     * const data = await infoClient.blockDetails({ height: 123 });
     * ```
     */
    async blockDetails(args: BlockDetailsParameters, signal?: AbortSignal): Promise<BlockDetails> {
        const request: BlockDetailsRequest = {
            type: "blockDetails",
            ...args,
        };
        const { blockDetails } = await this.transport.request<BlockDetailsResponse>("explorer", request, signal);
        return blockDetails;
    }

    /**
     * Request candlestick snapshots.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    candleSnapshot(args: CandleSnapshotParameters, signal?: AbortSignal): Promise<Candle[]> {
        const request: CandleSnapshotRequest = {
            type: "candleSnapshot",
            req: args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request clearinghouse state.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    clearinghouseState(args: ClearinghouseStateParameters, signal?: AbortSignal): Promise<PerpsClearinghouseState> {
        const request: ClearinghouseStateRequest = {
            type: "clearinghouseState",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user staking delegations.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    delegations(args: DelegationsParameters, signal?: AbortSignal): Promise<Delegation[]> {
        const request: DelegationsRequest = {
            type: "delegations",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user staking history.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    delegatorHistory(args: DelegatorHistoryParameters, signal?: AbortSignal): Promise<DelegatorUpdate[]> {
        const request: DelegatorHistoryRequest = {
            type: "delegatorHistory",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user staking rewards.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    delegatorRewards(args: DelegatorRewardsParameters, signal?: AbortSignal): Promise<DelegatorReward[]> {
        const request: DelegatorRewardsRequest = {
            type: "delegatorRewards",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user staking summary.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    delegatorSummary(args: DelegatorSummaryParameters, signal?: AbortSignal): Promise<DelegatorSummary> {
        const request: DelegatorSummaryRequest = {
            type: "delegatorSummary",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request exchange status information.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
     * @returns Exchange system status information.
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
     * const data = await infoClient.exchangeStatus();
     * ```
     */
    exchangeStatus(signal?: AbortSignal): Promise<ExchangeStatus> {
        const request: ExchangeStatusRequest = {
            type: "exchangeStatus",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user's extra agents.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    extraAgents(args: ExtraAgentsParameters, signal?: AbortSignal): Promise<ExtraAgent[]> {
        const request: ExtraAgentsRequest = {
            type: "extraAgents",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request frontend open orders.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    frontendOpenOrders(args: FrontendOpenOrdersParameters, signal?: AbortSignal): Promise<FrontendOrder[]> {
        const request: FrontendOpenOrdersRequest = {
            type: "frontendOpenOrders",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request funding history.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    fundingHistory(args: FundingHistoryParameters, signal?: AbortSignal): Promise<FundingHistory[]> {
        const request: FundingHistoryRequest = {
            type: "fundingHistory",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user's historical orders.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    historicalOrders(args: HistoricalOrdersParameters, signal?: AbortSignal): Promise<OrderStatus<FrontendOrder>[]> {
        const request: HistoricalOrdersRequest = {
            type: "historicalOrders",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request to check if a user is a VIP.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    isVip(args: IsVipParameters, signal?: AbortSignal): Promise<boolean> {
        const request: IsVipRequest = {
            type: "isVip",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request L2 order book.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    l2Book(args: L2BookParameters, signal?: AbortSignal): Promise<Book> {
        const request: L2BookRequest = {
            type: "l2Book",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request leading vaults for a user.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    leadingVaults(args: LeadingVaultsParameters, signal?: AbortSignal): Promise<VaultLeading[]> {
        const request: LeadingVaultsRequest = {
            type: "leadingVaults",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request legal verification status of a user.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    legalCheck(args: LegalCheckParameters, signal?: AbortSignal): Promise<LegalCheck> {
        const request: LegalCheckRequest = {
            type: "legalCheck",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request liquidatable (unknown).
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
     * @returns
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
     * const data = await infoClient.liquidatable();
     * ```
     */
    liquidatable(signal?: AbortSignal): Promise<unknown[]> {
        const request: LiquidatableRequest = {
            type: "liquidatable",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request margin table data.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
     * @returns Margin requirements table with multiple tiers.
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
     * const data = await infoClient.marginTable({ id: 1 });
     * ```
     */
    marginTable(args: MarginTableParameters, signal?: AbortSignal): Promise<MarginTable> {
        const request: MarginTableRequest = {
            type: "marginTable",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request builder fee approval.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    maxBuilderFee(args: MaxBuilderFeeParameters, signal?: AbortSignal): Promise<number> {
        const request: MaxBuilderFeeRequest = {
            type: "maxBuilderFee",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request maximum market order notionals.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
     * @returns
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
     * const data = await infoClient.maxMarketOrderNtls();
     * ```
     */
    maxMarketOrderNtls(signal?: AbortSignal): Promise<[number, string][]> {
        const request: MaxMarketOrderNtlsRequest = {
            type: "maxMarketOrderNtls",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request trading metadata.
     * @param args - An optional parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    meta(args?: MetaParameters, signal?: AbortSignal): Promise<PerpsMeta>;
    meta(signal?: AbortSignal): Promise<PerpsMeta>;
    meta(args_or_signal?: MetaParameters | AbortSignal, maybeSignal?: AbortSignal): Promise<PerpsMeta> {
        const args = args_or_signal instanceof AbortSignal ? {} : args_or_signal;
        const signal = args_or_signal instanceof AbortSignal ? args_or_signal : maybeSignal;

        const request: MetaRequest = {
            type: "meta",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request metadata and asset contexts.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    metaAndAssetCtxs(signal?: AbortSignal): Promise<PerpsMetaAndAssetCtxs> {
        const request: MetaAndAssetCtxsRequest = {
            type: "metaAndAssetCtxs",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request open orders.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    openOrders(args: OpenOrdersParameters, signal?: AbortSignal): Promise<Order[]> {
        const request: OpenOrdersRequest = {
            type: "openOrders",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request order status.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    orderStatus(args: OrderStatusParameters, signal?: AbortSignal): Promise<OrderLookup> {
        const request: OrderStatusRequest = {
            type: "orderStatus",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request for the status of the perpetual deploy auction.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    perpDeployAuctionStatus(signal?: AbortSignal): Promise<DeployAuctionStatus> {
        const request: PerpDeployAuctionStatusRequest = {
            type: "perpDeployAuctionStatus",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request all perpetual dexs.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    perpDexs(signal?: AbortSignal): Promise<(PerpDex | null)[]> {
        const request: PerpDexsRequest = {
            type: "perpDexs",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request perpetuals at open interest cap.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    perpsAtOpenInterestCap(signal?: AbortSignal): Promise<string[]> {
        const request: PerpsAtOpenInterestCapRequest = {
            type: "perpsAtOpenInterestCap",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user portfolio.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    portfolio(args: PortfolioParameters, signal?: AbortSignal): Promise<PortfolioPeriods> {
        const request: PortfolioRequest = {
            type: "portfolio",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request predicted funding rates.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    predictedFundings(signal?: AbortSignal): Promise<PredictedFunding[]> {
        const request: PredictedFundingsRequest = {
            type: "predictedFundings",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user's existence check before transfer.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    preTransferCheck(args: PreTransferCheckParameters, signal?: AbortSignal): Promise<PreTransferCheck> {
        const request: PreTransferCheckRequest = {
            type: "preTransferCheck",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user referral.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    referral(args: ReferralParameters, signal?: AbortSignal): Promise<Referral> {
        const request: ReferralRequest = {
            type: "referral",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request spot clearinghouse state.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    spotClearinghouseState(
        args: SpotClearinghouseStateParameters,
        signal?: AbortSignal,
    ): Promise<SpotClearinghouseState> {
        const request: SpotClearinghouseStateRequest = {
            type: "spotClearinghouseState",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request spot deploy state.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    spotDeployState(args: SpotDeployStateParameters, signal?: AbortSignal): Promise<SpotDeployState> {
        const request: SpotDeployStateRequest = {
            type: "spotDeployState",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request spot trading metadata.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    spotMeta(signal?: AbortSignal): Promise<SpotMeta> {
        const request: SpotMetaRequest = {
            type: "spotMeta",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request spot metadata and asset contexts.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    spotMetaAndAssetCtxs(signal?: AbortSignal): Promise<SpotMetaAndAssetCtxs> {
        const request: SpotMetaAndAssetCtxsRequest = {
            type: "spotMetaAndAssetCtxs",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user sub-accounts.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    subAccounts(args: SubAccountsParameters, signal?: AbortSignal): Promise<SubAccount[] | null> {
        const request: SubAccountsRequest = {
            type: "subAccounts",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request token details.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    tokenDetails(args: TokenDetailsParameters, signal?: AbortSignal): Promise<TokenDetails> {
        const request: TokenDetailsRequest = {
            type: "tokenDetails",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request twap history of a user.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    twapHistory(args: TwapHistoryParameters, signal?: AbortSignal): Promise<TwapHistory[]> {
        const request: TwapHistoryRequest = {
            type: "twapHistory",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request transaction details by transaction hash.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
     * @returns Transaction details.
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
     * const data = await infoClient.txDetails({ hash: "0x..." });
     * ```
     */
    async txDetails(args: TxDetailsParameters, signal?: AbortSignal): Promise<TxDetails> {
        const request: TxDetailsRequest = {
            type: "txDetails",
            ...args,
        };
        const { tx } = await this.transport.request<TxDetailsResponse>("explorer", request, signal);
        return tx;
    }

    /**
     * Request user details by user's address.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
     * @returns User details.
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
     * const data = await infoClient.userDetails({ user: "0x..." });
     * ```
     */
    async userDetails(args: UserDetailsParameters, signal?: AbortSignal): Promise<TxDetails[]> {
        const request: UserDetailsRequest = {
            type: "userDetails",
            ...args,
        };
        const { txs } = await this.transport.request<UserDetailsResponse>("explorer", request, signal);
        return txs;
    }

    /**
     * Request user fees.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    userFees(args: UserFeesParameters, signal?: AbortSignal): Promise<UserFees> {
        const request: UserFeesRequest = {
            type: "userFees",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user fills.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    userFills(args: UserFillsParameters, signal?: AbortSignal): Promise<Fill[]> {
        const request: UserFillsRequest = {
            type: "userFills",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user fills by time.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    userFillsByTime(args: UserFillsByTimeParameters, signal?: AbortSignal): Promise<Fill[]> {
        const request: UserFillsByTimeRequest = {
            type: "userFillsByTime",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user funding.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    userFunding(args: UserFundingParameters, signal?: AbortSignal): Promise<UserFundingUpdate[]> {
        const request: UserFundingRequest = {
            type: "userFunding",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user non-funding ledger updates.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    userNonFundingLedgerUpdates(
        args: UserNonFundingLedgerUpdatesParameters,
        signal?: AbortSignal,
    ): Promise<UserNonFundingLedgerUpdate[]> {
        const request: UserNonFundingLedgerUpdatesRequest = {
            type: "userNonFundingLedgerUpdates",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user rate limits.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    userRateLimit(args: UserRateLimitParameters, signal?: AbortSignal): Promise<UserRateLimit> {
        const request: UserRateLimitRequest = {
            type: "userRateLimit",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user role.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    userRole(args: UserRoleParameters, signal?: AbortSignal): Promise<UserRole> {
        const request: UserRoleRequest = {
            type: "userRole",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request multi-sig signers for a user.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    userToMultiSigSigners(
        args: UserToMultiSigSignersParameters,
        signal?: AbortSignal,
    ): Promise<MultiSigSigners | null> {
        const request: UserToMultiSigSignersRequest = {
            type: "userToMultiSigSigners",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user twap slice fills.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    userTwapSliceFills(args: UserTwapSliceFillsParameters, signal?: AbortSignal): Promise<TwapSliceFill[]> {
        const request: UserTwapSliceFillsRequest = {
            type: "userTwapSliceFills",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user twap slice fills by time.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    userTwapSliceFillsByTime(args: UserTwapSliceFillsByTimeParameters, signal?: AbortSignal): Promise<TwapSliceFill[]> {
        const request: UserTwapSliceFillsByTimeRequest = {
            type: "userTwapSliceFillsByTime",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request user vault deposits.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    userVaultEquities(args: UserVaultEquitiesParameters, signal?: AbortSignal): Promise<VaultEquity[]> {
        const request: UserVaultEquitiesRequest = {
            type: "userVaultEquities",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request validator L1 votes.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
     * @returns
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
     * const data = await infoClient.validatorL1Votes();
     * ```
     */
    validatorL1Votes(signal?: AbortSignal): Promise<unknown[]> {
        const request: ValidatorL1VotesRequest = {
            type: "validatorL1Votes",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request validator summaries.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    validatorSummaries(signal?: AbortSignal): Promise<ValidatorSummary[]> {
        const request: ValidatorSummariesRequest = {
            type: "validatorSummaries",
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request details of a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    vaultDetails(args: VaultDetailsParameters, signal?: AbortSignal): Promise<VaultDetails | null> {
        const request: VaultDetailsRequest = {
            type: "vaultDetails",
            ...args,
        };
        return this.transport.request("info", request, signal);
    }

    /**
     * Request a list of vaults less than 2 hours old.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    vaultSummaries(signal?: AbortSignal): Promise<VaultSummary[]> {
        const request: VaultSummariesRequest = {
            type: "vaultSummaries",
        };
        return this.transport.request("info", request, signal);
    }

    async [Symbol.asyncDispose](): Promise<void> {
        await this.transport[Symbol.asyncDispose]?.();
    }
}
