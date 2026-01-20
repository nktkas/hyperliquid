import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request all borrow/lend reserve states.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-all-borrow-lend-reserve-states
 */
export const AllBorrowLendReserveStatesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("allBorrowLendReserveStates"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request all borrow/lend reserve states."),
  );
})();
export type AllBorrowLendReserveStatesRequest = v.InferOutput<typeof AllBorrowLendReserveStatesRequest>;

/**
 * Array of tuples of reserve IDs and their borrow/lend reserve state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-all-borrow-lend-reserve-states
 */
export const AllBorrowLendReserveStatesResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.tuple([
        // Reserve ID
        UnsignedInteger,
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
      ]),
    ),
    v.description("Array of tuples of reserve IDs and their borrow/lend reserve state."),
  );
})();
export type AllBorrowLendReserveStatesResponse = v.InferOutput<typeof AllBorrowLendReserveStatesResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request all borrow/lend reserve states.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of tuples of reserve IDs and their borrow/lend reserve state.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { allBorrowLendReserveStates } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await allBorrowLendReserveStates({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-all-borrow-lend-reserve-states
 */
export function allBorrowLendReserveStates(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<AllBorrowLendReserveStatesResponse> {
  const request = v.parse(AllBorrowLendReserveStatesRequest, {
    type: "allBorrowLendReserveStates",
  });
  return config.transport.request("info", request, signal);
}
