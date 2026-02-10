import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import type { SpotAssetCtxSchema } from "../../info/_methods/_base/commonSchemas.ts";

/**
 * Subscription to context events for all spot assets.
 */
export const SpotAssetCtxsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("spotAssetCtxs"),
  });
})();
export type SpotAssetCtxsRequest = v.InferOutput<typeof SpotAssetCtxsRequest>;

/**
 * vent of spot asset contexts.
 */
export type SpotAssetCtxsEvent = SpotAssetCtxSchema[];

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/**
 * Subscribe to context updates for all spot assets.
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
 * import { spotAssetCtxs } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await spotAssetCtxs(
 *   { transport },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function spotAssetCtxs(
  config: SubscriptionConfig,
  listener: (data: SpotAssetCtxsEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(SpotAssetCtxsRequest, { type: "spotAssetCtxs" });
  return config.transport.subscribe<SpotAssetCtxsEvent>(payload.type, payload, (e) => {
    listener(e.detail);
  });
}
