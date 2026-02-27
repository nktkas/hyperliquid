import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request validator L1 votes.
 * @see null
 */
export const ValidatorL1VotesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("validatorL1Votes"),
  });
})();
export type ValidatorL1VotesRequest = v.InferOutput<typeof ValidatorL1VotesRequest>;

/**
 * Array of L1 governance votes cast by validators.
 * @see null
 */
export type ValidatorL1VotesResponse = {
  /** Timestamp when the vote expires (in ms since epoch). */
  expireTime: number;
  /** Type of the vote. */
  action: {
    D: string;
  } | {
    C: string[];
  };
  /**
   * List of validator addresses that cast this vote.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  votes: `0x${string}`[];
}[];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/**
 * Request validator L1 votes.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of L1 governance votes cast by validators.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
 *
 * @see null
 */
export function validatorL1Votes(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<ValidatorL1VotesResponse> {
  const request = parse(ValidatorL1VotesRequest, {
    type: "validatorL1Votes",
  });
  return config.transport.request("info", request, signal);
}
