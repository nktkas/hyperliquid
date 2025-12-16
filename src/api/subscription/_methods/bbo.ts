import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

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

const L2BookLevelSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Price. */
      px: v.pipe(
        UnsignedDecimal,
        v.description("Price."),
      ),
      /** Total size. */
      sz: v.pipe(
        UnsignedDecimal,
        v.description("Total size."),
      ),
      /** Number of individual orders. */
      n: v.pipe(
        UnsignedInteger,
        v.description("Number of individual orders."),
      ),
    }),
    v.description("L2 order book level."),
  );
})();

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

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/_base.ts";

/** Request parameters for the {@linkcode bbo} function. */
export type BboParameters = Omit<v.InferInput<typeof BboRequest>, "type">;

/**
 * Subscribe to best bid and offer updates for a specific asset.
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
 * import { bbo } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await bbo(
 *   { transport },
 *   { coin: "ETH" },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function bbo(
  config: SubscriptionConfig,
  params: BboParameters,
  listener: (data: BboEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(BboRequest, { type: "bbo", ...params });
  return config.transport.subscribe<BboEvent>(payload.type, payload, (e) => {
    if (e.detail.coin === payload.coin) {
      listener(e.detail);
    }
  });
}
