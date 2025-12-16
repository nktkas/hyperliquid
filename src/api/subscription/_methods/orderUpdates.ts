import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { OpenOrderSchema, OrderProcessingStatusSchema } from "../../info/_methods/_base/commonSchemas.ts";

/** Subscription to order updates for a specific user. */
export const OrderUpdatesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("orderUpdates"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to order updates for a specific user."),
  );
})();
export type OrderUpdatesRequest = v.InferOutput<typeof OrderUpdatesRequest>;

/** Event of array of orders with their current processing status. */
export const OrderUpdatesEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.object({
        /** Order details. */
        order: v.pipe(
          OpenOrderSchema,
          v.description("Order details."),
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
    ),
    v.description("Event of array of orders with their current processing status."),
  );
})();
export type OrderUpdatesEvent = v.InferOutput<typeof OrderUpdatesEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode orderUpdates} function. */
export type OrderUpdatesParameters = Omit<v.InferInput<typeof OrderUpdatesRequest>, "type">;

/**
 * Subscribe to order status updates for a specific user.
 *
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 *
 * @returns A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { orderUpdates } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
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
  const payload = v.parse(OrderUpdatesRequest, { type: "orderUpdates", ...params });
  return config.transport.subscribe<OrderUpdatesEvent>(payload.type, payload, (e) => {
    listener(e.detail);
  });
}
