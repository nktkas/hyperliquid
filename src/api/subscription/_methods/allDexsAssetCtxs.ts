import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import type { PerpAssetCtxSchema } from "../../info/_methods/_base/commonSchemas.ts";

/**
 * Subscription to asset context events for all DEXs.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const AllDexsAssetCtxsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("allDexsAssetCtxs"),
  });
})();
export type AllDexsAssetCtxsRequest = v.InferOutput<typeof AllDexsAssetCtxsRequest>;

/**
 * Event of asset contexts for all DEXs.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export type AllDexsAssetCtxsEvent = {
  /** Array of tuples of dex names and contexts for each perpetual asset. */
  ctxs: [dex: string, ctx: PerpAssetCtxSchema[]][];
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ISubscription } from "../../../transport/mod.ts";
import type { SubscriptionConfig } from "./_types.ts";

/**
 * Subscribe to asset contexts for all DEXs.
 *
 * @param config General configuration for Subscription API subscriptions.
 * @param listener A callback function to be called when the event is received.
 * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { allDexsAssetCtxs } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await allDexsAssetCtxs(
 *   { transport },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function allDexsAssetCtxs(
  config: SubscriptionConfig,
  listener: (data: AllDexsAssetCtxsEvent) => void,
): Promise<ISubscription> {
  const payload = parse(AllDexsAssetCtxsRequest, {
    type: "allDexsAssetCtxs",
  });
  return config.transport.subscribe<AllDexsAssetCtxsEvent>(payload.type, payload, (e) => {
    listener(e.detail);
  });
}
