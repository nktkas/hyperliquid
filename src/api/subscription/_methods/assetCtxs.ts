import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { PerpAssetCtxSchema } from "../../info/_methods/_base/commonSchemas.ts";

/** Subscription to context events for all perpetual assets. */
export const AssetCtxsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("assetCtxs"),
    /** DEX name (empty string for main dex). */
    dex: v.optional(v.string()),
  });
})();
export type AssetCtxsRequest = v.InferOutput<typeof AssetCtxsRequest>;

/** Event of asset contexts for all perpetual assets on a specified DEX. */
export const AssetCtxsEvent = /* @__PURE__ */ (() => {
  return v.object({
    /** DEX name (empty string for main dex). */
    dex: v.string(),
    /** Array of context information for each perpetual asset. */
    ctxs: v.array(PerpAssetCtxSchema),
  });
})();
export type AssetCtxsEvent = v.InferOutput<typeof AssetCtxsEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode assetCtxs} function. */
export type AssetCtxsParameters = Omit<v.InferInput<typeof AssetCtxsRequest>, "type">;

/**
 * Subscribe to asset contexts for all perpetual assets.
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
 * import { assetCtxs } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await assetCtxs(
 *   { transport },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function assetCtxs(
  config: SubscriptionConfig,
  listener: (data: AssetCtxsEvent) => void,
): Promise<ISubscription>;
export function assetCtxs(
  config: SubscriptionConfig,
  params: AssetCtxsParameters,
  listener: (data: AssetCtxsEvent) => void,
): Promise<ISubscription>;
export function assetCtxs(
  config: SubscriptionConfig,
  paramsOrListener: AssetCtxsParameters | ((data: AssetCtxsEvent) => void),
  maybeListener?: (data: AssetCtxsEvent) => void,
): Promise<ISubscription> {
  const params = typeof paramsOrListener === "function" ? {} : paramsOrListener;
  const listener = typeof paramsOrListener === "function" ? paramsOrListener : maybeListener!;

  const payload = v.parse(AssetCtxsRequest, {
    type: "assetCtxs",
    ...params,
    dex: params.dex ?? "", // same value as in response
  });
  return config.transport.subscribe<AssetCtxsEvent>(payload.type, payload, (e) => {
    if (e.detail.dex === payload.dex) {
      listener(e.detail);
    }
  });
}
