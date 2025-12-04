import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Percent } from "../../_schemas.ts";
import {
  ErrorResponse,
  HyperliquidChain,
  Nonce,
  Signature,
  SignatureChainId,
  SuccessResponse,
} from "./_base/schemas.ts";

/**
 * Approve a maximum fee rate for a builder.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
 */
export const ApproveBuilderFeeRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("approveBuilderFee"),
            v.description("Type of action."),
          ),
          /** Chain ID in hex format for EIP-712 signing. */
          signatureChainId: SignatureChainId,
          /** HyperLiquid network type. */
          hyperliquidChain: HyperliquidChain,
          /** Max fee rate (e.g., "0.01%"). */
          maxFeeRate: v.pipe(
            Percent,
            v.description('Max fee rate (e.g., "0.01%").'),
          ),
          /** Builder address. */
          builder: v.pipe(
            Address,
            v.description("Builder address."),
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
    v.description("Approve a maximum fee rate for a builder."),
  );
})();
export type ApproveBuilderFeeRequest = v.InferOutput<typeof ApproveBuilderFeeRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
 */
export const ApproveBuilderFeeResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type ApproveBuilderFeeResponse = v.InferOutput<typeof ApproveBuilderFeeResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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
  const action = v.parse(ApproveBuilderFeeParameters, params);
  return executeUserSignedAction(
    config,
    { type: "approveBuilderFee", ...action },
    ApproveBuilderFeeTypes,
    opts,
  );
}
