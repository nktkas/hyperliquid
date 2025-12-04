import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { RecentTradesResponse } from "../../info/_methods/recentTrades.ts";

/** Subscription to trade events for a specific asset. */
export const TradesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("trades"),
        v.description("Type of subscription."),
      ),
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
    }),
    v.description("Subscription to trade events for a specific asset."),
  );
})();
export type TradesRequest = v.InferOutput<typeof TradesRequest>;

/** Event of array of trades for a specific asset. */
export const TradesEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    RecentTradesResponse,
    v.description("Event of array of trades for a specific asset."),
  );
})();
export type TradesEvent = v.InferOutput<typeof TradesEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { WebSocketSubscription } from "../../../transport/websocket/mod.ts";

/** Request parameters for the {@linkcode trades} function. */
export type TradesParameters = Omit<v.InferInput<typeof TradesRequest>, "type">;

/**
 * Subscribe to real-time trade updates for a specific asset.
 *
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 *
 * @returns A request-promise that resolves with a {@link WebSocketSubscription} object to manage the subscription lifecycle.
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
): Promise<WebSocketSubscription> {
  const payload = v.parse(TradesRequest, { type: "trades", ...params });
  return config.transport.subscribe<TradesEvent>(payload.type, payload, (e) => {
    if (e.detail[0]?.coin === payload.coin) {
      listener(e.detail);
    }
  });
}
