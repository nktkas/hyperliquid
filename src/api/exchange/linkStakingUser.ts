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
 * Link staking and trading accounts for fee discount attribution.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#staking-linking
 */
export const LinkStakingUserRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("linkStakingUser"),
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
          /**
           * Target account address.
           * - Trading user initiating: enter staking account address.
           * - Staking user finalizing: enter trading account address.
           */
          user: v.pipe(
            Address,
            v.description(
              "Target account address." +
                "\n- Trading user initiating: enter staking account address." +
                "\n- Staking user finalizing: enter trading account address.",
            ),
          ),
          /**
           * Link phase.
           * - `false` = trading user initiates link request.
           * - `true` = staking user finalizes permanent link.
           */
          isFinalize: v.pipe(
            v.boolean(),
            v.description(
              "Link phase." +
                "\n- `false` = trading user initiates link request." +
                "\n- `true` = staking user finalizes permanent link.",
            ),
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
    v.description(""),
  );
})();
export type LinkStakingUserRequest = v.InferOutput<typeof LinkStakingUserRequest>;

import { SuccessResponse } from "./_base/mod.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode linkStakingUser} function. */
export type LinkStakingUserParameters = ExtractRequestAction<v.InferInput<typeof LinkStakingUserRequest>>;
/** Request options for the {@linkcode linkStakingUser} function. */
export type LinkStakingUserOptions = ExtractRequestOptions<v.InferInput<typeof LinkStakingUserRequest>>;

/** EIP-712 types for the {@linkcode linkStakingUser} function. */
export const LinkStakingUserTypes = {
  "HyperliquidTransaction:LinkStakingUser": [
    { name: "hyperliquidChain", type: "string" },
    { name: "user", type: "address" },
    { name: "isFinalize", type: "bool" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Link staking and trading accounts for fee discount attribution.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#staking-linking
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { linkStakingUser } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await linkStakingUser(
 *   { transport, wallet },
 *   { user: "0x...", isFinalize: false },
 * );
 * ```
 */
export async function linkStakingUser(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<LinkStakingUserParameters>,
  opts?: LinkStakingUserOptions,
): Promise<SuccessResponse> {
  const request = parser(LinkStakingUserRequest)({
    action: {
      type: "linkStakingUser",
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
  return await executeUserSignedAction(config, request, LinkStakingUserTypes, opts?.signal);
}
