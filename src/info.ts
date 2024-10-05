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
import { HyperliquidAPIError } from "./error.ts";

/**
 * A client to interact with the Hyperliquid info APIs.
 */
export class InfoClient {
    /** The endpoint of the Hyperliquid info APIs. */
    public readonly endpoint: string; // TESTNET: https://api.hyperliquid-testnet.xyz/info

    /**
     * Initialises a new instance.
     *
     * @example
     * ```ts
     * import * as hyperliquid from "@nktkas/hyperliquid";
     *
     * const client = new hyperliquid.InfoClient();
     * ```
     */
    constructor(
        /** The endpoint of the Hyperliquid info APIs. */
        endpoint: string = "https://api.hyperliquid.xyz/info",
    ) {
        this.endpoint = endpoint;
    }

    /**
     * Request mid coin prices.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
    async candleSnapshot(
        /** The parameters for the request. */
        args: {
            /** Asset symbol (e.g., "ETH"). */
            coin: string;

            /** Time interval (e.g., "15m"). */
            interval: string;

            /** Start time (in ms since epoch). */
            startTime: number;

            /** End time (in ms since epoch). */
            endTime?: number;
        },
    ): Promise<CandleSnapshot[]> {
        return await this.request({ type: "candleSnapshot", req: args });
    }

    /**
     * Request clearinghouse state.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const state = await client.clearinghouseState({ user: "0x..." });
     *
     * // state.marginSummary: { accountValue: "10000.0", totalNtlPos: "5000.0", totalRawUsd: "5000.0", totalMarginUsed: "1000.0" }
     * ```
     */
    async clearinghouseState(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;
        },
    ): Promise<ClearinghouseState> {
        return await this.request({ type: "clearinghouseState", ...args });
    }

    /**
     * Request frontend open orders.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const orders = await client.frontendOpenOrders({ user: "0x1234..." });
     *
     * // orders[0]: { coin: "ETH", side: "B", limitPx: "1800.0", sz: "1.0", oid: 12345, timestamp: 1234567890000, ... }
     * ```
     */
    async frontendOpenOrders(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;
        },
    ): Promise<FrontendOpenOrder[]> {
        return await this.request({ type: "frontendOpenOrders", ...args });
    }

    /**
     * Request funding history.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const funding = await client.fundingHistory({
     *     coin: "ETH",
     *     startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     *
     * // funding[0]: { coin: "ETH", fundingRate: "0.0001", premium: "0.0002", time: 1234567890000 }
     */
    async fundingHistory(
        /** The parameters for the request. */
        args: {
            /** Asset symbol (e.g., "ETH"). */
            coin: string;

            /** Start time (in ms since epoch). */
            startTime: number;

            /** End time (in ms since epoch). */
            endTime?: number;
        },
    ): Promise<FundingHistory[]> {
        return await this.request({ type: "fundingHistory", ...args });
    }

    /**
     * Request L2 order book.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const book = await client.l2Book({ coin: "ETH", nSigFigs: 2 });
     *
     * // book.levels[0]: [{ px: "1800.00", sz: "10.5", n: 5 }, { px: "1799.00", sz: "5.0", n: 3 }, ...]
     * ```
     */
    async l2Book(
        /** The parameters for the request. */
        args: {
            /** Asset symbol (e.g., "ETH"). */
            coin: string;

            /** Number of significant figures for price levels. */
            nSigFigs?: 2 | 3 | 4 | 5;

            /** Mantissa for aggregation (if nSigFigs is 5). */
            mantissa?: 2 | 5;
        },
    ): Promise<L2Book> {
        return await this.request({ type: "l2Book", ...args });
    }

    /**
     * Request trading metadata.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
     * Request metadata and asset contexts.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
     * Request open orders.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const orders = await client.openOrders({ user: "0x1234..." });
     *
     * // orders[0]: { coin: "ETH", side: "B", limitPx: "1800.0", sz: "1.0", oid: 12345, timestamp: 1234567890000, ... }
     * ```
     */
    async openOrders(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;
        },
    ): Promise<OpenOrder[]> {
        return await this.request({ type: "openOrders", ...args });
    }

    /**
     * Request order status.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const status = await client.orderStatus({ user: "0x1234...", oid: 12345 });
     *
     * // status: { status: "order", order: { order: {...}, status: "open", statusTimestamp: 1234567890000 } }
     * ```
     */
    async orderStatus(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;

            /** Order ID or Client Order ID. */
            oid: number | Hex;
        },
    ): Promise<OrderStatusResponse> {
        return await this.request({ type: "orderStatus", ...args });
    }

    /**
     * Request user referral.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const referral = await client.referral({ user: "0x1234..." });
     *
     * // referral: { referredBy: {...}, cumVlm: "100000.0", unclaimedRewards: "500.0", claimedRewards: "300.0", referrerState: {...}, rewardHistory: [...] }
     * ```
     */
    async referral(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;
        },
    ): Promise<Referral> {
        return await this.request({ type: "referral", ...args });
    }

    /**
     * Request spot clearinghouse state.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const state = await client.spotClearinghouseState({ user: "0x1234..." });
     *
     * // state.balances[0]: { coin: "ETH", entryNtl: "1800.0", hold: "0.5", token: 1, total: "10.0" }
     * ```
     */
    async spotClearinghouseState(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;
        },
    ): Promise<SpotClearinghouseState> {
        return await this.request({ type: "spotClearinghouseState", ...args });
    }

    /**
     * Request spot trading metadata.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const subAccounts = await client.subAccounts({ user: "0x1234..." });
     *
     * // subAccounts[0]: { name: "Test", subAccountUser: "0x...", master: "0x...", clearinghouseState: {...}, spotState: {...} }
     * ```
     */
    async subAccounts(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;
        },
    ): Promise<SubAccount[]> {
        return await this.request({ type: "subAccounts", ...args });
    }

    /**
     * Request user fees.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const userFees = await client.userFees({ user: "0x1234..." });
     *
     * // userFees: { dailyUserVlm: [...], feeSchedule: {...}, userCrossRate: "0.00035", userAddRate: "0.0001", ... }
     * ```
     */
    async userFees(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;
        },
    ): Promise<UserFees> {
        return await this.request({ type: "userFees", ...args });
    }

    /**
     * Request spot metadata and asset contexts.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
     * Request user fills.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const fills = await client.userFills({ user: "0x1234..." });
     *
     * // fills[0]: { coin: "ETH", px: "1800.0", sz: "1.0", side: "B", time: 1234567890000, ... }
     * ```
     */
    async userFills(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;
        },
    ): Promise<UserFill[]> {
        return await this.request({ type: "userFills", ...args });
    }

    /**
     * Request user fills by time.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
    async userFillsByTime(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;

            /** Start time (in ms since epoch). */
            startTime: number;

            /** End time (in ms since epoch). */
            endTime?: number;
        },
    ): Promise<UserFill[]> {
        return await this.request({ type: "userFillsByTime", ...args });
    }

    /**
     * Request user funding.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
    async userFunding(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;

            /** Start time (in ms since epoch). */
            startTime: number;

            /** End time (in ms since epoch). */
            endTime?: number;
        },
    ): Promise<UserFunding[]> {
        return await this.request({ type: "userFunding", ...args });
    }

    /**
     * Request user non-funding ledger updates.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
    async userNonFundingLedgerUpdates(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;

            /** Start time (in ms since epoch). */
            startTime: number;

            /** End time (in ms since epoch). */
            endTime?: number;
        },
    ): Promise<UserNonFundingLedgerUpdates[]> {
        return await this.request({ type: "userNonFundingLedgerUpdates", ...args });
    }

    /**
     * Request user rate limits.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const rateLimit = await client.userRateLimit({ user: "0x1234..." });
     *
     * // rateLimit: { cumVlm: "1000000", nRequestsUsed: 50, nRequestsCap: 100 }
     * ```
     */
    async userRateLimit(
        /** The parameters for the request. */
        args: {
            /** User's address. */
            user: Hex;
        },
    ): Promise<UserRateLimit> {
        return await this.request({ type: "userRateLimit", ...args });
    }

    /** Make `allMids` request */
    protected async request<T extends AllMidsRequest>(body: T): Promise<AllMids>;

    /** Make `candleSnapshot` request */
    protected async request<T extends OpenOrdersRequest>(body: T): Promise<OpenOrder[]>;

    /** Make `clearinghouseState` request */
    protected async request<T extends FrontendOpenOrdersRequest>(body: T): Promise<FrontendOpenOrder[]>;

    /** Make `userFills` request */
    protected async request<T extends UserFillsRequest>(body: T): Promise<UserFill[]>;

    /** Make `userFillsByTime` request */
    protected async request<T extends UserFillsByTimeRequest>(body: T): Promise<UserFill[]>;

    /** Make `userRateLimit` request */
    protected async request<T extends UserRateLimitRequest>(body: T): Promise<UserRateLimit>;

    /** Make `orderStatus` request */
    protected async request<T extends OrderStatusRequest>(body: T): Promise<OrderStatusResponse>;

    /** Make `referral` request. */
    protected async request<T extends ReferralRequest>(body: T): Promise<Referral>;

    /** Make `l2Book` request */
    protected async request<T extends L2BookRequest>(body: T): Promise<L2Book>;

    /** Make `candleSnapshot` request */
    protected async request<T extends CandleSnapshotRequest>(body: T): Promise<CandleSnapshot[]>;

    /** Make `meta` request */
    protected async request<T extends MetaRequest>(body: T): Promise<Meta>;

    /** Make `metaAndAssetCtxs` request */
    protected async request<T extends MetaAndAssetCtxsRequest>(body: T): Promise<MetaAndAssetCtxs>;

    /** Make `clearinghouseState` request */
    protected async request<T extends ClearinghouseStateRequest>(body: T): Promise<ClearinghouseState>;

    /** Make `openOrders` request */
    protected async request<T extends UserFundingRequest>(body: T): Promise<UserFunding[]>;

    /** Make `userNonFundingLedgerUpdates` request */
    protected async request<T extends UserNonFundingLedgerUpdatesRequest>(body: T): Promise<UserNonFundingLedgerUpdates[]>;

    /** Make `fundingHistory` request */
    protected async request<T extends FundingHistoryRequest>(body: T): Promise<FundingHistory[]>;

    /** Make `spotMeta` request */
    protected async request<T extends SpotMetaRequest>(body: T): Promise<SpotMeta>;

    /** Make `subAccounts` request */
    protected async request<T extends SubAccountsRequest>(body: T): Promise<SubAccount[]>;

    /** Make `userFees` request */
    protected async request<T extends UserFeesRequest>(body: T): Promise<UserFees>;

    /** Make  `spotMetaAndAssetCtxs` request */
    protected async request<T extends SpotMetaAndAssetCtxsRequest>(body: T): Promise<SpotMetaAndAssetCtxs>;

    /** Make `spotClearinghouseState` request */
    protected async request<T extends SpotClearinghouseStateRequest>(body: T): Promise<SpotClearinghouseState>;

    /** Make a request */
    protected async request(body: unknown): Promise<unknown> {
        const res = await fetch(
            this.endpoint,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            },
        );

        if (!res.ok) {
            throw new HyperliquidAPIError(`Request failed with status ${res.status}: ${await res.text()}`);
        }

        return await res.json();
    }
}
