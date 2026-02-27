import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import type { MetaResponse } from "./meta.ts";

/**
 * Request trading metadata for all DEXes.
 * @see null
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
 * @see null
 */
export type AllPerpMetasResponse = MetaResponse[];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/**
 * Request trading metadata for all DEXes.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Metadata for perpetual assets across all DEXes.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
 *
 * @see null
 */
export function allPerpMetas(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<AllPerpMetasResponse> {
  const request = parse(AllPerpMetasRequest, {
    type: "allPerpMetas",
  });
  return config.transport.request("info", request, signal);
}
