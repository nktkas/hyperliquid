import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import {
  type ErrorResponse,
  HyperliquidChainSchema,
  SignatureSchema,
  type SuccessResponse,
} from "./_base/commonSchemas.ts";

/**
 * Send usd to another address.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
 */
export const UsdSendRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("usdSend"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /** Destination address. */
      destination: Address,
      /** Amount to send (1 = $1). */
      amount: UnsignedDecimal,
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      time: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
  });
})();
export type UsdSendRequest = v.InferOutput<typeof UsdSendRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
 */
export type UsdSendResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const UsdSendParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(UsdSendRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "time"],
  );
})();
/** Action parameters for the {@linkcode usdSend} function. */
export type UsdSendParameters = v.InferInput<typeof UsdSendParameters>;

/** Request options for the {@linkcode usdSend} function. */
export type UsdSendOptions = ExtractRequestOptions<v.InferInput<typeof UsdSendRequest>>;

/** Successful variant of {@linkcode UsdSendResponse} without errors. */
export type UsdSendSuccessResponse = ExcludeErrorResponse<UsdSendResponse>;

/** EIP-712 types for the {@linkcode usdSend} function. */
export const UsdSendTypes = {
  "HyperliquidTransaction:UsdSend": [
    { name: "hyperliquidChain", type: "string" },
    { name: "destination", type: "string" },
    { name: "amount", type: "string" },
    { name: "time", type: "uint64" },
  ],
};

/**
 * Send usd to another address.
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
 * import { usdSend } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await usdSend(
 *   { transport, wallet },
 *   { destination: "0x...", amount: "1" },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
 */
export function usdSend(
  config: ExchangeConfig,
  params: UsdSendParameters,
  opts?: UsdSendOptions,
): Promise<UsdSendSuccessResponse> {
  const action = v.parse(UsdSendParameters, params);
  return executeUserSignedAction(
    config,
    { type: "usdSend", ...action },
    UsdSendTypes,
    opts,
  );
}
