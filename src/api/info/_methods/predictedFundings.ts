import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Decimal, UnsignedInteger } from "../../_schemas.ts";

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

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/**
 * Request predicted funding rates.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Array of predicted funding rates.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { predictedFundings } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await predictedFundings({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
 */
export function predictedFundings(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<PredictedFundingsResponse> {
  const request = v.parse(PredictedFundingsRequest, {
    type: "predictedFundings",
  });
  return config.transport.request("info", request, signal);
}
