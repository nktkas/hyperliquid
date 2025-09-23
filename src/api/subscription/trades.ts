import * as v from "valibot";
import { Address, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/** Subscription to trade events for a specific asset. */
export const TradesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("trades"),
        v.description("Type of subscription."),
      ),
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
    }),
    v.description("Subscription to trade events for a specific asset."),
  );
})();
export type TradesRequest = v.InferOutput<typeof TradesRequest>;

/** Event of array of trades for a specific asset. */
export const TradesEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Trade for a specific asset. */
      v.pipe(
        v.object({
          /** Asset symbol (e.g., BTC). */
          coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
          ),
          /** Trade side ("B" = Bid/Buy, "A" = Ask/Sell). */
          side: v.pipe(
            v.union([v.literal("B"), v.literal("A")]),
            v.description('Trade side ("B" = Bid/Buy, "A" = Ask/Sell).'),
          ),
          /** Trade price. */
          px: v.pipe(
            UnsignedDecimal,
            v.description("Trade price."),
          ),
          /** Trade size. */
          sz: v.pipe(
            UnsignedDecimal,
            v.description("Trade size."),
          ),
          /** Trade timestamp (in ms since epoch). */
          time: v.pipe(
            UnsignedInteger,
            v.description("Trade timestamp (in ms since epoch)."),
          ),
          /** Transaction hash. */
          hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("Transaction hash."),
          ),
          /** Trade ID. */
          tid: v.pipe(
            UnsignedInteger,
            v.description("Trade ID."),
          ),
          /** Addresses of users involved in the trade [Maker, Taker]. */
          users: v.pipe(
            v.tuple([Address, Address]),
            v.description("Addresses of users involved in the trade [Maker, Taker]."),
          ),
        }),
        v.description("Trade for a specific asset."),
      ),
    ),
    v.description("Event of array of trades for a specific asset."),
  );
})();
export type TradesEvent = v.InferOutput<typeof TradesEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode trades} function. */
export type TradesParameters = Omit<v.InferInput<typeof TradesRequest>, "type">;

/**
 * Subscribe to real-time trade updates for a specific asset.
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
 * import { trades } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await trades(
 *   { transport },
 *   { coin: "ETH" },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function trades(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<TradesParameters>,
  listener: (data: TradesEvent) => void,
): Promise<Subscription> {
  const payload = parser(TradesRequest)({ type: "trades", ...params });
  return config.transport.subscribe<TradesEvent>(payload.type, payload, (e) => {
    if (e.detail[0]?.coin === payload.coin) {
      listener(e.detail);
    }
  });
}
