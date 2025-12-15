import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, HyperliquidChainSchema, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Delegate or undelegate native tokens to or from a validator.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
 */
export const TokenDelegateRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("tokenDelegate"),
            v.description("Type of action."),
          ),
          /** Chain ID in hex format for EIP-712 signing. */
          signatureChainId: v.pipe(
            Hex,
            v.description("Chain ID in hex format for EIP-712 signing."),
          ),
          /** HyperLiquid network type. */
          hyperliquidChain: v.pipe(
            HyperliquidChainSchema,
            v.description("HyperLiquid network type."),
          ),
          /** Validator address. */
          validator: v.pipe(
            Address,
            v.description("Validator address."),
          ),
          /** Amount for delegate/undelegate (float * 1e8). */
          wei: v.pipe(
            UnsignedInteger,
            v.minValue(1),
            v.description("Amount for delegate/undelegate (float * 1e8)."),
          ),
          /** `true` for undelegate, `false` for delegate. */
          isUndelegate: v.pipe(
            v.boolean(),
            v.description("`true` for undelegate, `false` for delegate."),
          ),
          /** Nonce (timestamp in ms) used to prevent replay attacks. */
          nonce: v.pipe(
            UnsignedInteger,
            v.description("Nonce (timestamp in ms) used to prevent replay attacks."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Nonce (timestamp in ms) used to prevent replay attacks."),
      ),
      /** ECDSA signature components. */
      signature: v.pipe(
        SignatureSchema,
        v.description("ECDSA signature components."),
      ),
    }),
    v.description("Delegate or undelegate native tokens to or from a validator."),
  );
})();
export type TokenDelegateRequest = v.InferOutput<typeof TokenDelegateRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
 */
export const TokenDelegateResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type TokenDelegateResponse = v.InferOutput<typeof TokenDelegateResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const TokenDelegateParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(TokenDelegateRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();
/** Action parameters for the {@linkcode tokenDelegate} function. */
export type TokenDelegateParameters = v.InferInput<typeof TokenDelegateParameters>;

/** Request options for the {@linkcode tokenDelegate} function. */
export type TokenDelegateOptions = ExtractRequestOptions<v.InferInput<typeof TokenDelegateRequest>>;

/** Successful variant of {@linkcode TokenDelegateResponse} without errors. */
export type TokenDelegateSuccessResponse = ExcludeErrorResponse<TokenDelegateResponse>;

/** EIP-712 types for the {@linkcode tokenDelegate} function. */
export const TokenDelegateTypes = {
  "HyperliquidTransaction:TokenDelegate": [
    { name: "hyperliquidChain", type: "string" },
    { name: "validator", type: "address" },
    { name: "wei", type: "uint64" },
    { name: "isUndelegate", type: "bool" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Delegate or undelegate native tokens to or from a validator.
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
 * import { tokenDelegate } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await tokenDelegate(
 *   { transport, wallet },
 *   { validator: "0x...", isUndelegate: true, wei: 1 * 1e8 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
 */
export function tokenDelegate(
  config: ExchangeConfig,
  params: TokenDelegateParameters,
  opts?: TokenDelegateOptions,
): Promise<TokenDelegateSuccessResponse> {
  const action = v.parse(TokenDelegateParameters, params);
  return executeUserSignedAction(
    config,
    { type: "tokenDelegate", ...action },
    TokenDelegateTypes,
    opts,
  );
}
