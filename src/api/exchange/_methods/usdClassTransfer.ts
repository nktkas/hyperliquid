import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, HyperliquidChainSchema, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Transfer funds between Spot account and Perp account.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export const UsdClassTransferRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("usdClassTransfer"),
            v.description("Type of action."),
          ),
          /** Chain ID in hex format for EIP-712 signing. */
          signatureChainId: v.pipe(
            Hex,
            v.description("Chain ID in hex format for EIP-712 signing."),
          ),
          /** HyperLiquid network type. */
          hyperliquidChain: v.pipe(
            HyperliquidChainSchema,
            v.description("HyperLiquid network type."),
          ),
          /** Amount to transfer (1 = $1). */
          amount: v.pipe(
            UnsignedDecimal,
            v.description("Amount to transfer (1 = $1)."),
          ),
          /** `true` for Spot to Perp, `false` for Perp to Spot. */
          toPerp: v.pipe(
            v.boolean(),
            v.description("`true` for Spot to Perp, `false` for Perp to Spot."),
          ),
          /** Nonce (timestamp in ms) used to prevent replay attacks. */
          nonce: v.pipe(
            UnsignedInteger,
            v.description("Nonce (timestamp in ms) used to prevent replay attacks."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Nonce (timestamp in ms) used to prevent replay attacks."),
      ),
      /** ECDSA signature components. */
      signature: v.pipe(
        SignatureSchema,
        v.description("ECDSA signature components."),
      ),
    }),
    v.description("Transfer funds between Spot account and Perp account."),
  );
})();
export type UsdClassTransferRequest = v.InferOutput<typeof UsdClassTransferRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export const UsdClassTransferResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type UsdClassTransferResponse = v.InferOutput<typeof UsdClassTransferResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const UsdClassTransferParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(UsdClassTransferRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();
/** Action parameters for the {@linkcode usdClassTransfer} function. */
export type UsdClassTransferParameters = v.InferInput<typeof UsdClassTransferParameters>;

/** Request options for the {@linkcode usdClassTransfer} function. */
export type UsdClassTransferOptions = ExtractRequestOptions<v.InferInput<typeof UsdClassTransferRequest>>;

/** Successful variant of {@linkcode UsdClassTransferResponse} without errors. */
export type UsdClassTransferSuccessResponse = ExcludeErrorResponse<UsdClassTransferResponse>;

/** EIP-712 types for the {@linkcode usdClassTransfer} function. */
export const UsdClassTransferTypes = {
  "HyperliquidTransaction:UsdClassTransfer": [
    { name: "hyperliquidChain", type: "string" },
    { name: "amount", type: "string" },
    { name: "toPerp", type: "bool" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Transfer funds between Spot account and Perp account.
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
 * import { usdClassTransfer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await usdClassTransfer(
 *   { transport, wallet },
 *   { amount: "1", toPerp: true },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export function usdClassTransfer(
  config: ExchangeConfig,
  params: UsdClassTransferParameters,
  opts?: UsdClassTransferOptions,
): Promise<UsdClassTransferSuccessResponse> {
  const action = v.parse(UsdClassTransferParameters, params);
  return executeUserSignedAction(
    config,
    { type: "usdClassTransfer", ...action },
    UsdClassTransferTypes,
    opts,
  );
}
