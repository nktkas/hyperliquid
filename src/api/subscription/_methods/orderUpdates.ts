import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { OpenOrderSchema, OrderProcessingStatusSchema } from "../../info/_methods/_base/commonSchemas.ts";

/**
 * Subscription to order updates for a specific user.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const OrderUpdatesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("orderUpdates"),
    /** User address. */
    user: Address,
  });
})();
export type OrderUpdatesRequest = v.InferOutput<typeof OrderUpdatesRequest>;

/**
 * Event of array of orders with their current processing status.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export type OrderUpdatesEvent = {
  /** Order details. */
  order: OpenOrderSchema;
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
  status: OrderProcessingStatusSchema;
  /** Timestamp when the status was last updated (in ms since epoch). */
  statusTimestamp: number;
}[];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ISubscription } from "../../../transport/mod.ts";
import type { SubscriptionConfig } from "./_types.ts";

/** Request parameters for the {@linkcode orderUpdates} function. */
export type OrderUpdatesParameters = Omit<v.InferInput<typeof OrderUpdatesRequest>, "type">;

/**
 * Subscribe to order status updates for a specific user.
 *
 * @param config General configuration for Subscription API subscriptions.
 * @param params Parameters specific to the API subscription.
 * @param listener A callback function to be called when the event is received.
 * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { orderUpdates } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await orderUpdates(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function orderUpdates(
  config: SubscriptionConfig,
  params: OrderUpdatesParameters,
  listener: (data: OrderUpdatesEvent) => void,
): Promise<ISubscription> {
  const payload = parse(OrderUpdatesRequest, { type: "orderUpdates", ...params });
  return config.transport.subscribe<OrderUpdatesEvent>(payload.type, payload, (e) => {
    listener(e.detail);
  });
}
