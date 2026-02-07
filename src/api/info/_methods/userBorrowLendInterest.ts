import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user borrow/lend interest.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
 */
export const UserBorrowLendInterestRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userBorrowLendInterest"),
    /** User address. */
    user: Address,
    /** Start time (in ms since epoch). */
    startTime: UnsignedInteger,
    /** End time (in ms since epoch). */
    endTime: v.nullish(UnsignedInteger),
  });
})();
export type UserBorrowLendInterestRequest = v.InferOutput<typeof UserBorrowLendInterestRequest>;

/**
 * User's borrow/lend interest.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
 */
export type UserBorrowLendInterestResponse = {
  /** Timestamp of the update (in ms since epoch). */
  time: number;
  /** Token symbol. */
  token: string;
  /**
   * Borrow interest amount.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  borrow: string;
  /**
   * Supply interest amount.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  supply: string;
}[];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userBorrowLendInterest} function. */
export type UserBorrowLendInterestParameters = Omit<v.InferInput<typeof UserBorrowLendInterestRequest>, "type">;

/**
 * Request borrow/lend user interest.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns User's borrow/lend interest.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userBorrowLendInterest } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userBorrowLendInterest(
 *   { transport },
 *   { user: "0x...", startTime: 1725991229384 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
 */
export function userBorrowLendInterest(
  config: InfoConfig,
  params: UserBorrowLendInterestParameters,
  signal?: AbortSignal,
): Promise<UserBorrowLendInterestResponse> {
  const request = v.parse(UserBorrowLendInterestRequest, {
    type: "userBorrowLendInterest",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
