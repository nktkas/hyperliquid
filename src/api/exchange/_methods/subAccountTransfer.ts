import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Transfer between sub-accounts (perpetual).
 * @see null
 */
export const SubAccountTransferRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("subAccountTransfer"),
      /** Sub-account address. */
      subAccountUser: Address,
      /** `true` for deposit, `false` for withdrawal. */
      isDeposit: v.boolean(),
      /** Amount to transfer (float * 1e6). */
      usd: v.pipe(UnsignedInteger, v.minValue(1)),
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type SubAccountTransferRequest = v.InferOutput<typeof SubAccountTransferRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type SubAccountTransferResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const SubAccountTransferParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(SubAccountTransferRequest.entries.action.entries),
    ["type"],
  );
})();

/** Action parameters for the {@linkcode subAccountTransfer} function. */
export type SubAccountTransferParameters = v.InferInput<typeof SubAccountTransferParameters>;

/** Request options for the {@linkcode subAccountTransfer} function. */
export type SubAccountTransferOptions = ExtractRequestOptions<v.InferInput<typeof SubAccountTransferRequest>>;

/** Successful variant of {@linkcode SubAccountTransferResponse} without errors. */
export type SubAccountTransferSuccessResponse = ExcludeErrorResponse<SubAccountTransferResponse>;

/**
 * Transfer between sub-accounts (perpetual).
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
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
 *
 * @see null
 */
export function subAccountTransfer(
  config: ExchangeConfig,
  params: SubAccountTransferParameters,
  opts?: SubAccountTransferOptions,
): Promise<SubAccountTransferSuccessResponse> {
  const action = parse(SubAccountTransferParameters, params);
  return executeL1Action(config, { type: "subAccountTransfer", ...action }, opts);
}
