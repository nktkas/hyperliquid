import * as v from "valibot";
import { type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

import { CandleIntervalSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/**
 * Request candlestick snapshots.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
 */
export const CandleSnapshotRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("candleSnapshot"),
        v.description("Type of request."),
      ),
      /** Request parameters. */
      req: v.pipe(
        v.object({
          /** Asset symbol (e.g., BTC). */
          coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
          ),
          /** Time interval. */
          interval: CandleIntervalSchema,
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
        v.description("Request parameters."),
      ),
    }),
    v.description("Request candlestick snapshots."),
  );
})();
export type CandleSnapshotRequest = v.InferOutput<typeof CandleSnapshotRequest>;

/**
 * Array of candlestick data points.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
 */
export const CandleSnapshotResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Candlestick data point. */
      v.pipe(
        v.object({
          /** Opening timestamp (ms since epoch). */
          t: v.pipe(
            UnsignedInteger,
            v.description("Opening timestamp (ms since epoch)."),
          ),
          /** Closing timestamp (ms since epoch). */
          T: v.pipe(
            UnsignedInteger,
            v.description("Closing timestamp (ms since epoch)."),
          ),
          /** Asset symbol. */
          s: v.pipe(
            v.string(),
            v.description("Asset symbol."),
          ),
          /** Candle interval. */
          i: CandleIntervalSchema,
          /** Opening price. */
          o: v.pipe(
            UnsignedDecimal,
            v.description("Opening price."),
          ),
          /** Closing price. */
          c: v.pipe(
            UnsignedDecimal,
            v.description("Closing price."),
          ),
          /** Highest price. */
          h: v.pipe(
            UnsignedDecimal,
            v.description("Highest price."),
          ),
          /** Lowest price. */
          l: v.pipe(
            UnsignedDecimal,
            v.description("Lowest price."),
          ),
          /** Total volume traded in base currency. */
          v: v.pipe(
            UnsignedDecimal,
            v.description("Total volume traded in base currency."),
          ),
          /** Number of trades executed. */
          n: v.pipe(
            UnsignedInteger,
            v.description("Number of trades executed."),
          ),
        }),
        v.description("Candlestick data point."),
      ),
    ),
    v.description("Array of candlestick data points."),
  );
})();
export type CandleSnapshotResponse = v.InferOutput<typeof CandleSnapshotResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode candleSnapshot} function. */
export type CandleSnapshotParameters = v.InferInput<typeof CandleSnapshotRequest>["req"];

/**
 * Request candlestick snapshots.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of candlestick data points.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { candleSnapshot } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await candleSnapshot(
 *   { transport },
 *   { coin: "ETH", interval: "1h", startTime: Date.now() - 1000 * 60 * 60 * 24 },
 * );
 * ```
 */
export function candleSnapshot(
  config: InfoRequestConfig,
  params: DeepImmutable<CandleSnapshotParameters>,
  signal?: AbortSignal,
): Promise<CandleSnapshotResponse> {
  const request = parser(CandleSnapshotRequest)({
    type: "candleSnapshot",
    req: params,
  });
  return config.transport.request("info", request, signal);
}
