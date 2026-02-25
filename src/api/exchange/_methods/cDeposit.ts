import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedInteger } from "../../_schemas.ts";
import {
  type ErrorResponse,
  HyperliquidChainSchema,
  SignatureSchema,
  type SuccessResponse,
} from "./_base/commonSchemas.ts";

/**
 * Transfer native token from the user spot account into staking for delegating to validators.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
 */
export const CDepositRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("cDeposit"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /** Amount of wei to deposit into staking balance (float * 1e8). */
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
export type CDepositRequest = v.InferOutput<typeof CDepositRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
 */
export type CDepositResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";

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
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
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
