import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { FrontendOpenOrderSchema, OrderProcessingStatusSchema } from "./_base/commonSchemas.ts";

/**
 * Request user historical orders.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
 */
export const HistoricalOrdersRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("historicalOrders"),
    /** User address. */
    user: Address,
  });
})();
export type HistoricalOrdersRequest = v.InferOutput<typeof HistoricalOrdersRequest>;

/**
 * Array of frontend orders with current processing status.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
 */
export const HistoricalOrdersResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.object({
      /** Open order with additional display information. */
      order: FrontendOpenOrderSchema,
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
      status: OrderProcessingStatusSchema,
      /** Timestamp when the status was last updated (in ms since epoch). */
      statusTimestamp: UnsignedInteger,
    }),
  );
})();
export type HistoricalOrdersResponse = v.InferOutput<typeof HistoricalOrdersResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode historicalOrders} function. */
export type HistoricalOrdersParameters = Omit<v.InferInput<typeof HistoricalOrdersRequest>, "type">;

/**
 * Request user historical orders.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of frontend orders with current processing status.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { historicalOrders } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await historicalOrders(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
 */
export function historicalOrders(
  config: InfoConfig,
  params: HistoricalOrdersParameters,
  signal?: AbortSignal,
): Promise<HistoricalOrdersResponse> {
  const request = v.parse(HistoricalOrdersRequest, {
    type: "historicalOrders",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
