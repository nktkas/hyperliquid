import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, Percent, UnsignedInteger } from "../../_schemas.ts";
import {
  type ErrorResponse,
  HyperliquidChainSchema,
  SignatureSchema,
  type SuccessResponse,
} from "./_base/commonSchemas.ts";

/**
 * Approve a maximum fee rate for a builder.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
 */
export const ApproveBuilderFeeRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("approveBuilderFee"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /** Max fee rate (e.g., "0.01%"). */
      maxFeeRate: Percent,
      /** Builder address. */
      builder: Address,
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
  });
})();
export type ApproveBuilderFeeRequest = v.InferOutput<typeof ApproveBuilderFeeRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
 */
export type ApproveBuilderFeeResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const ApproveBuilderFeeParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(ApproveBuilderFeeRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();

/** Action parameters for the {@linkcode approveBuilderFee} function. */
export type ApproveBuilderFeeParameters = v.InferInput<typeof ApproveBuilderFeeParameters>;

/** Request options for the {@linkcode approveBuilderFee} function. */
export type ApproveBuilderFeeOptions = ExtractRequestOptions<v.InferInput<typeof ApproveBuilderFeeRequest>>;

/** Successful variant of {@linkcode ApproveBuilderFeeResponse} without errors. */
export type ApproveBuilderFeeSuccessResponse = ExcludeErrorResponse<ApproveBuilderFeeResponse>;

/** EIP-712 types for the {@linkcode approveBuilderFee} function. */
export const ApproveBuilderFeeTypes = {
  "HyperliquidTransaction:ApproveBuilderFee": [
    { name: "hyperliquidChain", type: "string" },
    { name: "maxFeeRate", type: "string" },
    { name: "builder", type: "address" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Approve a maximum fee rate for a builder.
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
 * import { approveBuilderFee } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await approveBuilderFee(
 *   { transport, wallet },
 *   { maxFeeRate: "0.01%", builder: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
 */
export function approveBuilderFee(
  config: ExchangeConfig,
  params: ApproveBuilderFeeParameters,
  opts?: ApproveBuilderFeeOptions,
): Promise<ApproveBuilderFeeSuccessResponse> {
  const action = parse(ApproveBuilderFeeParameters, params);
  return executeUserSignedAction(
    config,
    { type: "approveBuilderFee", ...action },
    ApproveBuilderFeeTypes,
    opts,
  );
}
