import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/** Subscription to best bid and offer events for a specific asset. */
export const BboRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("bbo"),
    /** Asset symbol (e.g., BTC). */
    coin: v.string(),
  });
})();
export type BboRequest = v.InferOutput<typeof BboRequest>;

const L2BookLevelSchema = /* @__PURE__ */ (() => {
  return v.object({
    /** Price. */
    px: UnsignedDecimal,
    /** Total size. */
    sz: UnsignedDecimal,
    /** Number of individual orders. */
    n: UnsignedInteger,
  });
})();

/** Event of best bid and offer. */
export const BboEvent = /* @__PURE__ */ (() => {
  return v.object({
    /** Asset symbol (e.g., BTC). */
    coin: v.string(),
    /** Time of the BBO update (in ms since epoch). */
    time: UnsignedInteger,
    /** Best bid and offer tuple [bid, offer], either can be undefined if unavailable. */
    bbo: v.tuple([L2BookLevelSchema, L2BookLevelSchema]),
  });
})();
export type BboEvent = v.InferOutput<typeof BboEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

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
