import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";

/**
 * Request funding history.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
 */
export const FundingHistoryRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("fundingHistory"),
    /** Asset symbol (e.g., BTC). */
    coin: v.string(),
    /** Start time (in ms since epoch). */
    startTime: UnsignedInteger,
    /** End time (in ms since epoch). */
    endTime: v.nullish(UnsignedInteger),
  });
})();
export type FundingHistoryRequest = v.InferOutput<typeof FundingHistoryRequest>;

/**
 * Array of historical funding rate records for an asset.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
 */
export type FundingHistoryResponse = {
  /** Asset symbol. */
  coin: string;
  /**
   * Funding rate.
   * @pattern ^-?[0-9]+(\.[0-9]+)?$
   */
  fundingRate: string;
  /**
   * Premium price.
   * @pattern ^-?[0-9]+(\.[0-9]+)?$
   */
  premium: string;
  /** Funding record timestamp (ms since epoch). */
  time: number;
}[];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode fundingHistory} function. */
export type FundingHistoryParameters = Omit<v.InferInput<typeof FundingHistoryRequest>, "type">;

/**
 * Request funding history.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of historical funding rate records for an asset.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { fundingHistory } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await fundingHistory(
 *   { transport },
 *   {
 *     coin: "ETH",
 *     startTime: Date.now() - 1000 * 60 * 60 * 24,
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
 */
export function fundingHistory(
  config: InfoConfig,
  params: FundingHistoryParameters,
  signal?: AbortSignal,
): Promise<FundingHistoryResponse> {
  const request = v.parse(FundingHistoryRequest, {
    type: "fundingHistory",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
