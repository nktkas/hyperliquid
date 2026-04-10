import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Transfer funds between Spot account and Perp account.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export const UsdClassTransferRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("usdClassTransfer"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: v.picklist(["Mainnet", "Testnet"]),
      /** Amount to transfer (1 = $1). */
      amount: UnsignedDecimal,
      /** `true` for Spot to Perp, `false` for Perp to Spot. */
      toPerp: v.boolean(),
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
export type UsdClassTransferRequest = v.InferOutput<typeof UsdClassTransferRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export type UsdClassTransferResponse =
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
const UsdClassTransferActionSchema = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(UsdClassTransferRequest.entries.action.entries),
    ["signatureChainId", "hyperliquidChain", "nonce"],
  );
})();

/** Action parameters for the {@linkcode usdClassTransfer} function. */
export type UsdClassTransferParameters = Omit<v.InferInput<typeof UsdClassTransferActionSchema>, "type">;

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
 * import { usdClassTransfer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await usdClassTransfer({ transport, wallet }, {
 *   amount: "1",
 *   toPerp: true,
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export function usdClassTransfer(
  config: ExchangeConfig,
  params: UsdClassTransferParameters,
  opts?: UsdClassTransferOptions,
): Promise<UsdClassTransferSuccessResponse> {
  const action = canonicalize(
    UsdClassTransferActionSchema,
    parse(UsdClassTransferActionSchema, { type: "usdClassTransfer", ...params }),
  );
  return executeUserSignedAction(config, action, UsdClassTransferTypes, opts);
}
