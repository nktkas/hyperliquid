import * as v from "valibot";
import { type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_base.ts";
import type { Subscription } from "../../transport/base.ts";

import { L2BookLevelSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/** Subscription to best bid and offer events for a specific asset. */
export const BboRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("bbo"),
        v.description("Type of subscription."),
      ),
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
    }),
    v.description("Subscription to best bid and offer events for a specific asset."),
  );
})();
export type BboRequest = v.InferOutput<typeof BboRequest>;

/** Event of best bid and offer. */
export const BboEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
      /** Time of the BBO update (in ms since epoch). */
      time: v.pipe(
        UnsignedInteger,
        v.description("Time of the BBO update (in ms since epoch)."),
      ),
      /** Best bid and offer tuple [bid, offer], either can be undefined if unavailable. */
      bbo: v.pipe(
        v.tuple([L2BookLevelSchema, L2BookLevelSchema]),
        v.description("Best bid and offer tuple [bid, offer], either can be undefined if unavailable."),
      ),
    }),
    v.description("Event of best bid and offer."),
  );
})();
export type BboEvent = v.InferOutput<typeof BboEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode bbo} function. */
export type BboParameters = Omit<v.InferInput<typeof BboRequest>, "type">;

/**
 * Subscribe to best bid and offer updates for a specific asset.
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
 * import { bbo } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await bbo(
 *   { transport },
 *   { coin: "ETH" },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function bbo(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<BboParameters>,
  listener: (data: BboEvent) => void,
): Promise<Subscription> {
  const payload = parser(BboRequest)({ type: "bbo", ...params });
  return config.transport.subscribe<BboEvent>(payload.type, payload, (e) => {
    if (e.detail.coin === payload.coin) {
      listener(e.detail);
    }
  });
}
