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
import type { IRESTTransport } from "../transports/base.d.ts";

/** @see {@linkcode InfoClient.candleSnapshot} */
export type CandleSnapshotParameters = CandleSnapshotRequest["req"];

/** @see {@linkcode InfoClient.clearinghouseState} */
export type ClearinghouseStateParameters = Omit<ClearinghouseStateRequest, "type">;

/** @see {@linkcode InfoClient.frontendOpenOrders} */
export type FrontendOpenOrdersParameters = Omit<FrontendOpenOrdersRequest, "type">;

/** @see {@linkcode InfoClient.fundingHistory} */
export type FundingHistoryParameters = Omit<FundingHistoryRequest, "type">;

/** @see {@linkcode InfoClient.l2Book} */
export type L2BookParameters = Omit<L2BookRequest, "type">;

/** @see {@linkcode InfoClient.maxBuilderFee} */
export type MaxBuilderFeeParameters = Omit<MaxBuilderFeeRequest, "type">;

/** @see {@linkcode InfoClient.openOrders} */
export type OpenOrdersParameters = Omit<OpenOrdersRequest, "type">;

/** @see {@linkcode InfoClient.orderStatus} */
export type OrderStatusParameters = Omit<OrderStatusRequest, "type">;

/** @see {@linkcode InfoClient.referral} */
export type ReferralParameters = Omit<ReferralRequest, "type">;

/** @see {@linkcode InfoClient.spotClearinghouseState} */
export type SpotClearinghouseStateParameters = Omit<SpotClearinghouseStateRequest, "type">;

/** @see {@linkcode InfoClient.subAccounts} */
export type SubAccountsParameters = Omit<SubAccountsRequest, "type">;

/** @see {@linkcode InfoClient.userFees} */
export type UserFeesParameters = Omit<UserFeesRequest, "type">;

/** @see {@linkcode InfoClient.userFillsByTime} */
export type UserFillsByTimeParameters = Omit<UserFillsByTimeRequest, "type">;

/** @see {@linkcode InfoClient.userFills} */
export type UserFillsParameters = Omit<UserFillsRequest, "type">;

/** @see {@linkcode InfoClient.userFunding} */
export type UserFundingParameters = Omit<UserFundingRequest, "type">;

/** @see {@linkcode InfoClient.userNonFundingLedgerUpdates} */
export type UserNonFundingLedgerUpdatesParameters = Omit<UserNonFundingLedgerUpdatesRequest, "type">;

/** @see {@linkcode InfoClient.userRateLimit} */
export type UserRateLimitParameters = Omit<UserRateLimitRequest, "type">;

/**
 * The client to interact with the Hyperliquid info APIs.
 *
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint|Hyperliquid GitBook}
 */
export class InfoClient {
    /** The transport used to connect to the Hyperliquid API. */
    transport: IRESTTransport;

    /**
     * Initialises a new instance.
     * @param transport - The transport used to connect to the Hyperliquid API.
     *
     * @example Using the default URL.
     * ```ts
     * import * as hyperliquid from "@nktkas/hyperliquid";
     *
     * const transport = new hyperliquid.HttpTransport(); // or WebSocketTransport
     * const client = new hyperliquid.InfoClient(transport);
     * ```
     */
    constructor(transport: IRESTTransport) {
        this.transport = transport;
    }

    /**
     * Request mid coin prices.
     * @param args - The parameters for the request.
     * @returns Mid coin prices.
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
        return await this.transport.request(
            "info",
            { type: "allMids" } as AllMidsRequest,
        );
    }

    /**
     * Request candlestick snapshots.
     * @param args - The parameters for the request.
     * @returns Array of candlestick data point.
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
        return await this.transport.request(
            "info",
            { type: "candleSnapshot", req: args } as CandleSnapshotRequest,
        );
    }

    /**
     * Request clearinghouse state.
     * @param args - The parameters for the request.
     * @returns Account summary for perpetual trading.
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
        return await this.transport.request(
            "info",
            { type: "clearinghouseState", ...args } as ClearinghouseStateRequest,
        );
    }

    /**
     * Request frontend open orders.
     * @param args - The parameters for the request.
     * @returns Array of open orders with additional frontend information.
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
        return await this.transport.request(
            "info",
            { type: "frontendOpenOrders", ...args } as FrontendOpenOrdersRequest,
        );
    }

    /**
     * Request funding history.
     * @param args - The parameters for the request.
     * @returns Array of historical funding rate data for an asset.
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
        return await this.transport.request(
            "info",
            { type: "fundingHistory", ...args } as FundingHistoryRequest,
        );
    }

    /**
     * Request L2 order book.
     * @param args - The parameters for the request.
     * @returns L2 order book snapshot.
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
        return await this.transport.request(
            "info",
            { type: "l2Book", ...args } as L2BookRequest,
        );
    }

    /**
     * Request builder fee approval.
     * @param args - The parameters for the request.
     * @returns Maximum builder fee approval.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval|Hyperliquid GitBook}
     * @example
     * ```ts
     * const maxBuilderFee = await client.maxBuilderFee({ user: "0x...", builder: "0x..." });
     *
     * // maxBuilderFee: 1 (0.001%)
     * ```
     */
    async maxBuilderFee(args: MaxBuilderFeeParameters): Promise<number> {
        return await this.transport.request(
            "info",
            { type: "maxBuilderFee", ...args } as MaxBuilderFeeRequest,
        );
    }

    /**
     * Request metadata and asset contexts.
     * @param args - The parameters for the request.
     * @returns Metadata and context information for each perpetual asset.
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
        return await this.transport.request(
            "info",
            { type: "metaAndAssetCtxs" } as MetaAndAssetCtxsRequest,
        );
    }

    /**
     * Request trading metadata.
     * @param args - The parameters for the request.
     * @returns Metadata for perpetual assets.
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
        return await this.transport.request(
            "info",
            { type: "meta" } as MetaRequest,
        );
    }

    /**
     * Request open orders.
     * @param args - The parameters for the request.
     * @returns Array of open order.
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
        return await this.transport.request(
            "info",
            { type: "openOrders", ...args } as OpenOrdersRequest,
        );
    }

    /**
     * Request order status.
     * @param args - The parameters for the request.
     * @returns Result of an order status lookup.
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
        return await this.transport.request(
            "info",
            { type: "orderStatus", ...args } as OrderStatusRequest,
        );
    }

    /**
     * Request user referral.
     * @param args - The parameters for the request.
     * @returns Referral information for a user.
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
        return await this.transport.request(
            "info",
            { type: "referral", ...args } as ReferralRequest,
        );
    }

    /**
     * Request spot clearinghouse state.
     * @param args - The parameters for the request.
     * @returns Balances for spot tokens.
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
        return await this.transport.request(
            "info",
            { type: "spotClearinghouseState", ...args } as SpotClearinghouseStateRequest,
        );
    }

    /**
     * Request spot metadata and asset contexts.
     * @param args - The parameters for the request.
     * @returns Metadata and context information for each spot asset.
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
        return await this.transport.request(
            "info",
            { type: "spotMetaAndAssetCtxs" } as SpotMetaAndAssetCtxsRequest,
        );
    }

    /**
     * Request spot trading metadata.
     * @param args - The parameters for the request.
     * @returns Metadata for spot assets.
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
        return await this.transport.request(
            "info",
            { type: "spotMeta" } as SpotMetaRequest,
        );
    }

    /**
     * Request user sub-accounts.
     * @param args - The parameters for the request.
     * @returns Array of user sub-account.
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
        return await this.transport.request(
            "info",
            { type: "subAccounts", ...args } as SubAccountsRequest,
        );
    }

    /**
     * Request user fees.
     * @param args - The parameters for the request.
     * @returns User fees.
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
        return await this.transport.request(
            "info",
            { type: "userFees", ...args } as UserFeesRequest,
        );
    }

    /**
     * Request user fills by time.
     * @param args - The parameters for the request.
     * @returns Array of user's trade fill.
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
        return await this.transport.request(
            "info",
            { type: "userFillsByTime", ...args } as UserFillsByTimeRequest,
        );
    }

    /**
     * Request user fills.
     * @param args - The parameters for the request.
     * @returns Array of user's trade fill.
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
        return await this.transport.request(
            "info",
            { type: "userFills", ...args } as UserFillsRequest,
        );
    }

    /**
     * Request user funding.
     * @param args - The parameters for the request.
     * @returns Array of user's funding ledger update.
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
        return await this.transport.request(
            "info",
            { type: "userFunding", ...args } as UserFundingRequest,
        );
    }

    /**
     * Request user non-funding ledger updates.
     * @param args - The parameters for the request.
     * @returns Array of user's non-funding ledger update.
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
        return await this.transport.request(
            "info",
            { type: "userNonFundingLedgerUpdates", ...args } as UserNonFundingLedgerUpdatesRequest,
        );
    }

    /**
     * Request user rate limits.
     * @param args - The parameters for the request.
     * @returns User's rate limits.
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
        return await this.transport.request(
            "info",
            { type: "userRateLimit", ...args } as UserRateLimitRequest,
        );
    }
}
