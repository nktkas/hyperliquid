import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import type { PerpAssetCtxSchema } from "../../info/_methods/_base/commonSchemas.ts";

/**
 * Subscription to context events for a specific perpetual asset.
 */
export const ActiveAssetCtxRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("activeAssetCtx"),
    /** Asset symbol (e.g., BTC). */
    coin: v.string(),
  });
})();
export type ActiveAssetCtxRequest = v.InferOutput<typeof ActiveAssetCtxRequest>;

/**
 * Event of active perpetual asset context.
 */
export type ActiveAssetCtxEvent = {
  /** Asset symbol (e.g., BTC). */
  coin: string;
  /** Context for a specific perpetual asset. */
  ctx: PerpAssetCtxSchema;
};

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode activeAssetCtx} function. */
export type ActiveAssetCtxParameters = Omit<v.InferInput<typeof ActiveAssetCtxRequest>, "type">;

/**
 * Subscribe to context updates for a specific perpetual asset.
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
 * import { activeAssetCtx } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await activeAssetCtx(
 *   { transport },
 *   { coin: "ETH" },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function activeAssetCtx(
  config: SubscriptionConfig,
  params: ActiveAssetCtxParameters,
  listener: (data: ActiveAssetCtxEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(ActiveAssetCtxRequest, { type: "activeAssetCtx", ...params });
  return config.transport.subscribe<ActiveAssetCtxEvent>(payload.type, payload, (e) => {
    if (e.detail.coin === payload.coin) {
      listener(e.detail);
    }
  });
}
