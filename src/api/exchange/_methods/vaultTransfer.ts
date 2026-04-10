import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";

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
    signature: v.object({
      /** First 32-byte component. */
      r: v.pipe(Hex, v.length(66)),
      /** Second 32-byte component. */
      s: v.pipe(Hex, v.length(66)),
      /** Recovery identifier. */
      v: v.picklist([27, 28]),
    }),
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type VaultTransferRequest = v.InferOutput<typeof VaultTransferRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
 */
export type VaultTransferResponse =
  | {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
      /** Type of response. */
      type: "default";
    };
  }
  | {
    /** Error status. */
    status: "err";
    /** Error message. */
    response: string;
  };

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import { canonicalize } from "../../../signing/mod.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for action fields (excludes request-level system fields). */
const VaultTransferActionSchema = /* @__PURE__ */ (() => {
  return v.object(VaultTransferRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode vaultTransfer} function. */
export type VaultTransferParameters = Omit<v.InferInput<typeof VaultTransferActionSchema>, "type">;

/** Request options for the {@linkcode vaultTransfer} function. */
export type VaultTransferOptions = ExtractRequestOptions<v.InferInput<typeof VaultTransferRequest>>;

/** Successful variant of {@linkcode VaultTransferResponse} without errors. */
export type VaultTransferSuccessResponse = ExcludeErrorResponse<VaultTransferResponse>;

/**
 * Deposit or withdraw from a vault.
 *
 * Signing: L1 Action.
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
 * import { vaultTransfer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await vaultTransfer({ transport, wallet }, {
 *   vaultAddress: "0x...",
 *   isDeposit: true,
 *   usd: 10 * 1e6,
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
 */
export function vaultTransfer(
  config: ExchangeConfig,
  params: VaultTransferParameters,
  opts?: VaultTransferOptions,
): Promise<VaultTransferSuccessResponse> {
  const action = canonicalize(
    VaultTransferActionSchema,
    parse(VaultTransferActionSchema, { type: "vaultTransfer", ...params }),
  );
  return executeL1Action(config, action, opts);
}
