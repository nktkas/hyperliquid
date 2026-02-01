import * as v from "@valibot/valibot";
import { Address, Cloid, Decimal, Hex, UnsignedDecimal, UnsignedInteger } from "../../../_schemas.ts";

/** Perpetual asset context. */
export const PerpAssetCtxSchema = /* @__PURE__ */ (() => {
  return v.object({
    /** Previous day's closing price. */
    prevDayPx: UnsignedDecimal,
    /** Daily notional volume. */
    dayNtlVlm: UnsignedDecimal,
    /** Mark price. */
    markPx: UnsignedDecimal,
    /** Mid price. */
    midPx: v.nullable(UnsignedDecimal),
    /** Funding rate. */
    funding: Decimal,
    /** Total open interest. */
    openInterest: UnsignedDecimal,
    /** Premium price. */
    premium: v.nullable(Decimal),
    /** Oracle price. */
    oraclePx: UnsignedDecimal,
    /** Array of impact prices. */
    impactPxs: v.nullable(v.array(v.string())),
    /** Daily volume in base currency. */
    dayBaseVlm: UnsignedDecimal,
  });
})();
export type PerpAssetCtxSchema = v.InferOutput<typeof PerpAssetCtxSchema>;

/** Spot asset context. */
export const SpotAssetCtxSchema = /* @__PURE__ */ (() => {
  return v.object({
    /** Previous day's closing price. */
    prevDayPx: UnsignedDecimal,
    /** Daily notional volume. */
    dayNtlVlm: UnsignedDecimal,
    /** Mark price. */
    markPx: UnsignedDecimal,
    /** Mid price. */
    midPx: v.nullable(UnsignedDecimal),
    /** Circulating supply. */
    circulatingSupply: UnsignedDecimal,
    /** Asset symbol. */
    coin: v.string(),
    /** Total supply. */
    totalSupply: UnsignedDecimal,
    /** Daily volume in base currency. */
    dayBaseVlm: UnsignedDecimal,
  });
})();
export type SpotAssetCtxSchema = v.InferOutput<typeof SpotAssetCtxSchema>;

/** Open order with additional display information. */
export const FrontendOpenOrderSchema = /* @__PURE__ */ (() => {
  return v.object({
    /** Asset symbol. */
    coin: v.string(),
    /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
    side: v.picklist(["B", "A"]),
    /** Limit price. */
    limitPx: UnsignedDecimal,
    /** Size. */
    sz: UnsignedDecimal,
    /** Order ID. */
    oid: UnsignedInteger,
    /** Timestamp when the order was placed (in ms since epoch). */
    timestamp: UnsignedInteger,
    /** Original size at order placement. */
    origSz: UnsignedDecimal,
    /** Condition for triggering the order. */
    triggerCondition: v.string(),
    /** Indicates if the order is a trigger order. */
    isTrigger: v.boolean(),
    /** Trigger price. */
    triggerPx: UnsignedDecimal,
    /** Child orders associated with this order. */
    children: v.array(v.unknown()),
    /** Indicates if the order is a position TP/SL order. */
    isPositionTpsl: v.boolean(),
    /** Indicates whether the order is reduce-only. */
    reduceOnly: v.boolean(),
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
    orderType: v.picklist([
      "Market",
      "Limit",
      "Stop Market",
      "Stop Limit",
      "Take Profit Market",
      "Take Profit Limit",
    ]),
    /**
     * Time-in-force:
     * - `"Gtc"`: Remains active until filled or canceled.
     * - `"Ioc"`: Fills immediately or cancels any unfilled portion.
     * - `"Alo"`: Adds liquidity only.
     * - `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.
     * - `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.
     */
    tif: v.nullable(
      v.picklist([
        "Gtc",
        "Ioc",
        "Alo",
        "FrontendMarket",
        "LiquidationMarket",
      ]),
    ),
    /** Client Order ID. */
    cloid: v.nullable(Cloid),
  });
})();
export type FrontendOpenOrderSchema = v.InferOutput<typeof FrontendOpenOrderSchema>;

/** Open order. */
export const OpenOrderSchema = /* @__PURE__ */ (() => {
  return v.object({
    /** Asset symbol. */
    coin: v.string(),
    /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
    side: v.picklist(["B", "A"]),
    /** Limit price. */
    limitPx: UnsignedDecimal,
    /** Size. */
    sz: UnsignedDecimal,
    /** Order ID. */
    oid: UnsignedInteger,
    /** Timestamp when the order was placed (in ms since epoch). */
    timestamp: UnsignedInteger,
    /** Original size at order placement. */
    origSz: UnsignedDecimal,
    /** Client Order ID. */
    cloid: v.optional(Cloid),
    /** Indicates if the order is reduce-only. */
    reduceOnly: v.optional(v.literal(true)),
  });
})();
export type OpenOrderSchema = v.InferOutput<typeof OpenOrderSchema>;

/** TWAP order state. */
export const TwapStateSchema = /* @__PURE__ */ (() => {
  return v.object({
    /** Asset symbol. */
    coin: v.string(),
    /** Executed notional value. */
    executedNtl: UnsignedDecimal,
    /** Executed size. */
    executedSz: UnsignedDecimal,
    /** Duration in minutes. */
    minutes: UnsignedInteger,
    /** Indicates if the TWAP randomizes execution. */
    randomize: v.boolean(),
    /** Indicates if the order is reduce-only. */
    reduceOnly: v.boolean(),
    /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
    side: v.picklist(["B", "A"]),
    /** Order size. */
    sz: UnsignedDecimal,
    /** Start time of the TWAP order (in ms since epoch). */
    timestamp: UnsignedInteger,
    /** User address. */
    user: Address,
  });
})();
export type TwapStateSchema = v.InferOutput<typeof TwapStateSchema>;

/** Vault relationship type. */
export const VaultRelationshipSchema = /* @__PURE__ */ (() => {
  return v.variant("type", [
    v.object({
      /** Relationship type. */
      type: v.picklist(["normal", "child"]),
    }),
    v.object({
      /** Relationship type. */
      type: v.literal("parent"),
      /** Child vault information. */
      data: v.object({
        /** Child vault addresses. */
        childAddresses: v.array(Address),
      }),
    }),
  ]);
})();
export type VaultRelationshipSchema = v.InferOutput<typeof VaultRelationshipSchema>;

/** Explorer transaction. */
export const ExplorerTransactionSchema = /* @__PURE__ */ (() => {
  return v.object({
    /** Action performed in transaction. */
    action: v.looseObject({
      /** Action type. */
      type: v.string(),
    }),
    /** Block number where transaction was included. */
    block: UnsignedInteger,
    /** Error message if transaction failed. */
    error: v.nullable(v.string()),
    /** Transaction hash. */
    hash: v.pipe(Hex, v.length(66)),
    /** Transaction creation timestamp. */
    time: UnsignedInteger,
    /** Creator's address. */
    user: Address,
  });
})();
export type ExplorerTransactionSchema = v.InferOutput<typeof ExplorerTransactionSchema>;

/** User fill. */
export const UserFillSchema = /* @__PURE__ */ (() => {
  return v.object({
    /** Asset symbol. */
    coin: v.string(),
    /** Price. */
    px: UnsignedDecimal,
    /** Size. */
    sz: UnsignedDecimal,
    /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
    side: v.picklist(["B", "A"]),
    /** Timestamp when the trade occurred (in ms since epoch). */
    time: UnsignedInteger,
    /** Start position size. */
    startPosition: Decimal,
    /** Direction indicator for frontend display. */
    dir: v.string(),
    /** Realized PnL. */
    closedPnl: Decimal,
    /** L1 transaction hash. */
    hash: v.pipe(Hex, v.length(66)),
    /** Order ID. */
    oid: UnsignedInteger,
    /** Indicates if the fill was a taker order. */
    crossed: v.boolean(),
    /** Fee charged or rebate received (negative indicates rebate). */
    fee: Decimal,
    /** Optional fee charged by the UI builder. */
    builderFee: v.optional(Decimal),
    /** Unique transaction identifier for a partial fill of an order. */
    tid: UnsignedInteger,
    /** Token in which the fee is denominated (e.g., "USDC"). */
    feeToken: v.string(),
    /** ID of the TWAP. */
    twapId: v.nullable(UnsignedInteger),
  });
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
  return v.picklist([
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
  ]);
})();
export type OrderProcessingStatusSchema = v.InferOutput<typeof OrderProcessingStatusSchema>;
