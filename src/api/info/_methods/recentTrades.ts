import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request recent trades.
 */
export const RecentTradesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("recentTrades"),
    /** Asset symbol (e.g., BTC). */
    coin: v.string(),
  });
})();
export type RecentTradesRequest = v.InferOutput<typeof RecentTradesRequest>;

/**
 * Array of recent trades.
 */
export type RecentTradesResponse = {
  /** Asset symbol (e.g., BTC). */
  coin: string;
  /** Trade side ("B" = Bid/Buy, "A" = Ask/Sell). */
  side: "B" | "A";
  /**
   * Trade price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  px: string;
  /**
   * Trade size.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  sz: string;
  /** Trade timestamp (in ms since epoch). */
  time: number;
  /**
   * Transaction hash.
   * @pattern ^0x[a-fA-F0-9]{64}$
   */
  hash: `0x${string}`;
  /** Trade ID. */
  tid: number;
  /** Addresses of users involved in the trade [Maker, Taker]. */
  users: [
    /** @pattern ^0x[a-fA-F0-9]{40}$ */
    maker: `0x${string}`,
    /** @pattern ^0x[a-fA-F0-9]{40}$ */
    taker: `0x${string}`,
  ];
}[];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode recentTrades} function. */
export type RecentTradesParameters = Omit<v.InferInput<typeof RecentTradesRequest>, "type">;

/**
 * Request recent trades.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of recent trades.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { recentTrades } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await recentTrades(
 *   { transport },
 *   { coin: "ETH" },
 * );
 * ```
 */
export function recentTrades(
  config: InfoConfig,
  params: RecentTradesParameters,
  signal?: AbortSignal,
): Promise<RecentTradesResponse> {
  const request = v.parse(RecentTradesRequest, {
    type: "recentTrades",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
