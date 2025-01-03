import type { IRESTTransport } from "../transports/base.ts";
import type { BlockDetailsRequest, TxDetailsRequest } from "../types/explorer/requests.d.ts";
import type { BlockDetailsResponse, TxDetailsResponse } from "../types/explorer/responses.d.ts";
import type {
    ClearinghouseState,
    ExtraAgent,
    Referral,
    SpotClearinghouseState,
    SubAccount,
    UserFees,
    UserFunding,
    UserNonFundingLedgerUpdates,
    UserRateLimit,
} from "../types/info/accounts.d.ts";
import type {
    AllMids,
    CandleSnapshot,
    FundingHistory,
    Meta,
    MetaAndAssetCtxs,
    PredictedFunding,
    SpotDeployState,
    SpotMeta,
    SpotMetaAndAssetCtxs,
    TokenDetails,
} from "../types/info/assets.d.ts";
import type {
    FrontendOpenOrder,
    L2Book,
    OpenOrder,
    OrderStatus,
    OrderStatusResult,
    TwapHistory,
    UserFill,
    UserTwapSliceFill,
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
import type { UserVaultEquity, VaultDetails, VaultSummary } from "../types/info/vaults.d.ts";

// ———————————————Info Parameters———————————————

/** @see {@linkcode PublicClient.candleSnapshot} */
export type CandleSnapshotParameters = CandleSnapshotRequest["req"];

/** @see {@linkcode PublicClient.clearinghouseState} */
export type ClearinghouseStateParameters = Omit<ClearinghouseStateRequest, "type">;

/** @see {@linkcode PublicClient.extraAgents} */
export type ExtraAgentsParameters = Omit<ExtraAgentsRequest, "type">;

/** @see {@linkcode PublicClient.frontendOpenOrders} */
export type FrontendOpenOrdersParameters = Omit<FrontendOpenOrdersRequest, "type">;

/** @see {@linkcode PublicClient.fundingHistory} */
export type FundingHistoryParameters = Omit<FundingHistoryRequest, "type">;

/** @see {@linkcode PublicClient.historicalOrders} */
export type HistoricalOrdersParameters = Omit<HistoricalOrdersRequest, "type">;

/** @see {@linkcode PublicClient.l2Book} */
export type L2BookParameters = Omit<L2BookRequest, "type">;

/** @see {@linkcode PublicClient.maxBuilderFee} */
export type MaxBuilderFeeParameters = Omit<MaxBuilderFeeRequest, "type">;

/** @see {@linkcode PublicClient.openOrders} */
export type OpenOrdersParameters = Omit<OpenOrdersRequest, "type">;

/** @see {@linkcode PublicClient.orderStatus} */
export type OrderStatusParameters = Omit<OrderStatusRequest, "type">;

/** @see {@linkcode PublicClient.referral} */
export type ReferralParameters = Omit<ReferralRequest, "type">;

/** @see {@linkcode PublicClient.spotClearinghouseState} */
export type SpotClearinghouseStateParameters = Omit<SpotClearinghouseStateRequest, "type">;

/** @see {@linkcode PublicClient.spotDeployState} */
export type SpotDeployStateParameters = Omit<SpotDeployStateRequest, "type">;

/** @see {@linkcode PublicClient.subAccounts} */
export type SubAccountsParameters = Omit<SubAccountsRequest, "type">;

/** @see {@linkcode PublicClient.tokenDetails} */
export type TokenDetailsParameters = Omit<TokenDetailsRequest, "type">;

/** @see {@linkcode PublicClient.twapHistory} */
export type TwapHistoryParameters = Omit<TwapHistoryRequest, "type">;

/** @see {@linkcode PublicClient.userFees} */
export type UserFeesParameters = Omit<UserFeesRequest, "type">;

/** @see {@linkcode PublicClient.userFills} */
export type UserFillsParameters = Omit<UserFillsRequest, "type">;

/** @see {@linkcode PublicClient.userFillsByTime} */
export type UserFillsByTimeParameters = Omit<UserFillsByTimeRequest, "type">;

/** @see {@linkcode PublicClient.userFunding} */
export type UserFundingParameters = Omit<UserFundingRequest, "type">;

/** @see {@linkcode PublicClient.userNonFundingLedgerUpdates} */
export type UserNonFundingLedgerUpdatesParameters = Omit<UserNonFundingLedgerUpdatesRequest, "type">;

/** @see {@linkcode PublicClient.userRateLimit} */
export type UserRateLimitParameters = Omit<UserRateLimitRequest, "type">;

/** @see {@linkcode PublicClient.userTwapSliceFills} */
export type UserTwapSliceFillsParameters = Omit<UserTwapSliceFillsRequest, "type">;

/** @see {@linkcode PublicClient.userVaultEquities} */
export type UserVaultEquitiesParameters = Omit<UserVaultEquitiesRequest, "type">;

/** @see {@linkcode PublicClient.vaultDetails} */
export type VaultDetailsParameters = Omit<VaultDetailsRequest, "type">;

// ———————————————Explorer Parameters———————————————

/** @see {@linkcode PublicClient.blockDetails} */
export type BlockDetailsParameters = Omit<BlockDetailsRequest, "type">;

/** @see {@linkcode PublicClient.txDetails} */
export type TxDetailsParameters = Omit<TxDetailsRequest, "type">;

// ———————————————Client———————————————`

/** Public client for interacting with the Hyperliquid API. */
export class PublicClient<T extends IRESTTransport = IRESTTransport> {
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
    constructor(args: {
        /** The transport used to connect to the Hyperliquid API. */
        transport: T;
    }) {
        this.transport = args.transport;
    }

    // ———————————————Info API———————————————

    /**
     * Request mid coin prices.
     * @param signal - An optional abort signal.
     * @returns Mid coin prices.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-actively-traded-coins|Hyperliquid GitBook}
     * @example
     * ```ts
     * const allMids = await client.allMids();
     * // {
     * //   "ETH": "1800.5",
     * //   "BTC": "30000.0",
     * //   ...
     * // }
     * ```
     */
    allMids(signal?: AbortSignal): Promise<AllMids> {
        return this.transport.request("info", { type: "allMids" }, signal);
    }

    /**
     * Request candlestick snapshots.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of candlestick data points.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot|Hyperliquid GitBook}
     * @example
     * ```ts
     * const candles = await client.candleSnapshot({
     *     coin: "ETH",
     *     interval: "1h",
     *     startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * // [
     * //   {
     * //     t: 1234567890000,
     * //     T: 1234571490000,
     * //     s: "ETH",
     * //     i: "1h",
     * //     o: "1800.0",
     * //     c: "1805.0",
     * //     h: "1810.0",
     * //     l: "1795.0",
     * //     v: "1000.5",
     * //     n: 500
     * //   },
     * //   ...
     * // ]
     * ```
     */
    candleSnapshot(args: CandleSnapshotParameters, signal?: AbortSignal): Promise<CandleSnapshot[]> {
        return this.transport.request("info", { type: "candleSnapshot", req: args }, signal);
    }

    /**
     * Request clearinghouse state.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Account summary for perpetual trading.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary|Hyperliquid GitBook}
     * @example
     * ```ts
     * const state = await client.clearinghouseState({ user: "0x..." });
     * // {
     * //   marginSummary: {
     * //     accountValue: "10000.0",
     * //     totalNtlPos: "5000.0",
     * //     totalRawUsd: "5000.0",
     * //     totalMarginUsed: "1000.0"
     * //   },
     * //   crossMarginSummary: {
     * //     accountValue: "10000.0",
     * //     totalNtlPos: "5000.0",
     * //     totalRawUsd: "5000.0",
     * //     totalMarginUsed: "1000.0"
     * //   },
     * //   crossMaintenanceMarginUsed: "0.0",
     * //   withdrawable: "10000.0",
     * //   assetPositions: [...],
     * //   time: 1234567890000
     * // }
     * ```
     */
    clearinghouseState(args: ClearinghouseStateParameters, signal?: AbortSignal): Promise<ClearinghouseState> {
        return this.transport.request("info", { type: "clearinghouseState", ...args }, signal);
    }

    /**
     * Request user's extra agents.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns User's extra agents.
     *
     * @example
     * ```ts
     * const extraAgents = await client.extraAgents({ user: "0x1234..." });
     * // [
     * //   { address: "0x...", name: "Test", validUntil: 1234567890 },
     * //   { address: "0x...", name: "Test2", validUntil: 1234567891 },
     * //   ...
     * // ]
     * ```
     */
    extraAgents(args: ExtraAgentsParameters, signal?: AbortSignal): Promise<ExtraAgent[]> {
        return this.transport.request("info", { type: "extraAgents", ...args }, signal);
    }

    /**
     * Request frontend open orders.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of open orders with additional frontend information.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info|Hyperliquid GitBook}
     * @example
     * ```ts
     * const orders = await client.frontendOpenOrders({ user: "0x1234..." });
     * // [
     * //   {
     * //     coin: "ETH",
     * //     side: "B",
     * //     limitPx: "1800.0",
     * //     sz: "1.0",
     * //     oid: 12345,
     * //     timestamp: 1234567890000,
     * //     origSz: "1.0",
     * //     triggerCondition: "gt",
     * //     isTrigger: false,
     * //     triggerPx: null,
     * //     children: [],
     * //     isPositionTpsl: false,
     * //     reduceOnly: false,
     * //     orderType: "Limit",
     * //     tif: null,
     * //     cloid: null
     * //   },
     * //   ...
     * // ]
     * ```
     */
    frontendOpenOrders(args: FrontendOpenOrdersParameters, signal?: AbortSignal): Promise<FrontendOpenOrder[]> {
        return this.transport.request("info", { type: "frontendOpenOrders", ...args }, signal);
    }

    /**
     * Request funding history.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of historical funding rate data for an asset.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates|Hyperliquid GitBook}
     * @example
     * ```ts
     * const funding = await client.fundingHistory({
     *     coin: "ETH",
     *     startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * // [
     * //   {
     * //     coin: "ETH",
     * //     fundingRate: "0.0001",
     * //     premium: "0.0002",
     * //     time: 1234567890000
     * //   },
     * //   ...
     * // ]
     * ```
     */
    fundingHistory(args: FundingHistoryParameters, signal?: AbortSignal): Promise<FundingHistory[]> {
        return this.transport.request("info", { type: "fundingHistory", ...args }, signal);
    }

    /**
     * Request user's historical orders.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's historical orders.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders|Hyperliquid GitBook}
     * @example
     * ```ts
     * const orders = await client.historicalOrders({ user: "0x..." });
     * // [
     * //   {
     * //     "order": {
     * //       "coin": "ETH",
     * //       "side": "A",
     * //       "limitPx": "2412.7",
     * //       "sz": "0.0",
     * //       "oid": 1,
     * //       "timestamp": 1724361546645,
     * //       ...
     * //     },
     * //     "status": "filled",
     * //     "statusTimestamp": 1724361546645
     * //   },
     * //   ...
     * // ]
     * ```
     */
    historicalOrders(args: HistoricalOrdersParameters, signal?: AbortSignal): Promise<OrderStatus[]> {
        return this.transport.request("info", { type: "historicalOrders", ...args }, signal);
    }

    /**
     * Request L2 order book.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns L2 order book snapshot.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot|Hyperliquid GitBook}
     * @example
     * ```ts
     * const book = await client.l2Book({ coin: "ETH", nSigFigs: 2 });
     * // {
     * //   coin: "ETH",
     * //   time: 1234567890000,
     * //   levels: [
     * //     [
     * //       { px: "1801.00", sz: "15.0", n: 7 },
     * //       { px: "1802.00", sz: "12.5", n: 4 },
     * //       ...
     * //     ],
     * //     [
     * //       { px: "1800.00", sz: "10.5", n: 5 },
     * //       { px: "1799.00", sz: "5.0", n: 3 },
     * //       ...
     * //     ]
     * //   ]
     * // }
     * ```
     */
    l2Book(args: L2BookParameters, signal?: AbortSignal): Promise<L2Book> {
        return this.transport.request("info", { type: "l2Book", ...args }, signal);
    }

    /**
     * Request builder fee approval.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Maximum builder fee approval.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval|Hyperliquid GitBook}
     * @example
     * ```ts
     * const maxBuilderFee = await client.maxBuilderFee({ user: "0x...", builder: "0x..." });
     * // 1 (means 0.001%)
     * ```
     */
    maxBuilderFee(args: MaxBuilderFeeParameters, signal?: AbortSignal): Promise<number> {
        return this.transport.request("info", { type: "maxBuilderFee", ...args }, signal);
    }

    /**
     * Request trading metadata.
     * @param signal - An optional abort signal.
     * @returns Metadata for perpetual assets.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata|Hyperliquid GitBook}
     * @example
     * ```ts
     * const meta = await client.meta();
     * // {
     * //   universe: [
     * //     { szDecimals: 3, name: "PERP", maxLeverage: 50, onlyIsolated: false },
     * //     { szDecimals: 3, name: "SOL", maxLeverage: 50, onlyIsolated: false },
     * //     ...
     * //   ]
     * // }
     * ```
     */
    meta(signal?: AbortSignal): Promise<Meta> {
        return this.transport.request("info", { type: "meta" }, signal);
    }

    /**
     * Request metadata and asset contexts.
     * @param signal - An optional abort signal.
     * @returns Metadata and context information for each perpetual asset.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc|Hyperliquid GitBook}
     * @example
     * ```ts
     * const [meta, assetCtxs] = await client.metaAndAssetCtxs();
     * // [
     * //   {
     * //     universe: [
     * //       { szDecimals: 5, name: "PERP", maxLeverage: 10, onlyIsolated: true },
     * //       { szDecimals: 4, name: "SOL", maxLeverage: 25, onlyIsolated: false },
     * //       ...
     * //     ],
     * //   },
     * //   [
     * //     { funding: "0.0001", openInterest: "1000000", prevDayPx: "1800.0", ... },
     * //     { funding: "0.0002", openInterest: "2000000", prevDayPx: "1805.0", ... },
     * //     ...
     * //   ]
     * // ]
     * ```
     */
    metaAndAssetCtxs(signal?: AbortSignal): Promise<MetaAndAssetCtxs> {
        return this.transport.request("info", { type: "metaAndAssetCtxs" }, signal);
    }

    /**
     * Request open orders.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of open order.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders|Hyperliquid GitBook}
     * @example
     * ```ts
     * const orders = await client.openOrders({ user: "0x1234..." });
     * // [
     * //   {
     * //     coin: "ETH",
     * //     side: "B",
     * //     limitPx: "1800.0",
     * //     sz: "1.0",
     * //     oid: 12345,
     * //     timestamp: 1234567890000,
     * //     origSz: "1.0"
     * //   },
     * //   ...
     * // ]
     * ```
     */
    openOrders(args: OpenOrdersParameters, signal?: AbortSignal): Promise<OpenOrder[]> {
        return this.transport.request("info", { type: "openOrders", ...args }, signal);
    }

    /**
     * Request order status.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Result of an order status lookup.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid|Hyperliquid GitBook}
     * @example
     * ```ts
     * const status = await client.orderStatus({ user: "0x1234...", oid: 12345 });
     * // {
     * //   status: "order",
     * //   order: {
     * //     order: {...},
     * //     status: "open",
     * //     statusTimestamp: 1234567890000
     * //   }
     * // }
     * // or
     * // {
     * //   status: "unknownOid"
     * // }
     * ```
     */
    orderStatus(args: OrderStatusParameters, signal?: AbortSignal): Promise<OrderStatusResult> {
        return this.transport.request("info", { type: "orderStatus", ...args }, signal);
    }

    /**
     * Request predicted funding rates.
     * @param signal - An optional abort signal.
     * @returns Array of predicted funding rates.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues|Hyperliquid GitBook}
     * @example
     * ```ts
     * const predictedFundings = await client.predictedFundings();
     * // [
     * //   ["ETH", [["BybitPerp", { fundingRate: "0.0001", nextFundingTime: 1234567890 }], ...],
     * //   ["SOL", [["BybitPerp", { fundingRate: "0.0002", nextFundingTime: 1234567891 }], ...],
     * //   ...
     * // ]
     * ```
     */
    predictedFundings(signal?: AbortSignal): Promise<PredictedFunding[]> {
        return this.transport.request("info", { type: "predictedFundings" }, signal);
    }

    /**
     * Request user referral.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Referral information for a user.
     *
     * @example
     * ```ts
     * const referral = await client.referral({ user: "0x1234..." });
     * // {
     * //   referredBy: {
     * //     referrer: "0x...",
     * //     code: "..."
     * //   },
     * //   cumVlm: "100000.0",
     * //   unclaimedRewards: "500.0",
     * //   claimedRewards: "300.0",
     * //   builderRewards: "0.0",
     * //   referrerState: {...},
     * //   rewardHistory: [...]
     * // }
     * ```
     */
    referral(args: ReferralParameters, signal?: AbortSignal): Promise<Referral> {
        return this.transport.request("info", { type: "referral", ...args }, signal);
    }

    /**
     * Request spot clearinghouse state.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Balances for spot tokens.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances|Hyperliquid GitBook}
     * @example
     * ```ts
     * const state = await client.spotClearinghouseState({ user: "0x1234..." });
     * // {
     * //   balances: [
     * //     { coin: "ETH", entryNtl: "12345.67", hold: "0.5", token: 1, total: "10.0" },
     * //     { coin: "BTC", entryNtl: "12345.67", hold: "0.5", token: 2, total: "10.0" },
     * //     ...
     * //   ]
     * // }
     * ```
     */
    spotClearinghouseState(
        args: SpotClearinghouseStateParameters,
        signal?: AbortSignal,
    ): Promise<SpotClearinghouseState> {
        return this.transport.request("info", { type: "spotClearinghouseState", ...args }, signal);
    }

    /**
     * Request spot deploy state.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns The deploy state of a user.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction|Hyperliquid GitBook}
     */
    spotDeployState(args: SpotDeployStateParameters, signal?: AbortSignal): Promise<SpotDeployState> {
        return this.transport.request("info", { type: "spotDeployState", ...args }, signal);
    }

    /**
     * Request spot trading metadata.
     * @param signal - An optional abort signal.
     * @returns Metadata for spot assets.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata|Hyperliquid GitBook}
     * @example
     * ```ts
     * const meta = await client.spotMeta();
     * // {
     * //   universe: [
     * //     { tokens: [1, 2, 3], name: "ETH", index: 1, isCanonical: true },
     * //     { tokens: [4, 5, 6], name: "BTC", index: 2, isCanonical: true },
     * //     ...
     * //   ],
     * //   tokens: [
     * //     { name: "ETH", szDecimals: 8, weiDecimals: 18, index: 1, tokenId: "0x...", ... },
     * //     { name: "BTC", szDecimals: 8, weiDecimals: 18, index: 2, tokenId: "0x...", ... },
     * //     ...
     * //   ]
     * // }
     * ```
     */
    spotMeta(signal?: AbortSignal): Promise<SpotMeta> {
        return this.transport.request("info", { type: "spotMeta" }, signal);
    }

    /**
     * Request spot metadata and asset contexts.
     * @param signal - An optional abort signal.
     * @returns Metadata and context information for each spot asset.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts|Hyperliquid GitBook}
     * @example
     * ```ts
     * const [meta, assetCtxs] = await client.spotMetaAndAssetCtxs();
     * // [
     * //   {
     * //     universe: [
     * //       { tokens: [1, 2, 3], name: "ETH", index: 1, isCanonical: true },
     * //       { tokens: [4, 5, 6], name: "BTC", index: 2, isCanonical: true },
     * //       ...
     * //     ],
     * //     tokens: [
     * //       { name: "ETH", szDecimals: 8, weiDecimals: 18, index: 1, tokenId: "0x...", ... },
     * //       { name: "BTC", szDecimals: 8, weiDecimals: 18, index: 2, tokenId: "0x...", ... },
     * //       ...
     * //     ],
     * //   },
     * //   [
     * //     { prevDayPx: "1800.0", dayNtlVlm: "10000000", markPx: "1805.0", ... },
     * //     { prevDayPx: "12345.67", dayNtlVlm: "10000000", markPx: "12350.0", ... },
     * //     ...
     * //   ],
     * // ]
     * ```
     */
    spotMetaAndAssetCtxs(signal?: AbortSignal): Promise<SpotMetaAndAssetCtxs> {
        return this.transport.request("info", { type: "spotMetaAndAssetCtxs" }, signal);
    }

    /**
     * Request user sub-accounts.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user sub-account.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts|Hyperliquid GitBook}
     * @example
     * ```ts
     * const subAccounts = await client.subAccounts({ user: "0x1234..." });
     * // [
     * //   { name: "Test", subAccountUser: "0x...", master: "0x...", clearinghouseState: {...}, spotState: {...} },
     * //   { name: "Test2", subAccountUser: "0x...", master: "0x...", clearinghouseState: {...}, spotState: {...} },
     * //   ...
     * // ]
     * ```
     */
    subAccounts(args: SubAccountsParameters, signal?: AbortSignal): Promise<SubAccount[] | null> {
        return this.transport.request("info", { type: "subAccounts", ...args }, signal);
    }

    /**
     * Request token details.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns The details of a token.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token|Hyperliquid GitBook}
     * @example
     * ```ts
     * const details = await client.tokenDetails({ tokenId: "0x..." });
     * // {
     * //   circulatingSupply: "1000000",
     * //   deployGas: "1000000",
     * //   deployTime: "2024-11-29T06:45:52.532",
     * //   deployer: "0x...",
     * //   ...
     * // }
     * ```
     */
    tokenDetails(args: TokenDetailsParameters, signal?: AbortSignal): Promise<TokenDetails> {
        return this.transport.request("info", { type: "tokenDetails", ...args }, signal);
    }

    /**
     * Request twap history of a user.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns The twap history of a user.
     *
     * @example
     * ```ts
     * const twapHistory = await client.twapHistory({ user: "0x1234..." });
     * // [
     * //   {
     * //     state: {
     * //       coin: "ETH",
     * //       side: "B",
     * //       minutes: 5,
     * //       ...
     * //     },
     * //     status: { status: "activated" },
     * //     time: 1234567890
     * //   },
     * //   {
     * //     state: {
     * //       coin: "BTC",
     * //       side: "A",
     * //       minutes: 30,
     * //       ...
     * //     },
     * //     status: { status: "terminated" },
     * //     time: 1234567891
     * //   },
     * //   ...
     * // ]
     * ```
     */
    twapHistory(args: TwapHistoryParameters, signal?: AbortSignal): Promise<TwapHistory[]> {
        return this.transport.request("info", { type: "twapHistory", ...args }, signal);
    }

    /**
     * Request user fees.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns User fees.
     *
     * @example
     * ```ts
     * const userFees = await client.userFees({ user: "0x1234..." });
     * // {
     * //   dailyUserVlm: [...],
     * //   feeSchedule: {...},
     * //   userCrossRate: "0.00035",
     * //   userAddRate: "0.0001",
     * //   activeReferralDiscount: "0.0001",
     * // }
     * ```
     */
    userFees(args: UserFeesParameters, signal?: AbortSignal): Promise<UserFees> {
        return this.transport.request("info", { type: "userFees", ...args }, signal);
    }

    /**
     * Request user fills.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's trade fill.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills|Hyperliquid GitBook}
     * @example
     * ```ts
     * const fills = await client.userFills({ user: "0x1234..." });
     * // [
     * //   { coin: "ETH", px: "1800.0", sz: "1.0", side: "B", time: 1234567890000, ... },
     * //   { coin: "BTC", px: "12345.67", sz: "2.0", side: "A", time: 1234567890001, ... },
     * //   ...
     * // ]
     * ```
     */
    userFills(args: UserFillsParameters, signal?: AbortSignal): Promise<UserFill[]> {
        return this.transport.request("info", { type: "userFills", ...args }, signal);
    }

    /**
     * Request user fills by time.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's trade fill.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time|Hyperliquid GitBook}
     * @example
     * ```ts
     * const fills = await client.userFillsByTime({
     *     user: "0x1234...",
     *     startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * // [
     * //   { coin: "ETH", px: "1800.0", sz: "1.0", side: "B", time: 1234567890000, ... },
     * //   { coin: "BTC", px: "12345.67", sz: "2.0", side: "A", time: 1234567890001, ... },
     * //   ...
     * // ]
     * ```
     */
    userFillsByTime(args: UserFillsByTimeParameters, signal?: AbortSignal): Promise<UserFill[]> {
        return this.transport.request("info", { type: "userFillsByTime", ...args }, signal);
    }

    /**
     * Request user funding.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's funding ledger update.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates|Hyperliquid GitBook}
     * @example
     * ```ts
     * const funding = await client.userFunding({
     *     user: "0x1234...",
     *     startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * // [
     * //   {
     * //     time: 1234567890000,
     * //     hash: "0x...",
     * //     delta: {
     * //       type: "funding",
     * //       coin: "ETH",
     * //       usdc: "1.5",
     * //       szi: "1000.0",
     * //       fundingRate: "0.0001",
     * //       nSamples: 10
     * //     }
     * //   },
     * //   ...
     * // ]
     * ```
     */
    userFunding(args: UserFundingParameters, signal?: AbortSignal): Promise<UserFunding[]> {
        return this.transport.request("info", { type: "userFunding", ...args }, signal);
    }

    /**
     * Request user non-funding ledger updates.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's non-funding ledger update.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates|Hyperliquid GitBook}
     * @example
     * ```ts
     * const funding = await client.userNonFundingLedgerUpdates({
     *     user: "0x1234...",
     *     startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * // [
     * //   {
     * //     time: 1234567890000,
     * //     hash: "0x...",
     * //     delta: { type: "deposit", usdc: "5" }
     * //   },
     * //   {
     * //     time: 1234567890001,
     * //     hash: "0x...",
     * //     delta: { type: "withdraw", usdc: "10", nonce: 1, fee: "0" }
     * //   },
     * //   ...
     * // ]
     * ```
     */
    userNonFundingLedgerUpdates(
        args: UserNonFundingLedgerUpdatesParameters,
        signal?: AbortSignal,
    ): Promise<UserNonFundingLedgerUpdates[]> {
        return this.transport.request("info", { type: "userNonFundingLedgerUpdates", ...args }, signal);
    }

    /**
     * Request user rate limits.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns User's rate limits.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits|Hyperliquid GitBook}
     * @example
     * ```ts
     * const rateLimit = await client.userRateLimit({ user: "0x1234..." });
     * // {
     * //   cumVlm: "1000000",
     * //   nRequestsUsed: 50,
     * //   nRequestsCap: 100
     * // }
     * ```
     */
    userRateLimit(args: UserRateLimitParameters, signal?: AbortSignal): Promise<UserRateLimit> {
        return this.transport.request("info", { type: "userRateLimit", ...args }, signal);
    }

    /**
     * Request user twap slice fills.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's twap slice fill.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills|Hyperliquid GitBook}
     * @example
     * ```ts
     * const fills = await client.userTwapSliceFills({ user: "0x..." });
     * // [
     * //   {
     * //     "fill": {
     * //       "closedPnl": "0.0",
     * //       "coin": "AVAX",
     * //       "crossed": true,
     * //       "dir": "Open Long",
     * //       "oid": 90542681,
     * //       "px": "18.435",
     * //       "side": "B",
     * //       ...
     * //     },
     * //     "twapId": 3156
     * //   },
     * //   ...
     * // ]
     * ```
     */
    userTwapSliceFills(args: UserTwapSliceFillsParameters, signal?: AbortSignal): Promise<UserTwapSliceFill[]> {
        return this.transport.request("info", { type: "userTwapSliceFills", ...args }, signal);
    }

    /**
     * Request user vault deposits.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of user's vault deposits.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits|Hyperliquid GitBook}
     * @example
     * ```ts
     * const deposits = await client.userVaultDeposits({ user: "0x..." });
     * // [
     * //   {
     * //     "vaultAddress": "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303",
     * //     "equity": "742500.082809"
     * //   },
     * //   ...
     * // ]
     * ```
     */
    userVaultEquities(args: UserVaultEquitiesParameters, signal?: AbortSignal): Promise<UserVaultEquity[]> {
        return this.transport.request("info", { type: "userVaultEquities", ...args }, signal);
    }

    /**
     * Request details of a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Details of a vault.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault|Hyperliquid GitBook}
     * @example
     * ```ts
     * const vault = await client.vaultDetails({ vaultAddress: "0x..." });
     * ```
     */
    vaultDetails(args: VaultDetailsParameters, signal?: AbortSignal): Promise<VaultDetails | null> {
        return this.transport.request("info", { type: "vaultDetails", ...args }, signal);
    }

    /**
     * Request a list of vaults less than 2 hours old.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Array of vault summaries.
     *
     * @example
     * ```ts
     * const vaults = await client.vaultSummaries();
     * // [
     * //   {
     * //     "name": "Test Vault",
     * //     "vaultAddress": "0xd7290b064ad5b7246f7396a5e64acec99345e4f3",
     * //     "leader": "0x4dc1cf5a7e6f3dd273b287ba7d93980daedc9ee6",
     * //     "tvl": "500.0",
     * //     "isClosed": false,
     * //     "relationship": {
     * //       "type": "normal"
     * //     },
     * //     "createTimeMillis": 1735582150881
     * //   },
     * //   ...
     * // ]
     * ```
     */
    vaultSummaries(signal?: AbortSignal): Promise<VaultSummary[]> {
        return this.transport.request("info", { type: "vaultSummaries" }, signal);
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
     * const { blockDetails } = await client.blockDetails({ height: 123 });
     * // {
     * //   blockTime: 1234567890,
     * //   hash: "0x...",
     * //   height: 123,
     * //   numTxs: 123,
     * //   proposer: "0x...",
     * //   txs: [...]
     * // }
     * ```
     */
    blockDetails(args: BlockDetailsParameters, signal?: AbortSignal): Promise<BlockDetailsResponse> {
        return this.transport.request("explorer", { type: "blockDetails", ...args }, signal);
    }

    /**
     * Gets the details of a transaction.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns A promise that resolves with the details of the transaction.
     *
     * @example
     * ```ts
     * const { tx } = await client.txDetails({ hash: "0x..." });
     * // {
     * //   action: {...},
     * //   block: 123,
     * //   error: null,
     * //   hash: "0x...",
     * //   time: 1234567890,
     * //   user: "0x..."
     * // }
     * ```
     */
    txDetails(args: TxDetailsParameters, signal?: AbortSignal): Promise<TxDetailsResponse> {
        return this.transport.request("explorer", { type: "txDetails", ...args }, signal);
    }
}
