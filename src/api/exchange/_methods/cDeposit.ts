import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import {
  ErrorResponse,
  HyperliquidChain,
  Nonce,
  Signature,
  SignatureChainId,
  SuccessResponse,
} from "./_base/schemas.ts";

/**
 * Transfer native token from the user spot account into staking for delegating to validators.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
 */
export const CDepositRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("cDeposit"),
            v.description("Type of action."),
          ),
          /** Chain ID in hex format for EIP-712 signing. */
          signatureChainId: SignatureChainId,
          /** HyperLiquid network type. */
          hyperliquidChain: HyperliquidChain,
          /** Amount of wei to deposit into staking balance (float * 1e8). */
          wei: v.pipe(
            UnsignedInteger,
            v.description("Amount of wei to deposit into staking balance (float * 1e8)."),
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
    v.description("Transfer native token from the user spot account into staking for delegating to validators."),
  );
})();
export type CDepositRequest = v.InferOutput<typeof CDepositRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
 */
export const CDepositResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type CDepositResponse = v.InferOutput<typeof CDepositResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const CDepositParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(CDepositRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();
/** Action parameters for the {@linkcode cDeposit} function. */
export type CDepositParameters = v.InferInput<typeof CDepositParameters>;

/** Request options for the {@linkcode cDeposit} function. */
export type CDepositOptions = ExtractRequestOptions<v.InferInput<typeof CDepositRequest>>;

/** Successful variant of {@linkcode CDepositResponse} without errors. */
export type CDepositSuccessResponse = ExcludeErrorResponse<CDepositResponse>;

/** EIP-712 types for the {@linkcode cDeposit} function. */
export const CDepositTypes = {
  "HyperliquidTransaction:CDeposit": [
    { name: "hyperliquidChain", type: "string" },
    { name: "wei", type: "uint64" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Transfer native token from the user spot account into staking for delegating to validators.
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
 * import { cDeposit } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await cDeposit(
 *   { transport, wallet },
 *   { wei: 1 * 1e8 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
 */
export function cDeposit(
  config: ExchangeConfig,
  params: CDepositParameters,
  opts?: CDepositOptions,
): Promise<CDepositSuccessResponse> {
  const action = v.parse(CDepositParameters, params);
  return executeUserSignedAction(
    config,
    { type: "cDeposit", ...action },
    CDepositTypes,
    opts,
  );
}
