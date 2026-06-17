import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import type { PerpAssetCtx } from "../../info/_methods/_base/mod.ts";

/**
 * Subscription to context events for all perpetual assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const AssetCtxsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("assetCtxs"),
    /** DEX name (empty string for main dex). */
    dex: v.optional(v.string()),
  });
})();
export type AssetCtxsRequest = v.InferOutput<typeof AssetCtxsRequest>;

/**
 * Event of asset contexts for all perpetual assets on a specified DEX.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export type AssetCtxsEvent = {
  /** DEX name (empty string for main dex). */
  dex: string;
  /** Array of context information for each perpetual asset. */
  ctxs: PerpAssetCtx[];
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ISubscription } from "../../../transport/mod.ts";
import type { SubscriptionConfig, SubscriptionOptions } from "./_base/mod.ts";

/** Request parameters for the {@linkcode assetCtxs} function. */
export type AssetCtxsParameters = Omit<v.InferInput<typeof AssetCtxsRequest>, "type">;

/**
 * Subscribe to asset contexts for all perpetual assets.
 *
 * @param config General configuration for Subscription API subscriptions.
 * @param params Parameters specific to the API subscription.
 * @param listener A callback function to be called when the event is received.
 * @param options Options to control the subscription lifecycle.
 * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { assetCtxs } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
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
  options?: SubscriptionOptions,
): Promise<ISubscription>;
export function assetCtxs(
  config: SubscriptionConfig,
  params: AssetCtxsParameters,
  listener: (data: AssetCtxsEvent) => void,
  options?: SubscriptionOptions,
): Promise<ISubscription>;
export function assetCtxs(
  config: SubscriptionConfig,
  paramsOrListener: AssetCtxsParameters | ((data: AssetCtxsEvent) => void),
  listenerOrOptions?: ((data: AssetCtxsEvent) => void) | SubscriptionOptions,
  maybeOptions?: SubscriptionOptions,
): Promise<ISubscription> {
  const isListenerFirst = typeof paramsOrListener === "function";
  const params = isListenerFirst ? {} : paramsOrListener;
  const listener = isListenerFirst ? paramsOrListener : listenerOrOptions as (data: AssetCtxsEvent) => void;
  const options = isListenerFirst ? listenerOrOptions as SubscriptionOptions | undefined : maybeOptions;

  const payload = parse(AssetCtxsRequest, {
    type: "assetCtxs",
    ...params,
    dex: params.dex ?? "", // same value as in response
  });
  return config.transport.subscribe<AssetCtxsEvent>(payload.type, payload, (e) => {
    if (e.detail.dex === payload.dex) {
      listener(e.detail);
    }
  }, options);
}
