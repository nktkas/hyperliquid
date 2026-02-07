import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import {
  type ErrorResponse,
  HyperliquidChainSchema,
  SignatureSchema,
  type SuccessResponse,
} from "./_base/commonSchemas.ts";

/**
 * Transfer funds between Spot account and Perp account.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export const UsdClassTransferRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("usdClassTransfer"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /** Amount to transfer (1 = $1). */
      amount: UnsignedDecimal,
      /** `true` for Spot to Perp, `false` for Perp to Spot. */
      toPerp: v.boolean(),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
  });
})();
export type UsdClassTransferRequest = v.InferOutput<typeof UsdClassTransferRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export type UsdClassTransferResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const UsdClassTransferParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(UsdClassTransferRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();
/** Action parameters for the {@linkcode usdClassTransfer} function. */
export type UsdClassTransferParameters = v.InferInput<typeof UsdClassTransferParameters>;

/** Request options for the {@linkcode usdClassTransfer} function. */
export type UsdClassTransferOptions = ExtractRequestOptions<v.InferInput<typeof UsdClassTransferRequest>>;

/** Successful variant of {@linkcode UsdClassTransferResponse} without errors. */
export type UsdClassTransferSuccessResponse = ExcludeErrorResponse<UsdClassTransferResponse>;

/** EIP-712 types for the {@linkcode usdClassTransfer} function. */
export const UsdClassTransferTypes = {
  "HyperliquidTransaction:UsdClassTransfer": [
    { name: "hyperliquidChain", type: "string" },
    { name: "amount", type: "string" },
    { name: "toPerp", type: "bool" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Transfer funds between Spot account and Perp account.
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
 * import { usdClassTransfer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await usdClassTransfer(
 *   { transport, wallet },
 *   { amount: "1", toPerp: true },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export function usdClassTransfer(
  config: ExchangeConfig,
  params: UsdClassTransferParameters,
  opts?: UsdClassTransferOptions,
): Promise<UsdClassTransferSuccessResponse> {
  const action = v.parse(UsdClassTransferParameters, params);
  return executeUserSignedAction(
    config,
    { type: "usdClassTransfer", ...action },
    UsdClassTransferTypes,
    opts,
  );
}
