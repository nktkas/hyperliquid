import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user portfolio.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-portfolio
 */
export const PortfolioRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("portfolio"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user portfolio."),
  );
})();
export type PortfolioRequest = v.InferOutput<typeof PortfolioRequest>;

/** Portfolio metrics snapshot. */
const Portfolio = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** History entries for account value as [timestamp, value]. */
      accountValueHistory: v.pipe(
        v.array(v.tuple([UnsignedInteger, UnsignedDecimal])),
        v.description("History entries for account value as [timestamp, value]."),
      ),
      /** History entries for profit and loss as [timestamp, value]. */
      pnlHistory: v.pipe(
        v.array(v.tuple([UnsignedInteger, Decimal])),
        v.description("History entries for profit and loss as [timestamp, value]."),
      ),
      /** Volume metric for the portfolio. */
      vlm: v.pipe(
        UnsignedDecimal,
        v.description("Volume metric for the portfolio."),
      ),
    }),
    v.description("Portfolio metrics snapshot."),
  );
})();
type Portfolio = v.InferOutput<typeof Portfolio>;

/**
 * Portfolio metrics grouped by time periods.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-portfolio
 */
export const PortfolioResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.tuple([
      v.tuple([v.literal("day"), Portfolio]),
      v.tuple([v.literal("week"), Portfolio]),
      v.tuple([v.literal("month"), Portfolio]),
      v.tuple([v.literal("allTime"), Portfolio]),
      v.tuple([v.literal("perpDay"), Portfolio]),
      v.tuple([v.literal("perpWeek"), Portfolio]),
      v.tuple([v.literal("perpMonth"), Portfolio]),
      v.tuple([v.literal("perpAllTime"), Portfolio]),
    ]),
    v.description("Portfolio metrics grouped by time periods."),
  );
})();
export type PortfolioResponse = v.InferOutput<typeof PortfolioResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/** Request parameters for the {@linkcode portfolio} function. */
export type PortfolioParameters = Omit<v.InferInput<typeof PortfolioRequest>, "type">;

/**
 * Request user portfolio.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
