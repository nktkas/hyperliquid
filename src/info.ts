import type { Hex } from "viem";
import type {
    AllMidsRequest,
    AllMidsResponse,
    CandleSnapshot,
    CandleSnapshotRequest,
    ClearinghouseStateRequest,
    ClearinghouseStateResponse,
    FrontendOpenOrder,
    FrontendOpenOrdersRequest,
    FundingHistory,
    FundingHistoryRequest,
    L2BookRequest,
    L2BookResponse,
    MetaAndAssetCtxsRequest,
    MetaAndAssetCtxsResponse,
    MetaRequest,
    MetaResponse,
    OpenOrder,
    OpenOrdersRequest,
    OrderStatusRequest,
    OrderStatusResponse,
    SpotClearinghouseStateRequest,
    SpotClearinghouseStateResponse,
    SpotMetaAndAssetCtxsRequest,
    SpotMetaAndAssetCtxsResponse,
    SpotMetaRequest,
    SpotMetaResponse,
    UserFill,
    UserFillsByTimeRequest,
    UserFillsRequest,
    UserFunding,
    UserFundingRequest,
    UserRateLimitRequest,
    UserRateLimitResponse,
} from "./types/info.d.ts";

/**
 * Parameters for the {@link HyperliquidInfoClient.candleSnapshot candleSnapshot} method.
 */
export interface CandleSnapshotParameters {
    /** Symbol of the asset (e.g., `"ETH"`). */
    coin: string;

    /** Time interval for each candle (e.g., `"15m"`). */
    interval: string;

    /** Start time of the data (inclusive, in milliseconds since epoch). */
    startTime: number;

    /** End time of the data (inclusive, in milliseconds since epoch, optional). */
    endTime?: number;
}

/**
 * Parameters for the {@link HyperliquidInfoClient.clearinghouseState clearinghouseState} method.
 */
export interface ClearinghouseStateParameters {
    /** User's address. */
    user: Hex;
}

/**
 * Parameters for the {@link HyperliquidInfoClient.frontendOpenOrders frontendOpenOrders} method.
 */
export interface FrontendOpenOrdersParameters {
    /** User's address. */
    user: Hex;
}

/**
 * Parameters for the {@link HyperliquidInfoClient.fundingHistory fundingHistory} method.
 */
export interface FundingHistoryParameters {
    /** Symbol of the asset (e.g., `"ETH"`). */
    coin: string;

    /** Start time of the data (inclusive, in milliseconds since epoch). */
    startTime: number;

    /** End time of the data (inclusive, in milliseconds since epoch, optional). */
    endTime?: number;
}

/**
 * Parameters for the {@link HyperliquidInfoClient.l2Book l2Book} method.
 */
export interface L2BookParameters {
    /** Symbol of the asset to retrieve the order book for (e.g., `"ETH"`). */
    coin: string;

    /** Number of significant figures to aggregate price levels (optional). */
    nSigFigs?: 2 | 3 | 4 | 5;

    /** Mantissa value for level aggregation (allowed only when `nSigFigs` is `5`, optional). */
    // TODO: The documentation says that option 1 is possible, but in this case the request terminates with an error
    mantissa?: 2 | 5;
}

/**
 * Parameters for the {@link HyperliquidInfoClient.openOrders openOrders} method.
 */
export interface OpenOrdersParameters {
    /** User's address. */
    user: Hex;
}

/**
 * Parameters for the {@link HyperliquidInfoClient.orderStatus orderStatus} method.
 */
export interface OrderStatusParameters {
    /** User's address. */
    user: Hex;

    /**
     * Order ID to query.
     *
     * - If a `number`, it's an Order ID (`oid`).
     * - If a `Hex` string, it's a Client Order ID (`cloid`).
     */
    oid: number | Hex;
}

/**
 * Parameters for the {@link HyperliquidInfoClient.spotClearinghouseState spotClearinghouseState} method.
 */
export interface SpotClearinghouseStateParameters {
    /** User's address. */
    user: Hex;
}

/**
 * Parameters for the {@link HyperliquidInfoClient.userFills userFills} method.
 */
export interface UserFillsParameters {
    /** User's address. */
    user: Hex;
}

/**
 * Parameters for the {@link HyperliquidInfoClient.userFillsByTime userFillsByTime} method.
 */
export interface UserFillsByTimeParameters {
    /** User's address. */
    user: Hex;

    /** Start time of the range (inclusive, in milliseconds since epoch). */
    startTime: number;

    /** End time of the range (inclusive, in milliseconds since epoch). */
    endTime?: number;
}

/**
 * Parameters for the {@link HyperliquidInfoClient.userFunding userFunding} method.
 */
export interface UserFundingParameters {
    /** User's address. */
    user: Hex;

    /** Start time of the data (inclusive, in milliseconds since epoch). */
    startTime: number;

    /** End time of the data (inclusive, in milliseconds since epoch, optional). */
    endTime?: number;
}

/**
 * Parameters for the {@link HyperliquidInfoClient.userRateLimit userRateLimit} method.
 */
export interface UserRateLimitParameters {
    /** User's address. */
    user: Hex;
}

/**
 * A client to interact with the Hyperliquid info APIs.
 */
export class HyperliquidInfoClient {
    /** The endpoint of the Hyperliquid info APIs. */
    public readonly endpoint: string; // TESTNET: https://api.hyperliquid-testnet.xyz/info

    /**
     * Initializes a new instance of the HyperliquidInfoClient class.
     *
     * @param endpoint - The endpoint of the Hyperliquid info APIs.
     */
    constructor(endpoint: string = "https://api.hyperliquid.xyz/info") {
        this.endpoint = endpoint;
    }

    /**
     * Retrieves mid prices for all actively traded coins.
     *
     * @requestWeight 2
     */
    async allMids(): Promise<AllMidsResponse> {
        return await this.request({ type: "allMids" });
    }

    /**
     * Retrieves a candlestick data point for charting.
     *
     * @requestWeight 20
     */
    async candleSnapshot(args: CandleSnapshotParameters): Promise<CandleSnapshot[]> {
        return await this.request({ type: "candleSnapshot", req: args });
    }

    /**
     * Retrieves a user's account summary for perpetual trading.
     *
     * @requestWeight 2
     */
    async clearinghouseState(args: ClearinghouseStateParameters): Promise<ClearinghouseStateResponse> {
        return await this.request({ type: "clearinghouseState", ...args });
    }

    /**
     * Retrieves an open order with additional frontend information.
     *
     * @requestWeight 20
     */
    async frontendOpenOrders(args: FrontendOpenOrdersParameters): Promise<FrontendOpenOrder[]> {
        return await this.request({ type: "frontendOpenOrders", ...args });
    }

    /**
     * Retrieves historical funding rate data for an asset.
     *
     * @requestWeight 20
     */
    async fundingHistory(args: FundingHistoryParameters): Promise<FundingHistory[]> {
        return await this.request({ type: "fundingHistory", ...args });
    }

    /**
     * Retrieves a Level 2 (L2) order book snapshot.
     *
     * @requestWeight 2
     */
    async l2Book(args: L2BookParameters): Promise<L2BookResponse> {
        return await this.request({ type: "l2Book", ...args });
    }

    /**
     * Retrieves metadata for perpetual assets.
     *
     * @requestWeight 20
     */
    async meta(): Promise<MetaResponse> {
        return await this.request({ type: "meta" });
    }

    /**
     * Retrieves both metadata and context information for perpetual assets.
     *
     * @requestWeight 20
     */
    async metaAndAssetCtxs(): Promise<MetaAndAssetCtxsResponse> {
        return await this.request({ type: "metaAndAssetCtxs" });
    }

    /**
     * Retrieves a user's active open orders.
     *
     * @requestWeight 20
     */
    async openOrders(args: OpenOrdersParameters): Promise<OpenOrder[]> {
        return await this.request({ type: "openOrders", ...args });
    }

    /**
     * Retrieves the status of a specific order.
     *
     * @requestWeight 2
     */
    async orderStatus(args: OrderStatusParameters): Promise<OrderStatusResponse> {
        return await this.request({ type: "orderStatus", ...args });
    }

    /**
     * Retrieves a user's balances for spot tokens.
     *
     * @requestWeight 2
     */
    async spotClearinghouseState(args: SpotClearinghouseStateParameters): Promise<SpotClearinghouseStateResponse> {
        return await this.request({ type: "spotClearinghouseState", ...args });
    }

    /**
     * Retrieves metadata for spot trading.
     *
     * @requestWeight 20
     */
    async spotMeta(): Promise<SpotMetaResponse> {
        return await this.request({ type: "spotMeta" });
    }

    /**
     * Retrieves both metadata and context information for spot assets.
     *
     * @requestWeight 20
     */
    async spotMetaAndAssetCtxs(): Promise<SpotMetaAndAssetCtxsResponse> {
        return await this.request({ type: "spotMetaAndAssetCtxs" });
    }

    /**
     * Retrieves a user's trade fills.
     *
     * @requestWeight 20
     */
    async userFills(args: UserFillsParameters): Promise<UserFill[]> {
        return await this.request({ type: "userFills", ...args });
    }

    /**
     * Retrieves a user's trade fills within a specific time range.
     *
     * @requestWeight 20
     */
    async userFillsByTime(args: UserFillsByTimeParameters): Promise<UserFill[]> {
        return await this.request({ type: "userFillsByTime", ...args });
    }

    /**
     * Retrieves a user's funding history or non-funding ledger updates.
     *
     * @requestWeight 20
     */
    async userFunding(args: UserFundingParameters): Promise<UserFunding[]> {
        return await this.request({ type: "userFunding", ...args });
    }

    /**
     * Retrieves a user's rate limits.
     *
     * @requestWeight 20
     */
    async userRateLimit(args: UserRateLimitParameters): Promise<UserRateLimitResponse> {
        return await this.request({ type: "userRateLimit", ...args });
    }

    protected async request<T extends AllMidsRequest>(body: T): Promise<AllMidsResponse>;
    protected async request<T extends OpenOrdersRequest>(body: T): Promise<OpenOrder[]>;
    protected async request<T extends FrontendOpenOrdersRequest>(body: T): Promise<FrontendOpenOrder[]>;
    protected async request<T extends UserFillsRequest>(body: T): Promise<UserFill[]>;
    protected async request<T extends UserFillsByTimeRequest>(body: T): Promise<UserFill[]>;
    protected async request<T extends UserRateLimitRequest>(body: T): Promise<UserRateLimitResponse>;
    protected async request<T extends OrderStatusRequest>(body: T): Promise<OrderStatusResponse>;
    protected async request<T extends L2BookRequest>(body: T): Promise<L2BookResponse>;
    protected async request<T extends CandleSnapshotRequest>(body: T): Promise<CandleSnapshot[]>;
    protected async request<T extends MetaRequest>(body: T): Promise<MetaResponse>;
    protected async request<T extends MetaAndAssetCtxsRequest>(body: T): Promise<MetaAndAssetCtxsResponse>;
    protected async request<T extends ClearinghouseStateRequest>(body: T): Promise<ClearinghouseStateResponse>;
    protected async request<T extends UserFundingRequest>(body: T): Promise<UserFunding[]>;
    protected async request<T extends FundingHistoryRequest>(body: T): Promise<FundingHistory[]>;
    protected async request<T extends SpotMetaRequest>(body: T): Promise<SpotMetaResponse>;
    protected async request<T extends SpotMetaAndAssetCtxsRequest>(body: T): Promise<SpotMetaAndAssetCtxsResponse>;
    protected async request<T extends SpotClearinghouseStateRequest>(body: T): Promise<SpotClearinghouseStateResponse>;
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
            throw new Error(`Request failed with status ${res.status}: ${await res.text()}`);
        }

        return await res.json();
    }
}
