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
 * Link staking and trading accounts for fee discount attribution.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#staking-linking
 */
export const LinkStakingUserRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("linkStakingUser"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** HyperLiquid network type. */
      hyperliquidChain: HyperliquidChainSchema,
      /**
       * Target account address.
       * - Trading user initiating: enter staking account address.
       * - Staking user finalizing: enter trading account address.
       */
      user: Address,
      /**
       * Link phase.
       * - `false` = trading user initiates link request.
       * - `true` = staking user finalizes permanent link.
       */
      isFinalize: v.boolean(),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: UnsignedInteger,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
  });
})();
export type LinkStakingUserRequest = v.InferOutput<typeof LinkStakingUserRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#staking-linking
 */
export type LinkStakingUserResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const LinkStakingUserParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(LinkStakingUserRequest.entries.action.entries),
    ["type", "signatureChainId", "hyperliquidChain", "nonce"],
  );
})();

/** Action parameters for the {@linkcode linkStakingUser} function. */
export type LinkStakingUserParameters = v.InferInput<typeof LinkStakingUserParameters>;

/** Request options for the {@linkcode linkStakingUser} function. */
export type LinkStakingUserOptions = ExtractRequestOptions<v.InferInput<typeof LinkStakingUserRequest>>;

/** Successful variant of {@linkcode LinkStakingUserResponse} without errors. */
export type LinkStakingUserSuccessResponse = ExcludeErrorResponse<LinkStakingUserResponse>;

/** EIP-712 types for the {@linkcode linkStakingUser} function. */
export const LinkStakingUserTypes = {
  "HyperliquidTransaction:LinkStakingUser": [
    { name: "hyperliquidChain", type: "string" },
    { name: "user", type: "address" },
    { name: "isFinalize", type: "bool" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Link staking and trading accounts for fee discount attribution.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { linkStakingUser } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await linkStakingUser(
 *   { transport, wallet },
 *   { user: "0x...", isFinalize: false },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#staking-linking
 */
export function linkStakingUser(
  config: ExchangeConfig,
  params: LinkStakingUserParameters,
  opts?: LinkStakingUserOptions,
): Promise<LinkStakingUserSuccessResponse> {
  const action = v.parse(LinkStakingUserParameters, params);
  return executeUserSignedAction(
    config,
    { type: "linkStakingUser", ...action },
    LinkStakingUserTypes,
    opts,
  );
}
