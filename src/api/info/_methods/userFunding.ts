import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request array of user funding ledger updates.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export const UserFundingRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userFunding"),
    /** User address. */
    user: Address,
    /** Start time (in ms since epoch). */
    startTime: v.nullish(UnsignedInteger),
    /** End time (in ms since epoch). */
    endTime: v.nullish(UnsignedInteger),
  });
})();
export type UserFundingRequest = v.InferOutput<typeof UserFundingRequest>;

/**
 * Array of user funding ledger updates.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export const UserFundingResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.object({
      /** Timestamp of the update (in ms since epoch). */
      time: UnsignedInteger,
      /** L1 transaction hash. */
      hash: v.pipe(Hex, v.length(66)),
      /** Update details. */
      delta: v.object({
        /** Update type. */
        type: v.literal("funding"),
        /** Asset symbol. */
        coin: v.string(),
        /** Amount transferred in USDC. */
        usdc: Decimal,
        /** Signed position size. */
        szi: Decimal,
        /** Applied funding rate. */
        fundingRate: Decimal,
        /** Number of samples. */
        nSamples: v.nullable(UnsignedInteger),
      }),
    }),
  );
})();
export type UserFundingResponse = v.InferOutput<typeof UserFundingResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userFunding} function. */
export type UserFundingParameters = Omit<v.InferInput<typeof UserFundingRequest>, "type">;

/**
 * Request array of user funding ledger updates.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of user funding ledger updates.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userFunding } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userFunding(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export function userFunding(
  config: InfoConfig,
  params: UserFundingParameters,
  signal?: AbortSignal,
): Promise<UserFundingResponse> {
  const request = v.parse(UserFundingRequest, {
    type: "userFunding",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
