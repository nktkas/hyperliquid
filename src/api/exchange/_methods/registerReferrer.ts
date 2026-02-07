import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Create a referral code.
 */
export const RegisterReferrerRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("registerReferrer"),
      /** Referral code to create. */
      code: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type RegisterReferrerRequest = v.InferOutput<typeof RegisterReferrerRequest>;

/**
 * Successful response without specific data or error response.
 */
export type RegisterReferrerResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const RegisterReferrerParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(RegisterReferrerRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode registerReferrer} function. */
export type RegisterReferrerParameters = v.InferInput<typeof RegisterReferrerParameters>;

/** Request options for the {@linkcode registerReferrer} function. */
export type RegisterReferrerOptions = ExtractRequestOptions<v.InferInput<typeof RegisterReferrerRequest>>;

/** Successful variant of {@linkcode RegisterReferrerResponse} without errors. */
export type RegisterReferrerSuccessResponse = ExcludeErrorResponse<RegisterReferrerResponse>;

/**
 * Create a referral code.
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
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
 * import { registerReferrer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await registerReferrer(
 *   { transport, wallet },
 *   { code: "..." },
 * );
 * ```
 */
export function registerReferrer(
  config: ExchangeConfig,
  params: RegisterReferrerParameters,
  opts?: RegisterReferrerOptions,
): Promise<RegisterReferrerSuccessResponse> {
  const action = v.parse(RegisterReferrerParameters, params);
  return executeL1Action(config, { type: "registerReferrer", ...action }, opts);
}
