import { Address, type DeepImmutable, Hex, parser, UnsignedInteger } from "../_common.ts";
import {
  type ExchangeRequestConfig,
  executeUserSignedAction,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  getNonce,
  getSignatureChainId,
  type MultiSignRequestConfig,
  Signature,
} from "./_common.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/**
 * Delegate or undelegate native tokens to or from a validator.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
 */
export const TokenDelegateRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("tokenDelegate"),
            v.description("Type of action."),
          ),
          /** Chain ID used for signing. */
          signatureChainId: v.pipe(
            Hex,
            v.description("Chain ID used for signing."),
          ),
          /** HyperLiquid network. */
          hyperliquidChain: v.pipe(
            v.union([v.literal("Mainnet"), v.literal("Testnet")]),
            v.description("HyperLiquid network."),
          ),
          /** Validator address. */
          validator: v.pipe(
            Address,
            v.description("Validator address."),
          ),
          /** Amount for delegate/undelegate (float * 1e8). */
          wei: v.pipe(
            UnsignedInteger,
            v.description("Amount for delegate/undelegate (float * 1e8)."),
          ),
          /** `true` for undelegate, `false` for delegate. */
          isUndelegate: v.pipe(
            v.boolean(),
            v.description("`true` for undelegate, `false` for delegate."),
          ),
          /** Unique request identifier (current timestamp in ms). */
          nonce: v.pipe(
            UnsignedInteger,
            v.description("Unique request identifier (current timestamp in ms)."),
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
    }),
    v.description("Delegate or undelegate native tokens to or from a validator."),
  );
})();
export type TokenDelegateRequest = v.InferOutput<typeof TokenDelegateRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode tokenDelegate} function. */
export type TokenDelegateParameters = ExtractRequestAction<v.InferInput<typeof TokenDelegateRequest>>;
/** Request options for the {@linkcode tokenDelegate} function. */
export type TokenDelegateOptions = ExtractRequestOptions<v.InferInput<typeof TokenDelegateRequest>>;

/** EIP-712 types for the {@linkcode tokenDelegate} function. */
export const TokenDelegateTypes = {
  "HyperliquidTransaction:TokenDelegate": [
    { name: "hyperliquidChain", type: "string" },
    { name: "validator", type: "address" },
    { name: "wei", type: "uint64" },
    { name: "isUndelegate", type: "bool" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Delegate or undelegate native tokens to or from a validator.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { tokenDelegate } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await tokenDelegate(
 *   { transport, wallet },
 *   { validator: "0x...", isUndelegate: true, wei: 1 * 1e8 },
 * );
 * ```
 */
export async function tokenDelegate(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<TokenDelegateParameters>,
  opts?: TokenDelegateOptions,
): Promise<SuccessResponse> {
  const action = parser(TokenDelegateRequest.entries.action)({
    type: "tokenDelegate",
    hyperliquidChain: config.transport.isTestnet ? "Testnet" : "Mainnet",
    signatureChainId: await getSignatureChainId(config),
    nonce: await getNonce(config),
    ...params,
  });
  return await executeUserSignedAction(
    config,
    { action, types: TokenDelegateTypes },
    opts?.signal,
  );
}
