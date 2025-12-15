import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/** Set a referral code. */
export const SetReferrerRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("setReferrer"),
            v.description("Type of action."),
          ),
          /** Referral code. */
          code: v.pipe(
            v.string(),
            v.minLength(1),
            v.maxLength(20),
            v.description("Referral code."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Nonce (timestamp in ms) used to prevent replay attacks."),
      ),
      /** ECDSA signature components. */
      signature: v.pipe(
        SignatureSchema,
        v.description("ECDSA signature components."),
      ),
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Set a referral code."),
  );
})();
export type SetReferrerRequest = v.InferOutput<typeof SetReferrerRequest>;

/** Successful response without specific data or error response. */
export const SetReferrerResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type SetReferrerResponse = v.InferOutput<typeof SetReferrerResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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
 */
export function setReferrer(
  config: ExchangeConfig,
  params: SetReferrerParameters,
  opts?: SetReferrerOptions,
): Promise<SetReferrerSuccessResponse> {
  const action = v.parse(SetReferrerParameters, params);
  return executeL1Action(config, { type: "setReferrer", ...action }, opts);
}
