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
 * Modify a vault's configuration.
 * @see null
 */
export const VaultModifyRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("vaultModify"),
            v.description("Type of action."),
          ),
          /** Vault address. */
          vaultAddress: v.pipe(
            Address,
            v.description("Vault address."),
          ),
          /** Allow deposits from followers (default: null). */
          allowDeposits: v.pipe(
            v.optional(v.nullable(v.boolean()), null),
            v.description("Allow deposits from followers."),
          ),
          /** Always close positions on withdrawal (default: null). */
          alwaysCloseOnWithdraw: v.pipe(
            v.optional(v.nullable(v.boolean()), null),
            v.description("Always close positions on withdrawal."),
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
    v.description("Modify a vault's configuration."),
  );
})();
export type VaultModifyRequest = v.InferOutput<typeof VaultModifyRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode vaultModify} function. */
export type VaultModifyParameters = ExtractRequestAction<v.InferInput<typeof VaultModifyRequest>>;
/** Request options for the {@linkcode vaultModify} function. */
export type VaultModifyOptions = ExtractRequestOptions<v.InferInput<typeof VaultModifyRequest>>;

/**
 * Modify a vault's configuration.
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
 * import { vaultModify } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await vaultModify(
 *   { transport, wallet },
 *   {
 *     vaultAddress: "0x...",
 *     allowDeposits: true,
 *     alwaysCloseOnWithdraw: false,
 *   },
 * );
 * ```
 */
export async function vaultModify(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<VaultModifyParameters>,
  opts?: VaultModifyOptions,
): Promise<SuccessResponse> {
  const action = parser(VaultModifyRequest.entries.action)({
    type: "vaultModify",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
