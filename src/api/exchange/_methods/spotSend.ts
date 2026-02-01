import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, HyperliquidChainSchema, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Send spot assets to another address.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
 */
export const SpotSendRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("spotSend"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /** Destination address. */
      destination: Address,
      /** Token identifier. */
      token: v.string(),
      /** Amount to send (not in wei). */
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
export type SpotSendRequest = v.InferOutput<typeof SpotSendRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
 */
export const SpotSendResponse = /* @__PURE__ */ (() => {
  return v.union([SuccessResponse, ErrorResponse]);
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
