import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, HyperliquidChainSchema, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Link staking and trading accounts for fee discount attribution.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#staking-linking
 */
export const LinkStakingUserRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("linkStakingUser"),
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
          /**
           * Target account address.
           * - Trading user initiating: enter staking account address.
           * - Staking user finalizing: enter trading account address.
           */
          user: v.pipe(
            Address,
            v.description(
              "Target account address." +
                "\n- Trading user initiating: enter staking account address." +
                "\n- Staking user finalizing: enter trading account address.",
            ),
          ),
          /**
           * Link phase.
           * - `false` = trading user initiates link request.
           * - `true` = staking user finalizes permanent link.
           */
          isFinalize: v.pipe(
            v.boolean(),
            v.description(
              "Link phase." +
                "\n- `false` = trading user initiates link request." +
                "\n- `true` = staking user finalizes permanent link.",
            ),
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
    v.description("Link staking and trading accounts for fee discount attribution."),
  );
})();
export type LinkStakingUserRequest = v.InferOutput<typeof LinkStakingUserRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#staking-linking
 */
export const LinkStakingUserResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type LinkStakingUserResponse = v.InferOutput<typeof LinkStakingUserResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeUserSignedAction, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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
