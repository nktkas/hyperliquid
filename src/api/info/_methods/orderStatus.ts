import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Cloid, UnsignedInteger } from "../../_schemas.ts";
import type { FrontendOpenOrderSchema, OrderProcessingStatusSchema } from "./_base/commonSchemas.ts";

/**
 * Request order status.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
 */
export const OrderStatusRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("orderStatus"),
    /** User address. */
    user: Address,
    /** Order ID or Client Order ID. */
    oid: v.union([UnsignedInteger, Cloid]),
  });
})();
export type OrderStatusRequest = v.InferOutput<typeof OrderStatusRequest>;

/**
 * Order status response.
 * - If the order is found, returns detailed order information and its current status.
 * - If the order is not found, returns a status of "unknownOid".
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
 */
export type OrderStatusResponse = {
  /** Indicates that the order was found. */
  status: "order";
  /** Order status details. */
  order: {
    /** Open order with additional display information. */
    order: FrontendOpenOrderSchema;
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
  };
} | {
  /** Indicates that the order was not found. */
  status: "unknownOid";
};

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode orderStatus} function. */
export type OrderStatusParameters = Omit<v.InferInput<typeof OrderStatusRequest>, "type">;

/**
 * Request order status.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Order status response.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { orderStatus } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await orderStatus(
 *   { transport },
 *   { user: "0x...", oid: 12345 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
 */
export function orderStatus(
  config: InfoConfig,
  params: OrderStatusParameters,
  signal?: AbortSignal,
): Promise<OrderStatusResponse> {
  const request = v.parse(OrderStatusRequest, {
    type: "orderStatus",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
