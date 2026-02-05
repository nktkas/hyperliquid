import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

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

/**
 * L2 order book snapshot or `null` if the market does not exist.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
 */
export const L2BookResponse = /* @__PURE__ */ (() => {
  return v.nullable(
    v.object({
      /** Asset symbol. */
      coin: v.string(),
      /** Timestamp of the snapshot (in ms since epoch). */
      time: UnsignedInteger,
      /** Bid and ask levels (index 0 = bids, index 1 = asks). */
      levels: v.tuple([v.array(L2BookLevelSchema), v.array(L2BookLevelSchema)]),
      /** Spread (only present when `nSigFigs` is non-null). */
      spread: v.optional(UnsignedDecimal),
    }),
  );
})();
export type L2BookResponse = v.InferOutput<typeof L2BookResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode l2Book} function. */
export type L2BookParameters = Omit<v.InferInput<typeof L2BookRequest>, "type">;

/**
 * Request L2 order book.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns L2 order book snapshot.
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
