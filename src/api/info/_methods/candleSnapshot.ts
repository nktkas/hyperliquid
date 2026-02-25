import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";

/**
 * Request candlestick snapshots.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
 */
export const CandleSnapshotRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("candleSnapshot"),
    /** Request parameters. */
    req: v.object({
      /** Asset symbol (e.g., BTC). */
      coin: v.string(),
      /** Time interval. */
      interval: v.picklist(["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "8h", "12h", "1d", "3d", "1w", "1M"]),
      /** Start time (in ms since epoch). */
      startTime: UnsignedInteger,
      /** End time (in ms since epoch). */
      endTime: v.nullish(UnsignedInteger),
    }),
  });
})();
export type CandleSnapshotRequest = v.InferOutput<typeof CandleSnapshotRequest>;

/**
 * Array of candlestick data points.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
 */
export type CandleSnapshotResponse = {
  /** Opening timestamp (ms since epoch). */
  t: number;
  /** Closing timestamp (ms since epoch). */
  T: number;
  /** Asset symbol. */
  s: string;
  /** Time interval. */
  i: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
  /**
   * Opening price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  o: string;
  /**
   * Closing price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  c: string;
  /**
   * Highest price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  h: string;
  /**
   * Lowest price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  l: string;
  /**
   * Total volume traded in base currency.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  v: string;
  /** Number of trades executed. */
  n: number;
}[];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode candleSnapshot} function. */
export type CandleSnapshotParameters = v.InferInput<typeof CandleSnapshotRequest>["req"];

/**
 * Request candlestick snapshots.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of candlestick data points.
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
 *   {
 *     coin: "ETH",
 *     interval: "1h",
 *     startTime: Date.now() - 1000 * 60 * 60 * 24,
 *   },
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
