import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Decimal, UnsignedDecimal } from "../../_schemas.ts";

/** Subscription to asset context events for all DEXs. */
export const AllDexsAssetCtxsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("allDexsAssetCtxs"),
        v.description("Type of subscription."),
      ),
    }),
    v.description("Subscription to asset context events for all DEXs."),
  );
})();
export type AllDexsAssetCtxsRequest = v.InferOutput<typeof AllDexsAssetCtxsRequest>;

/** Event of asset contexts for all DEXs. */
export const AllDexsAssetCtxsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Array of tuples of dex names and contexts for each perpetual asset. */
      ctxs: v.pipe(
        v.array(
          v.tuple([
            v.string(),
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
                /** Funding rate. */
                funding: v.pipe(
                  Decimal,
                  v.description("Funding rate."),
                ),
                /** Total open interest. */
                openInterest: v.pipe(
                  UnsignedDecimal,
                  v.description("Total open interest."),
                ),
                /** Premium price. */
                premium: v.pipe(
                  v.nullable(Decimal),
                  v.description("Premium price."),
                ),
                /** Oracle price. */
                oraclePx: v.pipe(
                  UnsignedDecimal,
                  v.description("Oracle price."),
                ),
                /** Array of impact prices. */
                impactPxs: v.pipe(
                  v.nullable(v.array(v.string())),
                  v.description("Array of impact prices."),
                ),
                /** Daily volume in base currency. */
                dayBaseVlm: v.pipe(
                  UnsignedDecimal,
                  v.description("Daily volume in base currency."),
                ),
              }),
            ),
          ]),
        ),
        v.description("Array of tuples of dex names and contexts for each perpetual asset."),
      ),
    }),
    v.description("Event of asset contexts for all DEXs."),
  );
})();
export type AllDexsAssetCtxsEvent = v.InferOutput<typeof AllDexsAssetCtxsEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { WebSocketSubscription } from "../../../transport/websocket/mod.ts";

/**
 * Subscribe to asset contexts for all DEXs.
 *
 * @param config - General configuration for Subscription API subscriptions.
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
 * import { allDexsAssetCtxs } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
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
): Promise<WebSocketSubscription> {
  const payload = v.parse(AllDexsAssetCtxsRequest, {
    type: "allDexsAssetCtxs",
  });
  return config.transport.subscribe<AllDexsAssetCtxsEvent>(payload.type, payload, (e) => {
    listener(e.detail);
  });
}
