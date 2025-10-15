import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_base.ts";
import type { Subscription } from "../../transport/base.ts";

import { DetailedOrderSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/** Subscription to open order events for a specific user. */
export const OpenOrdersRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("openOrders"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.optional(v.string()),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Subscription to open order events for a specific user."),
  );
})();
export type OpenOrdersRequest = v.InferOutput<typeof OpenOrdersRequest>;

/** Event of open orders for a specific user. */
export const OpenOrdersEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.string(),
        v.description("DEX name (empty string for main dex)."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Array of open orders with additional display information. */
      orders: v.pipe(
        v.array(DetailedOrderSchema),
        v.description("Array of open orders with additional display information."),
      ),
    }),
    v.description("Event of open orders for a specific user."),
  );
})();
export type OpenOrdersEvent = v.InferOutput<typeof OpenOrdersEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode openOrders} function. */
export type OpenOrdersParameters = Omit<v.InferInput<typeof OpenOrdersRequest>, "type">;

/**
 * Subscribe to open orders updates for a specific user.
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
 * import { openOrders } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await openOrders(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function openOrders(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<OpenOrdersParameters>,
  listener: (data: OpenOrdersEvent) => void,
): Promise<Subscription> {
  const payload = parser(OpenOrdersRequest)({
    type: "openOrders",
    ...params,
    dex: params.dex ?? "", // same value as in response
  });
  return config.transport.subscribe<OpenOrdersEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user && e.detail.dex === payload.dex) {
      listener(e.detail);
    }
  });
}
