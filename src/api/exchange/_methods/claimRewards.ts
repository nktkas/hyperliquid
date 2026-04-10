import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Claim rewards from referral program.
 * @see null
 */
export const ClaimRewardsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("claimRewards"),
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: v.object({
      /** First 32-byte component. */
      r: v.pipe(Hex, v.length(66)),
      /** Second 32-byte component. */
      s: v.pipe(Hex, v.length(66)),
      /** Recovery identifier. */
      v: v.picklist([27, 28]),
    }),
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type ClaimRewardsRequest = v.InferOutput<typeof ClaimRewardsRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type ClaimRewardsResponse =
  | {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
      /** Type of response. */
      type: "default";
    };
  }
  | {
    /** Error status. */
    status: "err";
    /** Error message. */
    response: string;
  };

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import { canonicalize } from "../../../signing/mod.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for action fields (excludes request-level system fields). */
const ClaimRewardsActionSchema = /* @__PURE__ */ (() => {
  return v.object(ClaimRewardsRequest.entries.action.entries);
})();

/** Request options for the {@linkcode claimRewards} function. */
export type ClaimRewardsOptions = ExtractRequestOptions<v.InferInput<typeof ClaimRewardsRequest>>;

/** Successful variant of {@linkcode ClaimRewardsResponse} without errors. */
export type ClaimRewardsSuccessResponse = ExcludeErrorResponse<ClaimRewardsResponse>;

/**
 * Claim rewards from referral program.
 *
 * Signing: L1 Action.
 *
 * @param config General configuration for Exchange API requests.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { claimRewards } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await claimRewards({ transport, wallet });
 * ```
 *
 * @see null
 */
export function claimRewards(
  config: ExchangeConfig,
  opts?: ClaimRewardsOptions,
): Promise<ClaimRewardsSuccessResponse> {
  const action = canonicalize(
    ClaimRewardsActionSchema,
    parse(ClaimRewardsActionSchema, { type: "claimRewards" }),
  );
  return executeL1Action(config, action, opts);
}
