import * as v from "valibot";
import { type DeepImmutable, parser, UnsignedDecimal } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request mid coin prices.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
 */
export const AllMidsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("allMids"),
        v.description("Type of request."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.optional(v.string()),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Request mid coin prices."),
  );
})();
export type AllMidsRequest = v.InferOutput<typeof AllMidsRequest>;

/**
 * Mapping of coin symbols to mid prices.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
 */
export const AllMidsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.record(v.string(), UnsignedDecimal),
    v.description("Mapping of coin symbols to mid prices."),
  );
})();
export type AllMidsResponse = v.InferOutput<typeof AllMidsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode allMids} function. */
export type AllMidsParameters = Omit<v.InferInput<typeof AllMidsRequest>, "type">;

/**
 * Request mid coin prices.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Mapping of coin symbols to mid prices.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { allMids } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await allMids({ transport });
 * ```
 */
export function allMids(
  config: InfoRequestConfig,
  params?: DeepImmutable<AllMidsParameters>,
  signal?: AbortSignal,
): Promise<AllMidsResponse>;
export function allMids(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<AllMidsResponse>;
export function allMids(
  config: InfoRequestConfig,
  paramsOrSignal?: DeepImmutable<AllMidsParameters> | AbortSignal,
  maybeSignal?: AbortSignal,
): Promise<AllMidsResponse> {
  const params = paramsOrSignal instanceof AbortSignal ? {} : paramsOrSignal;
  const signal = paramsOrSignal instanceof AbortSignal ? paramsOrSignal : maybeSignal;

  const request = parser(AllMidsRequest)({
    type: "allMids",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
