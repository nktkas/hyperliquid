import { Address, type DeepImmutable, parser, Percent, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_common.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/**
 * Deploying HIP-1 and HIP-2 assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export const SpotDeployRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.union([
          v.pipe(
            v.object({
              /** Type of action. */
              type: v.pipe(
                v.literal("spotDeploy"),
                v.description("Type of action."),
              ),
              /** Genesis parameters. */
              genesis: v.pipe(
                v.object({
                  /** Token identifier. */
                  token: v.pipe(
                    UnsignedInteger,
                    v.description("Token identifier."),
                  ),
                  /** Maximum token supply. */
                  maxSupply: v.pipe(
                    UnsignedDecimal,
                    v.description("Maximum token supply."),
                  ),
                  /** Set hyperliquidity balance to 0. */
                  noHyperliquidity: v.pipe(
                    v.optional(v.literal(true)),
                    v.description("Set hyperliquidity balance to 0."),
                  ),
                }),
                v.description("Genesis parameters."),
              ),
            }),
            v.description("Genesis variant"),
          ),
          v.pipe(
            v.object({
              /** Type of action. */
              type: v.pipe(
                v.literal("spotDeploy"),
                v.description("Type of action."),
              ),
              /** Register hyperliquidity parameters. */
              registerHyperliquidity: v.pipe(
                v.object({
                  /** Spot index (distinct from base token index). */
                  spot: v.pipe(
                    UnsignedInteger,
                    v.description("Spot index (distinct from base token index)."),
                  ),
                  /** Starting price for liquidity seeding. */
                  startPx: v.pipe(
                    UnsignedDecimal,
                    v.description("Starting price for liquidity seeding."),
                  ),
                  /** Order size as a float (not in wei). */
                  orderSz: v.pipe(
                    UnsignedDecimal,
                    v.description("Order size as a float (not in wei)."),
                  ),
                  /** Total number of orders to place. */
                  nOrders: v.pipe(
                    UnsignedInteger,
                    v.description("Total number of orders to place."),
                  ),
                  /** Number of levels to seed with USDC. */
                  nSeededLevels: v.pipe(
                    v.optional(UnsignedInteger),
                    v.description("Number of levels to seed with USDC."),
                  ),
                }),
                v.description("Register hyperliquidity parameters."),
              ),
            }),
            v.description("Register hyperliquidity variant"),
          ),
          v.pipe(
            v.object({
              /** Type of action. */
              type: v.pipe(
                v.literal("spotDeploy"),
                v.description("Type of action."),
              ),
              /** Register spot parameters. */
              registerSpot: v.pipe(
                v.object({
                  /** Tuple containing base and quote token indices. */
                  tokens: v.pipe(
                    v.tuple([
                      UnsignedInteger,
                      UnsignedInteger,
                    ]),
                    v.description("Tuple containing base and quote token indices."),
                  ),
                }),
                v.description("Register spot parameters."),
              ),
            }),
            v.description("Register spot variant"),
          ),
          v.pipe(
            v.object({
              /** Type of action. */
              type: v.pipe(
                v.literal("spotDeploy"),
                v.description("Type of action."),
              ),
              /** Register token parameters. */
              registerToken2: v.pipe(
                v.object({
                  /** Token specifications. */
                  spec: v.pipe(
                    v.object({
                      /** Token name. */
                      name: v.pipe(
                        v.string(),
                        v.description("Token name."),
                      ),
                      /** Number of decimals for token size. */
                      szDecimals: v.pipe(
                        UnsignedInteger,
                        v.description("Number of decimals for token size."),
                      ),
                      /** Number of decimals for token amounts in wei. */
                      weiDecimals: v.pipe(
                        UnsignedInteger,
                        v.description("Number of decimals for token amounts in wei."),
                      ),
                    }),
                    v.description("Token specifications."),
                  ),
                  /** Maximum gas allowed for registration. */
                  maxGas: v.pipe(
                    UnsignedInteger,
                    v.description("Maximum gas allowed for registration."),
                  ),
                  /** Optional full token name. */
                  fullName: v.pipe(
                    v.optional(v.string()),
                    v.description("Optional full token name."),
                  ),
                }),
                v.description("Register token parameters."),
              ),
            }),
            v.description("Register token variant"),
          ),
          v.pipe(
            v.object({
              /** Type of action. */
              type: v.pipe(
                v.literal("spotDeploy"),
                v.description("Type of action."),
              ),
              /** Set deployer trading fee share parameters. */
              setDeployerTradingFeeShare: v.pipe(
                v.object({
                  /** Token identifier. */
                  token: v.pipe(
                    UnsignedInteger,
                    v.description("Token identifier."),
                  ),
                  /** The deployer trading fee share. Range is 0% to 100%. */
                  share: v.pipe(
                    Percent,
                    v.description("The deployer trading fee share. Range is 0% to 100%."),
                  ),
                }),
                v.description("Set deployer trading fee share parameters."),
              ),
            }),
            v.description("Set deployer trading fee share variant"),
          ),
          v.pipe(
            v.object({
              /** Type of action. */
              type: v.pipe(
                v.literal("spotDeploy"),
                v.description("Type of action."),
              ),
              /** User genesis parameters. */
              userGenesis: v.pipe(
                v.object({
                  /** Token identifier. */
                  token: v.pipe(
                    UnsignedInteger,
                    v.description("Token identifier."),
                  ),
                  /** Array of tuples: [user address, genesis amount in wei]. */
                  userAndWei: v.pipe(
                    v.array(v.tuple([Address, UnsignedDecimal])),
                    v.description("Array of tuples: [user address, genesis amount in wei]."),
                  ),
                  /** Array of tuples: [existing token identifier, genesis amount in wei]. */
                  existingTokenAndWei: v.pipe(
                    v.array(
                      v.tuple([
                        UnsignedInteger,
                        UnsignedDecimal,
                      ]),
                    ),
                    v.description(
                      "Array of tuples: [existing token identifier, genesis amount in wei].",
                    ),
                  ),
                  /** Array of tuples: [user address, blacklist status] (`true` for blacklist, `false` to remove existing blacklisted user). */
                  blacklistUsers: v.pipe(
                    v.optional(v.array(v.tuple([Address, v.boolean()]))),
                    v.description(
                      "Array of tuples: [user address, blacklist status] (`true` for blacklist, `false` to remove existing blacklisted user).",
                    ),
                  ),
                }),
                v.description("User genesis parameters."),
              ),
            }),
            v.description("User genesis variant"),
          ),
        ]),
        v.description("Action to perform."),
      ),
      /** Unique request identifier (current timestamp in ms). */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Unique request identifier (current timestamp in ms)."),
      ),
      /** Cryptographic signature. */
      signature: v.pipe(
        Signature,
        v.description("Cryptographic signature."),
      ),
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description(
      "Deploying HIP-1 and HIP-2 assets:" +
        "\n- Genesis" +
        "\n- Register Hyperliquidity" +
        "\n- Register Spot" +
        "\n- Register Token2" +
        "\n- Set Deployer Trading Fee Share" +
        "\n- User Genesis",
    ),
  );
})();
export type SpotDeployRequest = v.InferOutput<typeof SpotDeployRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode spotDeploy} function. */
export type SpotDeployParameters = ExtractRequestAction<v.InferInput<typeof SpotDeployRequest>>;
/** Request options for the {@linkcode spotDeploy} function. */
export type SpotDeployOptions = ExtractRequestOptions<v.InferInput<typeof SpotDeployRequest>>;

/**
 * Deploying HIP-1 and HIP-2 assets.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { spotDeploy } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await spotDeploy(
 *   { transport, wallet },
 *   {
 *     registerToken2: {
 *       spec: {
 *         name: "USDC",
 *         szDecimals: 8,
 *         weiDecimals: 8,
 *       },
 *       maxGas: 1000000,
 *       fullName: "USD Coin",
 *     },
 *   },
 * );
 * ```
 */
export async function spotDeploy(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<SpotDeployParameters>,
  opts?: SpotDeployOptions,
): Promise<SuccessResponse> {
  const action = parser(SpotDeployRequest.entries.action)({
    type: "spotDeploy",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
