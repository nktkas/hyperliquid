import * as v from "valibot";
import { Decimal, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request metadata and asset contexts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
 */
export const MetaAndAssetCtxsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("metaAndAssetCtxs"),
        v.description("Type of request."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.optional(v.string()),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Request metadata and asset contexts."),
  );
})();
export type MetaAndAssetCtxsRequest = v.InferOutput<typeof MetaAndAssetCtxsRequest>;

/**
 * Metadata and context for perpetual assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
 */
export const MetaAndAssetCtxsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.tuple([
      /** Metadata for assets. */
      v.pipe(
        v.object({
          /** Trading universes available for perpetual trading. */
          universe: v.pipe(
            v.array(
              /** Trading universe parameters for perpetual asset. */
              v.pipe(
                v.object({
                  /** Minimum decimal places for order sizes. */
                  szDecimals: v.pipe(
                    UnsignedInteger,
                    v.description("Minimum decimal places for order sizes."),
                  ),
                  /** Name of the universe. */
                  name: v.pipe(
                    v.string(),
                    v.description("Name of the universe."),
                  ),
                  /** Maximum allowed leverage. */
                  maxLeverage: v.pipe(
                    UnsignedInteger,
                    v.minValue(1),
                    v.description("Maximum allowed leverage."),
                  ),
                  /** Unique identifier for the margin requirements table. */
                  marginTableId: v.pipe(
                    UnsignedInteger,
                    v.description("Unique identifier for the margin requirements table."),
                  ),
                  /** Indicates if only isolated margin trading is allowed. */
                  onlyIsolated: v.pipe(
                    v.optional(v.literal(true)),
                    v.description("Indicates if only isolated margin trading is allowed."),
                  ),
                  /** Indicates if the universe is delisted. */
                  isDelisted: v.pipe(
                    v.optional(v.literal(true)),
                    v.description("Indicates if the universe is delisted."),
                  ),
                }),
                v.description("Trading universe parameters for perpetual asset."),
              ),
            ),
            v.description("Trading universes available for perpetual trading."),
          ),
          /** Margin requirement tables for different leverage tiers. */
          marginTables: v.pipe(
            v.array(
              /** Tuple of margin table ID and its details. */
              v.pipe(
                v.tuple([
                  UnsignedInteger,
                  v.object({
                    /** Description of the margin table. */
                    description: v.pipe(
                      v.string(),
                      v.description("Description of the margin table."),
                    ),
                    /** Array of margin tiers defining leverage limits. */
                    marginTiers: v.pipe(
                      v.array(
                        /** Individual tier in a margin requirements table. */
                        v.pipe(
                          v.object({
                            /** Lower position size boundary for this tier. */
                            lowerBound: v.pipe(
                              UnsignedDecimal,
                              v.description("Lower position size boundary for this tier."),
                            ),
                            /** Maximum allowed leverage for this tier. */
                            maxLeverage: v.pipe(
                              UnsignedInteger,
                              v.minValue(1),
                              v.description("Maximum allowed leverage for this tier."),
                            ),
                          }),
                          v.description("Individual tier in a margin requirements table."),
                        ),
                      ),
                      v.description("Array of margin tiers defining leverage limits."),
                    ),
                  }),
                ]),
                v.description("Tuple of margin table ID and its details."),
              ),
            ),
            v.description("Margin requirement tables for different leverage tiers."),
          ),
        }),
        v.description("Metadata for assets."),
      ),
      /** Array of contexts for each perpetual asset. */
      v.pipe(
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
        v.description("Array of contexts for each perpetual asset."),
      ),
    ]),
    v.description("Metadata and context for perpetual assets."),
  );
})();
export type MetaAndAssetCtxsResponse = v.InferOutput<typeof MetaAndAssetCtxsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode metaAndAssetCtxs} function. */
export type MetaAndAssetCtxsParameters = Omit<v.InferInput<typeof MetaAndAssetCtxsRequest>, "type">;

/**
 * Request metadata and asset contexts.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Metadata and context for perpetual assets.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { metaAndAssetCtxs } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await metaAndAssetCtxs({ transport });
 * ```
 */
export function metaAndAssetCtxs(
  config: InfoRequestConfig,
  params?: DeepImmutable<MetaAndAssetCtxsParameters>,
  signal?: AbortSignal,
): Promise<MetaAndAssetCtxsResponse>;
export function metaAndAssetCtxs(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<MetaAndAssetCtxsResponse>;
export function metaAndAssetCtxs(
  config: InfoRequestConfig,
  paramsOrSignal?: DeepImmutable<MetaAndAssetCtxsParameters> | AbortSignal,
  maybeSignal?: AbortSignal,
): Promise<MetaAndAssetCtxsResponse> {
  const params = paramsOrSignal instanceof AbortSignal ? {} : paramsOrSignal;
  const signal = paramsOrSignal instanceof AbortSignal ? paramsOrSignal : maybeSignal;

  const request = parser(MetaAndAssetCtxsRequest)({
    type: "metaAndAssetCtxs",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
