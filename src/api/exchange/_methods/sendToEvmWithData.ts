import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import {
  type ErrorResponse,
  HyperliquidChainSchema,
  SignatureSchema,
  type SuccessResponse,
} from "./_base/commonSchemas.ts";

/**
 * Transfer tokens from Core to EVM with an additional data payload for `ICoreReceiveWithData` contracts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-to-evm-with-data
 */
export const SendToEvmWithDataRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("sendToEvmWithData"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /** Token identifier (e.g., "USDC"). */
      token: v.string(),
      /** Amount to send (not in wei). */
      amount: UnsignedDecimal,
      /** Source DEX name to transfer from. */
      sourceDex: v.string(),
      /** Recipient address in the specified encoding format. */
      destinationRecipient: v.string(),
      /** Address encoding format. */
      addressEncoding: v.picklist(["hex", "base58"]),
      /** Target blockchain chain ID. */
      destinationChainId: UnsignedInteger,
      /** Gas limit for execution on the destination chain. */
      gasLimit: UnsignedInteger,
      /** Additional data payload (hex-encoded bytes, "0x" for empty). */
      data: v.pipe(v.string(), v.regex(/^0[xX]([0-9a-fA-F]+)?$/)),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
  });
})();
export type SendToEvmWithDataRequest = v.InferOutput<typeof SendToEvmWithDataRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-to-evm-with-data
 */
export type SendToEvmWithDataResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const SendToEvmWithDataParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(SendToEvmWithDataRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();

/** Action parameters for the {@linkcode sendToEvmWithData} function. */
export type SendToEvmWithDataParameters = v.InferInput<typeof SendToEvmWithDataParameters>;

/** Request options for the {@linkcode sendToEvmWithData} function. */
export type SendToEvmWithDataOptions = ExtractRequestOptions<v.InferInput<typeof SendToEvmWithDataRequest>>;

/** Successful variant of {@linkcode SendToEvmWithDataResponse} without errors. */
export type SendToEvmWithDataSuccessResponse = ExcludeErrorResponse<SendToEvmWithDataResponse>;

/** EIP-712 types for the {@linkcode sendToEvmWithData} function. */
export const SendToEvmWithDataTypes = {
  "HyperliquidTransaction:SendToEvmWithData": [
    { name: "hyperliquidChain", type: "string" },
    { name: "token", type: "string" },
    { name: "amount", type: "string" },
    { name: "sourceDex", type: "string" },
    { name: "destinationRecipient", type: "string" },
    { name: "addressEncoding", type: "string" },
    { name: "destinationChainId", type: "uint32" },
    { name: "gasLimit", type: "uint64" },
    { name: "data", type: "bytes" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Transfer tokens from Core to EVM with an additional data payload for `ICoreReceiveWithData` contracts.
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
 * import { sendToEvmWithData } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await sendToEvmWithData(
 *   { transport, wallet },
 *   {
 *     token: "USDC",
 *     amount: "1",
 *     sourceDex: "spot",
 *     destinationRecipient: "0x...",
 *     addressEncoding: "hex",
 *     destinationChainId: 42161,
 *     gasLimit: 200000,
 *     data: "0x",
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-to-evm-with-data
 */
export function sendToEvmWithData(
  config: ExchangeConfig,
  params: SendToEvmWithDataParameters,
  opts?: SendToEvmWithDataOptions,
): Promise<SendToEvmWithDataSuccessResponse> {
  const action = parse(SendToEvmWithDataParameters, params);
  return executeUserSignedAction(
    config,
    { type: "sendToEvmWithData", ...action },
    SendToEvmWithDataTypes,
    opts,
  );
}
