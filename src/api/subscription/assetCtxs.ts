import * as v from "valibot";
import { Decimal, type DeepImmutable, parser, UnsignedDecimal } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

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
        v.array(
          /** Context for a specific perpetual asset. */
          v.pipe(
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
            v.description("Context for a specific perpetual asset."),
          ),
        ),
        v.description("Array of context information for each perpetual asset."),
      ),
    }),
    v.description("Event of asset contexts for all perpetual assets on a specified DEX."),
  );
})();
export type AssetCtxsEvent = v.InferOutput<typeof AssetCtxsEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode assetCtxs} function. */
export type AssetCtxsParameters = Omit<v.InferInput<typeof AssetCtxsRequest>, "type">;

/**
 * Subscribe to asset contexts for all perpetual assets.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
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
 */
export function assetCtxs(
  config: SubscriptionRequestConfig,
  listener: (data: AssetCtxsEvent) => void,
): Promise<Subscription>;
export function assetCtxs(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<AssetCtxsParameters>,
  listener: (data: AssetCtxsEvent) => void,
): Promise<Subscription>;
export function assetCtxs(
  config: SubscriptionRequestConfig,
  paramsOrListener: DeepImmutable<AssetCtxsParameters> | ((data: AssetCtxsEvent) => void),
  maybeListener?: (data: AssetCtxsEvent) => void,
): Promise<Subscription> {
  const params = typeof paramsOrListener === "function" ? {} : paramsOrListener;
  const listener = typeof paramsOrListener === "function" ? paramsOrListener : maybeListener!;

  const payload = parser(AssetCtxsRequest)({
    type: "assetCtxs",
    ...params,
    dex: params.dex ?? "",
  });
  return config.transport.subscribe<AssetCtxsEvent>(payload.type, payload, (e) => {
    if (e.detail.dex === payload.dex) {
      listener(e.detail);
    }
  });
}
