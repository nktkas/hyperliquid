import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { SpotPairDeployAuctionStatusResponse } from "./spotPairDeployAuctionStatus.ts";

/**
 * Request spot deploy state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
 */
export const SpotDeployStateRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("spotDeployState"),
    /** User address. */
    user: Address,
  });
})();
export type SpotDeployStateRequest = v.InferOutput<typeof SpotDeployStateRequest>;

/**
 * Deploy state for spot tokens.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
 */
export const SpotDeployStateResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Array of deploy states for tokens. */
    states: v.array(
      v.object({
        /** Token ID. */
        token: UnsignedInteger,
        /** Token specification. */
        spec: v.object({
          /** Name of the token. */
          name: v.string(),
          /** Minimum decimal places for order sizes. */
          szDecimals: UnsignedInteger,
          /** Number of decimals for the token's smallest unit. */
          weiDecimals: UnsignedInteger,
        }),
        /** Full name of the token. */
        fullName: v.nullable(v.string()),
        /** Deployer trading fee share for the token. */
        deployerTradingFeeShare: UnsignedDecimal,
        /** Spot indices for the token. */
        spots: v.array(UnsignedInteger),
        /** Maximum supply of the token. */
        maxSupply: v.nullable(UnsignedDecimal),
        /** Hyperliquidity genesis balance of the token. */
        hyperliquidityGenesisBalance: UnsignedDecimal,
        /** Total genesis balance (in wei) for the token. */
        totalGenesisBalanceWei: UnsignedDecimal,
        /** User genesis balances for the token. */
        userGenesisBalances: v.array(v.tuple([Address, UnsignedDecimal])),
        /** Existing token genesis balances for the token. */
        existingTokenGenesisBalances: v.array(v.tuple([UnsignedInteger, UnsignedDecimal])),
        /** Blacklisted users for the token. */
        blacklistUsers: v.array(Address),
      }),
    ),
    /** Status of the spot deploy auction. */
    gasAuction: SpotPairDeployAuctionStatusResponse,
  });
})();
export type SpotDeployStateResponse = v.InferOutput<typeof SpotDeployStateResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode spotDeployState} function. */
export type SpotDeployStateParameters = Omit<v.InferInput<typeof SpotDeployStateRequest>, "type">;

/**
 * Request spot deploy state.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Deploy state for spot tokens.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotDeployState } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await spotDeployState(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
 */
export function spotDeployState(
  config: InfoConfig,
  params: SpotDeployStateParameters,
  signal?: AbortSignal,
): Promise<SpotDeployStateResponse> {
  const request = v.parse(SpotDeployStateRequest, {
    type: "spotDeployState",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
