import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Integer, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

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
        v.nullish(v.pipe(Integer, v.picklist([2, 3, 4, 5]))),
        v.description("Number of significant figures."),
      ),
      /** Mantissa for aggregation (if `nSigFigs` is 5). */
      mantissa: v.pipe(
        v.nullish(v.pipe(Integer, v.picklist([2, 5]))),
        v.description("Mantissa for aggregation (if `nSigFigs` is 5)."),
      ),
    }),
    v.description("Subscription to L2 order book events for a specific asset."),
  );
})();
export type L2BookRequest = v.InferOutput<typeof L2BookRequest>;

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

/** Event of L2 order book snapshot. */
export const L2BookEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Asset symbol. */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol."),
      ),
      /** Timestamp of the snapshot (in ms since epoch). */
      time: v.pipe(
        UnsignedInteger,
        v.description("Timestamp of the snapshot (in ms since epoch)."),
      ),
      /** Bid and ask levels (index 0 = bids, index 1 = asks). */
      levels: v.pipe(
        v.tuple([v.array(L2BookLevelSchema), v.array(L2BookLevelSchema)]),
        v.description("Bid and ask levels (index 0 = bids, index 1 = asks)."),
      ),
    }),
    v.description("Event of L2 order book snapshot."),
  );
})();
export type L2BookEvent = v.InferOutput<typeof L2BookEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { WebSocketSubscription } from "../../../transport/websocket/mod.ts";

/** Request parameters for the {@linkcode l2Book} function. */
export type L2BookParameters = Omit<v.InferInput<typeof L2BookRequest>, "type">;

/**
 * Subscribe to L2 order book updates for a specific asset.
 *
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 *
 * @returns A request-promise that resolves with a {@link WebSocketSubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { l2Book } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await l2Book(
 *   { transport },
 *   { coin: "ETH" },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function l2Book(
  config: SubscriptionConfig,
  params: L2BookParameters,
  listener: (data: L2BookEvent) => void,
): Promise<WebSocketSubscription> {
  const payload = v.parse(L2BookRequest, {
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
