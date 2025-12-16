import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Integer } from "../../_schemas.ts";

/**
 * Request validator L1 votes.
 */
export const ValidatorL1VotesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("validatorL1Votes"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request validator L1 votes."),
  );
})();
export type ValidatorL1VotesRequest = v.InferOutput<typeof ValidatorL1VotesRequest>;

/**
 * Array of L1 governance votes cast by validators.
 */
export const ValidatorL1VotesResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.object({
        /** Timestamp when the vote expires (in ms since epoch). */
        expireTime: v.pipe(
          Integer,
          v.description("Timestamp when the vote expires (in ms since epoch)."),
        ),
        /** Type of the vote. */
        action: v.pipe(
          v.union([
            v.object({
              // deno-lint-ignore valibot-project/require-description valibot-project/require-jsdoc
              D: v.string(),
            }),
            v.object({
              // deno-lint-ignore valibot-project/require-description valibot-project/require-jsdoc
              C: v.array(v.string()),
            }),
          ]),
          v.description("Type of the vote."),
        ),
        /** List of validator addresses that cast this vote. */
        votes: v.pipe(
          v.array(Address),
          v.description("List of validator addresses that cast this vote."),
        ),
      }),
    ),
    v.description("Array of L1 governance votes cast by validators."),
  );
})();
export type ValidatorL1VotesResponse = v.InferOutput<typeof ValidatorL1VotesResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request validator L1 votes.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of L1 governance votes cast by validators.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { validatorL1Votes } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await validatorL1Votes({ transport });
 * ```
 */
export function validatorL1Votes(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<ValidatorL1VotesResponse> {
  const request = v.parse(ValidatorL1VotesRequest, {
    type: "validatorL1Votes",
  });
  return config.transport.request("info", request, signal);
}
