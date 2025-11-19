import * as v from "valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../_base.ts";
import { ErrorResponse, Signature, SuccessResponse } from "./_base/mod.ts";

/** Jail or unjail self as a validator signer. */
export const CSignerActionRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.union([
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

/** Successful response without specific data or error response. */
export const CSignerActionResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type CSignerActionResponse = v.InferOutput<typeof CSignerActionResponse>;

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

/** Action parameters for the {@linkcode CSignerAction} function. */
export type CSignerActionParameters = ExtractRequestAction<v.InferInput<typeof CSignerActionRequest>>;

/** Request options for the {@linkcode CSignerAction} function. */
export type CSignerActionOptions = ExtractRequestOptions<v.InferInput<typeof CSignerActionRequest>>;

/** Successful variant of {@linkcode CSignerActionResponse} without errors. */
export type CSignerActionSuccessResponse = ExcludeErrorResponse<CSignerActionResponse>;

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
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cSignerAction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "viem/accounts";
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
): Promise<CSignerActionSuccessResponse> {
  const request = parser(CSignerActionRequest)({
    action: {
      type: "CSignerAction",
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
