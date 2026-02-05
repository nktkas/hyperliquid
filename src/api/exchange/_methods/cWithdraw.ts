import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, HyperliquidChainSchema, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Transfer native token from staking into the user's spot account.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
 */
export const CWithdrawRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("cWithdraw"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /** Amount of wei to withdraw from staking balance (float * 1e8). */
      wei: v.pipe(UnsignedInteger, v.minValue(1)),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
  });
})();
export type CWithdrawRequest = v.InferOutput<typeof CWithdrawRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
 */
export const CWithdrawResponse = /* @__PURE__ */ (() => {
  return v.union([SuccessResponse, ErrorResponse]);
})();
export type CWithdrawResponse = v.InferOutput<typeof CWithdrawResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const CWithdrawParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(CWithdrawRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();
/** Action parameters for the {@linkcode cWithdraw} function. */
export type CWithdrawParameters = v.InferInput<typeof CWithdrawParameters>;

/** Request options for the {@linkcode cWithdraw} function. */
export type CWithdrawOptions = ExtractRequestOptions<v.InferInput<typeof CWithdrawRequest>>;

/** Successful variant of {@linkcode CWithdrawResponse} without errors. */
export type CWithdrawSuccessResponse = ExcludeErrorResponse<CWithdrawResponse>;

/** EIP-712 types for the {@linkcode cWithdraw} function. */
export const CWithdrawTypes = {
  "HyperliquidTransaction:CWithdraw": [
    { name: "hyperliquidChain", type: "string" },
    { name: "wei", type: "uint64" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Transfer native token from staking into the user's spot account.
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
 * import { cWithdraw } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await cWithdraw(
 *   { transport, wallet },
 *   { wei: 1 * 1e8 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
 */
export function cWithdraw(
  config: ExchangeConfig,
  params: CWithdrawParameters,
  opts?: CWithdrawOptions,
): Promise<CWithdrawSuccessResponse> {
  const action = v.parse(CWithdrawParameters, params);
  return executeUserSignedAction(
    config,
    { type: "cWithdraw", ...action },
    CWithdrawTypes,
    opts,
  );
}
