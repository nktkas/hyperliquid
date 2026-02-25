import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request validator summaries.
 * @see null
 */
export const ValidatorSummariesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("validatorSummaries"),
  });
})();
export type ValidatorSummariesRequest = v.InferOutput<typeof ValidatorSummariesRequest>;

/** Statistics for validator performance over a time period. */
type ValidatorStats = {
  /**
   * Fraction of time the validator was online.
   * @pattern ^0(\.\d+)?|1(\.0+)?$
   */
  uptimeFraction: string;
  /**
   * Predicted annual percentage rate of returns.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  predictedApr: string;
  /** Number of samples used for statistics calculation. */
  nSamples: number;
};

/**
 * Array of validator performance statistics.
 * @see null
 */
export type ValidatorSummariesResponse = {
  /**
   * Address of the validator.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  validator: `0x${string}`;
  /**
   * Address of the validator signer.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  signer: `0x${string}`;
  /** Name of the validator. */
  name: string;
  /** Description of the validator. */
  description: string;
  /** Number of blocks produced recently. */
  nRecentBlocks: number;
  /** Total amount of tokens staked **(unsafe integer)**. */
  stake: number;
  /** Whether the validator is currently jailed. */
  isJailed: boolean;
  /** Timestamp when the validator can be unjailed (in ms since epoch). */
  unjailableAfter: number | null;
  /** Whether the validator is currently active. */
  isActive: boolean;
  /**
   * Commission rate charged by the validator.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  commission: string;
  /** Performance statistics over different time periods. */
  stats: [
    [period: "day", stats: ValidatorStats],
    [period: "week", stats: ValidatorStats],
    [period: "month", stats: ValidatorStats],
  ];
}[];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request validator summaries.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of validator performance statistics.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { validatorSummaries } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await validatorSummaries({ transport });
 * ```
 *
 * @see null
 */
export function validatorSummaries(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<ValidatorSummariesResponse> {
  const request = v.parse(ValidatorSummariesRequest, {
    type: "validatorSummaries",
  });
  return config.transport.request("info", request, signal);
}
