import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, Nonce, Signature, SuccessResponse } from "./_base/schemas.ts";

/** Claim rewards from referral program. */
export const ClaimRewardsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("claimRewards"),
            v.description("Type of action."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Claim rewards from referral program."),
  );
})();
export type ClaimRewardsRequest = v.InferOutput<typeof ClaimRewardsRequest>;

/** Successful response without specific data or error response. */
export const ClaimRewardsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type ClaimRewardsResponse = v.InferOutput<typeof ClaimRewardsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Request options for the {@linkcode claimRewards} function. */
export type ClaimRewardsOptions = ExtractRequestOptions<v.InferInput<typeof ClaimRewardsRequest>>;

/** Successful variant of {@linkcode ClaimRewardsResponse} without errors. */
export type ClaimRewardsSuccessResponse = ExcludeErrorResponse<ClaimRewardsResponse>;

/**
 * Claim rewards from referral program.
 *
 * @param opts - Request execution options.
 *
 * @returns Successful response without specific data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
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
 */
export function claimRewards(
  config: ExchangeConfig,
  opts?: ClaimRewardsOptions,
): Promise<ClaimRewardsSuccessResponse> {
  return executeL1Action(config, { type: "claimRewards" }, opts);
}
