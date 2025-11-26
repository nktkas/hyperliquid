import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../_base.ts";
import { ErrorResponse, Signature, SuccessResponse } from "./_base/mod.ts";

/** Create a referral code. */
export const RegisterReferrerRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("registerReferrer"),
            v.description("Type of action."),
          ),
          /** Referral code to create. */
          code: v.pipe(
            v.string(),
            v.minLength(1),
            v.description("Referral code to create."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Unique request identifier (current timestamp in ms). */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Unique request identifier (current timestamp in ms)."),
      ),
      /** Cryptographic signature. */
      signature: v.pipe(
        Signature,
        v.description("Cryptographic signature."),
      ),
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Create a referral code."),
  );
})();
export type RegisterReferrerRequest = v.InferOutput<typeof RegisterReferrerRequest>;

/** Successful response without specific data or error response. */
export const RegisterReferrerResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type RegisterReferrerResponse = v.InferOutput<typeof RegisterReferrerResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type DeepImmutable, parser } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  type ExcludeErrorResponse,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
} from "./_base/mod.ts";

/** Action parameters for the {@linkcode registerReferrer} function. */
export type RegisterReferrerParameters = ExtractRequestAction<v.InferInput<typeof RegisterReferrerRequest>>;

/** Request options for the {@linkcode registerReferrer} function. */
export type RegisterReferrerOptions = ExtractRequestOptions<v.InferInput<typeof RegisterReferrerRequest>>;

/** Successful variant of {@linkcode RegisterReferrerResponse} without errors. */
export type RegisterReferrerSuccessResponse = ExcludeErrorResponse<RegisterReferrerResponse>;

/**
 * Create a referral code.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
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
export async function registerReferrer(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<RegisterReferrerParameters>,
  opts?: RegisterReferrerOptions,
): Promise<RegisterReferrerSuccessResponse> {
  const request = parser(RegisterReferrerRequest)({
    action: {
      type: "registerReferrer",
      ...params,
    },
    nonce: 0, // Placeholder; actual nonce generated in `executeL1Action`
    signature: { // Placeholder; actual signature generated in `executeL1Action`
      r: "0x0000000000000000000000000000000000000000000000000000000000000000",
      s: "0x0000000000000000000000000000000000000000000000000000000000000000",
      v: 27,
    },
    expiresAfter: typeof config.defaultExpiresAfter === "number"
      ? config.defaultExpiresAfter
      : await config.defaultExpiresAfter?.(),
  });
  return await executeL1Action(config, request, opts?.signal);
}
