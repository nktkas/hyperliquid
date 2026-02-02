import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";
import {
  ErrorResponse,
  HyperliquidChainSchema,
  SignatureSchema,
  SuccessResponse,
} from "./_base/commonSchemas.ts";

/**
 * Set User abstraction mode.
 */
export const UserSetAbstractionRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("userSetAbstraction"),
            v.description("Type of action.")
          ),
          /** Chain ID in hex format for EIP-712 signing. */
          signatureChainId: v.pipe(
            Hex,
            v.description("Chain ID in hex format for EIP-712 signing.")
          ),
          /** HyperLiquid network type. */
          hyperliquidChain: v.pipe(
            HyperliquidChainSchema,
            v.description("HyperLiquid network type.")
          ),
          /** User address. */
          user: v.pipe(Address, v.description("User address.")),
          /** Abstraction mode to set. */
          abstraction: v.pipe(
            v.picklist(["dexAbstraction", "unifiedAccount", "disabled"]),
            v.description("Abstraction mode to set.")
          ),
          /** Nonce (timestamp in ms) used to prevent replay attacks. */
          nonce: v.pipe(
            UnsignedInteger,
            v.description(
              "Nonce (timestamp in ms) used to prevent replay attacks."
            )
          ),
        }),
        v.description("Action to perform.")
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Nonce (timestamp in ms) used to prevent replay attacks.")
      ),
      /** ECDSA signature components. */
      signature: v.pipe(
        SignatureSchema,
        v.description("ECDSA signature components.")
      ),
    }),
    v.description("Set User abstraction mode.")
  );
})();
export type UserSetAbstractionRequest = v.InferOutput<
  typeof UserSetAbstractionRequest
>;

/**
 * Successful response without specific data or error response.
 */
export const UserSetAbstractionResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description(
      "Successful response without specific data or error response."
    )
  );
})();
export type UserSetAbstractionResponse = v.InferOutput<
  typeof UserSetAbstractionResponse
>;

// ============================================================
// Execution Logic
// ============================================================

import {
  type ExchangeConfig,
  executeUserSignedAction,
  type ExtractRequestOptions,
} from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const UserSetAbstractionParameters = /* @__PURE__ */ (() => {
  return v.omit(v.object(UserSetAbstractionRequest.entries.action.entries), [
    "type",
    "signatureChainId",
    "hyperliquidChain",
    "nonce",
  ]);
})();
/** Action parameters for the {@linkcode userSetAbstraction} function. */
export type UserSetAbstractionParameters = v.InferInput<
  typeof UserSetAbstractionParameters
>;

/** Request options for the {@linkcode userSetAbstraction} function. */
export type UserSetAbstractionOptions = ExtractRequestOptions<
  v.InferInput<typeof UserSetAbstractionRequest>
>;

/** Successful variant of {@linkcode UserSetAbstractionResponse} without errors. */
export type UserSetAbstractionSuccessResponse =
  ExcludeErrorResponse<UserSetAbstractionResponse>;

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
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#enable-hip-3-dex-abstraction
 */
export function userSetAbstraction(
  config: ExchangeConfig,
  params: UserSetAbstractionParameters,
  opts?: UserSetAbstractionOptions
): Promise<UserSetAbstractionSuccessResponse> {
  const action = v.parse(UserSetAbstractionParameters, params);
  return executeUserSignedAction(
    config,
    { type: "userSetAbstraction", ...action },
    UserSetAbstractionTypes,
    opts
  );
}
