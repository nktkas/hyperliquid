import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user borrow/lend interest.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
 */
export const UserBorrowLendInterestRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userBorrowLendInterest"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Start time (in ms since epoch). */
      startTime: v.pipe(
        UnsignedInteger,
        v.description("Start time (in ms since epoch)."),
      ),
      /** End time (in ms since epoch). */
      endTime: v.pipe(
        v.nullish(UnsignedInteger),
        v.description("End time (in ms since epoch)."),
      ),
    }),
    v.description("Request user borrow/lend interest."),
  );
})();
export type UserBorrowLendInterestRequest = v.InferOutput<typeof UserBorrowLendInterestRequest>;

/**
 * User's borrow/lend interest.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
 */
export const UserBorrowLendInterestResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.object({
        /** Timestamp of the update (in ms since epoch). */
        time: v.pipe(
          UnsignedInteger,
          v.description("Timestamp of the update (in ms since epoch)."),
        ),
        /** Token symbol. */
        token: v.pipe(
          v.string(),
          v.description("Token symbol."),
        ),
        /** Borrow interest amount. */
        borrow: v.pipe(
          UnsignedDecimal,
          v.description("Borrow interest amount."),
        ),
        /** Supply interest amount. */
        supply: v.pipe(
          UnsignedDecimal,
          v.description("Supply interest amount."),
        ),
      }),
    ),
    v.description("User's borrow/lend interest."),
  );
})();
export type UserBorrowLendInterestResponse = v.InferOutput<typeof UserBorrowLendInterestResponse>;
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
