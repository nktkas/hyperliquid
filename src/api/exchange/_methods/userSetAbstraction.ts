import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";
import {
  type ErrorResponse,
  HyperliquidChainSchema,
  SignatureSchema,
  type SuccessResponse,
} from "./_base/commonSchemas.ts";

/**
 * Set User abstraction mode.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction
 */
export const UserSetAbstractionRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("userSetAbstraction"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /** User address. */
      user: Address,
      /** Abstraction mode to set. */
      abstraction: v.picklist(["dexAbstraction", "unifiedAccount", "portfolioMargin", "disabled"]),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
  });
})();
export type UserSetAbstractionRequest = v.InferOutput<typeof UserSetAbstractionRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction
 */
export type UserSetAbstractionResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const UserSetAbstractionParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(UserSetAbstractionRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();
/** Action parameters for the {@linkcode userSetAbstraction} function. */
export type UserSetAbstractionParameters = v.InferInput<typeof UserSetAbstractionParameters>;

/** Request options for the {@linkcode userSetAbstraction} function. */
export type UserSetAbstractionOptions = ExtractRequestOptions<v.InferInput<typeof UserSetAbstractionRequest>>;

/** Successful variant of {@linkcode UserSetAbstractionResponse} without errors. */
export type UserSetAbstractionSuccessResponse = ExcludeErrorResponse<UserSetAbstractionResponse>;

/** EIP-712 types for the {@linkcode userSetAbstraction} function. */
export const UserSetAbstractionTypes = {
  "HyperliquidTransaction:UserSetAbstraction": [
    { name: "hyperliquidChain", type: "string" },
    { name: "user", type: "address" },
    { name: "abstraction", type: "string" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Set User abstraction mode.
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
 * import { userSetAbstraction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await userSetAbstraction(
 *   { transport, wallet },
 *   { user: "0x...", abstraction: "dexAbstraction" },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction
 */
export function userSetAbstraction(
  config: ExchangeConfig,
  params: UserSetAbstractionParameters,
  opts?: UserSetAbstractionOptions,
): Promise<UserSetAbstractionSuccessResponse> {
  const action = v.parse(UserSetAbstractionParameters, params);
  return executeUserSignedAction(
    config,
    { type: "userSetAbstraction", ...action },
    UserSetAbstractionTypes,
    opts,
  );
}
