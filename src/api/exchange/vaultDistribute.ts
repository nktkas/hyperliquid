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
 * Distribute funds from a vault between followers.
 * @see null
 */
export const VaultDistributeRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("vaultDistribute"),
            v.description("Type of action."),
          ),
          /** Vault address. */
          vaultAddress: v.pipe(
            Address,
            v.description("Vault address."),
          ),
          /**
           * Amount to distribute (float * 1e6).
           *
           * Set to 0 to close the vault.
           */
          usd: v.pipe(
            UnsignedInteger,
            v.description(
              "Amount to distribute (float * 1e6)." +
                "\n\nSet to 0 to close the vault.",
            ),
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
    v.description("Distribute funds from a vault between followers."),
  );
})();
export type VaultDistributeRequest = v.InferOutput<typeof VaultDistributeRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode vaultDistribute} function. */
export type VaultDistributeParameters = ExtractRequestAction<v.InferInput<typeof VaultDistributeRequest>>;
/** Request options for the {@linkcode vaultDistribute} function. */
export type VaultDistributeOptions = ExtractRequestOptions<v.InferInput<typeof VaultDistributeRequest>>;

/**
 * Distribute funds from a vault between followers.
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
 * import { vaultDistribute } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await vaultDistribute(
 *   { transport, wallet },
 *   { vaultAddress: "0x...", usd: 10 * 1e6 },
 * );
 * ```
 */
export async function vaultDistribute(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<VaultDistributeParameters>,
  opts?: VaultDistributeOptions,
): Promise<SuccessResponse> {
  const action = parser(VaultDistributeRequest.entries.action)({
    type: "vaultDistribute",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
