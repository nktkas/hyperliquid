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
 * Array of tuples containing maximum market order notionals and their corresponding asset symbols.
 * @see null
 */
export type MaxMarketOrderNtlsResponse = [notional: number, symbol: string][];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request maximum market order notionals.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Maximum market order notionals.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
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
  const request = v.parse(MaxMarketOrderNtlsRequest, {
    type: "maxMarketOrderNtls",
  });
  return config.transport.request("info", request, signal);
}
