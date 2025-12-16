import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { PerpAssetCtxSchema } from "../../info/_methods/_base/commonSchemas.ts";

/** Subscription to context events for a specific perpetual asset. */
export const ActiveAssetCtxRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("activeAssetCtx"),
        v.description("Type of subscription."),
      ),
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
    }),
    v.description("Subscription to context events for a specific perpetual asset."),
  );
})();
export type ActiveAssetCtxRequest = v.InferOutput<typeof ActiveAssetCtxRequest>;

/** Event of active perpetual asset context. */
export const ActiveAssetCtxEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
      /** Context for a specific perpetual asset. */
      ctx: v.pipe(
        PerpAssetCtxSchema,
        v.description("Context for a specific perpetual asset."),
      ),
    }),
    v.description("Event of active perpetual asset context."),
  );
})();
export type ActiveAssetCtxEvent = v.InferOutput<typeof ActiveAssetCtxEvent>;

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
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
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
