import * as v from "valibot";
import { Address, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request recent trades.
 * @see null
 */
export const RecentTradesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("recentTrades"),
        v.description("Type of request."),
      ),
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
    }),
    v.description("Request recent trades."),
  );
})();
export type RecentTradesRequest = v.InferOutput<typeof RecentTradesRequest>;

/**
 * Array of recent trades.
 * @see null
 */
export const RecentTradesResponse = /* @__PURE__ */ (() => {
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
    v.description("Array of recent trades."),
  );
})();
export type RecentTradesResponse = v.InferOutput<typeof RecentTradesResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode recentTrades} function. */
export type RecentTradesParameters = Omit<v.InferInput<typeof RecentTradesRequest>, "type">;

/**
 * Request recent trades.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of recent trades.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { recentTrades } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await recentTrades(
 *   { transport },
 *   { coin: "ETH" },
 * );
 * ```
 */
export function recentTrades(
  config: InfoRequestConfig,
  params: DeepImmutable<RecentTradesParameters>,
  signal?: AbortSignal,
): Promise<RecentTradesResponse> {
  const request = parser(RecentTradesRequest)({
    type: "recentTrades",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
