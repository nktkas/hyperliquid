import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, TokenId, UnsignedDecimal } from "../../_schemas.ts";
import {
  ErrorResponse,
  HyperliquidChain,
  Nonce,
  Signature,
  SignatureChainId,
  SuccessResponse,
} from "./_base/schemas.ts";

/**
 * Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset
 */
export const SendAssetRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("sendAsset"),
            v.description("Type of action."),
          ),
          /** Chain ID in hex format for EIP-712 signing. */
          signatureChainId: SignatureChainId,
          /** HyperLiquid network type. */
          hyperliquidChain: HyperliquidChain,
          /** Destination address. */
          destination: v.pipe(
            Address,
            v.description("Destination address."),
          ),
          /** Source DEX ("" for default USDC perp DEX, "spot" for spot). */
          sourceDex: v.pipe(
            v.string(),
            v.description('Source DEX ("" for default USDC perp DEX, "spot" for spot).'),
          ),
          /** Destination DEX ("" for default USDC perp DEX, "spot" for spot). */
          destinationDex: v.pipe(
            v.string(),
            v.description('Destination DEX ("" for default USDC perp DEX, "spot" for spot).'),
          ),
          /** Token identifier. */
          token: v.pipe(
            TokenId,
            v.description("Token identifier."),
          ),
          /** Amount to send (not in wei). */
          amount: v.pipe(
            UnsignedDecimal,
            v.description("Amount to send (not in wei)."),
          ),
          /** Source sub-account address ("" for main account) (default: ""). */
          fromSubAccount: v.pipe(
            v.optional(v.union([v.literal(""), Address]), ""),
            v.description('Source sub-account address ("" for main account).'),
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
    v.description("Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts."),
  );
})();
export type SendAssetRequest = v.InferOutput<typeof SendAssetRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset
 */
export const SendAssetResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type SendAssetResponse = v.InferOutput<typeof SendAssetResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const SendAssetParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(SendAssetRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();
/** Action parameters for the {@linkcode sendAsset} function. */
export type SendAssetParameters = v.InferInput<typeof SendAssetParameters>;

/** Request options for the {@linkcode sendAsset} function. */
export type SendAssetOptions = ExtractRequestOptions<v.InferInput<typeof SendAssetRequest>>;

/** Successful variant of {@linkcode SendAssetResponse} without errors. */
export type SendAssetSuccessResponse = ExcludeErrorResponse<SendAssetResponse>;

/** EIP-712 types for the {@linkcode sendAsset} function. */
export const SendAssetTypes = {
  "HyperliquidTransaction:SendAsset": [
    { name: "hyperliquidChain", type: "string" },
    { name: "destination", type: "string" },
    { name: "sourceDex", type: "string" },
    { name: "destinationDex", type: "string" },
    { name: "token", type: "string" },
    { name: "amount", type: "string" },
    { name: "fromSubAccount", type: "string" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts.
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
 * import { sendAsset } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await sendAsset(
 *   { transport, wallet },
 *   {
 *     destination: "0x0000000000000000000000000000000000000001",
 *     sourceDex: "",
 *     destinationDex: "test",
 *     token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
 *     amount: "1",
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset
 */
export function sendAsset(
  config: ExchangeConfig,
  params: SendAssetParameters,
  opts?: SendAssetOptions,
): Promise<SendAssetSuccessResponse> {
  const action = v.parse(SendAssetParameters, params);
  return executeUserSignedAction(
    config,
    { type: "sendAsset", ...action },
    SendAssetTypes,
    opts,
  );
}
