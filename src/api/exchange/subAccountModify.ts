import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
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
 * Modify a sub-account's.
 * @see null
 */
export const SubAccountModifyRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("subAccountModify"),
            v.description("Type of action."),
          ),
          /** Sub-account address to modify. */
          subAccountUser: v.pipe(
            Address,
            v.description("Sub-account address to modify."),
          ),
          /** New sub-account name. */
          name: v.pipe(
            v.string(),
            v.minLength(1),
            v.description("New sub-account name."),
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
    v.description("Modify a sub-account."),
  );
})();
export type SubAccountModifyRequest = v.InferOutput<typeof SubAccountModifyRequest>;

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode subAccountModify} function. */
export type SubAccountModifyParameters = ExtractRequestAction<v.InferInput<typeof SubAccountModifyRequest>>;
/** Request options for the {@linkcode subAccountModify} function. */
export type SubAccountModifyOptions = ExtractRequestOptions<v.InferInput<typeof SubAccountModifyRequest>>;

/**
 * Modify a sub-account's.
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
 * import { subAccountModify } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await subAccountModify(
 *   { transport, wallet },
 *   { subAccountUser: "0x...", name: "..."  },
 * );
 * ```
 */
export async function subAccountModify(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<SubAccountModifyParameters>,
  opts?: SubAccountModifyOptions,
): Promise<SuccessResponse> {
  const action = parser(SubAccountModifyRequest.entries.action)({
    type: "subAccountModify",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
