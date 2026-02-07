import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Request user's staking summary.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
 */
export const DelegatorSummaryRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("delegatorSummary"),
    /** User address. */
    user: Address,
  });
})();
export type DelegatorSummaryRequest = v.InferOutput<typeof DelegatorSummaryRequest>;

/**
 * User's staking summary.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
 */
export type DelegatorSummaryResponse = {
  /**
   * Total amount of delegated tokens.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  delegated: string;
  /**
   * Total amount of undelegated tokens.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  undelegated: string;
  /**
   * Total amount of tokens pending withdrawal.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  totalPendingWithdrawal: string;
  /** Number of pending withdrawals. */
  nPendingWithdrawals: number;
};

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode delegatorSummary} function. */
export type DelegatorSummaryParameters = Omit<v.InferInput<typeof DelegatorSummaryRequest>, "type">;

/**
 * Request user's staking summary.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns User's staking summary.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { delegatorSummary } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await delegatorSummary(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
 */
export function delegatorSummary(
  config: InfoConfig,
  params: DelegatorSummaryParameters,
  signal?: AbortSignal,
): Promise<DelegatorSummaryResponse> {
  const request = v.parse(DelegatorSummaryRequest, {
    type: "delegatorSummary",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
