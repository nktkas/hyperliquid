import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, TokenId, UnsignedDecimal } from "../../_schemas.ts";
import {
  ErrorResponse,
  HyperliquidChain,
  Nonce,
  Signature,
  SignatureChainId,
  SuccessResponse,
} from "./_base/schemas.ts";

/**
 * Send spot assets to another address.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
 */
export const SpotSendRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("spotSend"),
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
          /** Token identifier. */
          token: v.pipe(
            TokenId,
            v.description("Token identifier."),
          ),
          /** Amount to send (not in wei). */
          amount: v.pipe(
            UnsignedDecimal,
            v.description("Amount to send (not in wei)."),
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
    v.description("Send spot assets to another address."),
  );
})();
export type SpotSendRequest = v.InferOutput<typeof SpotSendRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
 */
export const SpotSendResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type SpotSendResponse = v.InferOutput<typeof SpotSendResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const SpotSendParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(SpotSendRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "time"],
  );
})();
/** Action parameters for the {@linkcode spotSend} function. */
export type SpotSendParameters = v.InferInput<typeof SpotSendParameters>;

/** Request options for the {@linkcode spotSend} function. */
export type SpotSendOptions = ExtractRequestOptions<v.InferInput<typeof SpotSendRequest>>;

/** Successful variant of {@linkcode SpotSendResponse} without errors. */
export type SpotSendSuccessResponse = ExcludeErrorResponse<SpotSendResponse>;

/** EIP-712 types for the {@linkcode spotSend} function. */
export const SpotSendTypes = {
  "HyperliquidTransaction:SpotSend": [
    { name: "hyperliquidChain", type: "string" },
    { name: "destination", type: "string" },
    { name: "token", type: "string" },
    { name: "amount", type: "string" },
    { name: "time", type: "uint64" },
  ],
};

/**
 * Send spot assets to another address.
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
 * import { spotSend } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await spotSend(
 *   { transport, wallet },
 *   {
 *     destination: "0x...",
 *     token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
 *     amount: "1",
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
 */
export function spotSend(
  config: ExchangeConfig,
  params: SpotSendParameters,
  opts?: SpotSendOptions,
): Promise<SpotSendSuccessResponse> {
  const action = v.parse(SpotSendParameters, params);
  return executeUserSignedAction(
    config,
    { type: "spotSend", ...action },
    SpotSendTypes,
    opts,
  );
}
