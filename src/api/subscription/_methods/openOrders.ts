import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { FrontendOpenOrdersResponse } from "../../info/_methods/frontendOpenOrders.ts";

/** Subscription to open order events for a specific user. */
export const OpenOrdersRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("openOrders"),
    /** User address. */
    user: Address,
    /** DEX name (empty string for main dex). */
    dex: v.optional(v.string()),
  });
})();
export type OpenOrdersRequest = v.InferOutput<typeof OpenOrdersRequest>;

/** Event of open orders for a specific user. */
export const OpenOrdersEvent = /* @__PURE__ */ (() => {
  return v.object({
    /** DEX name (empty string for main dex). */
    dex: v.string(),
    /** User address. */
    user: Address,
    /** Array of open orders with additional display information. */
    orders: FrontendOpenOrdersResponse,
  });
})();
export type OpenOrdersEvent = v.InferOutput<typeof OpenOrdersEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode openOrders} function. */
export type OpenOrdersParameters = Omit<v.InferInput<typeof OpenOrdersRequest>, "type">;

/**
 * Subscribe to open orders updates for a specific user.
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
 * import { openOrders } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await openOrders(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function openOrders(
  config: SubscriptionConfig,
  params: OpenOrdersParameters,
  listener: (data: OpenOrdersEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(OpenOrdersRequest, {
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
