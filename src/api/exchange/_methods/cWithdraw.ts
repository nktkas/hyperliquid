import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Transfer native token from staking into the user's spot account.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
 */
export const CWithdrawRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("cWithdraw"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: v.picklist(["Mainnet", "Testnet"]),
      /** Amount of wei to withdraw from staking balance (float * 1e8). */
      wei: v.pipe(UnsignedInteger, v.minValue(1)),
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
export type CWithdrawRequest = v.InferOutput<typeof CWithdrawRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
 */
export type CWithdrawResponse =
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
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for action fields (excludes request-level system fields). */
const CWithdrawActionSchema = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(CWithdrawRequest.entries.action.entries),
    ["signatureChainId", "hyperliquidChain", "nonce"],
  );
})();

/** Action parameters for the {@linkcode cWithdraw} function. */
export type CWithdrawParameters = Omit<v.InferInput<typeof CWithdrawActionSchema>, "type">;

/** Request options for the {@linkcode cWithdraw} function. */
export type CWithdrawOptions = ExtractRequestOptions<v.InferInput<typeof CWithdrawRequest>>;

/** Successful variant of {@linkcode CWithdrawResponse} without errors. */
export type CWithdrawSuccessResponse = ExcludeErrorResponse<CWithdrawResponse>;

/** EIP-712 types for the {@linkcode cWithdraw} function. */
export const CWithdrawTypes = {
  "HyperliquidTransaction:CWithdraw": [
    { name: "hyperliquidChain", type: "string" },
    { name: "wei", type: "uint64" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Transfer native token from staking into the user's spot account.
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
 * import { cWithdraw } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await cWithdraw({ transport, wallet }, {
 *   wei: 1 * 1e8,
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
 */
export function cWithdraw(
  config: ExchangeConfig,
  params: CWithdrawParameters,
  opts?: CWithdrawOptions,
): Promise<CWithdrawSuccessResponse> {
  const action = parse(CWithdrawActionSchema, { type: "cWithdraw", ...params });
  return executeUserSignedAction(config, action, CWithdrawTypes, opts);
}
