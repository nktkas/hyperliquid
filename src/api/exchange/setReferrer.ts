import { type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_base.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/**
 * Set a referral code.
 * @see null
 */
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
            v.description("Referral code."),
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
    v.description("Set a referral code."),
  );
})();
export type SetReferrerRequest = v.InferOutput<typeof SetReferrerRequest>;

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode setReferrer} function. */
export type SetReferrerParameters = ExtractRequestAction<v.InferInput<typeof SetReferrerRequest>>;
/** Request options for the {@linkcode setReferrer} function. */
export type SetReferrerOptions = ExtractRequestOptions<v.InferInput<typeof SetReferrerRequest>>;

/**
 * Set a referral code.
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
export async function setReferrer(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<SetReferrerParameters>,
  opts?: SetReferrerOptions,
): Promise<SuccessResponse> {
  const action = parser(SetReferrerRequest.entries.action)({
    type: "setReferrer",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
