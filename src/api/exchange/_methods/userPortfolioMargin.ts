import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";
import {
  type ErrorResponse,
  HyperliquidChainSchema,
  SignatureSchema,
  type SuccessResponse,
} from "./_base/commonSchemas.ts";

/**
 * Enable/disable user portfolio margin.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/portfolio-margin
 */
export const UserPortfolioMarginRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("userPortfolioMargin"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /** User address. */
      user: Address,
      /** Whether to enable or disable user portfolio margin. */
      enabled: v.boolean(),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
  });
})();
export type UserPortfolioMarginRequest = v.InferOutput<typeof UserPortfolioMarginRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/portfolio-margin
 */
export type UserPortfolioMarginResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const UserPortfolioMarginParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(UserPortfolioMarginRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();

/** Action parameters for the {@linkcode userPortfolioMargin} function. */
export type UserPortfolioMarginParameters = v.InferInput<typeof UserPortfolioMarginParameters>;

/** Request options for the {@linkcode userPortfolioMargin} function. */
export type UserPortfolioMarginOptions = ExtractRequestOptions<v.InferInput<typeof UserPortfolioMarginRequest>>;

/** Successful variant of {@linkcode UserPortfolioMarginResponse} without errors. */
export type UserPortfolioMarginSuccessResponse = ExcludeErrorResponse<UserPortfolioMarginResponse>;

/** EIP-712 types for the {@linkcode userPortfolioMargin} function. */
export const UserPortfolioMarginTypes = {
  "HyperliquidTransaction:UserPortfolioMargin": [
    { name: "hyperliquidChain", type: "string" },
    { name: "user", type: "address" },
    { name: "enabled", type: "bool" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Enable/disable user portfolio margin.
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
 * import { userPortfolioMargin } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await userPortfolioMargin(
 *   { transport, wallet },
 *   { user: "0x...", enabled: true },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/portfolio-margin
 */
export function userPortfolioMargin(
  config: ExchangeConfig,
  params: UserPortfolioMarginParameters,
  opts?: UserPortfolioMarginOptions,
): Promise<UserPortfolioMarginSuccessResponse> {
  const action = parse(UserPortfolioMarginParameters, params);
  return executeUserSignedAction(
    config,
    { type: "userPortfolioMargin", ...action },
    UserPortfolioMarginTypes,
    opts,
  );
}
