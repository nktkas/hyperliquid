import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request borrow/lend reserve states.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-reserve-state
 */
export const BorrowLendReserveStateRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("borrowLendReserveState"),
        v.description("Type of request."),
      ),
      /** Token index. */
      token: v.pipe(
        UnsignedInteger,
        v.description("Token index."),
      ),
    }),
    v.description("Request borrow/lend reserve states."),
  );
})();
export type BorrowLendReserveStateRequest = v.InferOutput<typeof BorrowLendReserveStateRequest>;

/**
 * Borrow/lend reserve state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-reserve-state
 */
export const BorrowLendReserveStateResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Borrow interest rate (yearly). */
      borrowYearlyRate: v.pipe(
        UnsignedDecimal,
        v.description("Borrow interest rate (yearly)."),
      ),
      /** Supply interest rate (yearly). */
      supplyYearlyRate: v.pipe(
        UnsignedDecimal,
        v.description("Supply interest rate (yearly)."),
      ),
      /** Reserve balance. */
      balance: v.pipe(
        UnsignedDecimal,
        v.description("Reserve balance."),
      ),
      /** Reserve utilization ratio. */
      utilization: v.pipe(
        UnsignedDecimal,
        v.description("Reserve utilization ratio."),
      ),
      /** Oracle price. */
      oraclePx: v.pipe(
        UnsignedDecimal,
        v.description("Oracle price."),
      ),
      /** Loan-to-value (LTV) ratio. */
      ltv: v.pipe(
        UnsignedDecimal,
        v.description("Loan-to-value (LTV) ratio."),
      ),
      /** Total supplied amount. */
      totalSupplied: v.pipe(
        UnsignedDecimal,
        v.description("Total supplied amount."),
      ),
      /** Total borrowed amount. */
      totalBorrowed: v.pipe(
        UnsignedDecimal,
        v.description("Total borrowed amount."),
      ),
    }),
    v.description("Borrow/lend reserve state."),
  );
})();
export type BorrowLendReserveStateResponse = v.InferOutput<typeof BorrowLendReserveStateResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode borrowLendReserveState} function. */
export type BorrowLendReserveStateParameters = Omit<v.InferInput<typeof BorrowLendReserveStateRequest>, "type">;

/**
 * Request borrow/lend reserve state.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Borrow/lend reserve state.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { borrowLendReserveState } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await borrowLendReserveState(
 *   { transport },
 *   { token: 0 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-reserve-state
 */
export function borrowLendReserveState(
  config: InfoConfig,
  params: BorrowLendReserveStateParameters,
  signal?: AbortSignal,
): Promise<BorrowLendReserveStateResponse> {
  const request = v.parse(BorrowLendReserveStateRequest, {
    type: "borrowLendReserveState",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
