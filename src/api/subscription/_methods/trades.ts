import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { RecentTradesResponse } from "../../info/_methods/recentTrades.ts";

/** Subscription to trade events for a specific asset. */
export const TradesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("trades"),
    /** Asset symbol (e.g., BTC). */
    coin: v.string(),
  });
})();
export type TradesRequest = v.InferOutput<typeof TradesRequest>;

/** Event of array of trades for a specific asset. */
export const TradesEvent = /* @__PURE__ */ (() => {
  return RecentTradesResponse;
})();
export type TradesEvent = v.InferOutput<typeof TradesEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode trades} function. */
export type TradesParameters = Omit<v.InferInput<typeof TradesRequest>, "type">;

/**
 * Subscribe to real-time trade updates for a specific asset.
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
 * import { trades } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await trades(
 *   { transport },
 *   { coin: "ETH" },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function trades(
  config: SubscriptionConfig,
  params: TradesParameters,
  listener: (data: TradesEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(TradesRequest, { type: "trades", ...params });
  return config.transport.subscribe<TradesEvent>(payload.type, payload, (e) => {
    if (e.detail[0]?.coin === payload.coin) {
      listener(e.detail);
    }
  });
}
