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
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("spotDeployState"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request spot deploy state."),
  );
})();
export type SpotDeployStateRequest = v.InferOutput<typeof SpotDeployStateRequest>;

/**
 * Deploy state for spot tokens.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
 */
export const SpotDeployStateResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Array of deploy states for tokens. */
      states: v.pipe(
        v.array(
          /** Deploy state for a specific token. */
          v.pipe(
            v.object({
              /** Token ID. */
              token: v.pipe(
                UnsignedInteger,
                v.description("Token ID."),
              ),
              /** Token specification. */
              spec: v.pipe(
                v.object({
                  /** Name of the token. */
                  name: v.pipe(
                    v.string(),
                    v.description("Name of the token."),
                  ),
                  /** Minimum decimal places for order sizes. */
                  szDecimals: v.pipe(
                    UnsignedInteger,
                    v.description("Minimum decimal places for order sizes."),
                  ),
                  /** Number of decimals for the token's smallest unit. */
                  weiDecimals: v.pipe(
                    UnsignedInteger,
                    v.description("Number of decimals for the token's smallest unit."),
                  ),
                }),
                v.description("Token specification."),
              ),
              /** Full name of the token. */
              fullName: v.pipe(
                v.nullable(v.string()),
                v.description("Full name of the token."),
              ),
              /** Deployer trading fee share for the token. */
              deployerTradingFeeShare: v.pipe(
                UnsignedDecimal,
                v.description("Deployer trading fee share for the token."),
              ),
              /** Spot indices for the token. */
              spots: v.pipe(
                v.array(UnsignedInteger),
                v.description("Spot indices for the token."),
              ),
              /** Maximum supply of the token. */
              maxSupply: v.pipe(
                v.nullable(UnsignedDecimal),
                v.description("Maximum supply of the token."),
              ),
              /** Hyperliquidity genesis balance of the token. */
              hyperliquidityGenesisBalance: v.pipe(
                UnsignedDecimal,
                v.description("Hyperliquidity genesis balance of the token."),
              ),
              /** Total genesis balance (in wei) for the token. */
              totalGenesisBalanceWei: v.pipe(
                UnsignedDecimal,
                v.description("Total genesis balance (in wei) for the token."),
              ),
              /** User genesis balances for the token. */
              userGenesisBalances: v.pipe(
                v.array(v.tuple([Address, UnsignedDecimal])),
                v.description("User genesis balances for the token."),
              ),
              /** Existing token genesis balances for the token. */
              existingTokenGenesisBalances: v.pipe(
                v.array(v.tuple([UnsignedInteger, UnsignedDecimal])),
                v.description("Existing token genesis balances for the token."),
              ),
              /** Blacklisted users for the token. */
              blacklistUsers: v.pipe(
                v.array(Address),
                v.description("Blacklisted users for the token."),
              ),
            }),
            v.description("Deploy state for a specific token."),
          ),
        ),
        v.description("Array of deploy states for tokens."),
      ),
      /** Status of the spot deploy auction. */
      gasAuction: SpotPairDeployAuctionStatusResponse,
    }),
    v.description("Deploy state for spot tokens."),
  );
})();
export type SpotDeployStateResponse = v.InferOutput<typeof SpotDeployStateResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/** Request parameters for the {@linkcode spotDeployState} function. */
export type SpotDeployStateParameters = Omit<v.InferInput<typeof SpotDeployStateRequest>, "type">;

/**
 * Request spot deploy state.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
