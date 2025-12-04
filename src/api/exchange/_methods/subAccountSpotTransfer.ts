import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, TokenId, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, Nonce, Signature, SuccessResponse } from "./_base/schemas.ts";

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
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
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

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const SubAccountSpotTransferParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(SubAccountSpotTransferRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode subAccountSpotTransfer} function. */
export type SubAccountSpotTransferParameters = v.InferInput<typeof SubAccountSpotTransferParameters>;

/** Request options for the {@linkcode subAccountSpotTransfer} function. */
export type SubAccountSpotTransferOptions = ExtractRequestOptions<v.InferInput<typeof SubAccountSpotTransferRequest>>;

/** Successful variant of {@linkcode SubAccountSpotTransferResponse} without errors. */
export type SubAccountSpotTransferSuccessResponse = ExcludeErrorResponse<SubAccountSpotTransferResponse>;

/**
 * Transfer between sub-accounts (spot).
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
 * import { subAccountSpotTransfer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
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
export function subAccountSpotTransfer(
  config: ExchangeConfig,
  params: SubAccountSpotTransferParameters,
  opts?: SubAccountSpotTransferOptions,
): Promise<SubAccountSpotTransferSuccessResponse> {
  const action = v.parse(SubAccountSpotTransferParameters, params);
  return executeL1Action(config, { type: "subAccountSpotTransfer", ...action }, opts);
}
