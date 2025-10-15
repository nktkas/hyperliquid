import { Address, type DeepImmutable, Hex, parser, UnsignedInteger } from "../_base.ts";
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
 * Approve an agent to sign on behalf of the master account.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
 */
export const ApproveAgentRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("approveAgent"),
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
          /** Agent address. */
          agentAddress: v.pipe(
            Address,
            v.description("Agent address."),
          ),
          /** Agent name or null for unnamed agent (default: null). */
          agentName: v.pipe(
            v.optional(v.nullable(v.string()), null),
            v.description("Agent name or null for unnamed agent."),
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
    v.description("Approve an agent to sign on behalf of the master account."),
  );
})();
export type ApproveAgentRequest = v.InferOutput<typeof ApproveAgentRequest>;

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode approveAgent} function. */
export type ApproveAgentParameters = ExtractRequestAction<v.InferInput<typeof ApproveAgentRequest>>;
/** Request options for the {@linkcode approveAgent} function. */
export type ApproveAgentOptions = ExtractRequestOptions<v.InferInput<typeof ApproveAgentRequest>>;

/** EIP-712 types for the {@linkcode approveAgent} function. */
export const ApproveAgentTypes = {
  "HyperliquidTransaction:ApproveAgent": [
    { name: "hyperliquidChain", type: "string" },
    { name: "agentAddress", type: "address" },
    { name: "agentName", type: "string" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Approve an agent to sign on behalf of the master account.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { approveAgent } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await approveAgent(
 *   { transport, wallet },
 *   { agentAddress: "0x...", agentName: "..." },
 * );
 * ```
 */
export async function approveAgent(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<ApproveAgentParameters>,
  opts?: ApproveAgentOptions,
): Promise<SuccessResponse> {
  const action = parser(ApproveAgentRequest.entries.action)({
    type: "approveAgent",
    hyperliquidChain: config.transport.isTestnet ? "Testnet" : "Mainnet",
    signatureChainId: await getSignatureChainId(config),
    nonce: await getNonce(config),
    ...params,
  });
  return await executeUserSignedAction(
    config,
    { action, types: ApproveAgentTypes },
    opts?.signal,
  );
}
