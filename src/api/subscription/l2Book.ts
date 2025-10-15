import * as v from "valibot";
import { type DeepImmutable, Integer, parser } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_base.ts";
import type { Subscription } from "../../transport/base.ts";

import { L2BookResponse } from "../info/l2Book.ts";

// -------------------- Schemas --------------------

/** Subscription to L2 order book events for a specific asset. */
export const L2BookRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("l2Book"),
        v.description("Type of subscription."),
      ),
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
      /** Number of significant figures. */
      nSigFigs: v.pipe(
        v.nullish(
          v.pipe(
            Integer,
            v.union([v.literal(2), v.literal(3), v.literal(4), v.literal(5)]),
          ),
        ),
        v.description("Number of significant figures."),
      ),
      /** Mantissa for aggregation (if `nSigFigs` is 5). */
      mantissa: v.pipe(
        v.nullish(
          v.pipe(
            Integer,
            v.union([v.literal(2), v.literal(5)]),
          ),
        ),
        v.description("Mantissa for aggregation (if `nSigFigs` is 5)."),
      ),
    }),
    v.description("Subscription to L2 order book events for a specific asset."),
  );
})();
export type L2BookRequest = v.InferOutput<typeof L2BookRequest>;

/** Event of L2 order book snapshot. */
export const L2BookEvent = /* @__PURE__ */ (() => {
  return L2BookResponse;
})();
export type L2BookEvent = v.InferOutput<typeof L2BookEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode l2Book} function. */
export type L2BookParameters = Omit<v.InferInput<typeof L2BookRequest>, "type">;

/**
 * Subscribe to L2 order book updates for a specific asset.
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
 * import { l2Book } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await l2Book(
 *   { transport },
 *   { coin: "ETH" },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function l2Book(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<L2BookParameters>,
  listener: (data: L2BookEvent) => void,
): Promise<Subscription> {
  const payload = parser(L2BookRequest)({
    type: "l2Book",
    ...params,
    nSigFigs: params.nSigFigs ?? null,
    mantissa: params.mantissa ?? null,
  });
  return config.transport.subscribe<L2BookEvent>(payload.type, payload, (e) => {
    if (e.detail.coin === payload.coin) {
      listener(e.detail);
    }
  });
}
