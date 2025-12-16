import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

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
          interval: v.pipe(
            v.picklist(["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "8h", "12h", "1d", "3d", "1w", "1M"]),
            v.description("Time interval."),
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
        /** Time interval. */
        i: v.pipe(
          v.picklist(["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "8h", "12h", "1d", "3d", "1w", "1M"]),
          v.description("Time interval."),
        ),
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
    ),
    v.description("Array of candlestick data points."),
  );
})();
export type CandleSnapshotResponse = v.InferOutput<typeof CandleSnapshotResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode candleSnapshot} function. */
export type CandleSnapshotParameters = v.InferInput<typeof CandleSnapshotRequest>["req"];

/**
 * Request candlestick snapshots.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of candlestick data points.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { candleSnapshot } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await candleSnapshot(
 *   { transport },
 *   { coin: "ETH", interval: "1h", startTime: Date.now() - 1000 * 60 * 60 * 24 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
 */
export function candleSnapshot(
  config: InfoConfig,
  params: CandleSnapshotParameters,
  signal?: AbortSignal,
): Promise<CandleSnapshotResponse> {
  const request = v.parse(CandleSnapshotRequest, {
    type: "candleSnapshot",
    req: params,
  });
  return config.transport.request("info", request, signal);
}
