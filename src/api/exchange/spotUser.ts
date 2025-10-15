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
 * Opt Out of Spot Dusting.
 * @see null
 */
export const SpotUserRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("spotUser"),
            v.description("Type of action."),
          ),
          /** Spot dusting options. */
          toggleSpotDusting: v.pipe(
            v.object({
              /** Opt out of spot dusting. */
              optOut: v.pipe(
                v.boolean(),
                v.description("Opt out of spot dusting."),
              ),
            }),
            v.description("Spot dusting options."),
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
    v.description("Opt Out of Spot Dusting."),
  );
})();
export type SpotUserRequest = v.InferOutput<typeof SpotUserRequest>;

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode spotUser} function. */
export type SpotUserParameters = ExtractRequestAction<v.InferInput<typeof SpotUserRequest>>;
/** Request options for the {@linkcode spotUser} function. */
export type SpotUserOptions = ExtractRequestOptions<v.InferInput<typeof SpotUserRequest>>;

/**
 * Opt Out of Spot Dusting.
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
 * import { spotUser } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await spotUser(
 *   { transport, wallet },
 *   { toggleSpotDusting: { optOut: false } },
 * );
 * ```
 */
export async function spotUser(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<SpotUserParameters>,
  opts?: SpotUserOptions,
): Promise<SuccessResponse> {
  const action = parser(SpotUserRequest.entries.action)({
    type: "spotUser",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
