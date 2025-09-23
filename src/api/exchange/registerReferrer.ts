import { type DeepImmutable, parser, UnsignedInteger } from "../_common.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_common.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/**
 * Create a referral code.
 * @see null
 */
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

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode registerReferrer} function. */
export type RegisterReferrerParameters = ExtractRequestAction<v.InferInput<typeof RegisterReferrerRequest>>;
/** Request options for the {@linkcode registerReferrer} function. */
export type RegisterReferrerOptions = ExtractRequestOptions<v.InferInput<typeof RegisterReferrerRequest>>;

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
 * @see null
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
): Promise<SuccessResponse> {
  const action = parser(RegisterReferrerRequest.entries.action)({
    type: "registerReferrer",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
