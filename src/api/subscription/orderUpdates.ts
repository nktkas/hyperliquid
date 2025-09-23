import * as v from "valibot";
import { Address, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

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
      /** Order with its current processing status. */
      v.pipe(
        v.object({
          /** Order details. */
          order: v.pipe(
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
              /** Indicates whether the order is reduce-only. */
              reduceOnly: v.pipe(
                v.optional(v.literal(true)),
                v.description("Indicates whether the order is reduce-only."),
              ),
              /** Client Order ID. */
              cloid: v.pipe(
                v.optional(v.pipe(Hex, v.length(34))),
                v.description("Client Order ID."),
              ),
            }),
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
           */
          status: v.pipe(
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
                '\n- `"open"`: Order active and waiting to be filled. ' +
                '\n- `"filled"`: Order fully executed. ' +
                '\n- `"canceled"`: Order canceled by the user. ' +
                '\n- `"triggered"`: Order triggered and awaiting execution. ' +
                '\n- `"rejected"`: Order rejected by the system. ' +
                '\n- `"marginCanceled"`: Order canceled due to insufficient margin. ' +
                '\n- `"vaultWithdrawalCanceled"`: Canceled due to a user withdrawal from vault. ' +
                '\n- `"openInterestCapCanceled"`: Canceled due to order being too aggressive when open interest was at cap. ' +
                '\n- `"selfTradeCanceled"`: Canceled due to self-trade prevention. ' +
                '\n- `"reduceOnlyCanceled"`: Canceled reduced-only order that does not reduce position. ' +
                '\n- `"siblingFilledCanceled"`: Canceled due to sibling ordering being filled. ' +
                '\n- `"delistedCanceled"`: Canceled due to asset delisting. ' +
                '\n- `"liquidatedCanceled"`: Canceled due to liquidation. ' +
                '\n- `"scheduledCancel"`: Canceled due to exceeding scheduled cancel deadline (dead man\'s switch).',
            ),
          ),
          /** Timestamp when the status was last updated (in ms since epoch). */
          statusTimestamp: v.pipe(
            UnsignedInteger,
            v.description("Timestamp when the status was last updated (in ms since epoch)."),
          ),
        }),
        v.description("Order with its current processing status."),
      ),
    ),
    v.description("Event of array of orders with their current processing status."),
  );
})();
export type OrderUpdatesEvent = v.InferOutput<typeof OrderUpdatesEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode orderUpdates} function. */
export type OrderUpdatesParameters = Omit<v.InferInput<typeof OrderUpdatesRequest>, "type">;

/**
 * Subscribe to order status updates for a specific user.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
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
 */
export function orderUpdates(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<OrderUpdatesParameters>,
  listener: (data: OrderUpdatesEvent) => void,
): Promise<Subscription> {
  const payload = parser(OrderUpdatesRequest)({ type: "orderUpdates", ...params });
  return config.transport.subscribe<OrderUpdatesEvent>(payload.type, payload, (e) => {
    listener(e.detail);
  });
}
