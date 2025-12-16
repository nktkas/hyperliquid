import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { PerpAssetCtxSchema } from "./_base/commonSchemas.ts";
import { MetaResponse } from "./meta.ts";

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
 * Tuple containing metadata and array of asset contexts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
 */
export const MetaAndAssetCtxsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.tuple([
      MetaResponse,
      v.array(PerpAssetCtxSchema),
    ]),
    v.description("Tuple containing metadata and array of asset contexts."),
  );
})();
export type MetaAndAssetCtxsResponse = v.InferOutput<typeof MetaAndAssetCtxsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode metaAndAssetCtxs} function. */
export type MetaAndAssetCtxsParameters = Omit<v.InferInput<typeof MetaAndAssetCtxsRequest>, "type">;

/**
 * Request metadata and asset contexts.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Metadata and context for perpetual assets.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { metaAndAssetCtxs } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await metaAndAssetCtxs({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
 */
export function metaAndAssetCtxs(
  config: InfoConfig,
  params?: MetaAndAssetCtxsParameters,
  signal?: AbortSignal,
): Promise<MetaAndAssetCtxsResponse>;
export function metaAndAssetCtxs(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<MetaAndAssetCtxsResponse>;
export function metaAndAssetCtxs(
  config: InfoConfig,
  paramsOrSignal?: MetaAndAssetCtxsParameters | AbortSignal,
  maybeSignal?: AbortSignal,
): Promise<MetaAndAssetCtxsResponse> {
  const params = paramsOrSignal instanceof AbortSignal ? {} : paramsOrSignal;
  const signal = paramsOrSignal instanceof AbortSignal ? paramsOrSignal : maybeSignal;

  const request = v.parse(MetaAndAssetCtxsRequest, {
    type: "metaAndAssetCtxs",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
