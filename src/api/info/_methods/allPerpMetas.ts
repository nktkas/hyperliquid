import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { MetaResponse } from "./meta.ts";

/**
 * Request trading metadata for all DEXes.
 */
export const AllPerpMetasRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("allPerpMetas"),
  });
})();
export type AllPerpMetasRequest = v.InferOutput<typeof AllPerpMetasRequest>;

/**
 * Metadata for perpetual assets across all DEXes.
 */
export const AllPerpMetasResponse = /* @__PURE__ */ (() => {
  return v.array(MetaResponse);
})();
export type AllPerpMetasResponse = v.InferOutput<typeof AllPerpMetasResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request trading metadata for all DEXes.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Metadata for perpetual assets across all DEXes.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { allPerpMetas } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await allPerpMetas({ transport });
 * ```
 */
export function allPerpMetas(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<AllPerpMetasResponse> {
  const request = v.parse(AllPerpMetasRequest, {
    type: "allPerpMetas",
  });
  return config.transport.request("info", request, signal);
}
