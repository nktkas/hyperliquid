import * as v from "valibot";
import { type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

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
        v.union([
          v.literal("1m"),
          v.literal("3m"),
          v.literal("5m"),
          v.literal("15m"),
          v.literal("30m"),
          v.literal("1h"),
          v.literal("2h"),
          v.literal("4h"),
          v.literal("8h"),
          v.literal("12h"),
          v.literal("1d"),
          v.literal("3d"),
          v.literal("1w"),
          v.literal("1M"),
        ]),
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
      /** Candle interval. */
      i: v.pipe(
        v.union([
          v.literal("1m"),
          v.literal("3m"),
          v.literal("5m"),
          v.literal("15m"),
          v.literal("30m"),
          v.literal("1h"),
          v.literal("2h"),
          v.literal("4h"),
          v.literal("8h"),
          v.literal("12h"),
          v.literal("1d"),
          v.literal("3d"),
          v.literal("1w"),
          v.literal("1M"),
        ]),
        v.description("Candle interval."),
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

// -------------------- Function --------------------

/** Request parameters for the {@linkcode candle} function. */
export type CandleParameters = Omit<v.InferInput<typeof CandleRequest>, "type">;

/**
 * Subscribe to candlestick data updates for a specific asset.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { candle } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await candle(
 *   { transport },
 *   { coin: "ETH", interval: "1h" },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function candle(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<CandleParameters>,
  listener: (data: CandleEvent) => void,
): Promise<Subscription> {
  const payload = parser(CandleRequest)({ type: "candle", ...params });
  return config.transport.subscribe<CandleEvent>(payload.type, payload, (e) => {
    if (e.detail.s === payload.coin && e.detail.i === payload.interval) {
      listener(e.detail);
    }
  });
}
