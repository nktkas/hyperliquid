import { Address, type DeepImmutable, Hex, parser, Percent, UnsignedInteger } from "../_common.ts";
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
 * Approve a maximum fee rate for a builder.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
 */
export const ApproveBuilderFeeRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("approveBuilderFee"),
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
          /** Max fee rate (e.g., "0.01%"). */
          maxFeeRate: v.pipe(
            Percent,
            v.description('Max fee rate (e.g., "0.01%").'),
          ),
          /** Builder address. */
          builder: v.pipe(
            Address,
            v.description("Builder address."),
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
    v.description("Approve a maximum fee rate for a builder."),
  );
})();
export type ApproveBuilderFeeRequest = v.InferOutput<typeof ApproveBuilderFeeRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode approveBuilderFee} function. */
export type ApproveBuilderFeeParameters = ExtractRequestAction<v.InferInput<typeof ApproveBuilderFeeRequest>>;
/** Request options for the {@linkcode approveBuilderFee} function. */
export type ApproveBuilderFeeOptions = ExtractRequestOptions<v.InferInput<typeof ApproveBuilderFeeRequest>>;

/** EIP-712 types for the {@linkcode approveBuilderFee} function. */
export const ApproveBuilderFeeTypes = {
  "HyperliquidTransaction:ApproveBuilderFee": [
    { name: "hyperliquidChain", type: "string" },
    { name: "maxFeeRate", type: "string" },
    { name: "builder", type: "address" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Approve a maximum fee rate for a builder.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { approveBuilderFee } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await approveBuilderFee(
 *   { transport, wallet },
 *   { maxFeeRate: "0.01%", builder: "0x..." },
 * );
 * ```
 */
export async function approveBuilderFee(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<ApproveBuilderFeeParameters>,
  opts?: ApproveBuilderFeeOptions,
): Promise<SuccessResponse> {
  const action = parser(ApproveBuilderFeeRequest.entries.action)({
    type: "approveBuilderFee",
    hyperliquidChain: config.transport.isTestnet ? "Testnet" : "Mainnet",
    signatureChainId: await getSignatureChainId(config),
    nonce: await getNonce(config),
    ...params,
  });
  return await executeUserSignedAction(
    config,
    { action, types: ApproveBuilderFeeTypes },
    opts?.signal,
  );
}
