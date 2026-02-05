import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user staking history.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
 */
export const DelegatorHistoryRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("delegatorHistory"),
    /** User address. */
    user: Address,
  });
})();
export type DelegatorHistoryRequest = v.InferOutput<typeof DelegatorHistoryRequest>;

/**
 * Array of records of staking events by a delegator.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
 */
export const DelegatorHistoryResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.object({
      /** Timestamp of the delegation event (in ms since epoch). */
      time: UnsignedInteger,
      /** Transaction hash of the delegation event. */
      hash: v.pipe(Hex, v.length(66)),
      /** Details of the update. */
      delta: v.union([
        v.object({
          /** Delegation operation details. */
          delegate: v.object({
            /** Address of the validator receiving or losing delegation. */
            validator: Address,
            /** Amount of tokens being delegated or undelegated. */
            amount: UnsignedDecimal,
            /** Whether this is an undelegation operation. */
            isUndelegate: v.boolean(),
          }),
        }),
        v.object({
          /** Deposit details. */
          cDeposit: v.object({
            /** Amount of tokens being deposited. */
            amount: UnsignedDecimal,
          }),
        }),
        v.object({
          /** Withdrawal details. */
          withdrawal: v.object({
            /** Amount of tokens being withdrawn. */
            amount: UnsignedDecimal,
            /** Phase of the withdrawal process. */
            phase: v.picklist(["initiated", "finalized"]),
          }),
        }),
      ]),
    }),
  );
})();
export type DelegatorHistoryResponse = v.InferOutput<typeof DelegatorHistoryResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode delegatorHistory} function. */
export type DelegatorHistoryParameters = Omit<v.InferInput<typeof DelegatorHistoryRequest>, "type">;

/**
 * Request user staking history.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of records of staking events by a delegator.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { delegatorHistory } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await delegatorHistory(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
 */
export function delegatorHistory(
  config: InfoConfig,
  params: DelegatorHistoryParameters,
  signal?: AbortSignal,
): Promise<DelegatorHistoryResponse> {
  const request = v.parse(DelegatorHistoryRequest, {
    type: "delegatorHistory",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
