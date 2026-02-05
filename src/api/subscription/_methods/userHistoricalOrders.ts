import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { HistoricalOrdersResponse } from "../../info/_methods/historicalOrders.ts";

/** Subscription to user historical orders for a specific user. */
export const UserHistoricalOrdersRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("userHistoricalOrders"),
    /** User address. */
    user: Address,
  });
})();
export type UserHistoricalOrdersRequest = v.InferOutput<typeof UserHistoricalOrdersRequest>;

/** Event of user historical orders. */
export const UserHistoricalOrdersEvent = /* @__PURE__ */ (() => {
  return v.object({
    /** User address. */
    user: Address,
    /** Array of frontend orders with current processing status. */
    orderHistory: HistoricalOrdersResponse,
    /** Whether this is an initial snapshot. */
    isSnapshot: v.optional(v.literal(true)),
  });
})();
export type UserHistoricalOrdersEvent = v.InferOutput<typeof UserHistoricalOrdersEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode userHistoricalOrders} function. */
export type UserHistoricalOrdersParameters = Omit<v.InferInput<typeof UserHistoricalOrdersRequest>, "type">;

/**
 * Subscribe to historical order updates for a specific user.
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
 * import { userHistoricalOrders } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await userHistoricalOrders(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function userHistoricalOrders(
  config: SubscriptionConfig,
  params: UserHistoricalOrdersParameters,
  listener: (data: UserHistoricalOrdersEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(UserHistoricalOrdersRequest, { type: "userHistoricalOrders", ...params });
  return config.transport.subscribe<UserHistoricalOrdersEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
