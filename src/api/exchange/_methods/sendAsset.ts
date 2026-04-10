import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset
 */
export const SendAssetRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("sendAsset"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: v.picklist(["Mainnet", "Testnet"]),
      /** Destination address. */
      destination: Address,
      /** Source DEX ("" for default USDC perp DEX, "spot" for spot). */
      sourceDex: v.string(),
      /** Destination DEX ("" for default USDC perp DEX, "spot" for spot). */
      destinationDex: v.string(),
      /** Token identifier. */
      token: v.string(),
      /** Amount to send (not in wei). */
      amount: UnsignedDecimal,
      /** Source sub-account address ("" for main account). */
      fromSubAccount: v.optional(
        v.union([v.literal(""), Address]),
        "",
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: v.object({
      /** First 32-byte component. */
      r: v.pipe(Hex, v.length(66)),
      /** Second 32-byte component. */
      s: v.pipe(Hex, v.length(66)),
      /** Recovery identifier. */
      v: v.picklist([27, 28]),
    }),
  });
})();
export type SendAssetRequest = v.InferOutput<typeof SendAssetRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset
 */
export type SendAssetResponse =
  | {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
      /** Type of response. */
      type: "default";
    };
  }
  | {
    /** Error status. */
    status: "err";
    /** Error message. */
    response: string;
  };

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import { canonicalize } from "../../../signing/mod.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for action fields (excludes request-level system fields). */
const SendAssetActionSchema = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(SendAssetRequest.entries.action.entries),
    ["signatureChainId", "hyperliquidChain", "nonce"],
  );
})();

/** Action parameters for the {@linkcode sendAsset} function. */
export type SendAssetParameters = Omit<v.InferInput<typeof SendAssetActionSchema>, "type">;

/** Request options for the {@linkcode sendAsset} function. */
export type SendAssetOptions = ExtractRequestOptions<v.InferInput<typeof SendAssetRequest>>;

/** Successful variant of {@linkcode SendAssetResponse} without errors. */
export type SendAssetSuccessResponse = ExcludeErrorResponse<SendAssetResponse>;

/** EIP-712 types for the {@linkcode sendAsset} function. */
export const SendAssetTypes = {
  "HyperliquidTransaction:SendAsset": [
    { name: "hyperliquidChain", type: "string" },
    { name: "destination", type: "string" },
    { name: "sourceDex", type: "string" },
    { name: "destinationDex", type: "string" },
    { name: "token", type: "string" },
    { name: "amount", type: "string" },
    { name: "fromSubAccount", type: "string" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts.
 *
 * Signing: User-Signed EIP-712.
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
 * import { sendAsset } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await sendAsset({ transport, wallet }, {
 *   destination: "0x0000000000000000000000000000000000000001",
 *   sourceDex: "",
 *   destinationDex: "test",
 *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
 *   amount: "1",
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset
 */
export function sendAsset(
  config: ExchangeConfig,
  params: SendAssetParameters,
  opts?: SendAssetOptions,
): Promise<SendAssetSuccessResponse> {
  const action = canonicalize(
    SendAssetActionSchema,
    parse(SendAssetActionSchema, { type: "sendAsset", ...params }),
  );
  return executeUserSignedAction(config, action, SendAssetTypes, opts);
}
