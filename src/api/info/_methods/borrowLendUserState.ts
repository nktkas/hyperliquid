import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request borrow/lend user state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
 */
export const BorrowLendUserStateRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("borrowLendUserState"),
    /** User address. */
    user: Address,
  });
})();
export type BorrowLendUserStateRequest = v.InferOutput<typeof BorrowLendUserStateRequest>;

/**
 * User's borrow/lend state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
 */
export const BorrowLendUserStateResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Array of tuples of token IDs and their borrow/lend state. */
    tokenToState: v.array(
      v.tuple([
        UnsignedInteger,
        v.object({
          /** Borrow state for the token. */
          borrow: v.object({
            /** Borrow basis amount. */
            basis: UnsignedDecimal,
            /** Borrow value. */
            value: UnsignedDecimal,
          }),
          /** Supply state for the token. */
          supply: v.object({
            /** Supply basis amount. */
            basis: UnsignedDecimal,
            /** Supply value. */
            value: UnsignedDecimal,
          }),
        }),
      ]),
    ),
    /** Account health status. */
    health: v.literal("healthy"), // FIXME: presumably there are other literals
    /** Health factor. */
    healthFactor: v.null(),
  });
})();
export type BorrowLendUserStateResponse = v.InferOutput<typeof BorrowLendUserStateResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode borrowLendUserState} function. */
export type BorrowLendUserStateParameters = Omit<v.InferInput<typeof BorrowLendUserStateRequest>, "type">;

/**
 * Request borrow/lend user state.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns User's borrow/lend state.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { borrowLendUserState } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await borrowLendUserState(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
 */
export function borrowLendUserState(
  config: InfoConfig,
  params: BorrowLendUserStateParameters,
  signal?: AbortSignal,
): Promise<BorrowLendUserStateResponse> {
  const request = v.parse(BorrowLendUserStateRequest, {
    type: "borrowLendUserState",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
