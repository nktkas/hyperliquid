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
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("borrowLendUserState"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request borrow/lend user state."),
  );
})();
export type BorrowLendUserStateRequest = v.InferOutput<typeof BorrowLendUserStateRequest>;

/**
 * User's borrow/lend state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
 */
export const BorrowLendUserStateResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Array of tuples of token IDs and their borrow/lend state. */
      tokenToState: v.pipe(
        v.array(
          v.tuple([
            UnsignedInteger,
            v.object({
              /** Borrow state for the token. */
              borrow: v.pipe(
                v.object({
                  /** Borrow basis amount. */
                  basis: v.pipe(
                    UnsignedDecimal,
                    v.description("Borrow basis amount."),
                  ),
                  /** Borrow value. */
                  value: v.pipe(
                    UnsignedDecimal,
                    v.description("Borrow value."),
                  ),
                }),
                v.description("Borrow state for the token."),
              ),
              /** Supply state for the token. */
              supply: v.pipe(
                v.object({
                  /** Supply basis amount. */
                  basis: v.pipe(
                    UnsignedDecimal,
                    v.description("Supply basis amount."),
                  ),
                  /** Supply value. */
                  value: v.pipe(
                    UnsignedDecimal,
                    v.description("Supply value."),
                  ),
                }),
                v.description("Supply state for the token."),
              ),
            }),
          ]),
        ),
        v.description("Array of tuples of token IDs and their borrow/lend state."),
      ),
      /** Account health status. */
      health: v.pipe(
        v.literal("healthy"), // FIXME: presumably there are other literals
        v.description("Account health status."),
      ),
      /** Health factor. */
      healthFactor: v.pipe(
        v.null(),
        v.description("Health factor."),
      ),
    }),
    v.description("User's borrow/lend state."),
  );
})();
export type BorrowLendUserStateResponse = v.InferOutput<typeof BorrowLendUserStateResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode blockDetails} function. */
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
