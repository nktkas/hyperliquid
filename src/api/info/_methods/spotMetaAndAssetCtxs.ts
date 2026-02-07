import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import type { SpotAssetCtxSchema } from "./_base/commonSchemas.ts";
import type { SpotMetaResponse } from "./spotMeta.ts";

/**
 * Request spot metadata and asset contexts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
 */
export const SpotMetaAndAssetCtxsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("spotMetaAndAssetCtxs"),
  });
})();
export type SpotMetaAndAssetCtxsRequest = v.InferOutput<typeof SpotMetaAndAssetCtxsRequest>;

/**
 * Tuple of spot metadata and asset contexts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
 */
export type SpotMetaAndAssetCtxsResponse = [meta: SpotMetaResponse, assetCtxs: SpotAssetCtxSchema[]];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request spot metadata and asset contexts.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
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
