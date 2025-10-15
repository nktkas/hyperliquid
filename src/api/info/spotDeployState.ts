import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

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
      /** Status of the deploy auction. */
      gasAuction: v.pipe(
        v.object({
          /** Current gas. */
          currentGas: v.pipe(
            v.nullable(UnsignedDecimal),
            v.description("Current gas."),
          ),
          /** Duration in seconds. */
          durationSeconds: v.pipe(
            UnsignedInteger,
            v.description("Duration in seconds."),
          ),
          /** Ending gas. */
          endGas: v.pipe(
            v.nullable(UnsignedDecimal),
            v.description("Ending gas."),
          ),
          /** Starting gas. */
          startGas: v.pipe(
            UnsignedDecimal,
            v.description("Starting gas."),
          ),
          /** Auction start time (seconds since epoch). */
          startTimeSeconds: v.pipe(
            UnsignedInteger,
            v.description("Auction start time (seconds since epoch)."),
          ),
        }),
        v.description("Status of the deploy auction."),
      ),
    }),
    v.description("Deploy state for spot tokens."),
  );
})();
export type SpotDeployStateResponse = v.InferOutput<typeof SpotDeployStateResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode spotDeployState} function. */
export type SpotDeployStateParameters = Omit<v.InferInput<typeof SpotDeployStateRequest>, "type">;

/**
 * Request spot deploy state.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Deploy state for spot tokens.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotDeployState } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await spotDeployState(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function spotDeployState(
  config: InfoRequestConfig,
  params: DeepImmutable<SpotDeployStateParameters>,
  signal?: AbortSignal,
): Promise<SpotDeployStateResponse> {
  const request = parser(SpotDeployStateRequest)({
    type: "spotDeployState",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
