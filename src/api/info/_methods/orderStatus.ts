import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Cloid, UnsignedInteger } from "../../_schemas.ts";
import { FrontendOpenOrderSchema, OrderProcessingStatusSchema } from "./_base/commonSchemas.ts";

/**
 * Request order status.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
 */
export const OrderStatusRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("orderStatus"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Order ID or Client Order ID. */
      oid: v.pipe(
        v.union([UnsignedInteger, Cloid]),
        v.description("Order ID or Client Order ID."),
      ),
    }),
    v.description("Request order status."),
  );
})();
export type OrderStatusRequest = v.InferOutput<typeof OrderStatusRequest>;

/**
 * Order status response.
 * - If the order is found, returns detailed order information and its current status.
 * - If the order is not found, returns a status of "unknownOid".
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
 */
export const OrderStatusResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.variant("status", [
      v.object({
        /** Indicates that the order was found. */
        status: v.pipe(
          v.literal("order"),
          v.description("Indicates that the order was found."),
        ),
        /** Order status details. */
        order: v.pipe(
          v.object({
            /** Open order with additional display information. */
            order: v.pipe(
              FrontendOpenOrderSchema,
              v.description("Open order with additional display information."),
            ),
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
            status: v.pipe(
              OrderProcessingStatusSchema,
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
            ),
            /** Timestamp when the status was last updated (in ms since epoch). */
            statusTimestamp: v.pipe(
              UnsignedInteger,
              v.description("Timestamp when the status was last updated (in ms since epoch)."),
            ),
          }),
          v.description("Order status details."),
        ),
      }),
      v.object({
        /** Indicates that the order was not found. */
        status: v.pipe(
          v.literal("unknownOid"),
          v.description("Indicates that the order was not found."),
        ),
      }),
    ]),
    v.description(
      "Order status response." +
        "\n- If the order is found, returns detailed order information and its current status." +
        '\n- If the order is not found, returns a status of "unknownOid".',
    ),
  );
})();
export type OrderStatusResponse = v.InferOutput<typeof OrderStatusResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode orderStatus} function. */
export type OrderStatusParameters = Omit<v.InferInput<typeof OrderStatusRequest>, "type">;

/**
 * Request order status.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Order status response.
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
