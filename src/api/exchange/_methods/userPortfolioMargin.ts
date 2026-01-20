import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, HyperliquidChainSchema, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Enable/disable user portfolio margin.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/portfolio-margin
 */
export const UserPortfolioMarginRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("userPortfolioMargin"),
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
          /** User address. */
          user: v.pipe(
            Address,
            v.description("User address."),
          ),
          /** Whether to enable or disable user portfolio margin. */
          enabled: v.pipe(
            v.boolean(),
            v.description("Whether to enable or disable user portfolio margin."),
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
    v.description("Enable/disable user portfolio margin."),
  );
})();
export type UserPortfolioMarginRequest = v.InferOutput<typeof UserPortfolioMarginRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/portfolio-margin
 */
export const UserPortfolioMarginResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type UserPortfolioMarginResponse = v.InferOutput<typeof UserPortfolioMarginResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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

/** EIP-712 types for the {@linkcode UserPortfolioMargin} function. */
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
  const action = v.parse(UserPortfolioMarginParameters, params);
  return executeUserSignedAction(
    config,
    { type: "userPortfolioMargin", ...action },
    UserPortfolioMarginTypes,
    opts,
  );
}
