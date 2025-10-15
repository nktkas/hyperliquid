import * as v from "valibot";
import { parser, UnsignedDecimal } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

import { SpotMetaResponse } from "./spotMeta.ts";

// -------------------- Schemas --------------------

/**
 * Request spot metadata and asset contexts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
 */
export const SpotMetaAndAssetCtxsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("spotMetaAndAssetCtxs"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request spot metadata and asset contexts."),
  );
})();
export type SpotMetaAndAssetCtxsRequest = v.InferOutput<typeof SpotMetaAndAssetCtxsRequest>;

/**
 * Metadata and context for spot assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
 */
export const SpotMetaAndAssetCtxsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.tuple([
      SpotMetaResponse,
      /** Context for each spot asset. */
      v.pipe(
        v.array(
          /** Context for a specific spot asset. */
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
            v.description("Context for a specific spot asset."),
          ),
        ),
        v.description("Context for each spot asset."),
      ),
    ]),
    v.description("Metadata and context for spot assets."),
  );
})();
export type SpotMetaAndAssetCtxsResponse = v.InferOutput<typeof SpotMetaAndAssetCtxsResponse>;

// -------------------- Function --------------------

/**
 * Request spot metadata and asset contexts.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Metadata and context for spot assets.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotMetaAndAssetCtxs } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await spotMetaAndAssetCtxs({ transport });
 * ```
 */
export function spotMetaAndAssetCtxs(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<SpotMetaAndAssetCtxsResponse> {
  const request = parser(SpotMetaAndAssetCtxsRequest)({
    type: "spotMetaAndAssetCtxs",
  });
  return config.transport.request("info", request, signal);
}
