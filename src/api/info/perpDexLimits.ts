import * as v from "valibot";
import { type DeepImmutable, parser, UnsignedDecimal } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request builder deployed perpetual market limits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-builder-deployed-perp-market-limits
 */
export const PerpDexLimitsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("perpDexLimits"),
        v.description("Type of request."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.string(),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Request builder deployed perpetual market limits."),
  );
})();
export type PerpDexLimitsRequest = v.InferOutput<typeof PerpDexLimitsRequest>;

/**
 * Builder deployed perpetual market limits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-builder-deployed-perp-market-limits
 */
export const PerpDexLimitsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.nullable(
      v.object({
        /** Total open interest cap. */
        totalOiCap: v.pipe(
          UnsignedDecimal,
          v.description("Total open interest cap."),
        ),
        /** Open interest size cap per perpetual. */
        oiSzCapPerPerp: v.pipe(
          UnsignedDecimal,
          v.description("Open interest size cap per perpetual."),
        ),
        /** Maximum transfer notional amount. */
        maxTransferNtl: v.pipe(
          UnsignedDecimal,
          v.description("Maximum transfer notional amount."),
        ),
        /** Coin to open interest cap mapping. */
        coinToOiCap: v.pipe(
          v.array(v.tuple([v.string(), UnsignedDecimal])),
          v.description("Coin to open interest cap mapping."),
        ),
      }),
    ),
    v.description("Builder deployed perpetual market limits."),
  );
})();
export type PerpDexLimitsResponse = v.InferOutput<typeof PerpDexLimitsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode perpDexLimits} function. */
export type PerpDexLimitsParameters = Omit<v.InferInput<typeof PerpDexLimitsRequest>, "type">;

/**
 * Request builder deployed perpetual market limits.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Builder deployed perpetual market limits.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-builder-deployed-perp-market-limits
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { perpDexLimits } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await perpDexLimits(
 *   { transport },
 *   { dex: "test" },
 * );
 * ```
 */
export function perpDexLimits(
  config: InfoRequestConfig,
  params: DeepImmutable<PerpDexLimitsParameters>,
  signal?: AbortSignal,
): Promise<PerpDexLimitsResponse> {
  const request = parser(PerpDexLimitsRequest)({
    type: "perpDexLimits",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
