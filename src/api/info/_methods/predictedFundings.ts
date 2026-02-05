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
  return v.object({
    /** Type of request. */
    type: v.literal("predictedFundings"),
  });
})();
export type PredictedFundingsRequest = v.InferOutput<typeof PredictedFundingsRequest>;

/**
 * Array of tuples of asset symbols and their predicted funding data.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
 */
export const PredictedFundingsResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.tuple([
      // Asset symbol
      v.string(),
      // Array of predicted funding data for each exchange
      v.array(
        v.tuple([
          // Exchange symbol
          v.string(),
          // Predicted funding data (if available)
          v.nullable(
            v.object({
              /** Predicted funding rate. */
              fundingRate: Decimal,
              /** Next funding time (ms since epoch). */
              nextFundingTime: UnsignedInteger,
              /** Funding interval in hours. */
              fundingIntervalHours: v.optional(UnsignedInteger),
            }),
          ),
        ]),
      ),
    ]),
  );
})();
export type PredictedFundingsResponse = v.InferOutput<typeof PredictedFundingsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request predicted funding rates.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
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
