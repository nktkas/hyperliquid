import * as v from "valibot";
import { Decimal, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request funding history.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
 */
export const FundingHistoryRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("fundingHistory"),
        v.description("Type of request."),
      ),
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
      /** Start time (in ms since epoch). */
      startTime: v.pipe(
        UnsignedInteger,
        v.description("Start time (in ms since epoch)."),
      ),
      /** End time (in ms since epoch). */
      endTime: v.pipe(
        v.nullish(UnsignedInteger),
        v.description("End time (in ms since epoch)."),
      ),
    }),
    v.description("Request funding history."),
  );
})();
export type FundingHistoryRequest = v.InferOutput<typeof FundingHistoryRequest>;

/**
 * Array of historical funding rate records for an asset.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
 */
export const FundingHistoryResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Historical funding rate record for an asset. */
      v.pipe(
        v.object({
          /** Asset symbol. */
          coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
          ),
          /** Funding rate. */
          fundingRate: v.pipe(
            Decimal,
            v.description("Funding rate."),
          ),
          /** Premium price. */
          premium: v.pipe(
            Decimal,
            v.description("Premium price."),
          ),
          /** Funding record timestamp (ms since epoch). */
          time: v.pipe(
            UnsignedInteger,
            v.description("Funding record timestamp (ms since epoch)."),
          ),
        }),
        v.description("Historical funding rate record for an asset."),
      ),
    ),
    v.description("Array of historical funding rate records for an asset."),
  );
})();
export type FundingHistoryResponse = v.InferOutput<typeof FundingHistoryResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode fundingHistory} function. */
export type FundingHistoryParameters = Omit<v.InferInput<typeof FundingHistoryRequest>, "type">;

/**
 * Request funding history.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of historical funding rate records for an asset.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { fundingHistory } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await fundingHistory(
 *   { transport },
 *   { coin: "ETH", startTime: Date.now() - 1000 * 60 * 60 * 24 },
 * );
 * ```
 */
export function fundingHistory(
  config: InfoRequestConfig,
  params: DeepImmutable<FundingHistoryParameters>,
  signal?: AbortSignal,
): Promise<FundingHistoryResponse> {
  const request = parser(FundingHistoryRequest)({
    type: "fundingHistory",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
