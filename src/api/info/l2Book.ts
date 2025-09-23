import * as v from "valibot";
import { type DeepImmutable, Integer, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request L2 order book.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
 */
export const L2BookRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("l2Book"),
        v.description("Type of request."),
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
    v.description("Request L2 order book."),
  );
})();
export type L2BookRequest = v.InferOutput<typeof L2BookRequest>;

/** L2 order book level. */
const L2BookLevel = /* @__PURE__ */ (() => {
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
type L2BookLevel = v.InferOutput<typeof L2BookLevel>;

/**
 * L2 order book snapshot.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
 */
export const L2BookResponse = /* @__PURE__ */ (() => {
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
        v.tuple([v.array(L2BookLevel), v.array(L2BookLevel)]),
        v.description("Bid and ask levels (index 0 = bids, index 1 = asks)."),
      ),
    }),
    v.description("L2 order book snapshot."),
  );
})();
export type L2BookResponse = v.InferOutput<typeof L2BookResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode l2Book} function. */
export type L2BookParameters = Omit<v.InferInput<typeof L2BookRequest>, "type">;

/**
 * Request L2 order book.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns L2 order book snapshot.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { l2Book } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await l2Book(
 *   { transport },
 *   { coin: "ETH", nSigFigs: 2 },
 * );
 * ```
 */
export function l2Book(
  config: InfoRequestConfig,
  params: DeepImmutable<L2BookParameters>,
  signal?: AbortSignal,
): Promise<L2BookResponse> {
  const request = parser(L2BookRequest)({
    type: "l2Book",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
