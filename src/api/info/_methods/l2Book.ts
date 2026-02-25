import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request L2 order book.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
 */
export const L2BookRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("l2Book"),
    /** Asset symbol (e.g., BTC). */
    coin: v.string(),
    /** Number of significant figures. */
    nSigFigs: v.nullish(v.picklist([2, 3, 4, 5])),
    /** Mantissa for aggregation (if `nSigFigs` is 5). */
    mantissa: v.nullish(v.picklist([2, 5])),
  });
})();
export type L2BookRequest = v.InferOutput<typeof L2BookRequest>;

type L2BookLevel = {
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
};

/**
 * L2 order book snapshot or `null` if the market does not exist.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
 */
export type L2BookResponse = {
  /** Asset symbol. */
  coin: string;
  /** Timestamp of the snapshot (in ms since epoch). */
  time: number;
  /** Bid and ask levels (index 0 = bids, index 1 = asks). */
  levels: [bids: L2BookLevel[], asks: L2BookLevel[]];
  /**
   * Spread (only present when `nSigFigs` is non-null).
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  spread?: string;
} | null;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode l2Book} function. */
export type L2BookParameters = Omit<v.InferInput<typeof L2BookRequest>, "type">;

/**
 * Request L2 order book.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return L2 order book snapshot.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { l2Book } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await l2Book(
 *   { transport },
 *   { coin: "ETH", nSigFigs: 2 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
 */
export function l2Book(
  config: InfoConfig,
  params: L2BookParameters,
  signal?: AbortSignal,
): Promise<L2BookResponse> {
  const request = v.parse(L2BookRequest, {
    type: "l2Book",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
