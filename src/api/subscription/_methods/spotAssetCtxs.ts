import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal } from "../../_schemas.ts";

/** Subscription to context events for all spot assets. */
export const SpotAssetCtxsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("spotAssetCtxs"),
        v.description("Type of subscription."),
      ),
    }),
    v.description("Subscription to context events for all spot assets."),
  );
})();
export type SpotAssetCtxsRequest = v.InferOutput<typeof SpotAssetCtxsRequest>;

/** Event of spot asset contexts. */
export const SpotAssetCtxsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.object({
        /** Previous day's closing price. */
        prevDayPx: v.pipe(
          UnsignedDecimal,
          v.description("Previous day's closing price."),
        ),
        /** Daily notional volume. */
        dayNtlVlm: v.pipe(
          UnsignedDecimal,
          v.description("Daily notional volume."),
        ),
        /** Mark price. */
        markPx: v.pipe(
          UnsignedDecimal,
          v.description("Mark price."),
        ),
        /** Mid price. */
        midPx: v.pipe(
          v.nullable(UnsignedDecimal),
          v.description("Mid price."),
        ),
        /** Circulating supply. */
        circulatingSupply: v.pipe(
          UnsignedDecimal,
          v.description("Circulating supply."),
        ),
        /** Asset symbol. */
        coin: v.pipe(
          v.string(),
          v.description("Asset symbol."),
        ),
        /** Total supply. */
        totalSupply: v.pipe(
          UnsignedDecimal,
          v.description("Total supply."),
        ),
        /** Daily volume in base currency. */
        dayBaseVlm: v.pipe(
          UnsignedDecimal,
          v.description("Daily volume in base currency."),
        ),
      }),
    ),
    v.description("Event of spot asset contexts."),
  );
})();
export type SpotAssetCtxsEvent = v.InferOutput<typeof SpotAssetCtxsEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { WebSocketSubscription } from "../../../transport/websocket/mod.ts";

/**
 * Subscribe to context updates for all spot assets.
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
 * import { spotAssetCtxs } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
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
): Promise<WebSocketSubscription> {
  const payload = v.parse(SpotAssetCtxsRequest, { type: "spotAssetCtxs" });
  return config.transport.subscribe<SpotAssetCtxsEvent>(payload.type, payload, (e) => {
    listener(e.detail);
  });
}
