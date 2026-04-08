import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Set user abstraction mode.
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
      hyperliquidChain: v.picklist(["Mainnet", "Testnet"]),
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
    signature: v.object({
      /** First 32-byte component. */
      r: v.pipe(Hex, v.length(66)),
      /** Second 32-byte component. */
      s: v.pipe(Hex, v.length(66)),
      /** Recovery identifier. */
      v: v.picklist([27, 28]),
    }),
  });
})();
export type UserSetAbstractionRequest = v.InferOutput<typeof UserSetAbstractionRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction
 */
export type UserSetAbstractionResponse =
  | {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
      /** Type of response. */
      type: "default";
    };
  }
  | {
    /** Error status. */
    status: "err";
    /** Error message. */
    response: string;
  };

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for action fields (excludes request-level system fields). */
const UserSetAbstractionActionSchema = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(UserSetAbstractionRequest.entries.action.entries),
    ["signatureChainId", "hyperliquidChain", "nonce"],
  );
})();

/** Action parameters for the {@linkcode userSetAbstraction} function. */
export type UserSetAbstractionParameters = Omit<v.InferInput<typeof UserSetAbstractionActionSchema>, "type">;

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
 * Set user abstraction mode.
 *
 * Signing: User-Signed EIP-712.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
 * await userSetAbstraction({ transport, wallet }, {
 *   user: "0x...",
 *   abstraction: "dexAbstraction",
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction
 */
export function userSetAbstraction(
  config: ExchangeConfig,
  params: UserSetAbstractionParameters,
  opts?: UserSetAbstractionOptions,
): Promise<UserSetAbstractionSuccessResponse> {
  const action = parse(UserSetAbstractionActionSchema, { type: "userSetAbstraction", ...params });
  return executeUserSignedAction(config, action, UserSetAbstractionTypes, opts);
}
