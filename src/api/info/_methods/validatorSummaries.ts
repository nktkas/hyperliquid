import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request validator summaries.
 */
export const ValidatorSummariesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("validatorSummaries"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request validator summaries."),
  );
})();
export type ValidatorSummariesRequest = v.InferOutput<typeof ValidatorSummariesRequest>;

/** Statistics for validator performance over a time period. */
const ValidatorStatsSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Fraction of time the validator was online. */
      uptimeFraction: v.pipe(
        v.string(),
        v.description("Fraction of time the validator was online."),
      ),
      /** Predicted annual percentage rate of returns. */
      predictedApr: v.pipe(
        UnsignedDecimal,
        v.description("Predicted annual percentage rate of returns."),
      ),
      /** Number of samples used for statistics calculation. */
      nSamples: v.pipe(
        UnsignedInteger,
        v.description("Number of samples used for statistics calculation."),
      ),
    }),
    v.description("Statistics for validator performance over a time period."),
  );
})();

/**
 * Array of validator performance statistics.
 */
export const ValidatorSummariesResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.object({
        /** Address of the validator. */
        validator: v.pipe(
          Address,
          v.description("Address of the validator."),
        ),
        /** Address of the validator signer. */
        signer: v.pipe(
          Address,
          v.description("Address of the validator signer."),
        ),
        /** Name of the validator. */
        name: v.pipe(
          v.string(),
          v.description("Name of the validator."),
        ),
        /** Description of the validator. */
        description: v.pipe(
          v.string(),
          v.description("Description of the validator."),
        ),
        /** Number of blocks produced recently. */
        nRecentBlocks: v.pipe(
          UnsignedInteger,
          v.description("Number of blocks produced recently."),
        ),
        /** Total amount of tokens staked **(unsafe integer)**. */
        stake: v.pipe(
          v.number(),
          v.integer(),
          v.description("Total amount of tokens staked **(unsafe integer)**."),
        ),
        /** Whether the validator is currently jailed. */
        isJailed: v.pipe(
          v.boolean(),
          v.description("Whether the validator is currently jailed."),
        ),
        /** Timestamp when the validator can be unjailed (in ms since epoch). */
        unjailableAfter: v.pipe(
          v.nullable(UnsignedInteger),
          v.description("Timestamp when the validator can be unjailed (in ms since epoch)."),
        ),
        /** Whether the validator is currently active. */
        isActive: v.pipe(
          v.boolean(),
          v.description("Whether the validator is currently active."),
        ),
        /** Commission rate charged by the validator. */
        commission: v.pipe(
          UnsignedDecimal,
          v.description("Commission rate charged by the validator."),
        ),
        /** Performance statistics over different time periods. */
        stats: v.pipe(
          v.tuple([
            v.tuple([v.literal("day"), ValidatorStatsSchema]),
            v.tuple([v.literal("week"), ValidatorStatsSchema]),
            v.tuple([v.literal("month"), ValidatorStatsSchema]),
          ]),
          v.description("Performance statistics over different time periods."),
        ),
      }),
    ),
    v.description("Array of validator performance statistics."),
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
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
