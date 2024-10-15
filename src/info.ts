import type {
    AllMids,
    AllMidsRequest,
    CandleSnapshot,
    CandleSnapshotRequest,
    ClearinghouseState,
    ClearinghouseStateRequest,
    FrontendOpenOrder,
    FrontendOpenOrdersRequest,
    FundingHistory,
    FundingHistoryRequest,
    Hex,
    L2Book,
    L2BookRequest,
    MaxBuilderFeeRequest,
    Meta,
    MetaAndAssetCtxs,
    MetaAndAssetCtxsRequest,
    MetaRequest,
    OpenOrder,
    OpenOrdersRequest,
    OrderStatusRequest,
    OrderStatusResponse,
    Referral,
    ReferralRequest,
    SpotClearinghouseState,
    SpotClearinghouseStateRequest,
    SpotMeta,
    SpotMetaAndAssetCtxs,
    SpotMetaAndAssetCtxsRequest,
    SpotMetaRequest,
    SubAccount,
    SubAccountsRequest,
    UserFees,
    UserFeesRequest,
    UserFill,
    UserFillsByTimeRequest,
    UserFillsRequest,
    UserFunding,
    UserFundingRequest,
    UserNonFundingLedgerUpdates,
    UserNonFundingLedgerUpdatesRequest,
    UserRateLimit,
    UserRateLimitRequest,
} from "./types/info.d.ts";
import { HttpError } from "./error.ts";

/** @see {@linkcode InfoClient.candleSnapshot} */
export interface CandleSnapshotParameters {
    /** Asset symbol (e.g., "ETH"). */
    coin: string;

    /** Time interval (e.g., "15m"). */
    interval: string;

    /** Start time (in ms since epoch). */
    startTime: number;

    /** End time (in ms since epoch). */
    endTime?: number;
}

/** @see {@linkcode InfoClient.clearinghouseState} */
export interface ClearinghouseStateParameters {
    /** User's address. */
    user: Hex;
}

/** @see {@linkcode InfoClient.frontendOpenOrders} */
export interface FrontendOpenOrdersParameters {
    /** User's address. */
    user: Hex;
}

/** @see {@linkcode InfoClient.fundingHistory} */
export interface FundingHistoryParameters {
    /** Asset symbol (e.g., "ETH"). */
    coin: string;

    /** Start time (in ms since epoch). */
    startTime: number;

    /** End time (in ms since epoch). */
    endTime?: number;
}

/** @see {@linkcode InfoClient.l2Book} */
export interface L2BookParameters {
    /** Asset symbol (e.g., "ETH"). */
    coin: string;

    /** Number of significant figures for price levels. */
    nSigFigs?: 2 | 3 | 4 | 5;

    /** Mantissa for aggregation (if nSigFigs is 5). */
    mantissa?: 2 | 5;
}

/** @see {@linkcode InfoClient.maxBuilderFee} */
export interface MaxBuilderFeeParameters {
    /** User's address. */
    user: Hex;

    /** Builder address. */
    builder: Hex;
}

/** @see {@linkcode InfoClient.openOrders} */
export interface OpenOrdersParameters {
    /** User's address. */
    user: Hex;
}

/** @see {@linkcode InfoClient.orderStatus} */
export interface OrderStatusParameters {
    /** User's address. */
    user: Hex;

    /** Order ID or Client Order ID. */
    oid: number | Hex;
}

/** @see {@linkcode InfoClient.referral} */
export interface ReferralParameters {
    /** User's address. */
    user: Hex;
}

/** @see {@linkcode InfoClient.spotClearinghouseState} */
export interface SpotClearinghouseStateParameters {
    /** User's address. */
    user: Hex;
}

/** @see {@linkcode InfoClient.subAccounts} */
export interface SubAccountsParameters {
    /** User's address. */
    user: Hex;
}

/** @see {@linkcode InfoClient.userFees} */
export interface UserFeesParameters {
    /** User's address. */
    user: Hex;
}

/** @see {@linkcode InfoClient.userFills} */
export interface UserFillsParameters {
    /** User's address. */
    user: Hex;
}

/** @see {@linkcode InfoClient.userFillsByTime} */
export interface UserFillsByTimeParameters {
    /** User's address. */
    user: Hex;

    /** Start time (in ms since epoch). */
    startTime: number;

    /** End time (in ms since epoch). */
    endTime?: number;
}

/** @see {@linkcode InfoClient.userFunding} */
export interface UserFundingParameters {
    /** User's address. */
    user: Hex;

    /** Start time (in ms since epoch). */
    startTime: number;

    /** End time (in ms since epoch). */
    endTime?: number;
}

/** @see {@linkcode InfoClient.userNonFundingLedgerUpdates} */
export interface UserNonFundingLedgerUpdatesParameters {
    /** User's address. */
    user: Hex;

    /** Start time (in ms since epoch). */
    startTime: number;

    /** End time (in ms since epoch). */
    endTime?: number;
}

/** @see {@linkcode InfoClient.userRateLimit} */
export interface UserRateLimitParameters {
    /** User's address. */
    user: Hex;
}

/** A client to interact with the Hyperliquid info APIs. */
export class InfoClient {
    /** The endpoint of the Hyperliquid info APIs. */
    public readonly endpoint: string; // TESTNET: https://api.hyperliquid-testnet.xyz/info

    /**
     * Initialises a new instance.
     *
     * @param endpoint - The endpoint of the Hyperliquid info APIs.
     *
     * @example
     * ```ts
     * import * as hyperliquid from "@nktkas/hyperliquid";
     *
     * const client = new hyperliquid.InfoClient();
     * ```
     */
    constructor(endpoint: string = "https://api.hyperliquid.xyz/info") {
        this.endpoint = endpoint;
    }

    /**
     * Request mid coin prices.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-actively-traded-coins|Hyperliquid GitBook}
     * @example
     * ```ts
     * const allMids = await client.allMids();
     *
     * // allMids: { "ETH": "1800.5", "BTC": "30000.0", ... }
     * ```
     */
    async allMids(): Promise<AllMids> {
        return await this.request({ type: "allMids" });
    }

    /**
     * Request candlestick snapshots.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot|Hyperliquid GitBook}
     * @example
     * ```ts
     * const candles = await client.candleSnapshot({
     *     coin: "ETH",
     *     interval: "1h",
     *     startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     *
     * // candles[0]: { t: 1234567890000, T: 1234571490000, s: "ETH", i: "1h", o: "1800.0", c: "1805.0", h: "1810.0", l: "1795.0", v: "1000.5", n: 500 }
     * ```
     */
    async candleSnapshot(args: CandleSnapshotParameters): Promise<CandleSnapshot[]> {
        return await this.request({ type: "candleSnapshot", req: args });
    }

    /**
     * Request clearinghouse state.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary|Hyperliquid GitBook}
     * @example
     * ```ts
     * const state = await client.clearinghouseState({ user: "0x..." });
     *
     * // state.marginSummary: { accountValue: "10000.0", totalNtlPos: "5000.0", totalRawUsd: "5000.0", totalMarginUsed: "1000.0" }
     * ```
     */
    async clearinghouseState(args: ClearinghouseStateParameters): Promise<ClearinghouseState> {
        return await this.request({ type: "clearinghouseState", ...args });
    }

    /**
     * Request frontend open orders.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info|Hyperliquid GitBook}
     * @example
     * ```ts
     * const orders = await client.frontendOpenOrders({ user: "0x1234..." });
     *
     * // orders[0]: { coin: "ETH", side: "B", limitPx: "1800.0", sz: "1.0", oid: 12345, timestamp: 1234567890000, ... }
     * ```
     */
    async frontendOpenOrders(args: FrontendOpenOrdersParameters): Promise<FrontendOpenOrder[]> {
        return await this.request({ type: "frontendOpenOrders", ...args });
    }

    /**
     * Request funding history.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates|Hyperliquid GitBook}
     * @example
     * ```ts
     * const funding = await client.fundingHistory({
     *     coin: "ETH",
     *     startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     *
     * // funding[0]: { coin: "ETH", fundingRate: "0.0001", premium: "0.0002", time: 1234567890000 }
     */
    async fundingHistory(args: FundingHistoryParameters): Promise<FundingHistory[]> {
        return await this.request({ type: "fundingHistory", ...args });
    }

    /**
     * Request L2 order book.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot|Hyperliquid GitBook}
     * @example
     * ```ts
     * const book = await client.l2Book({ coin: "ETH", nSigFigs: 2 });
     *
     * // book.levels[0]: [{ px: "1800.00", sz: "10.5", n: 5 }, { px: "1799.00", sz: "5.0", n: 3 }, ...]
     * ```
     */
    async l2Book(args: L2BookParameters): Promise<L2Book> {
        return await this.request({ type: "l2Book", ...args });
    }

    /**
     * Request builder fee approval
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval|Hyperliquid GitBook}
     * @example
     * ```ts
     * const maxBuilderFee = await client.maxBuilderFee({ user: "0x...", builder: "0x..." });
     *
     * // maxBuilderFee: 1
     * ```
     */
    async maxBuilderFee(args: MaxBuilderFeeParameters): Promise<number> {
        return await this.request({ type: "maxBuilderFee", ...args });
    }

    /**
     * Request metadata and asset contexts.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc|Hyperliquid GitBook}
     * @example
     * ```ts
     * const [meta, assetCtxs] = await client.metaAndAssetCtxs();
     *
     * // assetCtxs[0]: { funding: "0.0001", openInterest: "1000000", prevDayPx: "1800.0", ... }
     * ```
     */
    async metaAndAssetCtxs(): Promise<MetaAndAssetCtxs> {
        return await this.request({ type: "metaAndAssetCtxs" });
    }

    /**
     * Request trading metadata.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata|Hyperliquid GitBook}
     * @example
     * ```ts
     * const meta = await client.meta();
     *
     * // meta.universe[0]: { szDecimals: 3, name: "PERP", maxLeverage: 50, onlyIsolated: false }
     * ```
     */
    async meta(): Promise<Meta> {
        return await this.request({ type: "meta" });
    }

    /**
     * Request open orders.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders|Hyperliquid GitBook}
     * @example
     * ```ts
     * const orders = await client.openOrders({ user: "0x1234..." });
     *
     * // orders[0]: { coin: "ETH", side: "B", limitPx: "1800.0", sz: "1.0", oid: 12345, timestamp: 1234567890000, ... }
     * ```
     */
    async openOrders(args: OpenOrdersParameters): Promise<OpenOrder[]> {
        return await this.request({ type: "openOrders", ...args });
    }

    /**
     * Request order status.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid|Hyperliquid GitBook}
     * @example
     * ```ts
     * const status = await client.orderStatus({ user: "0x1234...", oid: 12345 });
     *
     * // status: { status: "order", order: { order: {...}, status: "open", statusTimestamp: 1234567890000 } }
     * ```
     */
    async orderStatus(args: OrderStatusParameters): Promise<OrderStatusResponse> {
        return await this.request({ type: "orderStatus", ...args });
    }

    /**
     * Request user referral.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see null
     * @example
     * ```ts
     * const referral = await client.referral({ user: "0x1234..." });
     *
     * // referral: { referredBy: {...}, cumVlm: "100000.0", unclaimedRewards: "500.0", claimedRewards: "300.0", referrerState: {...}, rewardHistory: [...] }
     * ```
     */
    async referral(args: ReferralParameters): Promise<Referral> {
        return await this.request({ type: "referral", ...args });
    }

    /**
     * Request spot clearinghouse state.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances|Hyperliquid GitBook}
     * @example
     * ```ts
     * const state = await client.spotClearinghouseState({ user: "0x1234..." });
     *
     * // state.balances[0]: { coin: "ETH", entryNtl: "1800.0", hold: "0.5", token: 1, total: "10.0" }
     * ```
     */
    async spotClearinghouseState(args: SpotClearinghouseStateParameters): Promise<SpotClearinghouseState> {
        return await this.request({ type: "spotClearinghouseState", ...args });
    }

    /**
     * Request spot metadata and asset contexts.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts|Hyperliquid GitBook}
     * @example
     * ```ts
     * const [meta, assetCtxs] = await client.spotMetaAndAssetCtxs();
     *
     * // assetCtxs[0]: { prevDayPx: "1800.0", dayNtlVlm: "10000000", markPx: "1805.0", ... }
     * ```
     */
    async spotMetaAndAssetCtxs(): Promise<SpotMetaAndAssetCtxs> {
        return await this.request({ type: "spotMetaAndAssetCtxs" });
    }

    /**
     * Request spot trading metadata.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata|Hyperliquid GitBook}
     * @example
     * ```ts
     * const meta = await client.spotMeta();
     *
     * // meta.tokens[0]: { name: "ETH", szDecimals: 8, weiDecimals: 18, index: 1, tokenId: "0x...", ... }
     * ```
     */
    async spotMeta(): Promise<SpotMeta> {
        return await this.request({ type: "spotMeta" });
    }

    /**
     * Request user sub-accounts.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see null
     * @example
     * ```ts
     * const subAccounts = await client.subAccounts({ user: "0x1234..." });
     *
     * // subAccounts[0]: { name: "Test", subAccountUser: "0x...", master: "0x...", clearinghouseState: {...}, spotState: {...} }
     * ```
     */
    async subAccounts(args: SubAccountsParameters): Promise<SubAccount[]> {
        return await this.request({ type: "subAccounts", ...args });
    }

    /**
     * Request user fees.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see null
     * @example
     * ```ts
     * const userFees = await client.userFees({ user: "0x1234..." });
     *
     * // userFees: { dailyUserVlm: [...], feeSchedule: {...}, userCrossRate: "0.00035", userAddRate: "0.0001", ... }
     * ```
     */
    async userFees(args: UserFeesParameters): Promise<UserFees> {
        return await this.request({ type: "userFees", ...args });
    }

    /**
     * Request user fills.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills|Hyperliquid GitBook}
     * @example
     * ```ts
     * const fills = await client.userFills({ user: "0x1234..." });
     *
     * // fills[0]: { coin: "ETH", px: "1800.0", sz: "1.0", side: "B", time: 1234567890000, ... }
     * ```
     */
    async userFills(args: UserFillsParameters): Promise<UserFill[]> {
        return await this.request({ type: "userFills", ...args });
    }

    /**
     * Request user fills by time.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time|Hyperliquid GitBook}
     * @example
     * ```ts
     * const fills = await client.userFillsByTime({
     *     user: "0x1234...",
     *     startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     *
     * // fills[0]: { coin: "ETH", px: "1800.0", sz: "1.0", side: "B", time: 1234567890000, ... }
     * ```
     */
    async userFillsByTime(args: UserFillsByTimeParameters): Promise<UserFill[]> {
        return await this.request({ type: "userFillsByTime", ...args });
    }

    /**
     * Request user funding.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates|Hyperliquid GitBook}
     * @example
     * ```ts
     * const funding = await client.userFunding({
     *     user: "0x1234...",
     *     startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     *
     * // funding[0]: { time: 1234567890000, hash: "0x...", delta: { type: "funding", coin: "ETH", usdc: "1.5", ... } }
     * ```
     */
    async userFunding(args: UserFundingParameters): Promise<UserFunding[]> {
        return await this.request({ type: "userFunding", ...args });
    }

    /**
     * Request user non-funding ledger updates.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates|Hyperliquid GitBook}
     * @example
     * ```ts
     * const funding = await client.userNonFundingLedgerUpdates({
     *     user: "0x1234...",
     *     startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     *
     * // funding[0]: { time: 1234567890000, hash: "0x...", delta: { type: "deposit", usdc: "5" } }
     * ```
     */
    async userNonFundingLedgerUpdates(args: UserNonFundingLedgerUpdatesParameters): Promise<UserNonFundingLedgerUpdates[]> {
        return await this.request({ type: "userNonFundingLedgerUpdates", ...args });
    }

    /**
     * Request user rate limits.
     *
     * @throws {HttpError} if HTTP response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits|Hyperliquid GitBook}
     * @example
     * ```ts
     * const rateLimit = await client.userRateLimit({ user: "0x1234..." });
     *
     * // rateLimit: { cumVlm: "1000000", nRequestsUsed: 50, nRequestsCap: 100 }
     * ```
     */
    async userRateLimit(args: UserRateLimitParameters): Promise<UserRateLimit> {
        return await this.request({ type: "userRateLimit", ...args });
    }

    protected async request(body: AllMidsRequest): Promise<AllMids>;
    protected async request(body: CandleSnapshotRequest): Promise<CandleSnapshot[]>;
    protected async request(body: ClearinghouseStateRequest): Promise<ClearinghouseState>;
    protected async request(body: FrontendOpenOrdersRequest): Promise<FrontendOpenOrder[]>;
    protected async request(body: FundingHistoryRequest): Promise<FundingHistory[]>;
    protected async request(body: L2BookRequest): Promise<L2Book>;
    protected async request(body: MaxBuilderFeeRequest): Promise<number>;
    protected async request(body: MetaAndAssetCtxsRequest): Promise<MetaAndAssetCtxs>;
    protected async request(body: MetaRequest): Promise<Meta>;
    protected async request(body: OpenOrdersRequest): Promise<OpenOrder[]>;
    protected async request(body: OrderStatusRequest): Promise<OrderStatusResponse>;
    protected async request(body: ReferralRequest): Promise<Referral>;
    protected async request(body: SpotClearinghouseStateRequest): Promise<SpotClearinghouseState>;
    protected async request(body: SpotMetaAndAssetCtxsRequest): Promise<SpotMetaAndAssetCtxs>;
    protected async request(body: SpotMetaRequest): Promise<SpotMeta>;
    protected async request(body: SubAccountsRequest): Promise<SubAccount[]>;
    protected async request(body: UserFeesRequest): Promise<UserFees>;
    protected async request(body: UserFillsByTimeRequest): Promise<UserFill[]>;
    protected async request(body: UserFillsRequest): Promise<UserFill[]>;
    protected async request(body: UserFundingRequest): Promise<UserFunding[]>;
    protected async request(body: UserNonFundingLedgerUpdatesRequest): Promise<UserNonFundingLedgerUpdates[]>;
    protected async request(body: UserRateLimitRequest): Promise<UserRateLimit>;
    protected async request(body: unknown): Promise<unknown> {
        const response = await fetch(
            this.endpoint,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            },
        );

        if (!response.ok) {
            throw new HttpError(response);
        }

        return await response.json();
    }
}
