import * as v from "valibot";
import { Address, Decimal, Hex, UnsignedDecimal, UnsignedInteger } from "./_base.ts";

/**
 * Time-in-force.
 * - `"Gtc"`: Remains active until filled or canceled.
 * - `"Ioc"`: Fills immediately or cancels any unfilled portion.
 * - `"Alo"`: Adds liquidity only.
 * - `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.
 * - `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.
 */
export const TIFSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([
      v.literal("Gtc"),
      v.literal("Ioc"),
      v.literal("Alo"),
      v.literal("FrontendMarket"),
      v.literal("LiquidationMarket"),
    ]),
    v.description(
      "Time-in-force." +
        '\n- `"Gtc"`: Remains active until filled or canceled.' +
        '\n- `"Ioc"`: Fills immediately or cancels any unfilled portion.' +
        '\n- `"Alo"`: Adds liquidity only.' +
        '\n- `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.' +
        '\n- `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.',
    ),
  );
})();

/** Place order parameters. */
export const PlaceOrderParamsSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Asset ID. */
      a: v.pipe(
        UnsignedInteger,
        v.description("Asset ID."),
      ),
      /** Position side (`true` for long, `false` for short). */
      b: v.pipe(
        v.boolean(),
        v.description("Position side (`true` for long, `false` for short)."),
      ),
      /** Price. */
      p: v.pipe(
        UnsignedDecimal,
        v.description("Price."),
      ),
      /** Size (in base currency units). */
      s: v.pipe(
        UnsignedDecimal,
        v.description("Size (in base currency units)."),
      ),
      /** Is reduce-only? */
      r: v.pipe(
        v.boolean(),
        v.description("Is reduce-only?"),
      ),
      /** Order type. */
      t: v.pipe(
        v.union([
          v.object({
            /** Limit order parameters. */
            limit: v.pipe(
              v.object({
                /**
                 * Time-in-force.
                 * - `"Gtc"`: Remains active until filled or canceled.
                 * - `"Ioc"`: Fills immediately or cancels any unfilled portion.
                 * - `"Alo"`: Adds liquidity only.
                 * - `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.
                 * - `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.
                 */
                tif: TIFSchema,
              }),
              v.description("Limit order parameters."),
            ),
          }),
          v.object({
            /** Trigger order parameters. */
            trigger: v.pipe(
              v.object({
                /** Is market order? */
                isMarket: v.pipe(
                  v.boolean(),
                  v.description("Is market order?"),
                ),
                /** Trigger price. */
                triggerPx: v.pipe(
                  UnsignedDecimal,
                  v.description("Trigger price."),
                ),
                /** Indicates whether it is take profit or stop loss. */
                tpsl: v.pipe(
                  v.union([v.literal("tp"), v.literal("sl")]),
                  v.description("Indicates whether it is take profit or stop loss."),
                ),
              }),
              v.description("Trigger order parameters."),
            ),
          }),
        ]),
        v.description("Order type."),
      ),
      /** Client Order ID. */
      c: v.pipe(
        v.optional(v.pipe(Hex, v.length(34))),
        v.description("Client Order ID."),
      ),
    }),
    v.description("Place order parameters."),
  );
})();

/** Candle interval. */
export const CandleIntervalSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([
      v.literal("1m"),
      v.literal("3m"),
      v.literal("5m"),
      v.literal("15m"),
      v.literal("30m"),
      v.literal("1h"),
      v.literal("2h"),
      v.literal("4h"),
      v.literal("8h"),
      v.literal("12h"),
      v.literal("1d"),
      v.literal("3d"),
      v.literal("1w"),
      v.literal("1M"),
    ]),
    v.description("Time interval."),
  );
})();

/** Order details. */
export const OrderSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
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
        UnsignedInteger,
        v.description("Order ID."),
      ),
      /** Timestamp when the order was placed (in ms since epoch). */
      timestamp: v.pipe(
        UnsignedInteger,
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
    v.description("Order details."),
  );
})();

/** Open order with additional display information. */
export const DetailedOrderSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
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
        UnsignedInteger,
        v.description("Order ID."),
      ),
      /** Timestamp when the order was placed (in ms since epoch). */
      timestamp: v.pipe(
        UnsignedInteger,
        v.description("Timestamp when the order was placed (in ms since epoch)."),
      ),
      /** Original size at order placement. */
      origSz: v.pipe(
        UnsignedDecimal,
        v.description("Original size at order placement."),
      ),
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
        v.array(v.lazy<any>(() => DetailedOrderSchema)),
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
      /**
       * Order type for market execution.
       * - `"Market"`: Executes immediately at the market price.
       * - `"Limit"`: Executes at the specified limit price or better.
       * - `"Stop Market"`: Activates as a market order when a stop price is reached.
       * - `"Stop Limit"`: Activates as a limit order when a stop price is reached.
       * - `"Take Profit Market"`: Executes as a market order when a take profit price is reached.
       * - `"Take Profit Limit"`: Executes as a limit order when a take profit price is reached.
       * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/order-types
       */
      orderType: v.pipe(
        v.union([
          v.literal("Market"),
          v.literal("Limit"),
          v.literal("Stop Market"),
          v.literal("Stop Limit"),
          v.literal("Take Profit Market"),
          v.literal("Take Profit Limit"),
        ]),
        v.description(
          "Order type for market execution." +
            '\n- `"Market"`: Executes immediately at the market price.' +
            '\n- `"Limit"`: Executes at the specified limit price or better.' +
            '\n- `"Stop Market"`: Activates as a market order when a stop price is reached.' +
            '\n- `"Stop Limit"`: Activates as a limit order when a stop price is reached.' +
            '\n- `"Take Profit Market"`: Executes as a market order when a take profit price is reached.' +
            '\n- `"Take Profit Limit"`: Executes as a limit order when a take profit price is reached. ',
        ),
      ),
      /**
       * Time-in-force options.
       * - `"Gtc"`: Remains active until filled or canceled.
       * - `"Ioc"`: Fills immediately or cancels any unfilled portion.
       * - `"Alo"`: Adds liquidity only.
       * - `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.
       * - `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.
       */
      tif: v.nullable(TIFSchema),
      /** Client Order ID. */
      cloid: v.pipe(
        v.nullable(v.pipe(Hex, v.length(34))),
        v.description("Client Order ID."),
      ),
    }),
    v.description("Open order with additional display information."),
  );
})();

/**
 * Order processing status.
 * - `"open"`: Order active and waiting to be filled.
 * - `"filled"`: Order fully executed.
 * - `"canceled"`: Order canceled by the user.
 * - `"triggered"`: Order triggered and awaiting execution.
 * - `"rejected"`: Order rejected by the system.
 * - `"marginCanceled"`: Order canceled due to insufficient margin.
 * - `"vaultWithdrawalCanceled"`: Canceled due to a user withdrawal from vault.
 * - `"openInterestCapCanceled"`: Canceled due to order being too aggressive when open interest was at cap.
 * - `"selfTradeCanceled"`: Canceled due to self-trade prevention.
 * - `"reduceOnlyCanceled"`: Canceled reduced-only order that does not reduce position.
 * - `"siblingFilledCanceled"`: Canceled due to sibling ordering being filled.
 * - `"delistedCanceled"`: Canceled due to asset delisting.
 * - `"liquidatedCanceled"`: Canceled due to liquidation.
 * - `"scheduledCancel"`: Canceled due to exceeding scheduled cancel deadline (dead man's switch).
 * - `"tickRejected"`: Rejected due to invalid tick price.
 * - `"minTradeNtlRejected"`: Rejected due to order notional below minimum.
 * - `"perpMarginRejected"`: Rejected due to insufficient margin.
 * - `"reduceOnlyRejected"`: Rejected due to reduce only.
 * - `"badAloPxRejected"`: Rejected due to post-only immediate match.
 * - `"iocCancelRejected"`: Rejected due to IOC not able to match.
 * - `"badTriggerPxRejected"`: Rejected due to invalid TP/SL price.
 * - `"marketOrderNoLiquidityRejected"`: Rejected due to lack of liquidity for market order.
 * - `"positionIncreaseAtOpenInterestCapRejected"`: Rejected due to open interest cap.
 * - `"positionFlipAtOpenInterestCapRejected"`: Rejected due to open interest cap.
 * - `"tooAggressiveAtOpenInterestCapRejected"`: Rejected due to price too aggressive at open interest cap.
 * - `"openInterestIncreaseRejected"`: Rejected due to open interest cap.
 * - `"insufficientSpotBalanceRejected"`: Rejected due to insufficient spot balance.
 * - `"oracleRejected"`: Rejected due to price too far from oracle.
 * - `"perpMaxPositionRejected"`: Rejected due to exceeding margin tier limit at current leverage.
 */
export const OrderProcessingStatusSchema = /* @__PURE__ */ (() => {
  return v.pipe(
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
      v.literal("tickRejected"),
      v.literal("minTradeNtlRejected"),
      v.literal("perpMarginRejected"),
      v.literal("reduceOnlyRejected"),
      v.literal("badAloPxRejected"),
      v.literal("iocCancelRejected"),
      v.literal("badTriggerPxRejected"),
      v.literal("marketOrderNoLiquidityRejected"),
      v.literal("positionIncreaseAtOpenInterestCapRejected"),
      v.literal("positionFlipAtOpenInterestCapRejected"),
      v.literal("tooAggressiveAtOpenInterestCapRejected"),
      v.literal("openInterestIncreaseRejected"),
      v.literal("insufficientSpotBalanceRejected"),
      v.literal("oracleRejected"),
      v.literal("perpMaxPositionRejected"),
    ]),
    v.description(
      "Order processing status." +
        '\n- `"open"`: Order active and waiting to be filled.' +
        '\n- `"filled"`: Order fully executed.' +
        '\n- `"canceled"`: Order canceled by the user.' +
        '\n- `"triggered"`: Order triggered and awaiting execution.' +
        '\n- `"rejected"`: Order rejected by the system.' +
        '\n- `"marginCanceled"`: Order canceled due to insufficient margin.' +
        '\n- `"vaultWithdrawalCanceled"`: Canceled due to a user withdrawal from vault.' +
        '\n- `"openInterestCapCanceled"`: Canceled due to order being too aggressive when open interest was at cap.' +
        '\n- `"selfTradeCanceled"`: Canceled due to self-trade prevention.' +
        '\n- `"reduceOnlyCanceled"`: Canceled reduced-only order that does not reduce position.' +
        '\n- `"siblingFilledCanceled"`: Canceled due to sibling ordering being filled.' +
        '\n- `"delistedCanceled"`: Canceled due to asset delisting.' +
        '\n- `"liquidatedCanceled"`: Canceled due to liquidation.' +
        '\n- `"scheduledCancel"`: Canceled due to exceeding scheduled cancel deadline (dead man\'s switch).' +
        '\n- `"tickRejected"`: Rejected due to invalid tick price.' +
        '\n- `"minTradeNtlRejected"`: Rejected due to order notional below minimum.' +
        '\n- `"perpMarginRejected"`: Rejected due to insufficient margin.' +
        '\n- `"reduceOnlyRejected"`: Rejected due to reduce only.' +
        '\n- `"badAloPxRejected"`: Rejected due to post-only immediate match.' +
        '\n- `"iocCancelRejected"`: Rejected due to IOC not able to match.' +
        '\n- `"badTriggerPxRejected"`: Rejected due to invalid TP/SL price.' +
        '\n- `"marketOrderNoLiquidityRejected"`: Rejected due to lack of liquidity for market order.' +
        '\n- `"positionIncreaseAtOpenInterestCapRejected"`: Rejected due to open interest cap.' +
        '\n- `"positionFlipAtOpenInterestCapRejected"`: Rejected due to open interest cap.' +
        '\n- `"tooAggressiveAtOpenInterestCapRejected"`: Rejected due to price too aggressive at open interest cap.' +
        '\n- `"openInterestIncreaseRejected"`: Rejected due to open interest cap.' +
        '\n- `"insufficientSpotBalanceRejected"`: Rejected due to insufficient spot balance.' +
        '\n- `"oracleRejected"`: Rejected due to price too far from oracle.' +
        '\n- `"perpMaxPositionRejected"`: Rejected due to exceeding margin tier limit at current leverage.',
    ),
  );
})();

/** L2 order book level. */
export const L2BookLevelSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
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
        UnsignedInteger,
        v.description("Number of individual orders."),
      ),
    }),
    v.description("L2 order book level."),
  );
})();

/** State of the TWAP order. */
export const TwapStateSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
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
        UnsignedInteger,
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
        UnsignedInteger,
        v.description("Start time of the TWAP order (in ms since epoch)."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("State of the TWAP order."),
  );
})();

/**
 * Current status of the TWAP order.
 * - `"finished"`: Fully executed.
 * - `"activated"`: Active and executing.
 * - `"terminated"`: Terminated.
 * - `"error"`: An error occurred.
 */
export const TwapStatusSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.variant("status", [
      v.object({
        /** Status of the TWAP order. */
        status: v.pipe(
          v.union([
            v.literal("finished"),
            v.literal("activated"),
            v.literal("terminated"),
          ]),
          v.description("Status of the TWAP order."),
        ),
      }),
      v.object({
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
      "Current status of the TWAP order." +
        '\n- `"finished"`: Fully executed.' +
        '\n- `"activated"`: Active and executing.' +
        '\n- `"terminated"`: Terminated.' +
        '\n- `"error"`: An error occurred.',
    ),
  );
})();

/** Order fill record. */
export const FillSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
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
        UnsignedInteger,
        v.description("Timestamp when the trade occurred (in ms since epoch)."),
      ),
      /** Start position size. */
      startPosition: v.pipe(
        Decimal,
        v.description("Start position size."),
      ),
      /** Direction indicator for frontend display. */
      dir: v.pipe(
        v.string(),
        v.description("Direction indicator for frontend display."),
      ),
      /** Realized PnL. */
      closedPnl: v.pipe(
        Decimal,
        v.description("Realized PnL."),
      ),
      /** L1 transaction hash. */
      hash: v.pipe(
        v.pipe(Hex, v.length(66)),
        v.description("L1 transaction hash."),
      ),
      /** Order ID. */
      oid: v.pipe(
        UnsignedInteger,
        v.description("Order ID."),
      ),
      /** Indicates if the fill was a taker order. */
      crossed: v.pipe(
        v.boolean(),
        v.description("Indicates if the fill was a taker order."),
      ),
      /** Fee charged or rebate received (negative indicates rebate). */
      fee: v.pipe(
        Decimal,
        v.description("Fee charged or rebate received (negative indicates rebate)."),
      ),
      /** Unique transaction identifier for a partial fill of an order. */
      tid: v.pipe(
        UnsignedInteger,
        v.description("Unique transaction identifier for a partial fill of an order."),
      ),
      /** Client Order ID. */
      cloid: v.pipe(
        v.optional(v.pipe(Hex, v.length(34))),
        v.description("Client Order ID."),
      ),
      /** Liquidation details. */
      liquidation: v.pipe(
        v.optional(
          v.object({
            /** Address of the liquidated user. */
            liquidatedUser: v.pipe(
              Address,
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
        ),
        v.description("Liquidation details."),
      ),
      /** Token in which the fee is denominated (e.g., "USDC"). */
      feeToken: v.pipe(
        v.string(),
        v.description('Token in which the fee is denominated (e.g., "USDC").'),
      ),
      /** ID of the TWAP. */
      twapId: v.pipe(
        v.nullable(UnsignedInteger),
        v.description("ID of the TWAP."),
      ),
    }),
    v.description("Order fill record."),
  );
})();

/** TWAP fill record. */
export const TwapFillSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
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
        UnsignedInteger,
        v.description("Timestamp when the trade occurred (in ms since epoch)."),
      ),
      /** Start position size. */
      startPosition: v.pipe(
        Decimal,
        v.description("Start position size."),
      ),
      /** Direction indicator for frontend display. */
      dir: v.pipe(
        v.string(),
        v.description("Direction indicator for frontend display."),
      ),
      /** Realized PnL. */
      closedPnl: v.pipe(
        Decimal,
        v.description("Realized PnL."),
      ),
      /** L1 transaction hash. */
      hash: v.pipe(
        v.pipe(Hex, v.length(66)),
        v.description("L1 transaction hash."),
      ),
      /** Order ID. */
      oid: v.pipe(
        UnsignedInteger,
        v.description("Order ID."),
      ),
      /** Indicates if the fill was a taker order. */
      crossed: v.pipe(
        v.boolean(),
        v.description("Indicates if the fill was a taker order."),
      ),
      /** Fee charged or rebate received (negative indicates rebate). */
      fee: v.pipe(
        Decimal,
        v.description("Fee charged or rebate received (negative indicates rebate)."),
      ),
      /** Unique transaction identifier for a partial fill of an order. */
      tid: v.pipe(
        UnsignedInteger,
        v.description("Unique transaction identifier for a partial fill of an order."),
      ),
      /** Token in which the fee is denominated (e.g., "USDC"). */
      feeToken: v.pipe(
        v.string(),
        v.description('Token in which the fee is denominated (e.g., "USDC").'),
      ),
      /** ID of the TWAP. */
      twapId: v.pipe(
        v.nullable(UnsignedInteger),
        v.description("ID of the TWAP."),
      ),
    }),
    v.description("TWAP fill record."),
  );
})();
