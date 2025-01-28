import type { IRequestTransport } from "../transports/base.ts";
import type { BlockDetailsRequest, TxDetailsRequest } from "../types/explorer/requests.d.ts";
import type { BlockDetailsResponse, TxDetailsResponse } from "../types/explorer/responses.d.ts";
import type {
    ExtraAgent,
    PerpsClearinghouseState,
    Referral,
    SpotClearinghouseState,
    SubAccount,
    UserFees,
    UserFundingUpdate,
    UserNonFundingLedgerUpdate,
    UserRateLimit,
} from "../types/info/accounts.d.ts";
import type {
    AllMids,
    Candle,
    FundingHistory,
    PerpsMeta,
    PerpsMetaAndAssetCtxs,
    PredictedFunding,
    SpotDeployState,
    SpotMeta,
    SpotMetaAndAssetCtxs,
    TokenDetails,
} from "../types/info/assets.d.ts";
import type {
    Book,
    Fill,
    FrontendOrder,
    Order,
    OrderLookup,
    OrderStatus,
    TwapHistory,
    TwapSliceFill,
} from "../types/info/orders.d.ts";
import type {
    CandleSnapshotRequest,
    ClearinghouseStateRequest,
    ExtraAgentsRequest,
    FrontendOpenOrdersRequest,
    FundingHistoryRequest,
    HistoricalOrdersRequest,
    L2BookRequest,
    MaxBuilderFeeRequest,
    OpenOrdersRequest,
    OrderStatusRequest,
    ReferralRequest,
    SpotClearinghouseStateRequest,
    SpotDeployStateRequest,
    SubAccountsRequest,
    TokenDetailsRequest,
    TwapHistoryRequest,
    UserFeesRequest,
    UserFillsByTimeRequest,
    UserFillsRequest,
    UserFundingRequest,
    UserNonFundingLedgerUpdatesRequest,
    UserRateLimitRequest,
    UserTwapSliceFillsRequest,
    UserVaultEquitiesRequest,
    VaultDetailsRequest,
} from "../types/info/requests.d.ts";
import type { VaultDetails, VaultEquity, VaultSummary } from "../types/info/vaults.d.ts";

// ———————————————Info Parameters———————————————

/** Parameters for the {@linkcode PublicClient} constructor. */
export type PublicClientParameters<T extends IRequestTransport = IRequestTransport> = {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;
};

/** Parameters for the {@linkcode PublicClient.candleSnapshot} method. */
export type CandleSnapshotParameters = CandleSnapshotRequest["req"];

/** Parameters for the {@linkcode PublicClient.clearinghouseState} method. */
export type ClearinghouseStateParameters = Omit<ClearinghouseStateRequest, "type">;

/** Parameters for the {@linkcode PublicClient.extraAgents} method. */
export type ExtraAgentsParameters = Omit<ExtraAgentsRequest, "type">;

/** Parameters for the {@linkcode PublicClient.frontendOpenOrders} method. */
export type FrontendOpenOrdersParameters = Omit<FrontendOpenOrdersRequest, "type">;

/** Parameters for the {@linkcode PublicClient.fundingHistory} method. */
export type FundingHistoryParameters = Omit<FundingHistoryRequest, "type">;

/** Parameters for the {@linkcode PublicClient.historicalOrders} method. */
export type HistoricalOrdersParameters = Omit<HistoricalOrdersRequest, "type">;

/** Parameters for the {@linkcode PublicClient.l2Book} method. */
export type L2BookParameters = Omit<L2BookRequest, "type">;

/** Parameters for the {@linkcode PublicClient.maxBuilderFee} method. */
export type MaxBuilderFeeParameters = Omit<MaxBuilderFeeRequest, "type">;

/** Parameters for the {@linkcode PublicClient.openOrders} method. */
export type OpenOrdersParameters = Omit<OpenOrdersRequest, "type">;

/** Parameters for the {@linkcode PublicClient.orderStatus} method. */
export type OrderStatusParameters = Omit<OrderStatusRequest, "type">;

/** Parameters for the {@linkcode PublicClient.referral} method. */
export type ReferralParameters = Omit<ReferralRequest, "type">;

/** Parameters for the {@linkcode PublicClient.spotClearinghouseState} method. */
export type SpotClearinghouseStateParameters = Omit<SpotClearinghouseStateRequest, "type">;

/** Parameters for the {@linkcode PublicClient.spotDeployState} method. */
export type SpotDeployStateParameters = Omit<SpotDeployStateRequest, "type">;

/** Parameters for the {@linkcode PublicClient.subAccounts} method. */
export type SubAccountsParameters = Omit<SubAccountsRequest, "type">;

/** Parameters for the {@linkcode PublicClient.tokenDetails} method. */
export type TokenDetailsParameters = Omit<TokenDetailsRequest, "type">;

/** Parameters for the {@linkcode PublicClient.twapHistory} method. */
export type TwapHistoryParameters = Omit<TwapHistoryRequest, "type">;

/** Parameters for the {@linkcode PublicClient.userFees} method. */
export type UserFeesParameters = Omit<UserFeesRequest, "type">;

/** Parameters for the {@linkcode PublicClient.userFills} method. */
export type UserFillsParameters = Omit<UserFillsRequest, "type">;

/** Parameters for the {@linkcode PublicClient.userFillsByTime} method. */
export type UserFillsByTimeParameters = Omit<UserFillsByTimeRequest, "type">;

/** Parameters for the {@linkcode PublicClient.userFunding} method. */
export type UserFundingParameters = Omit<UserFundingRequest, "type">;

/** Parameters for the {@linkcode PublicClient.userNonFundingLedgerUpdates} method. */
export type UserNonFundingLedgerUpdatesParameters = Omit<UserNonFundingLedgerUpdatesRequest, "type">;

/** Parameters for the {@linkcode PublicClient.userRateLimit} method. */
export type UserRateLimitParameters = Omit<UserRateLimitRequest, "type">;

/** Parameters for the {@linkcode PublicClient.userTwapSliceFills} method. */
export type UserTwapSliceFillsParameters = Omit<UserTwapSliceFillsRequest, "type">;

/** Parameters for the {@linkcode PublicClient.userVaultEquities} method. */
export type UserVaultEquitiesParameters = Omit<UserVaultEquitiesRequest, "type">;

/** Parameters for the {@linkcode PublicClient.vaultDetails} method. */
export type VaultDetailsParameters = Omit<VaultDetailsRequest, "type">;

// ———————————————Explorer Parameters———————————————

/** Parameters for the {@linkcode PublicClient.blockDetails} method. */
export type BlockDetailsParameters = Omit<BlockDetailsRequest, "type">;

/** Parameters for the {@linkcode PublicClient.txDetails} method. */
export type TxDetailsParameters = Omit<TxDetailsRequest, "type">;

/**
 * Public client for interacting with the Hyperliquid API.
 * @typeParam T - The type of transport used to connect to the Hyperliquid API.
 */
export class PublicClient<T extends IRequestTransport = IRequestTransport> {
    /** The transport used to connect to the Hyperliquid API. */
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
     * const client = new hl.PublicClient({ transport });
     * ```
     */
    constructor(args: PublicClientParameters<T>) {
        this.transport = args.transport;
    }

    // ———————————————Info API———————————————

    /**
     * Request mid coin prices.
     * @param signal - An optional abort signal.
     * @returns Mid coin prices.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const allMids = await client.allMids();
     * ```
     */
    allMids(signal?: AbortSignal): Promise<AllMids> {
        return this.transport.request(
            "info",
            { type: "allMids" },
            signal,
        ) as Promise<AllMids>;
    }

    /**
     * Request candlestick snapshots.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of candlestick data points.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const candles = await client.candleSnapshot({
     *   coin: "ETH",
     *   interval: "1h",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    candleSnapshot(args: CandleSnapshotParameters, signal?: AbortSignal): Promise<Candle[]> {
        return this.transport.request(
            "info",
            { type: "candleSnapshot", req: args },
            signal,
        ) as Promise<Candle[]>;
    }

    /**
     * Request clearinghouse state.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Account summary for perpetual trading.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const state = await client.clearinghouseState({ user: "0x..." });
     * ```
     */
    clearinghouseState(args: ClearinghouseStateParameters, signal?: AbortSignal): Promise<PerpsClearinghouseState> {
        return this.transport.request(
            "info",
            { type: "clearinghouseState", ...args },
            signal,
        ) as Promise<PerpsClearinghouseState>;
    }

    /**
     * Request user's extra agents.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns User's extra agents.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const extraAgents = await client.extraAgents({ user: "0x..." });
     * ```
     */
    extraAgents(args: ExtraAgentsParameters, signal?: AbortSignal): Promise<ExtraAgent[]> {
        return this.transport.request(
            "info",
            { type: "extraAgents", ...args },
            signal,
        ) as Promise<ExtraAgent[]>;
    }

    /**
     * Request frontend open orders.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of open orders with additional frontend information.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const orders = await client.frontendOpenOrders({ user: "0x..." });
     * ```
     */
    frontendOpenOrders(args: FrontendOpenOrdersParameters, signal?: AbortSignal): Promise<FrontendOrder[]> {
        return this.transport.request(
            "info",
            { type: "frontendOpenOrders", ...args },
            signal,
        ) as Promise<FrontendOrder[]>;
    }

    /**
     * Request funding history.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of historical funding rate data for an asset.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const funding = await client.fundingHistory({
     *   coin: "ETH",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    fundingHistory(args: FundingHistoryParameters, signal?: AbortSignal): Promise<FundingHistory[]> {
        return this.transport.request(
            "info",
            { type: "fundingHistory", ...args },
            signal,
        ) as Promise<FundingHistory[]>;
    }

    /**
     * Request user's historical orders.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's historical orders.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const orders = await client.historicalOrders({ user: "0x..." });
     * ```
     */
    historicalOrders(args: HistoricalOrdersParameters, signal?: AbortSignal): Promise<OrderStatus<FrontendOrder>[]> {
        return this.transport.request(
            "info",
            { type: "historicalOrders", ...args },
            signal,
        ) as Promise<OrderStatus<FrontendOrder>[]>;
    }

    /**
     * Request L2 order book.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns L2 order book snapshot.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const book = await client.l2Book({ coin: "ETH", nSigFigs: 2 });
     * ```
     */
    l2Book(args: L2BookParameters, signal?: AbortSignal): Promise<Book> {
        return this.transport.request(
            "info",
            { type: "l2Book", ...args },
            signal,
        ) as Promise<Book>;
    }

    /**
     * Request builder fee approval.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Maximum builder fee approval.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const maxBuilderFee = await client.maxBuilderFee({ user: "0x...", builder: "0x..." });
     * ```
     */
    maxBuilderFee(args: MaxBuilderFeeParameters, signal?: AbortSignal): Promise<number> {
        return this.transport.request(
            "info",
            { type: "maxBuilderFee", ...args },
            signal,
        ) as Promise<number>;
    }

    /**
     * Request trading metadata.
     * @param signal - An optional abort signal.
     * @returns Metadata for perpetual assets.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const meta = await client.meta();
     * ```
     */
    meta(signal?: AbortSignal): Promise<PerpsMeta> {
        return this.transport.request(
            "info",
            { type: "meta" },
            signal,
        ) as Promise<PerpsMeta>;
    }

    /**
     * Request metadata and asset contexts.
     * @param signal - An optional abort signal.
     * @returns Metadata and context information for each perpetual asset.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const [meta, assetCtxs] = await client.metaAndAssetCtxs();
     * ```
     */
    metaAndAssetCtxs(signal?: AbortSignal): Promise<PerpsMetaAndAssetCtxs> {
        return this.transport.request(
            "info",
            { type: "metaAndAssetCtxs" },
            signal,
        ) as Promise<PerpsMetaAndAssetCtxs>;
    }

    /**
     * Request open orders.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of open order.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const orders = await client.openOrders({ user: "0x..." });
     * ```
     */
    openOrders(args: OpenOrdersParameters, signal?: AbortSignal): Promise<Order[]> {
        return this.transport.request(
            "info",
            { type: "openOrders", ...args },
            signal,
        ) as Promise<Order[]>;
    }

    /**
     * Request order status.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Result of an order status lookup.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const status = await client.orderStatus({ user: "0x...", oid: 12345 });
     * ```
     */
    orderStatus(args: OrderStatusParameters, signal?: AbortSignal): Promise<OrderLookup> {
        return this.transport.request(
            "info",
            { type: "orderStatus", ...args },
            signal,
        ) as Promise<OrderLookup>;
    }

    /**
     * Request predicted funding rates.
     * @param signal - An optional abort signal.
     * @returns Array of predicted funding rates.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const predictedFundings = await client.predictedFundings();
     * ```
     */
    predictedFundings(signal?: AbortSignal): Promise<PredictedFunding[]> {
        return this.transport.request(
            "info",
            { type: "predictedFundings" },
            signal,
        ) as Promise<PredictedFunding[]>;
    }

    /**
     * Request user referral.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Referral information for a user.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const referral = await client.referral({ user: "0x..." });
     * ```
     */
    referral(args: ReferralParameters, signal?: AbortSignal): Promise<Referral> {
        return this.transport.request(
            "info",
            { type: "referral", ...args },
            signal,
        ) as Promise<Referral>;
    }

    /**
     * Request spot clearinghouse state.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Balances for spot tokens.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const state = await client.spotClearinghouseState({ user: "0x..." });
     * ```
     */
    spotClearinghouseState(
        args: SpotClearinghouseStateParameters,
        signal?: AbortSignal,
    ): Promise<SpotClearinghouseState> {
        return this.transport.request(
            "info",
            { type: "spotClearinghouseState", ...args },
            signal,
        ) as Promise<SpotClearinghouseState>;
    }

    /**
     * Request spot deploy state.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns The deploy state of a user.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction | Hyperliquid GitBook}
     */
    spotDeployState(args: SpotDeployStateParameters, signal?: AbortSignal): Promise<SpotDeployState> {
        return this.transport.request(
            "info",
            { type: "spotDeployState", ...args },
            signal,
        ) as Promise<SpotDeployState>;
    }

    /**
     * Request spot trading metadata.
     * @param signal - An optional abort signal.
     * @returns Metadata for spot assets.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const meta = await client.spotMeta();
     * ```
     */
    spotMeta(signal?: AbortSignal): Promise<SpotMeta> {
        return this.transport.request(
            "info",
            { type: "spotMeta" },
            signal,
        ) as Promise<SpotMeta>;
    }

    /**
     * Request spot metadata and asset contexts.
     * @param signal - An optional abort signal.
     * @returns Metadata and context information for each spot asset.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const [meta, assetCtxs] = await client.spotMetaAndAssetCtxs();
     * ```
     */
    spotMetaAndAssetCtxs(signal?: AbortSignal): Promise<SpotMetaAndAssetCtxs> {
        return this.transport.request(
            "info",
            { type: "spotMetaAndAssetCtxs" },
            signal,
        ) as Promise<SpotMetaAndAssetCtxs>;
    }

    /**
     * Request user sub-accounts.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user sub-account.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const subAccounts = await client.subAccounts({ user: "0x..." });
     * ```
     */
    subAccounts(args: SubAccountsParameters, signal?: AbortSignal): Promise<SubAccount[] | null> {
        return this.transport.request(
            "info",
            { type: "subAccounts", ...args },
            signal,
        ) as Promise<SubAccount[] | null>;
    }

    /**
     * Request token details.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns The details of a token.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const details = await client.tokenDetails({ tokenId: "0x..." });
     * ```
     */
    tokenDetails(args: TokenDetailsParameters, signal?: AbortSignal): Promise<TokenDetails> {
        return this.transport.request(
            "info",
            { type: "tokenDetails", ...args },
            signal,
        ) as Promise<TokenDetails>;
    }

    /**
     * Request twap history of a user.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns The twap history of a user.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const twapHistory = await client.twapHistory({ user: "0x..." });
     * ```
     */
    twapHistory(args: TwapHistoryParameters, signal?: AbortSignal): Promise<TwapHistory[]> {
        return this.transport.request(
            "info",
            { type: "twapHistory", ...args },
            signal,
        ) as Promise<TwapHistory[]>;
    }

    /**
     * Request user fees.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns User fees.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const userFees = await client.userFees({ user: "0x..." });
     * ```
     */
    userFees(args: UserFeesParameters, signal?: AbortSignal): Promise<UserFees> {
        return this.transport.request(
            "info",
            { type: "userFees", ...args },
            signal,
        ) as Promise<UserFees>;
    }

    /**
     * Request user fills.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's trade fill.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const fills = await client.userFills({ user: "0x..." });
     * ```
     */
    userFills(args: UserFillsParameters, signal?: AbortSignal): Promise<Fill[]> {
        return this.transport.request(
            "info",
            { type: "userFills", ...args },
            signal,
        ) as Promise<Fill[]>;
    }

    /**
     * Request user fills by time.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's trade fill.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const fills = await client.userFillsByTime({
     *   user: "0x...",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    userFillsByTime(args: UserFillsByTimeParameters, signal?: AbortSignal): Promise<Fill[]> {
        return this.transport.request(
            "info",
            { type: "userFillsByTime", ...args },
            signal,
        ) as Promise<Fill[]>;
    }

    /**
     * Request user funding.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's funding ledger update.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const funding = await client.userFunding({
     *   user: "0x...",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    userFunding(args: UserFundingParameters, signal?: AbortSignal): Promise<UserFundingUpdate[]> {
        return this.transport.request(
            "info",
            { type: "userFunding", ...args },
            signal,
        ) as Promise<UserFundingUpdate[]>;
    }

    /**
     * Request user non-funding ledger updates.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's non-funding ledger update.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const funding = await client.userNonFundingLedgerUpdates({
     *   user: "0x...",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    userNonFundingLedgerUpdates(
        args: UserNonFundingLedgerUpdatesParameters,
        signal?: AbortSignal,
    ): Promise<UserNonFundingLedgerUpdate[]> {
        return this.transport.request(
            "info",
            { type: "userNonFundingLedgerUpdates", ...args },
            signal,
        ) as Promise<UserNonFundingLedgerUpdate[]>;
    }

    /**
     * Request user rate limits.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns User's rate limits.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const rateLimit = await client.userRateLimit({ user: "0x..." });
     * ```
     */
    userRateLimit(args: UserRateLimitParameters, signal?: AbortSignal): Promise<UserRateLimit> {
        return this.transport.request(
            "info",
            { type: "userRateLimit", ...args },
            signal,
        ) as Promise<UserRateLimit>;
    }

    /**
     * Request user twap slice fills.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's twap slice fill.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const fills = await client.userTwapSliceFills({ user: "0x..." });
     * ```
     */
    userTwapSliceFills(args: UserTwapSliceFillsParameters, signal?: AbortSignal): Promise<TwapSliceFill[]> {
        return this.transport.request(
            "info",
            { type: "userTwapSliceFills", ...args },
            signal,
        ) as Promise<TwapSliceFill[]>;
    }

    /**
     * Request user vault deposits.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's vault deposits.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const deposits = await client.userVaultDeposits({ user: "0x..." });
     * ```
     */
    userVaultEquities(args: UserVaultEquitiesParameters, signal?: AbortSignal): Promise<VaultEquity[]> {
        return this.transport.request(
            "info",
            { type: "userVaultEquities", ...args },
            signal,
        ) as Promise<VaultEquity[]>;
    }

    /**
     * Request details of a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Details of a vault.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const vault = await client.vaultDetails({ vaultAddress: "0x..." });
     * ```
     */
    vaultDetails(args: VaultDetailsParameters, signal?: AbortSignal): Promise<VaultDetails | null> {
        return this.transport.request(
            "info",
            { type: "vaultDetails", ...args },
            signal,
        ) as Promise<VaultDetails | null>;
    }

    /**
     * Request a list of vaults less than 2 hours old.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of vault summaries.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const vaults = await client.vaultSummaries();
     * ```
     */
    vaultSummaries(signal?: AbortSignal): Promise<VaultSummary[]> {
        return this.transport.request(
            "info",
            { type: "vaultSummaries" },
            signal,
        ) as Promise<VaultSummary[]>;
    }

    // ———————————————Explorer API———————————————

    /**
     * Gets the details of a block.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns A promise that resolves with the details of the block.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const { blockDetails } = await client.blockDetails({ height: 123 });
     * ```
     */
    blockDetails(args: BlockDetailsParameters, signal?: AbortSignal): Promise<BlockDetailsResponse> {
        return this.transport.request(
            "explorer",
            { type: "blockDetails", ...args },
            signal,
        ) as Promise<BlockDetailsResponse>;
    }

    /**
     * Gets the details of a transaction.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns A promise that resolves with the details of the transaction.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.PublicClient({ transport });
     *
     * const { tx } = await client.txDetails({ hash: "0x..." });
     * ```
     */
    txDetails(args: TxDetailsParameters, signal?: AbortSignal): Promise<TxDetailsResponse> {
        return this.transport.request(
            "explorer",
            { type: "txDetails", ...args },
            signal,
        ) as Promise<TxDetailsResponse>;
    }
}
