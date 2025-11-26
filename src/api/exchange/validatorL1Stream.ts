import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import { ErrorResponse, Signature, SuccessResponse } from "./_base/mod.ts";

/**
 * Validator vote on risk-free rate for aligned quote asset.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#validator-vote-on-risk-free-rate-for-aligned-quote-asset
 */
export const ValidatorL1StreamRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("validatorL1Stream"),
            v.description("Type of action."),
          ),
          /** Risk-free rate as a decimal string (e.g., "0.05" for 5%). */
          riskFreeRate: v.pipe(
            UnsignedDecimal,
            v.description('Risk-free rate as a decimal string (e.g., "0.05" for 5%).'),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Unique request identifier (current timestamp in ms). */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Unique request identifier (current timestamp in ms)."),
      ),
      /** Cryptographic signature. */
      signature: v.pipe(
        Signature,
        v.description("Cryptographic signature."),
      ),
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Validator vote on risk-free rate for aligned quote asset."),
  );
})();
export type ValidatorL1StreamRequest = v.InferOutput<typeof ValidatorL1StreamRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#validator-vote-on-risk-free-rate-for-aligned-quote-asset
 */
export const ValidatorL1StreamResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type ValidatorL1StreamResponse = v.InferOutput<typeof ValidatorL1StreamResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type DeepImmutable, parser } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  type ExcludeErrorResponse,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
} from "./_base/mod.ts";

/** Action parameters for the {@linkcode validatorL1Stream} function. */
export type ValidatorL1StreamParameters = ExtractRequestAction<v.InferInput<typeof ValidatorL1StreamRequest>>;

/** Request options for the {@linkcode validatorL1Stream} function. */
export type ValidatorL1StreamOptions = ExtractRequestOptions<v.InferInput<typeof ValidatorL1StreamRequest>>;

/** Successful variant of {@linkcode ValidatorL1StreamResponse} without errors. */
export type ValidatorL1StreamSuccessResponse = ExcludeErrorResponse<ValidatorL1StreamResponse>;

/**
 * Validator vote on risk-free rate for aligned quote asset.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#validator-vote-on-risk-free-rate-for-aligned-quote-asset
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
 */
export async function validatorL1Stream(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<ValidatorL1StreamParameters>,
  opts?: ValidatorL1StreamOptions,
): Promise<ValidatorL1StreamSuccessResponse> {
  const request = parser(ValidatorL1StreamRequest)({
    action: {
      type: "validatorL1Stream",
      ...params,
    },
    nonce: 0, // Placeholder; actual nonce generated in `executeL1Action`
    signature: { // Placeholder; actual signature generated in `executeL1Action`
      r: "0x0000000000000000000000000000000000000000000000000000000000000000",
      s: "0x0000000000000000000000000000000000000000000000000000000000000000",
      v: 27,
    },
    expiresAfter: typeof config.defaultExpiresAfter === "number"
      ? config.defaultExpiresAfter
      : await config.defaultExpiresAfter?.(),
  });
  return await executeL1Action(config, request, opts?.signal);
}
