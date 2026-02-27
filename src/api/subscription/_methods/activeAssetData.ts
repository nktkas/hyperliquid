import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { ActiveAssetDataResponse } from "../../info/_methods/activeAssetData.ts";

/**
 * Subscription to active asset data events for a specific user and coin.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const ActiveAssetDataRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("activeAssetData"),
    /** Asset symbol (e.g., BTC). */
    coin: v.string(),
    /** User address. */
    user: Address,
  });
})();
export type ActiveAssetDataRequest = v.InferOutput<typeof ActiveAssetDataRequest>;

/**
 * Event of user active asset data.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export type ActiveAssetDataEvent = ActiveAssetDataResponse;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ISubscription } from "../../../transport/mod.ts";
import type { SubscriptionConfig } from "./_types.ts";

/** Request parameters for the {@linkcode activeAssetData} function. */
export type ActiveAssetDataParameters = Omit<v.InferInput<typeof ActiveAssetDataRequest>, "type">;

/**
 * Subscribe to trading data updates for a specific asset and user.
 *
 * @param config General configuration for Subscription API subscriptions.
 * @param params Parameters specific to the API subscription.
 * @param listener A callback function to be called when the event is received.
 * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { activeAssetData } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await activeAssetData(
 *   { transport },
 *   { coin: "ETH", user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function activeAssetData(
  config: SubscriptionConfig,
  params: ActiveAssetDataParameters,
  listener: (data: ActiveAssetDataEvent) => void,
): Promise<ISubscription> {
  const payload = parse(ActiveAssetDataRequest, { type: "activeAssetData", ...params });
  return config.transport.subscribe<ActiveAssetDataEvent>(payload.type, payload, (e) => {
    if (e.detail.coin === payload.coin && e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
