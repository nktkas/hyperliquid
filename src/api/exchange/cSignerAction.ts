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
 * Jail or unjail self as a validator signer.
 * @see null
 */
export const CSignerActionRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.variant("type", [
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("CSignerAction"),
              v.description("Type of action."),
            ),
            /** Jail the signer. */
            jailSelf: v.pipe(
              v.null(),
              v.description("Jail the signer."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("CSignerAction"),
              v.description("Type of action."),
            ),
            /** Unjail the signer. */
            unjailSelf: v.pipe(
              v.null(),
              v.description("Unjail the signer."),
            ),
          }),
        ]),
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
    v.description("Jail or unjail self as a validator signer."),
  );
})();
export type CSignerActionRequest = v.InferOutput<typeof CSignerActionRequest>;

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode CSignerAction} function. */
export type CSignerActionParameters = ExtractRequestAction<v.InferInput<typeof CSignerActionRequest>>;
/** Request options for the {@linkcode CSignerAction} function. */
export type CSignerActionOptions = ExtractRequestOptions<v.InferInput<typeof CSignerActionRequest>>;

/**
 * Jail or unjail self as a validator signer.
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
 * import { cSignerAction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * // Jail self
 * await cSignerAction(
 *   { transport, wallet },
 *   { jailSelf: null },
 * );
 *
 * // Unjail self
 * await cSignerAction(
 *   { transport, wallet },
 *   { unjailSelf: null },
 * );
 * ```
 */
export async function cSignerAction(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<CSignerActionParameters>,
  opts?: CSignerActionOptions,
): Promise<SuccessResponse> {
  const action = parser(CSignerActionRequest.entries.action)({
    type: "CSignerAction",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
