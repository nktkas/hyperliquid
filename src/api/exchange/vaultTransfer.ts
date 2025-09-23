import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_common.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_common.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/**
 * Deposit or withdraw from a vault.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
 */
export const VaultTransferRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("vaultTransfer"),
            v.description("Type of action."),
          ),
          /** Vault address. */
          vaultAddress: v.pipe(
            Address,
            v.description("Vault address."),
          ),
          /** `true` for deposit, `false` for withdrawal. */
          isDeposit: v.pipe(
            v.boolean(),
            v.description("`true` for deposit, `false` for withdrawal."),
          ),
          /** Amount for deposit/withdrawal (float * 1e6). */
          usd: v.pipe(
            UnsignedInteger,
            v.description("Amount for deposit/withdrawal (float * 1e6)."),
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
    v.description("Deposit or withdraw from a vault."),
  );
})();
export type VaultTransferRequest = v.InferOutput<typeof VaultTransferRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode vaultTransfer} function. */
export type VaultTransferParameters = ExtractRequestAction<v.InferInput<typeof VaultTransferRequest>>;
/** Request options for the {@linkcode vaultTransfer} function. */
export type VaultTransferOptions = ExtractRequestOptions<v.InferInput<typeof VaultTransferRequest>>;

/**
 * Deposit or withdraw from a vault.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
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
 */
export async function vaultTransfer(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<VaultTransferParameters>,
  opts?: VaultTransferOptions,
): Promise<SuccessResponse> {
  const action = parser(VaultTransferRequest.entries.action)({
    type: "vaultTransfer",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
