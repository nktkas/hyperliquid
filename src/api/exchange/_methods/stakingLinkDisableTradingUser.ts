import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Permanently disable a linked trading user, locking its funds.
 * Sent by the staking user. After 1 year of locking, funds from the trading user are automatically
 * transferred to the staking user. **This action is irreversible.**
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#staking-linking
 */
export const StakingLinkDisableTradingUserRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("stakingLinkDisableTradingUser"),
      /** Chain ID in hex format for EIP-712 signing. */
      signatureChainId: Hex,
      /** Hyperliquid network type. */
      hyperliquidChain: v.picklist(["Mainnet", "Testnet"]),
      /** Trading user address to disable. */
      tradingUser: Address,
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
export type StakingLinkDisableTradingUserRequest = v.InferOutput<typeof StakingLinkDisableTradingUserRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#staking-linking
 */
export type StakingLinkDisableTradingUserResponse =
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
import {
  type ExchangeConfig,
  type ExcludeErrorResponse,
  executeUserSignedAction,
  type ExtractRequestOptions,
} from "./_base/mod.ts";

/** Schema for action fields (excludes request-level system fields). */
const StakingLinkDisableTradingUserActionSchema = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(StakingLinkDisableTradingUserRequest.entries.action.entries),
    ["signatureChainId", "hyperliquidChain", "nonce"],
  );
})();

/** Action parameters for the {@linkcode stakingLinkDisableTradingUser} function. */
export type StakingLinkDisableTradingUserParameters = Omit<
  v.InferInput<typeof StakingLinkDisableTradingUserActionSchema>,
  "type"
>;

/** Request options for the {@linkcode stakingLinkDisableTradingUser} function. */
export type StakingLinkDisableTradingUserOptions = ExtractRequestOptions<
  v.InferInput<typeof StakingLinkDisableTradingUserRequest>
>;

/** Successful variant of {@linkcode StakingLinkDisableTradingUserResponse} without errors. */
export type StakingLinkDisableTradingUserSuccessResponse = ExcludeErrorResponse<
  StakingLinkDisableTradingUserResponse
>;

/** EIP-712 types for the {@linkcode stakingLinkDisableTradingUser} function. */
export const StakingLinkDisableTradingUserTypes = {
  "HyperliquidTransaction:StakingLinkDisableTradingUser": [
    { name: "hyperliquidChain", type: "string" },
    { name: "tradingUser", type: "address" },
    { name: "nonce", type: "uint64" },
  ],
};

/**
 * Permanently disable a linked trading user, locking its funds.
 * Sent by the staking user. After 1 year of locking, funds from the trading user are automatically
 * transferred to the staking user. **This action is irreversible.**
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
 * import { stakingLinkDisableTradingUser } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await stakingLinkDisableTradingUser({ transport, wallet }, {
 *   tradingUser: "0x...",
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#staking-linking
 */
export function stakingLinkDisableTradingUser(
  config: ExchangeConfig,
  params: StakingLinkDisableTradingUserParameters,
  opts?: StakingLinkDisableTradingUserOptions,
): Promise<StakingLinkDisableTradingUserSuccessResponse> {
  const action = canonicalize(
    StakingLinkDisableTradingUserActionSchema,
    parse(StakingLinkDisableTradingUserActionSchema, { type: "stakingLinkDisableTradingUser", ...params }),
  );
  return executeUserSignedAction(config, action, StakingLinkDisableTradingUserTypes, opts);
}
