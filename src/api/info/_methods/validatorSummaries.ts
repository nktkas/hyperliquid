import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request validator summaries.
 */
export const ValidatorSummariesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("validatorSummaries"),
  });
})();
export type ValidatorSummariesRequest = v.InferOutput<typeof ValidatorSummariesRequest>;

/** Statistics for validator performance over a time period. */
const ValidatorStatsSchema = /* @__PURE__ */ (() => {
  return v.object({
    /** Fraction of time the validator was online. */
    uptimeFraction: v.string(),
    /** Predicted annual percentage rate of returns. */
    predictedApr: UnsignedDecimal,
    /** Number of samples used for statistics calculation. */
    nSamples: UnsignedInteger,
  });
})();

/**
 * Array of validator performance statistics.
 */
export const ValidatorSummariesResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.object({
      /** Address of the validator. */
      validator: Address,
      /** Address of the validator signer. */
      signer: Address,
      /** Name of the validator. */
      name: v.string(),
      /** Description of the validator. */
      description: v.string(),
      /** Number of blocks produced recently. */
      nRecentBlocks: UnsignedInteger,
      /** Total amount of tokens staked **(unsafe integer)**. */
      stake: v.pipe(v.number(), v.integer()),
      /** Whether the validator is currently jailed. */
      isJailed: v.boolean(),
      /** Timestamp when the validator can be unjailed (in ms since epoch). */
      unjailableAfter: v.nullable(UnsignedInteger),
      /** Whether the validator is currently active. */
      isActive: v.boolean(),
      /** Commission rate charged by the validator. */
      commission: UnsignedDecimal,
      /** Performance statistics over different time periods. */
      stats: v.tuple([
        v.tuple([v.literal("day"), ValidatorStatsSchema]),
        v.tuple([v.literal("week"), ValidatorStatsSchema]),
        v.tuple([v.literal("month"), ValidatorStatsSchema]),
      ]),
    }),
  );
})();
export type ValidatorSummariesResponse = v.InferOutput<typeof ValidatorSummariesResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request validator summaries.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of validator performance statistics.
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
