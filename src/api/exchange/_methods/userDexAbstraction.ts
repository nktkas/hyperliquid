import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import {
  ErrorResponse,
  HyperliquidChain,
  Nonce,
  Signature,
  SignatureChainId,
  SuccessResponse,
} from "./_base/schemas.ts";

/**
 * Enable/disable HIP-3 DEX abstraction.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#enable-hip-3-dex-abstraction
 */
export const UserDexAbstractionRequest = /* @__PURE__ */ (() => {
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
          /** Chain ID in hex format for EIP-712 signing. */
          signatureChainId: SignatureChainId,
          /** HyperLiquid network type. */
          hyperliquidChain: HyperliquidChain,
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
          /** Nonce (timestamp in ms) used to prevent replay attacks. */
          nonce: Nonce,
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
    }),
    v.description("Enable/disable HIP-3 DEX abstraction."),
  );
})();
export type UserDexAbstractionRequest = v.InferOutput<typeof UserDexAbstractionRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#enable-hip-3-dex-abstraction
 */
export const UserDexAbstractionResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type UserDexAbstractionResponse = v.InferOutput<typeof UserDexAbstractionResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const UserDexAbstractionParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(UserDexAbstractionRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();
/** Action parameters for the {@linkcode userDexAbstraction} function. */
export type UserDexAbstractionParameters = v.InferInput<typeof UserDexAbstractionParameters>;

/** Request options for the {@linkcode userDexAbstraction} function. */
export type UserDexAbstractionOptions = ExtractRequestOptions<
  v.InferInput<typeof UserDexAbstractionRequest>
>;

/** Successful variant of {@linkcode UserDexAbstractionResponse} without errors. */
export type UserDexAbstractionSuccessResponse = ExcludeErrorResponse<UserDexAbstractionResponse>;

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
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Successful response without specific data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
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
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#enable-hip-3-dex-abstraction
 */
export function userDexAbstraction(
  config: ExchangeConfig,
  params: UserDexAbstractionParameters,
  opts?: UserDexAbstractionOptions,
): Promise<UserDexAbstractionSuccessResponse> {
  const action = v.parse(UserDexAbstractionParameters, params);
  return executeUserSignedAction(
    config,
    { type: "userDexAbstraction", ...action },
    UserDexAbstractionTypes,
    opts,
  );
}
