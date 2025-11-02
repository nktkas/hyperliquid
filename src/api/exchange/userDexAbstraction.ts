import * as v from "valibot";
import { Address, type DeepImmutable, Hex, parser, UnsignedInteger } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  executeUserSignedAction,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  getSignatureChainId,
  type MultiSignRequestConfig,
  Signature,
} from "./_base/mod.ts";

// -------------------- Schemas --------------------

/**
 * Enable/disable HIP-3 DEX abstraction.
 * @see null
 */
export const UserDexAbstractionExchangeRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("userDexAbstraction"),
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
          /** User address. */
          user: v.pipe(
            Address,
            v.description("User address."),
          ),
          /** Whether to enable or disable HIP-3 DEX abstraction. */
          enabled: v.pipe(
            v.boolean(),
            v.description("Whether to enable or disable HIP-3 DEX abstraction."),
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
    v.description("Enable/disable HIP-3 DEX abstraction."),
  );
})();
export type UserDexAbstractionExchangeRequest = v.InferOutput<typeof UserDexAbstractionExchangeRequest>;

import { SuccessResponse } from "./_base/mod.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode userDexAbstraction} function. */
export type UserDexAbstractionExchangeParameters = ExtractRequestAction<
  v.InferInput<typeof UserDexAbstractionExchangeRequest>
>;
/** Request options for the {@linkcode userDexAbstraction} function. */
export type UserDexAbstractionExchangeOptions = ExtractRequestOptions<
  v.InferInput<typeof UserDexAbstractionExchangeRequest>
>;

/** EIP-712 types for the {@linkcode userDexAbstraction} function. */
export const UserDexAbstractionTypes = {
  "HyperliquidTransaction:UserDexAbstraction": [
    { name: "hyperliquidChain", type: "string" },
    { name: "user", type: "address" },
    { name: "enabled", type: "bool" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Enable/disable HIP-3 DEX abstraction.
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
 * import { userDexAbstraction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await userDexAbstraction(
 *   { transport, wallet },
 *   { user: "0x...", enabled: true },
 * );
 * ```
 */
export async function userDexAbstraction(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<UserDexAbstractionExchangeParameters>,
  opts?: UserDexAbstractionExchangeOptions,
): Promise<SuccessResponse> {
  const request = parser(UserDexAbstractionExchangeRequest)({
    action: {
      type: "userDexAbstraction",
      hyperliquidChain: config.transport.isTestnet ? "Testnet" : "Mainnet",
      signatureChainId: await getSignatureChainId(config),
      nonce: 0, // Placeholder; actual nonce generated in `executeUserSignedAction` to prevent race conditions
      ...params,
    },
    nonce: 0, // Placeholder; actual nonce generated in `executeUserSignedAction` to prevent race conditions
    signature: { // Placeholder; actual signature generated in `executeUserSignedAction`
      r: "0x0000000000000000000000000000000000000000000000000000000000000000",
      s: "0x0000000000000000000000000000000000000000000000000000000000000000",
      v: 27,
    },
  });
  return await executeUserSignedAction(config, request, UserDexAbstractionTypes, opts?.signal);
}
