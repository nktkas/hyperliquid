import type { Hex } from "../../base.ts";

/** L2 order book snapshot. */
export interface Book {
    /** Asset symbol. */
    coin: string;
    /** Timestamp of the snapshot (in ms since epoch). */
    time: number;
    /** Bid and ask levels (index 0 = bids, index 1 = asks). */
    levels: [BookLevel[], BookLevel[]];
}

/** Order book level. */
export interface BookLevel {
    /** Price. */
    px: string;
    /** Total size. */
    sz: string;
    /** Number of individual orders. */
    n: number;
}

/** Trade fill record. */
export interface Fill {
    /** Asset symbol. */
    coin: string;
    /** Price. */
    px: string;
    /** Size. */
    sz: string;
    /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
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
    /** Indicates if the fill was a taker order. */
    crossed: boolean;
    /** Fee charged or rebate received (negative indicates rebate). */
    fee: string;
    /** Unique transaction identifier for a partial fill of an order. */
    tid: number;
    /** Client Order ID. */
    cloid?: Hex;
    /** Liquidation details. */
    liquidation?: FillLiquidation;
    /** Token in which the fee is denominated (e.g., "USDC"). */
    feeToken: string;
}

/** Liquidation details for a trade fill. */
export interface FillLiquidation {
    /** Address of the liquidated user. */
    liquidatedUser: Hex;
    /** Mark price at the time of liquidation. */
    markPx: string;
    /** Liquidation method. */
    method: "market" | "backstop";
}

/** Open order with additional display information. */
export interface FrontendOrder extends Omit<Order, "reduceOnly" | "cloid"> {
    /** Condition for triggering the order. */
    triggerCondition: string;
    /** Indicates if the order is a trigger order. */
    isTrigger: boolean;
    /** Trigger price. */
    triggerPx: string;
    /** Child orders associated with this order. */
    children: FrontendOrder[];
    /** Indicates if the order is a position TP/SL order. */
    isPositionTpsl: boolean;
    /** Indicates whether the order is reduce-only. */
    reduceOnly: boolean;
    /** Order type. */
    orderType: OrderType;
    /** Time-in-force option. */
    tif: TIF | null;
    /** Client Order ID. */
    cloid: Hex | null;
}

/** Open order details. */
export interface Order {
    /** Asset symbol. */
    coin: string;
    /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
    side: "B" | "A";
    /** Limit price. */
    limitPx: string;
    /** Size. */
    sz: string;
    /** Order ID. */
    oid: number;
    /** Timestamp when the order was placed (in ms since epoch). */
    timestamp: number;
    /** Original size at order placement. */
    origSz: string;
    /** Client Order ID. */
    cloid?: Hex;
    /** Indicates if the order is reduce-only. */
    reduceOnly?: true;
}

/** Result of an order status lookup. */
export type OrderLookup =
    | {
        /** Indicates that the order was found. */
        status: "order";
        /** Order details. */
        order: OrderStatus<FrontendOrder>;
    }
    | {
        /** Indicates that the order was not found. */
        status: "unknownOid";
    };

/**
 * Order processing status.
 * - `open`: Order active and waiting to be filled.
 * - `filled`: Order fully executed.
 * - `canceled`: Order canceled by the user.
 * - `triggered`: Order triggered and awaiting execution.
 * - `rejected`: Order rejected by the system.
 * - `marginCanceled`: Order canceled due to insufficient margin.
 * - `vaultWithdrawalCanceled`: Canceled due to a user's withdrawal from vault.
 * - `openInterestCapCanceled`: Canceled due to order being too aggressive when open interest was at cap.
 * - `selfTradeCanceled`: Canceled due to self-trade prevention.
 * - `reduceOnlyCanceled`: Canceled reduced-only order that does not reduce position.
 * - `siblingFilledCanceled`: Canceled due to sibling ordering being filled.
 * - `delistedCanceled`: Canceled due to asset delisting.
 * - `liquidatedCanceled`: Canceled due to liquidation.
 * - `scheduledCancel`: Canceled due to exceeding scheduled cancel deadline (dead man's switch).
 */
export type OrderProcessingStatus =
    | "open"
    | "filled"
    | "canceled"
    | "triggered"
    | "rejected"
    | "marginCanceled"
    | "vaultWithdrawalCanceled"
    | "openInterestCapCanceled"
    | "selfTradeCanceled"
    | "reduceOnlyCanceled"
    | "siblingFilledCanceled"
    | "delistedCanceled"
    | "liquidatedCanceled"
    | "scheduledCancel"
    | "reduceOnlyRejected";

/** Order with current processing status. */
export interface OrderStatus<O extends Order | FrontendOrder> {
    /** Order details. */
    order: O;
    /** Order processing status. */
    status: OrderProcessingStatus;
    /** Timestamp when the status was last updated (in ms since epoch). */
    statusTimestamp: number;
}

/**
 * Order types for market execution.
 * - `Market`: Executes immediately at the market price.
 * - `Limit`: Executes at the specified limit price or better.
 * - `Stop Market`: Activates as a market order when a stop price is reached.
 * - `Stop Limit`: Activates as a limit order when a stop price is reached.
 * - `Take Profit Market`: Executes as a market order when a take profit price is reached.
 * - `Take Profit Limit`: Executes as a limit order when a take profit price is reached.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/order-types
 */
export type OrderType =
    | "Market"
    | "Limit"
    | "Stop Market"
    | "Stop Limit"
    | "Take Profit Market"
    | "Take Profit Limit";

/**
 * Time-in-force options.
 * - `Gtc`: Remains active until filled or canceled.
 * - `Ioc`: Fills immediately or cancels any unfilled portion.
 * - `Alo`: Adds liquidity only.
 * - `FrontendMarket`: Similar to Ioc, used in Hyperliquid UI.
 * - `LiquidationMarket`: Similar to Ioc, used in Hyperliquid UI.
 */
export type TIF = "Gtc" | "Ioc" | "Alo" | "FrontendMarket" | "LiquidationMarket";

/** TWAP history record for a user. */
export interface TwapHistory {
    /** Creation time of the history record (in seconds since epoch). */
    time: number;
    /** State of the TWAP order. */
    state: TwapState;
    /** Current status of the TWAP order. */
    status: TwapStatus;
}

/** TWAP slice fill details. */
export interface TwapSliceFill {
    /** Fill details for the TWAP slice. */
    fill: Omit<Fill, "cloid" | "liquidation">;
    /** ID of the TWAP. */
    twapId: number;
}

/** Current state of a TWAP order. */
export interface TwapState {
    /** Asset symbol. */
    coin: string;
    /** Executed notional value. */
    executedNtl: string;
    /** Executed size. */
    executedSz: string;
    /** Duration in minutes. */
    minutes: number;
    /** Indicates if the TWAP randomizes execution. */
    randomize: boolean;
    /** Indicates if the order is reduce-only. */
    reduceOnly: boolean;
    /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
    side: "B" | "A";
    /** Order size. */
    sz: string;
    /** Start time of the TWAP order (in ms since epoch). */
    timestamp: number;
    /** User address. */
    user: Hex;
}

/**
 * TWAP order status.
 * - `finished`: Fully executed.
 * - `activated`: Active and executing.
 * - `terminated`: Terminated.
 * - `error`: An error occurred.
 */
export type TwapStatus =
    | {
        /** Status of the TWAP order. */
        status: "finished" | "activated" | "terminated";
    }
    | {
        /** Status of the TWAP order. */
        status: "error";
        /** Error message. */
        description: string;
    };
