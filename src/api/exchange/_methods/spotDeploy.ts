import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Percent, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, Nonce, Signature, SuccessResponse } from "./_base/schemas.ts";

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
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("spotDeploy"),
              v.description("Type of action."),
            ),
            /** Enable quote token parameters. */
            enableQuoteToken: v.pipe(
              v.object({
                /** The token ID to convert to a quote token. */
                token: v.pipe(
                  UnsignedInteger,
                  v.description("The token ID to convert to a quote token."),
                ),
              }),
              v.description("Enable quote token parameters."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("spotDeploy"),
              v.description("Type of action."),
            ),
            /** Enable aligned quote token parameters. */
            enableAlignedQuoteToken: v.pipe(
              v.object({
                /** Token identifier to enable as aligned quote token. */
                token: v.pipe(
                  UnsignedInteger,
                  v.description("Token identifier to enable as aligned quote token."),
                ),
              }),
              v.description("Enable aligned quote token parameters."),
            ),
          }),
        ]),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
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

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export const SpotDeployResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type SpotDeployResponse = v.InferOutput<typeof SpotDeployResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const SpotDeployParameters = /* @__PURE__ */ (() => {
  return v.union(
    SpotDeployRequest.entries.action.options.map((option) => v.omit(option, ["type"])),
  );
})();
/** Action parameters for the {@linkcode spotDeploy} function. */
export type SpotDeployParameters = v.InferInput<typeof SpotDeployParameters>;

/** Request options for the {@linkcode spotDeploy} function. */
export type SpotDeployOptions = ExtractRequestOptions<v.InferInput<typeof SpotDeployRequest>>;

/** Successful variant of {@linkcode SpotDeployResponse} without errors. */
export type SpotDeploySuccessResponse = ExcludeErrorResponse<SpotDeployResponse>;

/**
 * Deploying HIP-1 and HIP-2 assets.
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
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export function spotDeploy(
  config: ExchangeConfig,
  params: SpotDeployParameters,
  opts?: SpotDeployOptions,
): Promise<SpotDeploySuccessResponse> {
  const action = v.parse(SpotDeployParameters, params);
  return executeL1Action(config, { type: "spotDeploy", ...action }, opts);
}
