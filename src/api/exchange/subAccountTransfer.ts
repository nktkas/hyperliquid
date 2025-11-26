import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../_base.ts";
import { ErrorResponse, Signature, SuccessResponse } from "./_base/mod.ts";

/** Transfer between sub-accounts (perpetual). */
export const SubAccountTransferRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("subAccountTransfer"),
            v.description("Type of action."),
          ),
          /** Sub-account address. */
          subAccountUser: v.pipe(
            Address,
            v.description("Sub-account address."),
          ),
          /** `true` for deposit, `false` for withdrawal. */
          isDeposit: v.pipe(
            v.boolean(),
            v.description("`true` for deposit, `false` for withdrawal."),
          ),
          /** Amount to transfer (float * 1e6). */
          usd: v.pipe(
            UnsignedInteger,
            v.description("Amount to transfer (float * 1e6)."),
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
    v.description("Transfer between sub-accounts (perpetual)."),
  );
})();
export type SubAccountTransferRequest = v.InferOutput<typeof SubAccountTransferRequest>;

/** Successful response without specific data or error response. */
export const SubAccountTransferResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type SubAccountTransferResponse = v.InferOutput<typeof SubAccountTransferResponse>;

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

/** Action parameters for the {@linkcode subAccountTransfer} function. */
export type SubAccountTransferParameters = ExtractRequestAction<v.InferInput<typeof SubAccountTransferRequest>>;

/** Request options for the {@linkcode subAccountTransfer} function. */
export type SubAccountTransferOptions = ExtractRequestOptions<v.InferInput<typeof SubAccountTransferRequest>>;

/** Successful variant of {@linkcode SubAccountTransferResponse} without errors. */
export type SubAccountTransferSuccessResponse = ExcludeErrorResponse<SubAccountTransferResponse>;

/**
 * Transfer between sub-accounts (perpetual).
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
 * import { subAccountTransfer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await subAccountTransfer(
 *   { transport, wallet },
 *   { subAccountUser: "0x...", isDeposit: true, usd: 1 * 1e6 },
 * );
 * ```
 */
export async function subAccountTransfer(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<SubAccountTransferParameters>,
  opts?: SubAccountTransferOptions,
): Promise<SubAccountTransferSuccessResponse> {
  const request = parser(SubAccountTransferRequest)({
    action: {
      type: "subAccountTransfer",
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
