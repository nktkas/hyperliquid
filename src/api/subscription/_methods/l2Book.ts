import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Integer } from "../../_schemas.ts";

/**
 * Subscription to L2 order book events for a specific asset.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const L2BookRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("l2Book"),
    /** Asset symbol (e.g., BTC). */
    coin: v.string(),
    /** Number of significant figures. */
    nSigFigs: v.nullish(v.pipe(Integer, v.picklist([2, 3, 4, 5]))),
    /** Mantissa for aggregation (if `nSigFigs` is 5). */
    mantissa: v.nullish(v.pipe(Integer, v.picklist([2, 5]))),
  });
})();
export type L2BookRequest = v.InferOutput<typeof L2BookRequest>;

/**
 * Event of L2 order book snapshot.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export type L2BookEvent = {
  /** Asset symbol. */
  coin: string;
  /** Timestamp of the snapshot (in ms since epoch). */
  time: number;
  /** Bid and ask levels (index 0 = bids, index 1 = asks). */
  levels: [{
    /**
     * Price.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    px: string;
    /**
     * Total size.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    sz: string;
    /** Number of individual orders. */
    n: number;
  }[], {
    /**
     * Price.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    px: string;
    /**
     * Total size.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    sz: string;
    /** Number of individual orders. */
    n: number;
  }[]];
  /**
   * Spread (only present when `nSigFigs` is non-null).
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  spread?: string | undefined;
};

// ============================================================
// Execution Logic
// ============================================================

import type { ISubscription } from "../../../transport/mod.ts";
import type { SubscriptionConfig } from "./_types.ts";

/** Request parameters for the {@linkcode l2Book} function. */
export type L2BookParameters = Omit<v.InferInput<typeof L2BookRequest>, "type">;

/**
 * Subscribe to L2 order book updates for a specific asset.
 *
 * @param config General configuration for Subscription API subscriptions.
 * @param params Parameters specific to the API subscription.
 * @param listener A callback function to be called when the event is received.
 * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
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
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function l2Book(
  config: SubscriptionConfig,
  params: L2BookParameters,
  listener: (data: L2BookEvent) => void,
): Promise<ISubscription> {
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
