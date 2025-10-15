import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_base.ts";
import type { Subscription } from "../../transport/base.ts";

import { DetailedOrderSchema, OrderProcessingStatusSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/** Subscription to user historical orders for a specific user. */
export const UserHistoricalOrdersRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("userHistoricalOrders"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to user historical orders for a specific user."),
  );
})();
export type UserHistoricalOrdersRequest = v.InferOutput<typeof UserHistoricalOrdersRequest>;

/** Event of user historical orders. */
export const UserHistoricalOrdersEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Array of frontend orders with current processing status. */
      orderHistory: v.pipe(
        v.array(
          /** Frontend order with current processing status. */
          v.pipe(
            v.object({
              /** Order details. */
              order: DetailedOrderSchema,
              /** Order processing status. */
              status: OrderProcessingStatusSchema,
              /** Timestamp when the status was last updated (in ms since epoch). */
              statusTimestamp: v.pipe(
                UnsignedInteger,
                v.description("Timestamp when the status was last updated (in ms since epoch)."),
              ),
            }),
            v.description("Frontend order with current processing status."),
          ),
        ),
        v.description("Array of frontend orders with current processing status."),
      ),
      /** Whether this is an initial snapshot. */
      isSnapshot: v.pipe(
        v.optional(v.literal(true)),
        v.description("Whether this is an initial snapshot."),
      ),
    }),
    v.description("Event of user historical orders."),
  );
})();
export type UserHistoricalOrdersEvent = v.InferOutput<typeof UserHistoricalOrdersEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userHistoricalOrders} function. */
export type UserHistoricalOrdersParameters = Omit<v.InferInput<typeof UserHistoricalOrdersRequest>, "type">;

/**
 * Subscribe to historical order updates for a specific user.
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
 * import { userHistoricalOrders } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await userHistoricalOrders(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function userHistoricalOrders(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<UserHistoricalOrdersParameters>,
  listener: (data: UserHistoricalOrdersEvent) => void,
): Promise<Subscription> {
  const payload = parser(UserHistoricalOrdersRequest)({ type: "userHistoricalOrders", ...params });
  return config.transport.subscribe<UserHistoricalOrdersEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
