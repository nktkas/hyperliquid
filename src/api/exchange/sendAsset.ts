import { Address, type DeepImmutable, Hex, parser, TokenId, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
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
 * Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset-testnet-only
 */
export const SendAssetRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("sendAsset"),
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
          /** Destination address. */
          destination: v.pipe(
            Address,
            v.description("Destination address."),
          ),
          /** Source DEX ("" for default USDC perp DEX, "spot" for spot). */
          sourceDex: v.pipe(
            v.string(),
            v.description('Source DEX ("" for default USDC perp DEX, "spot" for spot).'),
          ),
          /** Destination DEX ("" for default USDC perp DEX, "spot" for spot). */
          destinationDex: v.pipe(
            v.string(),
            v.description('Destination DEX ("" for default USDC perp DEX, "spot" for spot).'),
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
          /** Source sub-account address ("" for main account) (default: ""). */
          fromSubAccount: v.pipe(
            v.optional(v.union([v.literal(""), Address]), ""),
            v.description('Source sub-account address ("" for main account).'),
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
    v.description("Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts."),
  );
})();
export type SendAssetRequest = v.InferOutput<typeof SendAssetRequest>;

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode sendAsset} function. */
export type SendAssetParameters = ExtractRequestAction<v.InferInput<typeof SendAssetRequest>>;
/** Request options for the {@linkcode sendAsset} function. */
export type SendAssetOptions = ExtractRequestOptions<v.InferInput<typeof SendAssetRequest>>;

/** EIP-712 types for the {@linkcode sendAsset} function. */
export const SendAssetTypes = {
  "HyperliquidTransaction:SendAsset": [
    { name: "hyperliquidChain", type: "string" },
    { name: "destination", type: "string" },
    { name: "sourceDex", type: "string" },
    { name: "destinationDex", type: "string" },
    { name: "token", type: "string" },
    { name: "amount", type: "string" },
    { name: "fromSubAccount", type: "string" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset-testnet-only
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { sendAsset } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await sendAsset(
 *   { transport, wallet },
 *   {
 *     destination: "0x0000000000000000000000000000000000000001",
 *     sourceDex: "",
 *     destinationDex: "test",
 *     token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
 *     amount: "1",
 *   },
 * );
 * ```
 */
export async function sendAsset(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<SendAssetParameters>,
  opts?: SendAssetOptions,
): Promise<SuccessResponse> {
  const action = parser(SendAssetRequest.entries.action)({
    type: "sendAsset",
    hyperliquidChain: config.transport.isTestnet ? "Testnet" : "Mainnet",
    signatureChainId: await getSignatureChainId(config),
    nonce: await getNonce(config),
    ...params,
  });
  return await executeUserSignedAction(
    config,
    { action, types: SendAssetTypes },
    opts?.signal,
  );
}
