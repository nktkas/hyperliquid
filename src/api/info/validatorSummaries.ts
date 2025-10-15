import * as v from "valibot";
import { Address, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request validator summaries.
 * @see null
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
const ValidatorStats = /* @__PURE__ */ (() => {
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
type ValidatorStats = v.InferOutput<typeof ValidatorStats>;

/**
 * Array of validator performance statistics.
 * @see null
 */
export const ValidatorSummariesResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Validator performance statistics. */
      v.pipe(
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
            v.pipe(v.number(), v.integer()),
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
              v.tuple([v.literal("day"), ValidatorStats]),
              v.tuple([v.literal("week"), ValidatorStats]),
              v.tuple([v.literal("month"), ValidatorStats]),
            ]),
            v.description("Performance statistics over different time periods."),
          ),
        }),
        v.description("Validator performance statistics."),
      ),
    ),
    v.description("Array of validator performance statistics."),
  );
})();
export type ValidatorSummariesResponse = v.InferOutput<typeof ValidatorSummariesResponse>;

// -------------------- Function --------------------

/**
 * Request validator summaries.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of validator performance statistics.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { validatorSummaries } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await validatorSummaries({ transport });
 * ```
 */
export function validatorSummaries(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<ValidatorSummariesResponse> {
  const request = parser(ValidatorSummariesRequest)({
    type: "validatorSummaries",
  });
  return config.transport.request("info", request, signal);
}
