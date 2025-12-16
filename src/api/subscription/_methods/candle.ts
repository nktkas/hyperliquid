import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/** Subscription to candlestick events for a specific asset and time interval. */
export const CandleRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("candle"),
        v.description("Type of subscription."),
      ),
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
    }),
    v.description("Subscription to candlestick events for a specific asset and time interval."),
  );
})();
export type CandleRequest = v.InferOutput<typeof CandleRequest>;

/** Event of candlestick data point. */
export const CandleEvent = /* @__PURE__ */ (() => {
  return v.pipe(
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
    v.description("Event of candlestick data point."),
  );
})();
export type CandleEvent = v.InferOutput<typeof CandleEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/_base.ts";

/** Request parameters for the {@linkcode candle} function. */
export type CandleParameters = Omit<v.InferInput<typeof CandleRequest>, "type">;

/**
 * Subscribe to candlestick data updates for a specific asset.
 *
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 *
 * @returns A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { candle } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await candle(
 *   { transport },
 *   { coin: "ETH", interval: "1h" },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function candle(
  config: SubscriptionConfig,
  params: CandleParameters,
  listener: (data: CandleEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(CandleRequest, { type: "candle", ...params });
  return config.transport.subscribe<CandleEvent>(payload.type, payload, (e) => {
    if (e.detail.s === payload.coin && e.detail.i === payload.interval) {
      listener(e.detail);
    }
  });
}
