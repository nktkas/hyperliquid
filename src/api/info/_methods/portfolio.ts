import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Request user portfolio.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-portfolio
 */
export const PortfolioRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("portfolio"),
    /** User address. */
    user: Address,
  });
})();
export type PortfolioRequest = v.InferOutput<typeof PortfolioRequest>;

/** Portfolio metrics snapshot. */
type Portfolio = {
  /** History entries for account value as [timestamp, value]. */
  accountValueHistory: [
    timestamp: number,
    /** @pattern ^[0-9]+(\.[0-9]+)?$ */
    value: string,
  ][];
  /** History entries for profit and loss as [timestamp, value]. */
  pnlHistory: [
    timestamp: number,
    /** @pattern ^-?[0-9]+(\.[0-9]+)?$ */
    value: string,
  ][];
  /**
   * Volume metric for the portfolio.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  vlm: string;
};

/**
 * Portfolio metrics grouped by time periods.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-portfolio
 */
export type PortfolioResponse = [
  [period: "day", data: Portfolio],
  [period: "week", data: Portfolio],
  [period: "month", data: Portfolio],
  [period: "allTime", data: Portfolio],
  [period: "perpDay", data: Portfolio],
  [period: "perpWeek", data: Portfolio],
  [period: "perpMonth", data: Portfolio],
  [period: "perpAllTime", data: Portfolio],
];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode portfolio} function. */
export type PortfolioParameters = Omit<v.InferInput<typeof PortfolioRequest>, "type">;

/**
 * Request user portfolio.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Portfolio metrics grouped by time periods.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { portfolio } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await portfolio(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-portfolio
 */
export function portfolio(
  config: InfoConfig,
  params: PortfolioParameters,
  signal?: AbortSignal,
): Promise<PortfolioResponse> {
  const request = v.parse(PortfolioRequest, {
    type: "portfolio",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
