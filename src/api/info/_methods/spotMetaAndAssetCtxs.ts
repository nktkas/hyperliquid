import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal } from "../../_schemas.ts";
import { SpotMetaResponse } from "./spotMeta.ts";

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
      /** Asset context for each spot asset. */
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
        v.description("Asset context for each spot asset."),
      ),
    ]),
    v.description("Metadata and context for spot assets."),
  );
})();
export type SpotMetaAndAssetCtxsResponse = v.InferOutput<typeof SpotMetaAndAssetCtxsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/**
 * Request spot metadata and asset contexts.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Metadata and context for spot assets.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotMetaAndAssetCtxs } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await spotMetaAndAssetCtxs({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
 */
export function spotMetaAndAssetCtxs(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<SpotMetaAndAssetCtxsResponse> {
  const request = v.parse(SpotMetaAndAssetCtxsRequest, {
    type: "spotMetaAndAssetCtxs",
  });
  return config.transport.request("info", request, signal);
}
