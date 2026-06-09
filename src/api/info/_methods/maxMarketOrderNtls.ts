import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request maximum market order notionals.
 * @see null
 */
export const MaxMarketOrderNtlsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("maxMarketOrderNtls"),
  });
})();
export type MaxMarketOrderNtlsRequest = v.InferOutput<typeof MaxMarketOrderNtlsRequest>;

/**
 * Array of tuples of maximum leverage and its corresponding maximum market order notional.
 * @see null
 */
export type MaxMarketOrderNtlsResponse = [
  /** Maximum leverage. */
  maxLeverage: number,
  /**
   * Maximum market order notional.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  maxMarketOrderNtl: string,
][];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/mod.ts";

/**
 * Request maximum market order notionals.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Maximum market order notionals.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { maxMarketOrderNtls } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await maxMarketOrderNtls({ transport });
 * ```
 *
 * @see null
 */
export function maxMarketOrderNtls(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<MaxMarketOrderNtlsResponse> {
  const request = parse(MaxMarketOrderNtlsRequest, {
    type: "maxMarketOrderNtls",
  });
  return config.transport.request("info", request, signal);
}
