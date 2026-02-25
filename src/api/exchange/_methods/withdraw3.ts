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
 * Initiate a withdrawal request.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
 */
export const Withdraw3Request = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("withdraw3"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /** Destination address. */
      destination: Address,
      /** Amount to withdraw (1 = $1). */
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
export type Withdraw3Request = v.InferOutput<typeof Withdraw3Request>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
 */
export type Withdraw3Response = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const Withdraw3Parameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(Withdraw3Request.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "time"],
  );
})();

/** Action parameters for the {@linkcode withdraw3} function. */
export type Withdraw3Parameters = v.InferInput<typeof Withdraw3Parameters>;

/** Request options for the {@linkcode withdraw3} function. */
export type Withdraw3Options = ExtractRequestOptions<v.InferInput<typeof Withdraw3Request>>;

/** Successful variant of {@linkcode Withdraw3Response} without errors. */
export type Withdraw3SuccessResponse = ExcludeErrorResponse<Withdraw3Response>;

/** EIP-712 types for the {@linkcode withdraw3} function. */
export const Withdraw3Types = {
  "HyperliquidTransaction:Withdraw": [
    { name: "hyperliquidChain", type: "string" },
    { name: "destination", type: "string" },
    { name: "amount", type: "string" },
    { name: "time", type: "uint64" },
  ],
};

/**
 * Initiate a withdrawal request.
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
 * import { withdraw3 } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await withdraw3(
 *   { transport, wallet },
 *   { destination: "0x...", amount: "1" },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
 */
export function withdraw3(
  config: ExchangeConfig,
  params: Withdraw3Parameters,
  opts?: Withdraw3Options,
): Promise<Withdraw3SuccessResponse> {
  const action = v.parse(Withdraw3Parameters, params);
  return executeUserSignedAction(
    config,
    { type: "withdraw3", ...action },
    Withdraw3Types,
    opts,
  );
}
