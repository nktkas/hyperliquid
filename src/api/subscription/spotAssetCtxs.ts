import * as v from "valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal } from "../_base.ts";

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

import { parser } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_types.ts";
import type { Subscription } from "../../transport/base.ts";

/** Request parameters for the {@linkcode spotAssetCtxs} function. */
export type SpotAssetCtxsParameters = Omit<v.InferInput<typeof SpotAssetCtxsRequest>, "type">;

/**
 * Subscribe to context updates for all spot assets.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
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
 */
export function spotAssetCtxs(
  config: SubscriptionRequestConfig,
  listener: (data: SpotAssetCtxsEvent) => void,
): Promise<Subscription> {
  const payload = parser(SpotAssetCtxsRequest)({ type: "spotAssetCtxs" });
  return config.transport.subscribe<SpotAssetCtxsEvent>(payload.type, payload, (e) => {
    listener(e.detail);
  });
}
