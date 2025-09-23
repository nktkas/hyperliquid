import { type DeepImmutable, Hex, parser, UnsignedInteger } from "../_common.ts";
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
 * Transfer native token from staking into the user's spot account.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
 */
export const CWithdrawRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("cWithdraw"),
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
          /** Amount of wei to withdraw from staking balance (float * 1e8). */
          wei: v.pipe(
            UnsignedInteger,
            v.description("Amount of wei to withdraw from staking balance (float * 1e8)."),
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
    v.description("Transfer native token from staking into the user's spot account."),
  );
})();
export type CWithdrawRequest = v.InferOutput<typeof CWithdrawRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode cWithdraw} function. */
export type CWithdrawParameters = ExtractRequestAction<v.InferInput<typeof CWithdrawRequest>>;
/** Request options for the {@linkcode cWithdraw} function. */
export type CWithdrawOptions = ExtractRequestOptions<v.InferInput<typeof CWithdrawRequest>>;

/** EIP-712 types for the {@linkcode cWithdraw} function. */
export const CWithdrawTypes = {
  "HyperliquidTransaction:CWithdraw": [
    { name: "hyperliquidChain", type: "string" },
    { name: "wei", type: "uint64" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Transfer native token from staking into the user's spot account.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cWithdraw } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await cWithdraw(
 *   { transport, wallet },
 *   { wei: 1 * 1e8 },
 * );
 * ```
 */
export async function cWithdraw(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<CWithdrawParameters>,
  opts?: CWithdrawOptions,
): Promise<SuccessResponse> {
  const action = parser(CWithdrawRequest.entries.action)({
    type: "cWithdraw",
    hyperliquidChain: config.transport.isTestnet ? "Testnet" : "Mainnet",
    signatureChainId: await getSignatureChainId(config),
    nonce: await getNonce(config),
    ...params,
  });
  return await executeUserSignedAction(
    config,
    { action, types: CWithdrawTypes },
    opts?.signal,
  );
}
