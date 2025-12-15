import * as v from "@valibot/valibot";
import { Address, Cloid, Decimal, Hex, UnsignedDecimal, UnsignedInteger } from "../../../_schemas.ts";

/** Perpetual asset context. */
export const PerpAssetCtxSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Previous day's closing price. */
      prevDayPx: v.pipe(
        UnsignedDecimal,
        v.description("Previous day's closing price."),
      ),
      /** Daily notional volume. */
      dayNtlVlm: v.pipe(
        UnsignedDecimal,
        v.description("Daily notional volume."),
      ),
      /** Mark price. */
      markPx: v.pipe(
        UnsignedDecimal,
        v.description("Mark price."),
      ),
      /** Mid price. */
      midPx: v.pipe(
        v.nullable(UnsignedDecimal),
        v.description("Mid price."),
      ),
      /** Funding rate. */
      funding: v.pipe(
        Decimal,
        v.description("Funding rate."),
      ),
      /** Total open interest. */
      openInterest: v.pipe(
        UnsignedDecimal,
        v.description("Total open interest."),
      ),
      /** Premium price. */
      premium: v.pipe(
        v.nullable(Decimal),
        v.description("Premium price."),
      ),
      /** Oracle price. */
      oraclePx: v.pipe(
        UnsignedDecimal,
        v.description("Oracle price."),
      ),
      /** Array of impact prices. */
      impactPxs: v.pipe(
        v.nullable(v.array(v.string())),
        v.description("Array of impact prices."),
      ),
      /** Daily volume in base currency. */
      dayBaseVlm: v.pipe(
        UnsignedDecimal,
        v.description("Daily volume in base currency."),
      ),
    }),
    v.description("Perpetual asset context."),
  );
})();
export type PerpAssetCtxSchema = v.InferOutput<typeof PerpAssetCtxSchema>;

/** Spot asset context. */
export const SpotAssetCtxSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Previous day's closing price. */
      prevDayPx: v.pipe(
        UnsignedDecimal,
        v.description("Previous day's closing price."),
      ),
      /** Daily notional volume. */
      dayNtlVlm: v.pipe(
        UnsignedDecimal,
        v.description("Daily notional volume."),
      ),
      /** Mark price. */
      markPx: v.pipe(
        UnsignedDecimal,
        v.description("Mark price."),
      ),
      /** Mid price. */
      midPx: v.pipe(
        v.nullable(UnsignedDecimal),
        v.description("Mid price."),
      ),
      /** Circulating supply. */
      circulatingSupply: v.pipe(
        UnsignedDecimal,
        v.description("Circulating supply."),
      ),
      /** Asset symbol. */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol."),
      ),
      /** Total supply. */
      totalSupply: v.pipe(
        UnsignedDecimal,
        v.description("Total supply."),
      ),
      /** Daily volume in base currency. */
      dayBaseVlm: v.pipe(
        UnsignedDecimal,
        v.description("Daily volume in base currency."),
      ),
    }),
    v.description("Spot asset context."),
  );
})();
export type SpotAssetCtxSchema = v.InferOutput<typeof SpotAssetCtxSchema>;

/** Open order with additional display information. */
export const FrontendOpenOrderSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Asset symbol. */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol."),
      ),
      /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
      side: v.pipe(
        v.picklist(["B", "A"]),
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
        v.array(v.unknown()),
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
        v.picklist([
          "Market",
          "Limit",
          "Stop Market",
          "Stop Limit",
          "Take Profit Market",
          "Take Profit Limit",
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
       * Time-in-force:
       * - `"Gtc"`: Remains active until filled or canceled.
       * - `"Ioc"`: Fills immediately or cancels any unfilled portion.
       * - `"Alo"`: Adds liquidity only.
       * - `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.
       * - `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.
       */
      tif: v.pipe(
        v.nullable(v.picklist([
          "Gtc",
          "Ioc",
          "Alo",
          "FrontendMarket",
          "LiquidationMarket",
        ])),
        v.description(
          "Time-in-force:" +
            '\n- `"Gtc"`: Remains active until filled or canceled.' +
            '\n- `"Ioc"`: Fills immediately or cancels any unfilled portion.' +
            '\n- `"Alo"`: Adds liquidity only.' +
            '\n- `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.' +
            '\n- `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.',
        ),
      ),
      /** Client Order ID. */
      cloid: v.pipe(
        v.nullable(Cloid),
        v.description("Client Order ID."),
      ),
    }),
    v.description("Open order with additional display information."),
  );
})();
export type FrontendOpenOrderSchema = v.InferOutput<typeof FrontendOpenOrderSchema>;

/** Open order. */
export const OpenOrderSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Asset symbol. */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol."),
      ),
      /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
      side: v.pipe(
        v.picklist(["B", "A"]),
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
        v.optional(Cloid),
        v.description("Client Order ID."),
      ),
      /** Indicates if the order is reduce-only. */
      reduceOnly: v.pipe(
        v.optional(v.literal(true)),
        v.description("Indicates if the order is reduce-only."),
      ),
    }),
    v.description("Open order."),
  );
})();
export type OpenOrderSchema = v.InferOutput<typeof OpenOrderSchema>;

/** TWAP order state. */
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
        v.picklist(["B", "A"]),
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
    v.description("TWAP order state."),
  );
})();
export type TwapStateSchema = v.InferOutput<typeof TwapStateSchema>;

/** Vault relationship type. */
export const VaultRelationshipSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.variant("type", [
      v.object({
        /** Relationship type. */
        type: v.pipe(
          v.picklist(["normal", "child"]),
          v.description("Relationship type."),
        ),
      }),
      v.object({
        /** Relationship type. */
        type: v.pipe(
          v.literal("parent"),
          v.description("Relationship type."),
        ),
        /** Child vault information. */
        data: v.pipe(
          v.object({
            /** Child vault addresses. */
            childAddresses: v.pipe(
              v.array(Address),
              v.description("Child vault addresses."),
            ),
          }),
          v.description("Child vault information."),
        ),
      }),
    ]),
    v.description("Vault relationship type."),
  );
})();
export type VaultRelationshipSchema = v.InferOutput<typeof VaultRelationshipSchema>;

/** Explorer transaction. */
export const ExplorerTransactionSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action performed in transaction. */
      action: v.pipe(
        v.looseObject({
          /** Action type. */
          type: v.pipe(
            v.string(),
            v.description("Action type."),
          ),
        }),
        v.description("Action performed in transaction."),
      ),
      /** Block number where transaction was included. */
      block: v.pipe(
        UnsignedInteger,
        v.description("Block number where transaction was included."),
      ),
      /** Error message if transaction failed. */
      error: v.pipe(
        v.nullable(v.string()),
        v.description("Error message if transaction failed."),
      ),
      /** Transaction hash. */
      hash: v.pipe(
        Hex,
        v.length(66),
        v.description("Transaction hash."),
      ),
      /** Transaction creation timestamp. */
      time: v.pipe(
        UnsignedInteger,
        v.description("Transaction creation timestamp."),
      ),
      /** Creator's address. */
      user: v.pipe(
        Address,
        v.description("Creator's address."),
      ),
    }),
    v.description("Explorer transaction."),
  );
})();
export type ExplorerTransactionSchema = v.InferOutput<typeof ExplorerTransactionSchema>;

/** User fill. */
export const UserFillSchema = /* @__PURE__ */ (() => {
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
        v.picklist(["B", "A"]),
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
        Hex,
        v.length(66),
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
    v.description("User fill."),
  );
})();
export type UserFillSchema = v.InferOutput<typeof UserFillSchema>;

/**
 * Order processing status:
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
    v.picklist([
      "open",
      "filled",
      "canceled",
      "triggered",
      "rejected",
      "marginCanceled",
      "vaultWithdrawalCanceled",
      "openInterestCapCanceled",
      "selfTradeCanceled",
      "reduceOnlyCanceled",
      "siblingFilledCanceled",
      "delistedCanceled",
      "liquidatedCanceled",
      "scheduledCancel",
      "tickRejected",
      "minTradeNtlRejected",
      "perpMarginRejected",
      "reduceOnlyRejected",
      "badAloPxRejected",
      "iocCancelRejected",
      "badTriggerPxRejected",
      "marketOrderNoLiquidityRejected",
      "positionIncreaseAtOpenInterestCapRejected",
      "positionFlipAtOpenInterestCapRejected",
      "tooAggressiveAtOpenInterestCapRejected",
      "openInterestIncreaseRejected",
      "insufficientSpotBalanceRejected",
      "oracleRejected",
      "perpMaxPositionRejected",
    ]),
    v.description(
      "Order processing status:" +
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
export type OrderProcessingStatusSchema = v.InferOutput<typeof OrderProcessingStatusSchema>;
