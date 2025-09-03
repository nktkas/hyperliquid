import * as v from "valibot";
import { Hex, SignedDecimal, UnsignedDecimal } from "../_base.ts";

/** Order book level. */
export const BookLevel = v.pipe(
    v.strictObject({
        /** Price. */
        px: v.pipe(
            UnsignedDecimal,
            v.description("Price."),
        ),
        /** Total size. */
        sz: v.pipe(
            UnsignedDecimal,
            v.description("Total size."),
        ),
        /** Number of individual orders. */
        n: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Number of individual orders."),
        ),
    }),
    v.description("Order book level."),
);
export type BookLevel = v.InferOutput<typeof BookLevel>;

/** L2 order book snapshot. */
export const Book = v.pipe(
    v.strictObject({
        /** Asset symbol. */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
        ),
        /** Timestamp of the snapshot (in ms since epoch). */
        time: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Timestamp of the snapshot (in ms since epoch)."),
        ),
        /** Bid and ask levels (index 0 = bids, index 1 = asks). */
        levels: v.pipe(
            v.strictTuple([v.array(BookLevel), v.array(BookLevel)]),
            v.description("Bid and ask levels (index 0 = bids, index 1 = asks)."),
        ),
    }),
    v.description("L2 order book snapshot."),
);
export type Book = v.InferOutput<typeof Book>;

/** Liquidation details for a trade fill. */
export const FillLiquidation = v.pipe(
    v.strictObject({
        /** Address of the liquidated user. */
        liquidatedUser: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Address of the liquidated user."),
        ),
        /** Mark price at the time of liquidation. */
        markPx: v.pipe(
            UnsignedDecimal,
            v.description("Mark price at the time of liquidation."),
        ),
        /** Liquidation method. */
        method: v.pipe(
            v.union([v.literal("market"), v.literal("backstop")]),
            v.description("Liquidation method."),
        ),
    }),
    v.description("Liquidation details for a trade fill."),
);
export type FillLiquidation = v.InferOutput<typeof FillLiquidation>;

/** Trade fill record. */
export const Fill = v.pipe(
    v.strictObject({
        /** Asset symbol. */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
        ),
        /** Price. */
        px: v.pipe(
            UnsignedDecimal,
            v.description("Price."),
        ),
        /** Size. */
        sz: v.pipe(
            UnsignedDecimal,
            v.description("Size."),
        ),
        /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
        side: v.pipe(
            v.union([v.literal("B"), v.literal("A")]),
            v.description('Order side ("B" = Bid/Buy, "A" = Ask/Sell).'),
        ),
        /** Timestamp when the trade occurred (in ms since epoch). */
        time: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Timestamp when the trade occurred (in ms since epoch)."),
        ),
        /** Start position size. */
        startPosition: v.pipe(
            SignedDecimal,
            v.description("Start position size."),
        ),
        /** Direction indicator for frontend display. */
        dir: v.pipe(
            v.string(),
            v.description("Direction indicator for frontend display."),
        ),
        /** Realized PnL. */
        closedPnl: v.pipe(
            SignedDecimal,
            v.description("Realized PnL."),
        ),
        /** L1 transaction hash. */
        hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("L1 transaction hash."),
        ),
        /** Order ID. */
        oid: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Order ID."),
        ),
        /** Indicates if the fill was a taker order. */
        crossed: v.pipe(
            v.boolean(),
            v.description("Indicates if the fill was a taker order."),
        ),
        /** Fee charged or rebate received (negative indicates rebate). */
        fee: v.pipe(
            SignedDecimal,
            v.description("Fee charged or rebate received (negative indicates rebate)."),
        ),
        /** Unique transaction identifier for a partial fill of an order. */
        tid: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Unique transaction identifier for a partial fill of an order."),
        ),
        /** Client Order ID. */
        cloid: v.pipe(
            v.optional(v.pipe(Hex, v.length(34))),
            v.description("Client Order ID."),
        ),
        /** Liquidation details. */
        liquidation: v.pipe(
            v.optional(FillLiquidation),
            v.description("Liquidation details."),
        ),
        /** Token in which the fee is denominated (e.g., "USDC"). */
        feeToken: v.pipe(
            v.string(),
            v.description('Token in which the fee is denominated (e.g., "USDC").'),
        ),
        /** ID of the TWAP. */
        twapId: v.pipe(
            v.union([v.pipe(v.number(), v.safeInteger(), v.minValue(0)), v.null()]),
            v.description("ID of the TWAP."),
        ),
    }),
    v.description("Trade fill record."),
);
export type Fill = v.InferOutput<typeof Fill>;

/** Open order details. */
export const Order = v.pipe(
    v.strictObject({
        /** Asset symbol. */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
        ),
        /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
        side: v.pipe(
            v.union([v.literal("B"), v.literal("A")]),
            v.description('Order side ("B" = Bid/Buy, "A" = Ask/Sell).'),
        ),
        /** Limit price. */
        limitPx: v.pipe(
            UnsignedDecimal,
            v.description("Limit price."),
        ),
        /** Size. */
        sz: v.pipe(
            UnsignedDecimal,
            v.description("Size."),
        ),
        /** Order ID. */
        oid: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Order ID."),
        ),
        /** Timestamp when the order was placed (in ms since epoch). */
        timestamp: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Timestamp when the order was placed (in ms since epoch)."),
        ),
        /** Original size at order placement. */
        origSz: v.pipe(
            UnsignedDecimal,
            v.description("Original size at order placement."),
        ),
        /** Client Order ID. */
        cloid: v.pipe(
            v.optional(v.pipe(Hex, v.length(34))),
            v.description("Client Order ID."),
        ),
        /** Indicates if the order is reduce-only. */
        reduceOnly: v.pipe(
            v.optional(v.literal(true)),
            v.description("Indicates if the order is reduce-only."),
        ),
    }),
    v.description("Open order details."),
);
export type Order = v.InferOutput<typeof Order>;

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
export const OrderType = v.pipe(
    v.union([
        v.literal("Market"),
        v.literal("Limit"),
        v.literal("Stop Market"),
        v.literal("Stop Limit"),
        v.literal("Take Profit Market"),
        v.literal("Take Profit Limit"),
    ]),
    v.description(
        "Order types for market execution." +
            "\n- `Market`: Executes immediately at the market price. " +
            "\n- `Limit`: Executes at the specified limit price or better. " +
            "\n- `Stop Market`: Activates as a market order when a stop price is reached. " +
            "\n- `Stop Limit`: Activates as a limit order when a stop price is reached. " +
            "\n- `Take Profit Market`: Executes as a market order when a take profit price is reached. " +
            "\n- `Take Profit Limit`: Executes as a limit order when a take profit price is reached. ",
    ),
);
export type OrderType = v.InferOutput<typeof OrderType>;

/**
 * Time-in-force options.
 * - `Gtc`: Remains active until filled or canceled.
 * - `Ioc`: Fills immediately or cancels any unfilled portion.
 * - `Alo`: Adds liquidity only.
 * - `FrontendMarket`: Similar to Ioc, used in Hyperliquid UI.
 * - `LiquidationMarket`: Similar to Ioc, used in Hyperliquid UI.
 */
export const TIF = v.pipe(
    v.union([
        v.literal("Gtc"),
        v.literal("Ioc"),
        v.literal("Alo"),
        v.literal("FrontendMarket"),
        v.literal("LiquidationMarket"),
    ]),
    v.description(
        "Time-in-force options." +
            "\n- `Gtc`: Remains active until filled or canceled. " +
            "\n- `Ioc`: Fills immediately or cancels any unfilled portion. " +
            "\n- `Alo`: Adds liquidity only. " +
            "\n- `FrontendMarket`: Similar to Ioc, used in Hyperliquid UI. " +
            "\n- `LiquidationMarket`: Similar to Ioc, used in Hyperliquid UI.",
    ),
);
export type TIF = v.InferOutput<typeof TIF>;

/** Open order with additional display information. */
export const FrontendOrder = v.pipe(
    v.strictObject({
        ...v.omit(v.strictObject(Order.entries), ["reduceOnly", "cloid"]).entries,
        /** Condition for triggering the order. */
        triggerCondition: v.pipe(
            v.string(),
            v.description("Condition for triggering the order."),
        ),
        /** Indicates if the order is a trigger order. */
        isTrigger: v.pipe(
            v.boolean(),
            v.description("Indicates if the order is a trigger order."),
        ),
        /** Trigger price. */
        triggerPx: v.pipe(
            UnsignedDecimal,
            v.description("Trigger price."),
        ),
        /** Child orders associated with this order. */
        children: v.pipe(
            // deno-lint-ignore no-explicit-any
            v.array(v.lazy<any>(() => FrontendOrder)),
            v.description("Child orders associated with this order."),
        ),
        /** Indicates if the order is a position TP/SL order. */
        isPositionTpsl: v.pipe(
            v.boolean(),
            v.description("Indicates if the order is a position TP/SL order."),
        ),
        /** Indicates whether the order is reduce-only. */
        reduceOnly: v.pipe(
            v.boolean(),
            v.description("Indicates whether the order is reduce-only."),
        ),
        /** Order type. */
        orderType: v.pipe(
            OrderType,
            v.description("Order type."),
        ),
        /** Time-in-force option. */
        tif: v.pipe(
            v.union([TIF, v.null()]),
            v.description("Time-in-force option."),
        ),
        /** Client Order ID. */
        cloid: v.pipe(
            v.union([v.pipe(Hex, v.length(34)), v.null()]),
            v.description("Client Order ID."),
        ),
    }),
    v.description("Open order with additional display information."),
);
export type FrontendOrder = v.InferOutput<typeof FrontendOrder>;

/**
 * Order processing status.
 * - `open`: Order active and waiting to be filled.
 * - `filled`: Order fully executed.
 * - `canceled`: Order canceled by the user.
 * - `triggered`: Order triggered and awaiting execution.
 * - `rejected`: Order rejected by the system.
 * - `marginCanceled`: Order canceled due to insufficient margin.
 * - `vaultWithdrawalCanceled`: Canceled due to a user withdrawal from vault.
 * - `openInterestCapCanceled`: Canceled due to order being too aggressive when open interest was at cap.
 * - `selfTradeCanceled`: Canceled due to self-trade prevention.
 * - `reduceOnlyCanceled`: Canceled reduced-only order that does not reduce position.
 * - `siblingFilledCanceled`: Canceled due to sibling ordering being filled.
 * - `delistedCanceled`: Canceled due to asset delisting.
 * - `liquidatedCanceled`: Canceled due to liquidation.
 * - `scheduledCancel`: Canceled due to exceeding scheduled cancel deadline (dead man's switch).
 */
export const OrderProcessingStatus = v.pipe(
    v.union([
        v.literal("open"),
        v.literal("filled"),
        v.literal("canceled"),
        v.literal("triggered"),
        v.literal("rejected"),
        v.literal("marginCanceled"),
        v.literal("vaultWithdrawalCanceled"),
        v.literal("openInterestCapCanceled"),
        v.literal("selfTradeCanceled"),
        v.literal("reduceOnlyCanceled"),
        v.literal("siblingFilledCanceled"),
        v.literal("delistedCanceled"),
        v.literal("liquidatedCanceled"),
        v.literal("scheduledCancel"),
        v.literal("reduceOnlyRejected"),
    ]),
    v.description(
        "Order processing status." +
            "\n- `open`: Order active and waiting to be filled. " +
            "\n- `filled`: Order fully executed. " +
            "\n- `canceled`: Order canceled by the user. " +
            "\n- `triggered`: Order triggered and awaiting execution. " +
            "\n- `rejected`: Order rejected by the system. " +
            "\n- `marginCanceled`: Order canceled due to insufficient margin. " +
            "\n- `vaultWithdrawalCanceled`: Canceled due to a user withdrawal from vault. " +
            "\n- `openInterestCapCanceled`: Canceled due to order being too aggressive when open interest was at cap. " +
            "\n- `selfTradeCanceled`: Canceled due to self-trade prevention. " +
            "\n- `reduceOnlyCanceled`: Canceled reduced-only order that does not reduce position. " +
            "\n- `siblingFilledCanceled`: Canceled due to sibling ordering being filled. " +
            "\n- `delistedCanceled`: Canceled due to asset delisting. " +
            "\n- `liquidatedCanceled`: Canceled due to liquidation. " +
            "\n- `scheduledCancel`: Canceled due to exceeding scheduled cancel deadline (dead man's switch).",
    ),
);
export type OrderProcessingStatus = v.InferOutput<typeof OrderProcessingStatus>;

/** Order with current processing status. */
export const OrderStatus = v.pipe(
    v.strictObject({
        /** Order details. */
        order: v.pipe(
            Order,
            v.description("Order details."),
        ),
        /** Order processing status. */
        status: v.pipe(
            OrderProcessingStatus,
            v.description("Order processing status."),
        ),
        /** Timestamp when the status was last updated (in ms since epoch). */
        statusTimestamp: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Timestamp when the status was last updated (in ms since epoch)."),
        ),
    }),
    v.description("Order with current processing status."),
);
export type OrderStatus = v.InferOutput<typeof OrderStatus>;

/** Frontend order with current processing status. */
export const FrontendOrderStatus = v.pipe(
    v.strictObject({
        /** Order details. */
        order: v.pipe(
            FrontendOrder,
            v.description("Order details."),
        ),
        /** Order processing status. */
        status: v.pipe(
            OrderProcessingStatus,
            v.description("Order processing status."),
        ),
        /** Timestamp when the status was last updated (in ms since epoch). */
        statusTimestamp: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Timestamp when the status was last updated (in ms since epoch)."),
        ),
    }),
    v.description("Frontend order with current processing status."),
);
export type FrontendOrderStatus = v.InferOutput<typeof FrontendOrderStatus>;

/** Result of an order status lookup. */
export const OrderLookup = v.pipe(
    v.union([
        v.strictObject({
            /** Indicates that the order was found. */
            status: v.pipe(
                v.literal("order"),
                v.description("Indicates that the order was found."),
            ),
            /** Order details. */
            order: v.pipe(
                FrontendOrderStatus,
                v.description("Order details."),
            ),
        }),
        v.strictObject({
            /** Indicates that the order was not found. */
            status: v.pipe(
                v.literal("unknownOid"),
                v.description("Indicates that the order was not found."),
            ),
        }),
    ]),
    v.description("Result of an order status lookup."),
);
export type OrderLookup = v.InferOutput<typeof OrderLookup>;

/** Current state of a TWAP order. */
export const TwapState = v.pipe(
    v.strictObject({
        /** Asset symbol. */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
        ),
        /** Executed notional value. */
        executedNtl: v.pipe(
            UnsignedDecimal,
            v.description("Executed notional value."),
        ),
        /** Executed size. */
        executedSz: v.pipe(
            UnsignedDecimal,
            v.description("Executed size."),
        ),
        /** Duration in minutes. */
        minutes: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Duration in minutes."),
        ),
        /** Indicates if the TWAP randomizes execution. */
        randomize: v.pipe(
            v.boolean(),
            v.description("Indicates if the TWAP randomizes execution."),
        ),
        /** Indicates if the order is reduce-only. */
        reduceOnly: v.pipe(
            v.boolean(),
            v.description("Indicates if the order is reduce-only."),
        ),
        /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
        side: v.pipe(
            v.union([v.literal("B"), v.literal("A")]),
            v.description('Order side ("B" = Bid/Buy, "A" = Ask/Sell).'),
        ),
        /** Order size. */
        sz: v.pipe(
            UnsignedDecimal,
            v.description("Order size."),
        ),
        /** Start time of the TWAP order (in ms since epoch). */
        timestamp: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Start time of the TWAP order (in ms since epoch)."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Current state of a TWAP order."),
);
export type TwapState = v.InferOutput<typeof TwapState>;

/**
 * TWAP order status.
 * - `finished`: Fully executed.
 * - `activated`: Active and executing.
 * - `terminated`: Terminated.
 * - `error`: An error occurred.
 */
export const TwapStatus = v.pipe(
    v.union([
        v.strictObject({
            /** Status of the TWAP order. */
            status: v.pipe(
                v.union([v.literal("finished"), v.literal("activated"), v.literal("terminated")]),
                v.description("Status of the TWAP order."),
            ),
        }),
        v.strictObject({
            /** Status of the TWAP order. */
            status: v.pipe(
                v.literal("error"),
                v.description("Status of the TWAP order."),
            ),
            /** Error message. */
            description: v.pipe(
                v.string(),
                v.description("Error message."),
            ),
        }),
    ]),
    v.description(
        "TWAP order status. " +
            "\n- `finished`: Fully executed. " +
            "\n- `activated`: Active and executing. " +
            "\n- `terminated`: Terminated. " +
            "\n- `error`: An error occurred.",
    ),
);
export type TwapStatus = v.InferOutput<typeof TwapStatus>;

/** TWAP history record for a user. */
export const TwapHistory = v.pipe(
    v.strictObject({
        /** Creation time of the history record (in seconds since epoch). */
        time: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Creation time of the history record (in seconds since epoch)."),
        ),
        /** State of the TWAP order. */
        state: v.pipe(
            TwapState,
            v.description("State of the TWAP order."),
        ),
        /** Current status of the TWAP order. */
        status: v.pipe(
            TwapStatus,
            v.description("Current status of the TWAP order."),
        ),
    }),
    v.description("TWAP history record for a user."),
);
export type TwapHistory = v.InferOutput<typeof TwapHistory>;

/** TWAP slice fill details. */
export const TwapSliceFill = v.pipe(
    v.strictObject({
        /** Fill details for the TWAP slice. */
        fill: v.pipe(
            v.omit(v.strictObject(Fill.entries), ["cloid", "liquidation"]),
            v.description("Fill details for the TWAP slice."),
        ),
        /** ID of the TWAP. */
        twapId: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("ID of the TWAP."),
        ),
    }),
    v.description("TWAP slice fill details."),
);
export type TwapSliceFill = v.InferOutput<typeof TwapSliceFill>;
