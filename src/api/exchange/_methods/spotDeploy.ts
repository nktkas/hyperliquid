import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Percent, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Deploying HIP-1 and HIP-2 assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export const SpotDeployRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.variant("type", [
      v.object({
        /** Type of action. */
        type: v.literal("spotDeploy"),
        /** Register token parameters. */
        registerToken2: v.object({
          /** Token specifications. */
          spec: v.object({
            /** Token name. */
            name: v.string(),
            /** Number of decimals for token size. */
            szDecimals: UnsignedInteger,
            /** Number of decimals for token amounts in wei. */
            weiDecimals: UnsignedInteger,
          }),
          /** Maximum gas allowed for registration. */
          maxGas: UnsignedInteger,
          /** Optional full token name. */
          fullName: v.optional(v.string()),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("spotDeploy"),
        /** User genesis parameters. */
        userGenesis: v.object({
          /** Token identifier. */
          token: UnsignedInteger,
          /** Array of tuples: [user address, genesis amount in wei]. */
          userAndWei: v.array(v.tuple([Address, UnsignedDecimal])),
          /** Array of tuples: [existing token identifier, genesis amount in wei]. */
          existingTokenAndWei: v.array(v.tuple([UnsignedInteger, UnsignedDecimal])),
          /** Array of tuples: [user address, blacklist status] (`true` for blacklist, `false` to remove existing blacklisted user). */
          blacklistUsers: v.optional(v.array(v.tuple([Address, v.boolean()]))),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("spotDeploy"),
        /** Genesis parameters. */
        genesis: v.object({
          /** Token identifier. */
          token: UnsignedInteger,
          /** Maximum token supply. */
          maxSupply: UnsignedDecimal,
          /** Set hyperliquidity balance to 0. */
          noHyperliquidity: v.optional(v.literal(true)),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("spotDeploy"),
        /** Register spot parameters. */
        registerSpot: v.object({
          /** Tuple containing base and quote token indices. */
          tokens: v.tuple([UnsignedInteger, UnsignedInteger]),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("spotDeploy"),
        /** Register hyperliquidity parameters. */
        registerHyperliquidity: v.object({
          /** Spot index (distinct from base token index). */
          spot: UnsignedInteger,
          /** Starting price for liquidity seeding. */
          startPx: UnsignedDecimal,
          /** Order size as a float (not in wei). */
          orderSz: UnsignedDecimal,
          /** Total number of orders to place. */
          nOrders: UnsignedInteger,
          /** Number of levels to seed with USDC. */
          nSeededLevels: v.optional(UnsignedInteger),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("spotDeploy"),
        /** Set deployer trading fee share parameters. */
        setDeployerTradingFeeShare: v.object({
          /** Token identifier. */
          token: UnsignedInteger,
          /** The deployer trading fee share. Range is 0% to 100%. */
          share: Percent,
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("spotDeploy"),
        /** Enable quote token parameters. */
        enableQuoteToken: v.object({
          /** The token ID to convert to a quote token. */
          token: UnsignedInteger,
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("spotDeploy"),
        /** Enable aligned quote token parameters. */
        enableAlignedQuoteToken: v.object({
          /** Token identifier to enable as aligned quote token. */
          token: UnsignedInteger,
        }),
      }),
    ]),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type SpotDeployRequest = v.InferOutput<typeof SpotDeployRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export type SpotDeployResponse = SuccessResponse | ErrorResponse;

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
