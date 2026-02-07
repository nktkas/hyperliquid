import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";

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
export type UserFundingResponse = {
  /** Timestamp of the update (in ms since epoch). */
  time: number;
  /**
   * L1 transaction hash.
   * @pattern ^0x[a-fA-F0-9]{64}$
   */
  hash: `0x${string}`;
  /** Update details. */
  delta: {
    /** Update type. */
    type: "funding";
    /** Asset symbol. */
    coin: string;
    /**
     * Amount transferred in USDC.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    usdc: string;
    /**
     * Signed position size.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    szi: string;
    /**
     * Applied funding rate.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    fundingRate: string;
    /** Number of samples. */
    nSamples: number | null;
  };
}[];

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
