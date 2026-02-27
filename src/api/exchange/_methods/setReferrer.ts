import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Set a referral code.
 * @see null
 */
export const SetReferrerRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("setReferrer"),
      /** Referral code. */
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
export type SetReferrerRequest = v.InferOutput<typeof SetReferrerRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type SetReferrerResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const SetReferrerParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(SetReferrerRequest.entries.action.entries),
    ["type"],
  );
})();

/** Action parameters for the {@linkcode setReferrer} function. */
export type SetReferrerParameters = v.InferInput<typeof SetReferrerParameters>;

/** Request options for the {@linkcode setReferrer} function. */
export type SetReferrerOptions = ExtractRequestOptions<v.InferInput<typeof SetReferrerRequest>>;

/** Successful variant of {@linkcode SetReferrerResponse} without errors. */
export type SetReferrerSuccessResponse = ExcludeErrorResponse<SetReferrerResponse>;

/**
 * Set a referral code.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
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
 * import { setReferrer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await setReferrer(
 *   { transport, wallet },
 *   { code: "..." },
 * );
 * ```
 *
 * @see null
 */
export function setReferrer(
  config: ExchangeConfig,
  params: SetReferrerParameters,
  opts?: SetReferrerOptions,
): Promise<SetReferrerSuccessResponse> {
  const action = parse(SetReferrerParameters, params);
  return executeL1Action(config, { type: "setReferrer", ...action }, opts);
}
