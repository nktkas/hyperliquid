import type { Hex } from "viem";

// ———————————————Individual Types———————————————

/**
 * Order types define the way orders are executed in the market:
 *
 * - `"Market"`: Executes immediately at the current market price.
 * - `"Limit"`: Executes at the specified limit price or better.
 * - `"Stop Market"`: Becomes a market order once the stop price is reached.
 * - `"Stop Limit"`: Becomes a limit order once the stop price is reached.
 * - `"Scale"`: Places multiple limit orders across a range of prices.
 * - `"TWAP"`: Time-Weighted Average Price order that spreads execution over time.
 */
export type OrderType =
    | "Market"
    | "Limit"
    | "Stop Market"
    | "Stop Limit"
    | "Scale"
    | "TWAP";

/**
 * Time-in-force options specify how long an order remains active:
 *
 * - `"Gtc"` (Good Til Cancelled): Remains active until filled or canceled.
 * - `"Ioc"` (Immediate or Cancel): Fills immediately or cancels any unfilled portion.
 * - `"Alo"` (Add Liquidity Only): Only adds liquidity; does not take liquidity.
 */
export type TIF = "Gtc" | "Ioc" | "Alo";

/**
 * Represents a user's active open order.
 */
export interface OpenOrder {
    /** Symbol for the order (e.g., `"ETH"`). */
    coin: string;

    /**
     * Side of the order:
     *
     * - `"B"`: Bid (Buy) order.
     * - `"A"`: Ask (Sell) order.
     */
    side: "B" | "A";

    /** Limit price of the order. */
    limitPx: string;

    /** Remaining size of the order to be filled. */
    sz: string;

    /** Unique identifier for the order. */
    oid: number;

    /** Timestamp when the order was placed (in milliseconds since epoch). */
    timestamp: number;

    /** Original size of the order when it was placed. */
    origSz: string;

    /** Client Order ID assigned by the user (optional). */
    cloid?: Hex;
}

/**
 * An open order with additional frontend information.
 */
export interface FrontendOpenOrder extends OpenOrder {
    /** Trigger condition (if applicable). */
    triggerCondition: string;

    /** Indicates if the order is a trigger order. */
    isTrigger: boolean;

    /** Trigger price for stop or take-profit orders. */
    triggerPx: string;

    /** Child orders associated with this order (if any). */
    children: unknown[];

    /** Indicates if the order is a position TP/SL order that adjusts with position size. */
    isPositionTpsl: boolean;

    /** Indicates if the order is reduce-only (reduces existing position). */
    reduceOnly: boolean;

    /** Type of the order. */
    orderType: OrderType;

    /** Time-in-force option for the order. */
    tif: TIF | null;
}

/**
 * Represents a user's trade fill.
 */
export interface UserFill {
    /** Symbol of the asset traded (e.g., `"ETH"`). */
    coin: string;

    /** Price at which the trade was executed. */
    px: string;

    /** Size of the trade executed. */
    sz: string;

    /**
     * Side of the order:
     *
     * - `"B"`: Bid (Buy) order.
     * - `"A"`: Ask (Sell) order.
     */
    side: "B" | "A";

    /** Timestamp when the trade occurred (in milliseconds since epoch). */
    time: number;

    /** Position size before the trade execution. */
    startPosition: string;

    /** Direction indicator for frontend display. */
    dir: string;

    /** Realized profit or loss from the trade. */
    closedPnl: string;

    /** L1 transaction hash. */
    hash: Hex;

    /** Unique identifier for the order associated with this fill. */
    oid: number;

    /** Indicates if the fill was a taker order (crossed the spread). */
    crossed: boolean;

    /** Fee charged or rebate received (negative value indicates rebate). */
    fee: string;

    /** Unique identifier for the trade. */
    tid: number;

    /** Client Order ID assigned by the user (if any). */
    cloid?: Hex;

    /** Details of liquidation if the trade was part of one. */
    liquidation?: {
        /** Address of the user who was liquidated. */
        liquidatedUser: Hex;
        /** Mark price at the time of liquidation. */
        markPx: string;
        /** Method of liquidation. */
        method: "market";
    };

    /** Token in which the fee is denominated. */
    feeToken: string;
}

/**
 * Detailed status information for an order.
 */
export interface OrderStatus {
    /** Order details. */
    order: {
        /** Symbol for the order (e.g., `"ETH"`). */
        coin: string;

        /**
         * Side of the order:
         *
         * - `"B"`: Bid (Buy) order.
         * - `"A"`: Ask (Sell) order.
         */
        side: "B" | "A";

        /** Limit price of the order. */
        limitPx: string;

        /** Remaining size of the order to be filled. */
        sz: string;

        /** Unique identifier for the order. */
        oid: number;

        /** Timestamp when the order was placed (in milliseconds since epoch). */
        timestamp: number;

        /** Trigger condition (if applicable). */
        triggerCondition: string;

        /** Indicates if the order is a trigger order. */
        isTrigger: boolean;

        /** Trigger price for stop or take-profit orders. */
        triggerPx: string;

        /** Child orders associated with this order (if any). */
        children: unknown[];

        /** Indicates if the order is a position TP/SL order that adjusts with position size. */
        isPositionTpsl: boolean;

        /** Indicates if the order is reduce-only (reduces existing position). */
        reduceOnly: boolean;

        /** Type of the order. */
        orderType: OrderType;

        /** Original size of the order when it was placed. */
        origSz: string;

        /** Time-in-force option for the order. */
        tif: TIF | null;

        /** Client Order ID assigned by the user (if any). */
        cloid: Hex | null;
    };

    /**
     * Current status of the order:
     *
     * - `"filled"`: Fully executed.
     * - `"open"`: Active and waiting to be filled.
     * - `"canceled"`: Canceled by the user.
     * - `"triggered"`: Triggered and waiting execution (for stop or take-profit orders).
     * - `"rejected"`: Rejected by the system.
     * - `"marginCanceled"`: Canceled due to insufficient margin.
     */
    status:
        | "filled"
        | "open"
        | "canceled"
        | "triggered"
        | "rejected"
        | "marginCanceled";

    /** Timestamp when the status was last updated (in milliseconds since epoch). */
    statusTimestamp: number;
}

/**
 * Represents a single entry in the Level 2 (L2) order book.
 */
export interface L2BookEntry {
    /** Price level. */
    px: string;

    /** Total size (volume) available at this price level. */
    sz: string;

    /** Number of individual orders at this price level. */
    n: number;
}

/**
 * Represents a candlestick data point for charting.
 */
export interface CandleSnapshot {
    /** Opening timestamp of the candle period (in milliseconds since epoch). */
    t: number;

    /** Closing timestamp of the candle period (in milliseconds since epoch). */
    T: number;

    /** Symbol of the asset (e.g., `"ETH"`). */
    s: string;

    /** Interval of the candle (e.g., `"1m"`, `"5m"`, `"1h"`). */
    i: string;

    /** Opening price at the beginning of the period. */
    o: string;

    /** Closing price at the end of the period. */
    c: string;

    /** Highest price during the period. */
    h: string;

    /** Lowest price during the period. */
    l: string;

    /** Total volume traded during the period (in base currency units). */
    v: string;

    /** Number of trades executed during the period. */
    n: number;
}

/**
 * Represents a trading universe with specific parameters.
 */
export interface Universe {
    /** Minimum decimal places for order sizes. */
    szDecimals: number;

    /**
     * Name of the universe.
     *
     * - Max length: 6 characters.
     * - No uniqueness constraints.
     */
    name: string;

    /** Maximum leverage ratio allowed for positions. */
    maxLeverage: number;

    /** Indicates if only isolated margin trading is allowed. */
    onlyIsolated: boolean;
}

/**
 * Represents a user's position in a specific asset.
 */
export interface AssetPosition {
    /** Position type (currently only `"oneWay"` is supported). */
    type: "oneWay";

    /** Detailed position information. */
    position: {
        /** Symbol of the asset (e.g., `"ETH"`). */
        coin: string;

        /** Signed position size (positive for long, negative for short). */
        szi: string;

        /** Leverage information. */
        leverage: {
            /** Leverage type: `"cross"` or `"isolated"`. */
            type: "cross" | "isolated";

            /** Leverage value used. */
            value: number;

            /** TODO */
            rawUsd: string;
        };

        /** Average entry price. */
        entryPx: string;

        /** Current position value in quote currency. */
        positionValue: string;

        /** Unrealized profit or loss. */
        unrealizedPnl: string;

        /** Return on equity (unrealizedPnl / marginUsed). */
        returnOnEquity: string;

        /** Liquidation price. */
        liquidationPx: string | null;

        /** Margin used for the position. */
        marginUsed: string;

        /** Maximum allowed leverage. */
        maxLeverage: number;

        /** Cumulative funding information. */
        cumFunding: {
            /** Total funding paid or received since account opening. */
            allTime: string;

            /** Funding since the position was opened. */
            sinceOpen: string;

            /** Funding since the last position size change. */
            sinceChange: string;
        };
    };
}

/**
 * Represents context information for a perpetual asset.
 */
export interface AssetCtx {
    /** Current funding rate. */
    funding: string;

    /** Total open interest (sum of all positions) for the asset. */
    openInterest: string;

    /** Previous day's closing price. */
    prevDayPx: string;

    /** Daily notional trading volume. */
    dayNtlVlm: string;

    /** Premium (difference between mark and index price). */
    premium: string | null;

    /** Current oracle price. */
    oraclePx: string;

    /** Current mark price (fair value). */
    markPx: string;

    /** Current index price. */
    midPx: string | null;

    /** Impact prices at different levels. */
    impactPxs: string[] | null;
}

/**
 * Represents a user's funding or non-funding ledger update.
 */
export interface UserFunding {
    /** Timestamp of the update (in milliseconds since epoch). */
    time: number;

    /** L1 transaction hash. */
    hash: Hex;

    /** Details of the funding update. */
    delta: {
        /**
         * Type of update.
         *
         * TODO: Check for the existence of other types
         */
        type: "funding";

        /** Symbol of the asset affected (e.g., `"ETH"`). */
        coin: string;

        /** Amount credited or debited (in USDC). */
        usdc: string;

        /** Signed position size at the time (positive for long, negative for short). */
        szi: string;

        /** Funding rate applied. */
        fundingRate: string;

        /** Number of samples used to calculate funding. */
        nSamples: number | null;
    };
}

/**
 * Represents historical funding rate data for an asset.
 */
export interface FundingHistory {
    /** Symbol of the asset (e.g., `"ETH"`). */
    coin: string;

    /** Funding rate at the time. */
    fundingRate: string;

    /** Premium (difference between mark and index price). */
    premium: string;

    /** Timestamp of the funding record (in milliseconds since epoch). */
    time: number;
}

/**
 * Represents a universe for spot trading.
 */
export interface SpotUniverse {
    /** Array of token indices included in this universe. */
    tokens: number[];

    /**
     * Name of the universe.
     *
     * - Max length: 6 characters.
     * - No uniqueness constraints.
     */
    name: string;

    /** Unique identifier (index) for the universe. */
    index: number;

    /** Indicates if this is the primary universe for spot trading. */
    isCanonical: boolean;
}

/**
 * Represents a token available for spot trading.
 */
export interface SpotToken {
    /**
     * Name of the token.
     *
     * - Max length: 6 characters.
     * - No uniqueness constraints.
     */
    name: string;

    /** Minimum decimal places for order sizes. */
    szDecimals: number;

    /** Number of decimals used in the token's smallest unit. */
    weiDecimals: number;

    /** Unique identifier (index) for the token. */
    index: number;

    /** Token ID in hexadecimal format. */
    tokenId: Hex;

    /** Indicates if this token is the primary representation in the system. */
    isCanonical: boolean;

    /** EVM contract address for the token. */
    evmContract: Hex | null;

    /** Full display name of the token. */
    fullName: string | null;
}

/**
 * Represents context information for a spot asset.
 */
export interface SpotAssetCtx {
    /** Previous day's closing price. */
    prevDayPx: string;

    /** Daily notional trading volume. */
    dayNtlVlm: string;

    /** Latest market price. */
    markPx: string;

    /** Current index price. */
    midPx: string | null;

    /** Circulating supply. */
    circulatingSupply: string;

    /** Symbol of the asset (e.g., `"ETH"`). */
    coin: string;
}

/**
 * Represents a user's balance for a specific spot token.
 */
export interface SpotBalance {
    /** Symbol of the token (e.g., `"ETH"`). */
    coin: string;

    /** Entry notional value (initial value when the position was opened). */
    entryNtl: string;

    /** Amount of the token on hold (e.g., reserved in open orders). */
    hold: string;

    /** Unique identifier (index) for the token. */
    token: number;

    /** Total balance of the token (available + on hold). */
    total: string;
}

/**
 * Base structure for all information requests.
 */
export interface BaseInfoRequest {
    /** Type of the request (e.g., `"openOrders"`). */
    type: string;
}

// ———————————————API (Requests)———————————————

/**
 * Request to retrieves mid prices for all actively traded coins.
 *
 * @requestWeight 2
 * @response {@link AllMidsResponse}
 */
export interface AllMidsRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "allMids";
}

/**
 * Request to retrieves a user's active open orders.
 *
 * @requestWeight 20
 * @response Array of {@link OpenOrder}
 */
export interface OpenOrdersRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "openOrders";

    /** User's address. */
    user: Hex;
}

/**
 * Request to retrieves an open order with additional frontend information.
 *
 * @requestWeight 20
 * @response Array of {@link FrontendOpenOrder}
 */
export interface FrontendOpenOrdersRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "frontendOpenOrders";

    /** User's address. */
    user: Hex;
}

/**
 * Request to retrieves a user's trade fills.
 *
 * @requestWeight 20
 * @response Array of {@link UserFill}
 */
export interface UserFillsRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "userFills";

    /** User's address. */
    user: Hex;
}

/**
 * Request to retrieves a user's trade fills within a specific time range.
 *
 * @requestWeight 20
 * @response Array of {@link UserFill}
 */
export interface UserFillsByTimeRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "userFillsByTime";

    /** User's address. */
    user: Hex;

    /** Start time of the range (inclusive, in milliseconds since epoch). */
    startTime: number;

    /** End time of the range (inclusive, in milliseconds since epoch). */
    endTime?: number;
}

/**
 * Request to retrieves a user's rate limits.
 *
 * @requestWeight 20
 * @response {@link UserRateLimitResponse}
 */
export interface UserRateLimitRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "userRateLimit";

    /** User's address. */
    user: Hex;
}

/**
 * Request to retrieves the status of a specific order.
 *
 * @requestWeight 2
 * @response {@link OrderStatusResponse}
 */
export interface OrderStatusRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "orderStatus";

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
 * Request to retrieves a Level 2 (L2) order book snapshot.
 *
 * @requestWeight 2
 * @response {@link L2BookResponse}
 */
export interface L2BookRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "l2Book";

    /** Symbol of the asset to retrieve the order book for (e.g., `"ETH"`). */
    coin: string;

    /** Number of significant figures to aggregate price levels (optional). */
    nSigFigs?: 2 | 3 | 4 | 5;

    /** Mantissa value for level aggregation (allowed only when `nSigFigs` is `5`, optional). */
    // TODO: The documentation says that option 1 is possible, but in this case the request terminates with an error
    mantissa?: 2 | 5;
}

/**
 * Request to retrieves a candlestick data point for charting.
 *
 * @requestWeight 20
 * @response Array of {@link CandleSnapshot}
 */
export interface CandleSnapshotRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "candleSnapshot";

    /** Request parameters. */
    req: {
        /** Symbol of the asset (e.g., `"ETH"`). */
        coin: string;

        /** Time interval for each candle (e.g., `"15m"`). */
        interval: string;

        /** Start time of the data (inclusive, in milliseconds since epoch). */
        startTime: number;

        /** End time of the data (inclusive, in milliseconds since epoch, optional). */
        endTime?: number;
    };
}

/**
 * Request to retrieves metadata for perpetual assets.
 *
 * @requestWeight 20
 * @response {@link MetaResponse}
 */
export interface MetaRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "meta";
}

/**
 * Request to retrieves both metadata and context information for perpetual assets.
 *
 * @requestWeight 20
 * @response {@link MetaAndAssetCtxsResponse}
 */
export interface MetaAndAssetCtxsRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "metaAndAssetCtxs";
}

/**
 * Request to retrieves a user's account summary for perpetual trading.
 *
 * @requestWeight 2
 * @response {@link ClearinghouseStateResponse}
 */
export interface ClearinghouseStateRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "clearinghouseState";

    /** User's address. */
    user: Hex;
}

/**
 * Request to retrieves a user's funding history or non-funding ledger updates.
 *
 * @requestWeight 20
 * @response Array of {@link UserFunding}
 */
export interface UserFundingRequest extends BaseInfoRequest {
    /**
     * Type of the request:
     *
     * - `"userFunding"`: For funding updates.
     * - `"userNonFundingLedgerUpdates"`: For other ledger updates.
     */
    type: "userFunding" | "userNonFundingLedgerUpdates";

    /** User's address. */
    user: Hex;

    /** Start time of the data (inclusive, in milliseconds since epoch). */
    startTime: number;

    /** End time of the data (inclusive, in milliseconds since epoch, optional). */
    endTime?: number;
}

/**
 * Request to retrieves historical funding rate data for an asset.
 *
 * @requestWeight 20
 * @response Array of {@link FundingHistory}
 */
export interface FundingHistoryRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "fundingHistory";

    /** Symbol of the asset (e.g., `"ETH"`). */
    coin: string;

    /** Start time of the data (inclusive, in milliseconds since epoch). */
    startTime: number;

    /** End time of the data (inclusive, in milliseconds since epoch, optional). */
    endTime?: number;
}

/**
 * Request to retrieves metadata for spot trading.
 *
 * @requestWeight 20
 * @response {@link SpotMetaResponse}
 */
export interface SpotMetaRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "spotMeta";
}

/**
 * Request to retrieves both metadata and context information for spot assets.
 *
 * @requestWeight 20
 * @response {@link SpotMetaAndAssetCtxsResponse}
 */
export interface SpotMetaAndAssetCtxsRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "spotMetaAndAssetCtxs";
}

/**
 * Request to retrieves a user's balances for spot tokens.
 *
 * @requestWeight 2
 * @response {@link SpotClearinghouseStateResponse}
 */
export interface SpotClearinghouseStateRequest extends BaseInfoRequest {
    /** Type of the request. */
    type: "spotClearinghouseState";

    /** User's address. */
    user: Hex;
}

// ———————————————API (Responses)———————————————

/**
 * Response containing mid prices for all actively traded coins.
 *
 * Request: {@link AllMidsRequest}
 */
export interface AllMidsResponse {
    /** Object mapping coin symbols to their mid prices. */
    [coin: string]: string;
}

/**
 * Response containing a user's rate limits.
 *
 * Request: {@link UserRateLimitRequest}
 */
export interface UserRateLimitResponse {
    /** Cumulative trading volume by the user. */
    cumVlm: string;

    /** Number of API requests used by the user. */
    nRequestsUsed: number;

    /** Maximum allowed API requests for the user. */
    nRequestsCap: number;
}

/**
 * Response containing the status of a specific order.
 *
 * Request: {@link OrderStatusRequest}
 */
export type OrderStatusResponse =
    /** The order was found and its status is provided. */
    | {
        /** Status indicating the order was found. */
        status: "order";

        /** Detailed status information for the order. */
        order: OrderStatus;
    }
    /** The order was not found. */
    | {
        /** Status indicating the order ID was not recognized. */
        status: "unknownOid";
    };

/**
 * Response containing a Level 2 (L2) order book snapshot.
 *
 * Request: {@link L2BookRequest}
 */
export interface L2BookResponse {
    /** Symbol of the asset (e.g., `"ETH"`). */
    coin: string;

    /** Timestamp when the snapshot was taken (in milliseconds since epoch). */
    time: number;

    /**
     * Array of bid and ask levels:
     *
     * - Index 0: Bids (buy orders).
     * - Index 1: Asks (sell orders).
     */
    levels: L2BookEntry[][];
}

/**
 * Response containing metadata for perpetual assets.
 *
 * Request: {@link MetaRequest}
 */
export interface MetaResponse {
    /** Array of universes available for trading. */
    universe: Universe[];
}

/**
 * Response containing both metadata and context information for perpetual assets.
 *
 * Request: {@link MetaAndAssetCtxsRequest}
 */
export type MetaAndAssetCtxsResponse = [
    /** Metadata response. */
    MetaResponse,

    /** Array of context information for each asset. */
    AssetCtx[],
];

/**
 * Response containing a user's account summary for perpetual trading.
 *
 * Request: {@link ClearinghouseStateRequest}
 */
export interface ClearinghouseStateResponse {
    /** Overall margin information for the user. */
    marginSummary: {
        /** Total account value across all positions. */
        accountValue: string;

        /** Total notional value of all positions. */
        totalNtlPos: string;

        /** Total raw USD value in the account. */
        totalRawUsd: string;

        /** Total margin currently used. */
        totalMarginUsed: string;
    };

    /** Margin information for cross-margin positions. */
    crossMarginSummary: {
        /** Account value specifically for cross-margin positions. */
        accountValue: string;

        /** Total notional value of cross-margin positions. */
        totalNtlPos: string;

        /** Total raw USD value for cross-margin. */
        totalRawUsd: string;

        /** Total margin used for cross-margin positions. */
        totalMarginUsed: string;
    };

    /** Maintenance margin used for cross-margin positions. */
    crossMaintenanceMarginUsed: string;

    /** Amount of funds available for withdrawal. */
    withdrawable: string;

    /** Array of the user's positions in various assets. */
    assetPositions: AssetPosition[];

    /** Timestamp when the data was retrieved (in milliseconds since epoch). */
    time: number;
}

/**
 * Response containing metadata for spot trading.
 *
 * Request: {@link SpotMetaRequest}
 */
export interface SpotMetaResponse {
    /** Array of universes available for spot trading. */
    universe: SpotUniverse[];

    /** Array of tokens available for spot trading. */
    tokens: SpotToken[];
}

/**
 * Response containing both metadata and context information for spot assets.
 *
 * Request: {@link SpotMetaAndAssetCtxsRequest}
 */
export type SpotMetaAndAssetCtxsResponse = [
    /** Metadata response for spot trading. */
    SpotMetaResponse,

    /** Array of context information for each spot asset. */
    SpotAssetCtx[],
];

/**
 * Response containing a user's balances for spot tokens.
 *
 * Request: {@link SpotClearinghouseStateRequest}
 */
export interface SpotClearinghouseStateResponse {
    /** Array of the user's balances in various spot tokens. */
    balances: SpotBalance[];
}
