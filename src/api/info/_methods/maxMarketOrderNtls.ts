import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal } from "../../_schemas.ts";

/**
 * Request maximum market order notionals.
 */
export const MaxMarketOrderNtlsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("maxMarketOrderNtls"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request maximum market order notionals."),
  );
})();
export type MaxMarketOrderNtlsRequest = v.InferOutput<typeof MaxMarketOrderNtlsRequest>;

/**
 * Array of tuples containing maximum market order notionals and their corresponding asset symbols.
 */
export const MaxMarketOrderNtlsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.tuple([UnsignedDecimal, v.string()]),
    ),
    v.description("Array of tuples containing maximum market order notionals and their corresponding asset symbols."),
  );
})();
export type MaxMarketOrderNtlsResponse = v.InferOutput<typeof MaxMarketOrderNtlsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request maximum market order notionals.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Maximum market order notionals.
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
