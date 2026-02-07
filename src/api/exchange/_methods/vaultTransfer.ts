import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Deposit or withdraw from a vault.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
 */
export const VaultTransferRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("vaultTransfer"),
      /** Vault address. */
      vaultAddress: Address,
      /** `true` for deposit, `false` for withdrawal. */
      isDeposit: v.boolean(),
      /** Amount for deposit/withdrawal (float * 1e6). */
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
export type VaultTransferRequest = v.InferOutput<typeof VaultTransferRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
 */
export type VaultTransferResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const VaultTransferParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(VaultTransferRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode vaultTransfer} function. */
export type VaultTransferParameters = v.InferInput<typeof VaultTransferParameters>;

/** Request options for the {@linkcode vaultTransfer} function. */
export type VaultTransferOptions = ExtractRequestOptions<v.InferInput<typeof VaultTransferRequest>>;

/** Successful variant of {@linkcode VaultTransferResponse} without errors. */
export type VaultTransferSuccessResponse = ExcludeErrorResponse<VaultTransferResponse>;

/**
 * Deposit or withdraw from a vault.
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
 * import { vaultTransfer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await vaultTransfer(
 *   { transport, wallet },
 *   { vaultAddress: "0x...", isDeposit: true, usd: 10 * 1e6 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
 */
export function vaultTransfer(
  config: ExchangeConfig,
  params: VaultTransferParameters,
  opts?: VaultTransferOptions,
): Promise<VaultTransferSuccessResponse> {
  const action = v.parse(VaultTransferParameters, params);
  return executeL1Action(config, { type: "vaultTransfer", ...action }, opts);
}
