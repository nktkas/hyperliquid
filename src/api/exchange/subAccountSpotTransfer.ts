import * as v from "valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, TokenId, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import { ErrorResponse, Signature, SuccessResponse } from "./_base/mod.ts";

/** Transfer between sub-accounts (spot). */
export const SubAccountSpotTransferRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("subAccountSpotTransfer"),
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
          /** Token identifier. */
          token: v.pipe(
            TokenId,
            v.description("Token identifier."),
          ),
          /** Amount to send (not in wei). */
          amount: v.pipe(
            UnsignedDecimal,
            v.description("Amount to send (not in wei)."),
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
    v.description("Transfer between sub-accounts (spot)."),
  );
})();
export type SubAccountSpotTransferRequest = v.InferOutput<typeof SubAccountSpotTransferRequest>;

/** Successful response without specific data or error response. */
export const SubAccountSpotTransferResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type SubAccountSpotTransferResponse = v.InferOutput<typeof SubAccountSpotTransferResponse>;

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

/** Action parameters for the {@linkcode subAccountSpotTransfer} function. */
export type SubAccountSpotTransferParameters = ExtractRequestAction<v.InferInput<typeof SubAccountSpotTransferRequest>>;

/** Request options for the {@linkcode subAccountSpotTransfer} function. */
export type SubAccountSpotTransferOptions = ExtractRequestOptions<v.InferInput<typeof SubAccountSpotTransferRequest>>;

/** Successful variant of {@linkcode SubAccountSpotTransferResponse} without errors. */
export type SubAccountSpotTransferSuccessResponse = ExcludeErrorResponse<SubAccountSpotTransferResponse>;

/**
 * Transfer between sub-accounts (spot).
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
 * import { subAccountSpotTransfer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await subAccountSpotTransfer(
 *   { transport, wallet },
 *   {
 *     subAccountUser: "0x...",
 *     isDeposit: true,
 *     token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
 *     amount: "1",
 *   },
 * );
 * ```
 */
export async function subAccountSpotTransfer(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<SubAccountSpotTransferParameters>,
  opts?: SubAccountSpotTransferOptions,
): Promise<SubAccountSpotTransferSuccessResponse> {
  const request = parser(SubAccountSpotTransferRequest)({
    action: {
      type: "subAccountSpotTransfer",
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
