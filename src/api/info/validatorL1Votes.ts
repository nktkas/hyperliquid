import * as v from "valibot";
import { Address, Integer, parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request validator L1 votes.
 * @see null
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
 * @see null
 */
export const ValidatorL1VotesResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** L1 governance vote cast by validators. */
      v.pipe(
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
                D: v.string(),
              }),
              v.object({
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
        v.description("L1 governance vote cast by validators."),
      ),
    ),
    v.description("Array of L1 governance votes cast by validators."),
  );
})();
export type ValidatorL1VotesResponse = v.InferOutput<typeof ValidatorL1VotesResponse>;

// -------------------- Function --------------------

/**
 * Request validator L1 votes.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of L1 governance votes cast by validators.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { validatorL1Votes } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await validatorL1Votes({ transport });
 * ```
 */
export function validatorL1Votes(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<ValidatorL1VotesResponse> {
  const request = parser(ValidatorL1VotesRequest)({
    type: "validatorL1Votes",
  });
  return config.transport.request("info", request, signal);
}
