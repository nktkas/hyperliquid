import * as v from "valibot";
import { parser, UnsignedDecimal } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request maximum market order notionals.
 * @see null
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
 * Maximum market order notionals.
 * @see null
 */
export const MaxMarketOrderNtlsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Tuple of maximum market order notional and corresponding asset symbol. */
      v.pipe(
        v.tuple([UnsignedDecimal, v.string()]),
        v.description("Tuple of maximum market order notional and corresponding asset symbol."),
      ),
    ),
    v.description("Maximum market order notionals."),
  );
})();
export type MaxMarketOrderNtlsResponse = v.InferOutput<typeof MaxMarketOrderNtlsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode maxMarketOrderNtls} function. */
export type MaxMarketOrderNtlsParameters = Omit<v.InferInput<typeof MaxMarketOrderNtlsRequest>, "type">;

/**
 * Request maximum market order notionals.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Maximum market order notionals.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { maxMarketOrderNtls } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await maxMarketOrderNtls({ transport });
 * ```
 */
export function maxMarketOrderNtls(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<MaxMarketOrderNtlsResponse> {
  const request = parser(MaxMarketOrderNtlsRequest)({
    type: "maxMarketOrderNtls",
  });
  return config.transport.request("info", request, signal);
}
