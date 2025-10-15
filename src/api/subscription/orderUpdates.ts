import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_base.ts";
import type { Subscription } from "../../transport/base.ts";

import { OrderProcessingStatusSchema, OrderSchema } from "../_common_schemas.ts";

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
          order: OrderSchema,
          /** Order processing status. */
          status: OrderProcessingStatusSchema,
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
