import { Address, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
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
 * Initiate a withdrawal request.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
 */
export const Withdraw3Request = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("withdraw3"),
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
          /** Amount to withdraw (1 = 1$). */
          amount: v.pipe(
            UnsignedDecimal,
            v.description("Amount to withdraw (1 = 1$)."),
          ),
          /** Unique request identifier (current timestamp in ms). */
          time: v.pipe(
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
    v.description("Initiate a withdrawal request."),
  );
})();
export type Withdraw3Request = v.InferOutput<typeof Withdraw3Request>;

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode withdraw3} function. */
export type Withdraw3Parameters = ExtractRequestAction<v.InferInput<typeof Withdraw3Request>>;
/** Request options for the {@linkcode withdraw3} function. */
export type Withdraw3Options = ExtractRequestOptions<v.InferInput<typeof Withdraw3Request>>;

/** EIP-712 types for the {@linkcode withdraw3} function. */
export const Withdraw3Types = {
  "HyperliquidTransaction:Withdraw": [
    { name: "hyperliquidChain", type: "string" },
    { name: "destination", type: "string" },
    { name: "amount", type: "string" },
    { name: "time", type: "uint64" },
  ],
};

/**
 * Initiate a withdrawal request.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { withdraw3 } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await withdraw3(
 *   { transport, wallet },
 *   { destination: "0x...", amount: "1" },
 * );
 * ```
 */
export async function withdraw3(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<Withdraw3Parameters>,
  opts?: Withdraw3Options,
): Promise<SuccessResponse> {
  const action = parser(Withdraw3Request.entries.action)({
    type: "withdraw3",
    hyperliquidChain: config.transport.isTestnet ? "Testnet" : "Mainnet",
    signatureChainId: await getSignatureChainId(config),
    time: await getNonce(config),
    ...params,
  });
  return await executeUserSignedAction(
    config,
    { action, types: Withdraw3Types },
    opts?.signal,
  );
}
