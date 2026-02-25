import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

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
export type PredictedFundingsResponse = [
  /** Asset symbol. */
  asset: string,
  /** Array of predicted funding data for each exchange. */
  exchanges: [
    /** Exchange symbol. */
    exchange: string,
    /** Predicted funding data (if available). */
    data: {
      /**
       * Predicted funding rate.
       * @pattern ^-?[0-9]+(\.[0-9]+)?$
       */
      fundingRate: string;
      /** Next funding time (ms since epoch). */
      nextFundingTime: number;
      /** Funding interval in hours. */
      fundingIntervalHours?: number;
    } | null,
  ][],
][];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request predicted funding rates.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of predicted funding rates.
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
