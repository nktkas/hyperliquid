import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Deploying HIP-3 assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hip-3-deployer-actions
 */
export const PerpDeployRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.variant("type", [
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** Parameters for registering a new perpetual asset (v2). */
        registerAsset2: v.object({
          /** Max gas in native token wei. If not provided, then uses current deploy auction price. */
          maxGas: v.nullable(UnsignedInteger),
          /** Contains new asset listing parameters. */
          assetRequest: v.object({
            /** Coin symbol for the new asset. */
            coin: v.string(),
            /** Number of decimal places for size. */
            szDecimals: UnsignedInteger,
            /** Initial oracle price for the asset. */
            oraclePx: UnsignedDecimal,
            /** Margin table identifier for risk management. */
            marginTableId: UnsignedInteger,
            /** 'strictIsolated' does not allow withdrawing of isolated margin from open position. */
            marginMode: v.picklist(["strictIsolated", "noCross"]),
          }),
          /** Name of the dex. */
          dex: v.string(),
          /** Contains new dex parameters. */
          schema: v.nullable(
            v.object({
              /** Full name of the dex. */
              fullName: v.string(),
              /** Collateral token index. */
              collateralToken: UnsignedInteger,
              /** User to update oracles. If not provided, then deployer is assumed to be oracle updater. */
              oracleUpdater: v.nullable(Address),
            }),
          ),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** Parameters for registering a new perpetual asset. */
        registerAsset: v.object({
          /** Max gas in native token wei. If not provided, then uses current deploy auction price. */
          maxGas: v.nullable(UnsignedInteger),
          /** Contains new asset listing parameters. */
          assetRequest: v.object({
            /** Coin symbol for the new asset. */
            coin: v.string(),
            /** Number of decimal places for size. */
            szDecimals: UnsignedInteger,
            /** Initial oracle price for the asset. */
            oraclePx: UnsignedDecimal,
            /** Margin table identifier for risk management. */
            marginTableId: UnsignedInteger,
            /** Whether the asset can only be traded with isolated margin. */
            onlyIsolated: v.boolean(),
          }),
          /** Name of the dex. */
          dex: v.string(),
          /** Contains new dex parameters. */
          schema: v.nullable(
            v.object({
              /** Full name of the dex. */
              fullName: v.string(),
              /** Collateral token index. */
              collateralToken: UnsignedInteger,
              /** User to update oracles. If not provided, then deployer is assumed to be oracle updater. */
              oracleUpdater: v.nullable(Address),
            }),
          ),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** Parameters for setting oracle and mark prices for assets. */
        setOracle: v.object({
          /** Name of the dex. */
          dex: v.string(),
          /** A list (sorted by key) of asset and oracle prices. */
          oraclePxs: v.array(v.tuple([v.string(), UnsignedDecimal])),
          /** An outer list of inner lists (inner list sorted by key) of asset and mark prices. */
          markPxs: v.array(v.array(v.tuple([v.string(), UnsignedDecimal]))),
          /** A list (sorted by key) of asset and external prices which prevent sudden mark price deviations. */
          externalPerpPxs: v.array(v.tuple([v.string(), UnsignedDecimal])),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** A list (sorted by key) of asset and funding multiplier. */
        setFundingMultipliers: v.array(v.tuple([v.string(), UnsignedDecimal])),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** Parameters for halting or resuming trading for an asset. */
        haltTrading: v.object({
          /** Coin symbol for the asset to halt or resume. */
          coin: v.string(),
          /** Whether trading should be halted (true) or resumed (false). */
          isHalted: v.boolean(),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** A list (sorted by key) of asset and margin table ids. */
        setMarginTableIds: v.array(v.tuple([v.string(), UnsignedInteger])),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** Parameters for setting the fee recipient. */
        setFeeRecipient: v.object({
          /** Name of the DEX. */
          dex: v.string(),
          /** Address of the fee recipient. */
          feeRecipient: Address,
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** A list (sorted by key) of asset and open interest cap notionals. */
        setOpenInterestCaps: v.array(v.tuple([v.string(), UnsignedInteger])),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** A modification to sub-deployer permissions. */
        setSubDeployers: v.object({
          /** Name of the DEX. */
          dex: v.string(),
          /** A modification to sub-deployer permissions. */
          subDeployers: v.array(
            v.object({
              /** Corresponds to a variant of PerpDeployAction. */
              variant: v.string(),
              /** Sub-deployer address. */
              user: Address,
              /** Add or remove the subDeployer from the authorized set for the action variant. */
              allowed: v.boolean(),
            }),
          ),
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** A list (sorted by key) of asset and margin modes. */
        setMarginModes: v.array(v.tuple([v.string(), v.picklist(["strictIsolated", "noCross"])])),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** Set fee scale. */
        setFeeScale: v.object({
          /** Name of the dex. */
          dex: v.string(),
          /** Fee scale (between 0.0 and 3.0). */
          scale: UnsignedDecimal,
        }),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("perpDeploy"),
        /** A list (sorted by key) of asset and growth modes. */
        setGrowthModes: v.array(v.tuple([v.string(), v.boolean()])),
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
export type PerpDeployRequest = v.InferOutput<typeof PerpDeployRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hip-3-deployer-actions
 */
export type PerpDeployResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const PerpDeployParameters = /* @__PURE__ */ (() => {
  return v.union(
    PerpDeployRequest.entries.action.options.map((option) => v.omit(option, ["type"])),
  );
})();
/** Action parameters for the {@linkcode perpDeploy} function. */
export type PerpDeployParameters = v.InferInput<typeof PerpDeployParameters>;

/** Request options for the {@linkcode perpDeploy} function. */
export type PerpDeployOptions = ExtractRequestOptions<v.InferInput<typeof PerpDeployRequest>>;

/** Successful variant of {@linkcode PerpDeployResponse} without errors. */
export type PerpDeploySuccessResponse = ExcludeErrorResponse<PerpDeployResponse>;

/**
 * Deploying HIP-3 assets.
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
 * import { perpDeploy } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await perpDeploy(
 *   { transport, wallet },
 *   {
 *     registerAsset: {
 *       maxGas: 1000000,
 *       assetRequest: {
 *         coin: "USDC",
 *         szDecimals: 8,
 *         oraclePx: "1",
 *         marginTableId: 1,
 *         onlyIsolated: false,
 *       },
 *       dex: "test",
 *       schema: null,
 *     },
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hip-3-deployer-actions
 */
export function perpDeploy(
  config: ExchangeConfig,
  params: PerpDeployParameters,
  opts?: PerpDeployOptions,
): Promise<PerpDeploySuccessResponse> {
  const action = v.parse(PerpDeployParameters, params);
  return executeL1Action(config, { type: "perpDeploy", ...action }, opts);
}
