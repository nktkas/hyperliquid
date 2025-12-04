import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal } from "../../_schemas.ts";
import {
  ErrorResponse,
  HyperliquidChain,
  Nonce,
  Signature,
  SignatureChainId,
  SuccessResponse,
} from "./_base/schemas.ts";

/**
 * Initiate a withdrawal request.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
 */
export const Withdraw3Request = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("withdraw3"),
            v.description("Type of action."),
          ),
          /** Chain ID in hex format for EIP-712 signing. */
          signatureChainId: SignatureChainId,
          /** HyperLiquid network type. */
          hyperliquidChain: HyperliquidChain,
          /** Destination address. */
          destination: v.pipe(
            Address,
            v.description("Destination address."),
          ),
          /** Amount to withdraw (1 = $1). */
          amount: v.pipe(
            UnsignedDecimal,
            v.description("Amount to withdraw (1 = $1)."),
          ),
          /** Nonce (timestamp in ms) used to prevent replay attacks. */
          time: Nonce,
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
    }),
    v.description("Initiate a withdrawal request."),
  );
})();
export type Withdraw3Request = v.InferOutput<typeof Withdraw3Request>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
 */
export const Withdraw3Response = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type Withdraw3Response = v.InferOutput<typeof Withdraw3Response>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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
