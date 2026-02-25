/**
 * Common types shared across Info API methods.
 * @module
 */

/** Perpetual asset context. */
export type PerpAssetCtxSchema = {
  /**
   * Previous day's closing price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  prevDayPx: string;
  /**
   * Daily notional volume.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  dayNtlVlm: string;
  /**
   * Mark price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  markPx: string;
  /**
   * Mid price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  midPx: string | null;
  /**
   * Funding rate.
   * @pattern ^-?[0-9]+(\.[0-9]+)?$
   */
  funding: string;
  /**
   * Total open interest.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  openInterest: string;
  /**
   * Premium price.
   * @pattern ^-?[0-9]+(\.[0-9]+)?$
   */
  premium: string | null;
  /**
   * Oracle price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  oraclePx: string;
  /**
   * Array of impact prices.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  impactPxs: string[] | null;
  /**
   * Daily volume in base currency.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  dayBaseVlm: string;
};

/** Spot asset context. */
export type SpotAssetCtxSchema = {
  /**
   * Previous day's closing price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  prevDayPx: string;
  /**
   * Daily notional volume.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  dayNtlVlm: string;
  /**
   * Mark price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  markPx: string;
  /**
   * Mid price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  midPx: string | null;
  /**
   * Circulating supply.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  circulatingSupply: string;
  /** Asset symbol. */
  coin: string;
  /**
   * Total supply.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  totalSupply: string;
  /**
   * Daily volume in base currency.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  dayBaseVlm: string;
};

/** Open order with additional display information. */
export type FrontendOpenOrderSchema = {
  /** Asset symbol. */
  coin: string;
  /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
  side: "B" | "A";
  /**
   * Limit price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  limitPx: string;
  /**
   * Size.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  sz: string;
  /** Order ID. */
  oid: number;
  /** Timestamp when the order was placed (in ms since epoch). */
  timestamp: number;
  /**
   * Original size at order placement.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  origSz: string;
  /** Condition for triggering the order. */
  triggerCondition: string;
  /** Indicates if the order is a trigger order. */
  isTrigger: boolean;
  /**
   * Trigger price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  triggerPx: string;
  /** Child orders associated with this order. */
  children: unknown[];
  /** Indicates if the order is a position TP/SL order. */
  isPositionTpsl: boolean;
  /** Indicates whether the order is reduce-only. */
  reduceOnly: boolean;
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
  orderType:
    | "Market"
    | "Limit"
    | "Stop Market"
    | "Stop Limit"
    | "Take Profit Market"
    | "Take Profit Limit";
  /**
   * Time-in-force:
   * - `"Gtc"`: Remains active until filled or canceled.
   * - `"Ioc"`: Fills immediately or cancels any unfilled portion.
   * - `"Alo"`: Adds liquidity only.
   * - `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.
   * - `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.
   */
  tif:
    | "Gtc"
    | "Ioc"
    | "Alo"
    | "FrontendMarket"
    | "LiquidationMarket"
    | null;
  /**
   * Client Order ID.
   * @pattern ^0x[a-fA-F0-9]{32}$
   */
  cloid: `0x${string}` | null;
};

/** Open order. */
export type OpenOrderSchema = {
  /** Asset symbol. */
  coin: string;
  /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
  side: "B" | "A";
  /**
   * Limit price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  limitPx: string;
  /**
   * Size.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  sz: string;
  /** Order ID. */
  oid: number;
  /** Timestamp when the order was placed (in ms since epoch). */
  timestamp: number;
  /**
   * Original size at order placement.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  origSz: string;
  /**
   * Client Order ID.
   * @pattern ^0x[a-fA-F0-9]{32}$
   */
  cloid?: `0x${string}`;
  /** Indicates if the order is reduce-only. */
  reduceOnly?: true;
};

/** TWAP order state. */
export type TwapStateSchema = {
  /** Asset symbol. */
  coin: string;
  /**
   * Executed notional value.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  executedNtl: string;
  /**
   * Executed size.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  executedSz: string;
  /** Duration in minutes. */
  minutes: number;
  /** Indicates if the TWAP randomizes execution. */
  randomize: boolean;
  /** Indicates if the order is reduce-only. */
  reduceOnly: boolean;
  /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
  side: "B" | "A";
  /**
   * Order size.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  sz: string;
  /** Start time of the TWAP order (in ms since epoch). */
  timestamp: number;
  /**
   * User address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  user: `0x${string}`;
};

/** Vault relationship type. */
export type VaultRelationshipSchema = {
  /** Relationship type. */
  type: "normal" | "child";
} | {
  /** Relationship type. */
  type: "parent";
  /** Child vault information. */
  data: {
    /**
     * Child vault addresses.
     * @pattern ^0x[a-fA-F0-9]{40}$
     */
    childAddresses: `0x${string}`[];
  };
};

/** Explorer transaction. */
export type ExplorerTransactionSchema = {
  /** Action performed in transaction. */
  action: {
    /** Action type. */
    type: string;
    [key: string]: unknown;
  };
  /** Block number where transaction was included. */
  block: number;
  /** Error message if transaction failed. */
  error: string | null;
  /**
   * Transaction hash.
   * @pattern ^0x[a-fA-F0-9]{64}$
   */
  hash: `0x${string}`;
  /** Transaction creation timestamp. */
  time: number;
  /**
   * Creator's address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  user: `0x${string}`;
};

/** User fill. */
export type UserFillSchema = {
  /** Asset symbol. */
  coin: string;
  /**
   * Price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  px: string;
  /**
   * Size.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  sz: string;
  /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
  side: "B" | "A";
  /** Timestamp when the trade occurred (in ms since epoch). */
  time: number;
  /**
   * Start position size.
   * @pattern ^-?[0-9]+(\.[0-9]+)?$
   */
  startPosition: string;
  /** Direction indicator for frontend display. */
  dir: string;
  /**
   * Realized PnL.
   * @pattern ^-?[0-9]+(\.[0-9]+)?$
   */
  closedPnl: string;
  /**
   * L1 transaction hash.
   * @pattern ^0x[a-fA-F0-9]{64}$
   */
  hash: `0x${string}`;
  /** Order ID. */
  oid: number;
  /** Indicates if the fill was a taker order. */
  crossed: boolean;
  /**
   * Fee charged or rebate received (negative indicates rebate).
   * @pattern ^-?[0-9]+(\.[0-9]+)?$
   */
  fee: string;
  /**
   * Optional fee charged by the UI builder.
   * @pattern ^-?[0-9]+(\.[0-9]+)?$
   */
  builderFee?: string;
  /** Unique transaction identifier for a partial fill of an order. */
  tid: number;
  /** Token in which the fee is denominated (e.g., "USDC"). */
  feeToken: string;
  /** ID of the TWAP. */
  twapId: number | null;
};

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
export type OrderProcessingStatusSchema =
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
  | "tickRejected"
  | "minTradeNtlRejected"
  | "perpMarginRejected"
  | "reduceOnlyRejected"
  | "badAloPxRejected"
  | "iocCancelRejected"
  | "badTriggerPxRejected"
  | "marketOrderNoLiquidityRejected"
  | "positionIncreaseAtOpenInterestCapRejected"
  | "positionFlipAtOpenInterestCapRejected"
  | "tooAggressiveAtOpenInterestCapRejected"
  | "openInterestIncreaseRejected"
  | "insufficientSpotBalanceRejected"
  | "oracleRejected"
  | "perpMaxPositionRejected";
