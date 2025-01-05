import type { Hex } from "../common.d.ts";

/**
 * Order type for market execution:
 * - `"Market"`: An order that executes immediately at the current market price.
 * - `"Limit"`: An order that executes at the selected limit price or better.
 * - `"Stop Market"`: A market order that is activated when the price reaches the selected stop price.
 * - `"Stop Limit"`: A limit order that is activated when the price reaches the selected stop price.
 *
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/trading/order-types|Hyperliquid GitBook}
 */
export type OrderType =
    | "Market"
    | "Limit"
    | "Stop Market"
    | "Stop Limit";

/**
 * Time-in-force options:
 * - `"Gtc"` (Good Til Cancelled): Remains active until filled or canceled.
 * - `"Ioc"` (Immediate or Cancel): Fills immediately or cancels any unfilled portion.
 * - `"Alo"` (Add Liquidity Only): Only adds liquidity; does not take liquidity.
 * - `"FrontendMarket"`: Equivalent `Ioc`. Used in Hyperliquid UI.
 * - `"LiquidationMarket"`: Equivalent `Ioc`. Used in Hyperliquid UI.
 */
export type TIF =
    | "Gtc"
    | "Ioc"
    | "Alo"
    | "FrontendMarket"
    | "LiquidationMarket";

/**
 * Order processing status:
 * - `"filled"`: Order fully executed.
 * - `"open"`: Order is active and waiting to be filled.
 * - `"canceled"`: Order canceled by the user.
 * - `"triggered"`: Order triggered and awaiting execution.
 * - `"rejected"`: Order rejected by the system.
 * - `"marginCanceled"`: Order canceled due to insufficient margin.
 */
export type OrderProcessingStatus =
    | "filled"
    | "open"
    | "canceled"
    | "triggered"
    | "rejected"
    | "marginCanceled";

/** Open order with additional frontend information. */
export interface FrontendOpenOrder extends Omit<OpenOrder, "cloid"> {
    /** Condition for triggering. */
    triggerCondition: string;

    /** Is the order a trigger order? */
    isTrigger: boolean;

    /** Trigger price (if {@link isTrigger} is true). */
    triggerPx: string;

    /** Child orders associated with this order. */
    children: FrontendOpenOrder[];

    /** Is the order a position TP/SL order (which changes depending on the position size)? */
    isPositionTpsl: boolean;

    /** Is reduce-only? */
    reduceOnly: boolean;

    /** Type of the order. */
    orderType: OrderType;

    /** Time-in-force. */
    tif: TIF | null;

    /** Client Order ID. */
    cloid: Hex | null;
}

/** Open order. */
export interface OpenOrder {
    /** Asset symbol. */
    coin: string;

    /** Side of the order ("B" = Bid = Buy, "A" = Ask = Sell). */
    side: "B" | "A";

    /** Limit price. */
    limitPx: string;

    /** Size. */
    sz: string;

    /** Order ID. */
    oid: number;

    /** Timestamp when the order was placed (in ms since epoch). */
    timestamp: number;

    /** Original size when placed. */
    origSz: string;

    /** Client Order ID. */
    cloid?: Hex;
}

/** Order status with additional frontend information and current status. */
export interface OrderStatus {
    /** Order details. */
    order: FrontendOpenOrder;

    /** Order processing status. */
    status: OrderProcessingStatus;

    /** Timestamp when the status was last updated (in ms since epoch). */
    statusTimestamp: number;
}

/** Result of an order status lookup. */
export type OrderStatusResult =
    | {
        /** Indicates that the order was found. */
        status: "order";

        /** Order details. */
        order: OrderStatus;
    }
    | {
        /** Indicates that the order was not found. */
        status: "unknownOid";
    };

/** User's trade fill. */
export interface UserFill {
    /** Asset symbol. */
    coin: string;

    /** Price. */
    px: string;

    /** Size. */
    sz: string;

    /** Side of the order ("B" = Bid = Buy, "A" = Ask = Sell). */
    side: "B" | "A";

    /** Timestamp when the trade occurred (in ms since epoch). */
    time: number;

    /** Start position size. */
    startPosition: string;

    /** Direction indicator for frontend display. */
    dir: string;

    /** Realized PnL. */
    closedPnl: string;

    /** L1 transaction hash. */
    hash: Hex;

    /** Order ID. */
    oid: number;

    /** Whether the fill was a taker order. */
    crossed: boolean;

    /** Fee charged or rebate received (negative value indicates rebate). */
    fee: string;

    /** Unique identifier of the transaction for the specified amount, which was a partial filling of one order (oid). */
    tid: number;

    /** Client Order ID. */
    cloid?: Hex;

    /** Liquidation details. */
    liquidation?: {
        /** Address of the user who was liquidated. */
        liquidatedUser: Hex;

        /** Mark price at the time of liquidation. */
        markPx: string;

        /** Method of liquidation. */
        method: "market" | "backstop";
    };

    /** Token in which the fee is denominated (e.g., "USDC"). */
    feeToken: string;
}

/** L2 order book snapshot. */
export interface L2Book {
    /** Asset symbol. */
    coin: string;

    /** Timestamp when the snapshot was taken (in ms since epoch). */
    time: number;

    /** Bid and ask levels (index 0 = bids, index 1 = asks). */
    levels: [L2BookEntry[], L2BookEntry[]];
}

/** Single entry in {@link L2Book.levels}. */
export interface L2BookEntry {
    /** Price. */
    px: string;

    /** Total size. */
    sz: string;

    /** Number of individual orders. */
    n: number;
}

/** The twap history of a user. */
export interface TwapHistory {
    /** The creation time of this history record (in seconds since epoch). */
    time: number;

    /** The state of the twap. */
    state: {
        /** The asset symbol. */
        coin: string;

        /** The executed notional. */
        executedNtl: string;

        /** The executed size. */
        executedSz: string;

        /** The number of minutes. */
        minutes: number;

        /** Whether to randomize the twap. */
        randomize: boolean;

        /** Whether to reduce only. */
        reduceOnly: boolean;

        /** The side of the order ("B" = Bid = Buy, "A" = Ask = Sell). */
        side: "B" | "A";

        /** The size of the order. */
        sz: string;

        /** The start time of the TWAP order (in milliseconds since epoch). */
        timestamp: number;

        /** The user's address. */
        user: Hex;
    };

    /** The status of the twap. */
    status:
        | {
            /** The status of the twap. */
            status: "finished" | "activated" | "terminated";
        }
        | {
            /** The status of the twap. */
            status: "error";

            /** The error message. */
            description: string;
        };
}

/** The twap slice fill of a user. */
export interface UserTwapSliceFill {
    /** The fill of the twap slice. */
    fill: Omit<UserFill, "cloid" | "liquidation">;

    /** The id of the twap. */
    twapId: number;
}
