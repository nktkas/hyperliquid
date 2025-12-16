import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { PerpAssetCtxSchema } from "../../info/_methods/_base/commonSchemas.ts";

/** Subscription to context events for all perpetual assets. */
export const AssetCtxsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("assetCtxs"),
        v.description("Type of subscription."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.optional(v.string()),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Subscription to context events for all perpetual assets."),
  );
})();
export type AssetCtxsRequest = v.InferOutput<typeof AssetCtxsRequest>;

/** Event of asset contexts for all perpetual assets on a specified DEX. */
export const AssetCtxsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.string(),
        v.description("DEX name (empty string for main dex)."),
      ),
      /** Array of context information for each perpetual asset. */
      ctxs: v.pipe(
        v.array(PerpAssetCtxSchema),
        v.description("Array of context information for each perpetual asset."),
      ),
    }),
    v.description("Event of asset contexts for all perpetual assets on a specified DEX."),
  );
})();
export type AssetCtxsEvent = v.InferOutput<typeof AssetCtxsEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/_base.ts";

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
