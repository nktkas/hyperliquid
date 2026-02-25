import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

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
export type DelegatorHistoryResponse = {
  /** Timestamp of the delegation event (in ms since epoch). */
  time: number;
  /**
   * Transaction hash of the delegation event.
   * @pattern ^0x[a-fA-F0-9]{64}$
   */
  hash: `0x${string}`;
  /** Details of the update. */
  delta: {
    /** Delegation operation details. */
    delegate: {
      /**
       * Address of the validator receiving or losing delegation.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      validator: `0x${string}`;
      /**
       * Amount of tokens being delegated or undelegated.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      amount: string;
      /** Whether this is an undelegation operation. */
      isUndelegate: boolean;
    };
  } | {
    /** Deposit details. */
    cDeposit: {
      /**
       * Amount of tokens being deposited.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      amount: string;
    };
  } | {
    /** Withdrawal details. */
    withdrawal: {
      /**
       * Amount of tokens being withdrawn.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      amount: string;
      /** Phase of the withdrawal process. */
      phase: "initiated" | "finalized";
    };
  };
}[];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode delegatorHistory} function. */
export type DelegatorHistoryParameters = Omit<v.InferInput<typeof DelegatorHistoryRequest>, "type">;

/**
 * Request user staking history.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of records of staking events by a delegator.
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
