import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import type { SpotAssetCtxSchema } from "../../info/_methods/_base/commonSchemas.ts";

/**
 * Subscription to context events for a specific spot asset.
 */
export const ActiveSpotAssetCtxRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("activeAssetCtx"),
    /** Asset ID (e.g., @1). */
    coin: v.string(),
  });
})();
export type ActiveSpotAssetCtxRequest = v.InferOutput<typeof ActiveSpotAssetCtxRequest>;

/**
 * Event of active spot asset context.
 */
export type ActiveSpotAssetCtxEvent = {
  /** Asset ID (e.g., @1). */
  coin: string;
  /** Context for a specific spot asset. */
  ctx: SpotAssetCtxSchema;
};

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode activeSpotAssetCtx} function. */
export type ActiveSpotAssetCtxParameters = Omit<v.InferInput<typeof ActiveSpotAssetCtxRequest>, "type">;

/**
 * Subscribe to context updates for a specific spot asset.
 *
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { activeSpotAssetCtx } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await activeSpotAssetCtx(
 *   { transport },
 *   { coin: "@1" },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function activeSpotAssetCtx(
  config: SubscriptionConfig,
  params: ActiveSpotAssetCtxParameters,
  listener: (data: ActiveSpotAssetCtxEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(ActiveSpotAssetCtxRequest, { type: "activeAssetCtx", ...params });
  return config.transport.subscribe<ActiveSpotAssetCtxEvent>("activeSpotAssetCtx", payload, (e) => {
    if (e.detail.coin === payload.coin) {
      listener(e.detail);
    }
  });
}
