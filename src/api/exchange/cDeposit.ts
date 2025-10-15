import { type DeepImmutable, Hex, parser, UnsignedInteger } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  executeUserSignedAction,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  getNonce,
  getSignatureChainId,
  type MultiSignRequestConfig,
  Signature,
} from "./_base.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/**
 * Transfer native token from the user spot account into staking for delegating to validators.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
 */
export const CDepositRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("cDeposit"),
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
          /** Amount of wei to deposit into staking balance (float * 1e8). */
          wei: v.pipe(
            UnsignedInteger,
            v.description("Amount of wei to deposit into staking balance (float * 1e8)."),
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
    v.description("Transfer native token from the user spot account into staking for delegating to validators."),
  );
})();
export type CDepositRequest = v.InferOutput<typeof CDepositRequest>;

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode cDeposit} function. */
export type CDepositParameters = ExtractRequestAction<v.InferInput<typeof CDepositRequest>>;
/** Request options for the {@linkcode cDeposit} function. */
export type CDepositOptions = ExtractRequestOptions<v.InferInput<typeof CDepositRequest>>;

/** EIP-712 types for the {@linkcode cDeposit} function. */
export const CDepositTypes = {
  "HyperliquidTransaction:CDeposit": [
    { name: "hyperliquidChain", type: "string" },
    { name: "wei", type: "uint64" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Transfer native token from the user spot account into staking for delegating to validators.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cDeposit } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await cDeposit(
 *   { transport, wallet },
 *   { wei: 1 * 1e8 },
 * );
 * ```
 */
export async function cDeposit(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<CDepositParameters>,
  opts?: CDepositOptions,
): Promise<SuccessResponse> {
  const action = parser(CDepositRequest.entries.action)({
    type: "cDeposit",
    hyperliquidChain: config.transport.isTestnet ? "Testnet" : "Mainnet",
    signatureChainId: await getSignatureChainId(config),
    nonce: await getNonce(config),
    ...params,
  });
  return await executeUserSignedAction(
    config,
    { action, types: CDepositTypes },
    opts?.signal,
  );
}
