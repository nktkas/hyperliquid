import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Validator vote on risk-free rate for aligned quote asset.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#validator-vote-on-risk-free-rate-for-aligned-quote-asset
 */
export const ValidatorL1StreamRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("validatorL1Stream"),
      /** Risk-free rate as a decimal string (e.g., "0.05" for 5%). */
      riskFreeRate: UnsignedDecimal,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type ValidatorL1StreamRequest = v.InferOutput<typeof ValidatorL1StreamRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#validator-vote-on-risk-free-rate-for-aligned-quote-asset
 */
export const ValidatorL1StreamResponse = /* @__PURE__ */ (() => {
  return v.union([SuccessResponse, ErrorResponse]);
})();
export type ValidatorL1StreamResponse = v.InferOutput<typeof ValidatorL1StreamResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const ValidatorL1StreamParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(ValidatorL1StreamRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode validatorL1Stream} function. */
export type ValidatorL1StreamParameters = v.InferInput<typeof ValidatorL1StreamParameters>;

/** Request options for the {@linkcode validatorL1Stream} function. */
export type ValidatorL1StreamOptions = ExtractRequestOptions<v.InferInput<typeof ValidatorL1StreamRequest>>;

/** Successful variant of {@linkcode ValidatorL1StreamResponse} without errors. */
export type ValidatorL1StreamSuccessResponse = ExcludeErrorResponse<ValidatorL1StreamResponse>;

/**
 * Validator vote on risk-free rate for aligned quote asset.
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
 * import { validatorL1Stream } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await validatorL1Stream(
 *   { transport, wallet },
 *   { riskFreeRate: "0.05" },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#validator-vote-on-risk-free-rate-for-aligned-quote-asset
 */
export function validatorL1Stream(
  config: ExchangeConfig,
  params: ValidatorL1StreamParameters,
  opts?: ValidatorL1StreamOptions,
): Promise<ValidatorL1StreamSuccessResponse> {
  const action = v.parse(ValidatorL1StreamParameters, params);
  return executeL1Action(config, { type: "validatorL1Stream", ...action }, opts);
}
