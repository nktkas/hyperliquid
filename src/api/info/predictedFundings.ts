import * as v from "valibot";
import { Decimal, parser, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request predicted funding rates.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
 */
export const PredictedFundingsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("predictedFundings"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request predicted funding rates."),
  );
})();
export type PredictedFundingsRequest = v.InferOutput<typeof PredictedFundingsRequest>;

/**
 * Array of predicted funding rates.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
 */
export const PredictedFundingsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Tuple of asset symbol and its predicted funding data. */
      v.pipe(
        v.tuple([
          /** Asset symbol. */
          v.pipe(
            v.string(),
            v.description("Asset symbol."),
          ),
          /** Array of predicted funding data for each exchange. */
          v.pipe(
            v.array(
              /** Tuple of exchange symbol and predicted funding data. */
              v.pipe(
                v.tuple([
                  /** Exchange symbol. */
                  v.pipe(
                    v.string(),
                    v.description("Exchange symbol."),
                  ),
                  /** Predicted funding data. */
                  v.pipe(
                    v.nullable(
                      v.object({
                        /** Predicted funding rate. */
                        fundingRate: v.pipe(
                          Decimal,
                          v.description("Predicted funding rate."),
                        ),
                        /** Next funding time (ms since epoch). */
                        nextFundingTime: v.pipe(
                          UnsignedInteger,
                          v.description("Next funding time (ms since epoch)."),
                        ),
                        /** Funding interval in hours. */
                        fundingIntervalHours: v.pipe(
                          v.optional(UnsignedInteger),
                          v.description("Funding interval in hours."),
                        ),
                      }),
                    ),
                    v.description("Predicted funding data."),
                  ),
                ]),
                v.description("Tuple of exchange symbol and predicted funding data."),
              ),
            ),
            v.description("Array of predicted funding data for each exchange."),
          ),
        ]),
        v.description("Tuple of asset symbol and its predicted funding data."),
      ),
    ),
    v.description("Array of predicted funding rates."),
  );
})();
export type PredictedFundingsResponse = v.InferOutput<typeof PredictedFundingsResponse>;

// -------------------- Function --------------------

/**
 * Request predicted funding rates.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of predicted funding rates.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { predictedFundings } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await predictedFundings({ transport });
 * ```
 */
export function predictedFundings(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<PredictedFundingsResponse> {
  const request = parser(PredictedFundingsRequest)({
    type: "predictedFundings",
  });
  return config.transport.request("info", request, signal);
}
