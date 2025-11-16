import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_base/mod.ts";

// -------------------- Schemas --------------------

/**
 * Deploying HIP-3 assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-3-assets
 */
export const PerpDeployRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.union([
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("perpDeploy"),
              v.description("Type of action."),
            ),
            /** Parameters for registering a new perpetual asset. */
            registerAsset: v.pipe(
              v.object({
                /** Max gas in native token wei. If not provided, then uses current deploy auction price. */
                maxGas: v.pipe(
                  v.nullable(UnsignedInteger),
                  v.description(
                    "Max gas in native token wei. If not provided, then uses current deploy auction price.",
                  ),
                ),
                /** Contains new asset listing parameters. */
                assetRequest: v.pipe(
                  v.object({
                    /** Coin symbol for the new asset. */
                    coin: v.pipe(
                      v.string(),
                      v.description("Coin symbol for the new asset."),
                    ),
                    /** Number of decimal places for size. */
                    szDecimals: v.pipe(
                      UnsignedInteger,
                      v.description("Number of decimal places for size."),
                    ),
                    /** Initial oracle price for the asset. */
                    oraclePx: v.pipe(
                      UnsignedDecimal,
                      v.description("Initial oracle price for the asset."),
                    ),
                    /** Margin table identifier for risk management. */
                    marginTableId: v.pipe(
                      UnsignedInteger,
                      v.description("Margin table identifier for risk management."),
                    ),
                    /** Whether the asset can only be traded with isolated margin. */
                    onlyIsolated: v.pipe(
                      v.boolean(),
                      v.description("Whether the asset can only be traded with isolated margin."),
                    ),
                  }),
                  v.description("Contains new asset listing parameters."),
                ),
                /** Name of the dex. */
                dex: v.pipe(
                  v.string(),
                  v.description("Name of the dex."),
                ),
                /** Contains new dex parameters. */
                schema: v.pipe(
                  v.nullable(v.object({
                    /** Full name of the dex. */
                    fullName: v.pipe(
                      v.string(),
                      v.description("Full name of the dex."),
                    ),
                    /** Collateral token index. */
                    collateralToken: v.pipe(
                      UnsignedInteger,
                      v.description("Collateral token index."),
                    ),
                    /** User to update oracles. If not provided, then deployer is assumed to be oracle updater. */
                    oracleUpdater: v.pipe(
                      v.nullable(Address),
                      v.description(
                        "User to update oracles. If not provided, then deployer is assumed to be oracle updater.",
                      ),
                    ),
                  })),
                  v.description("Contains new dex parameters."),
                ),
              }),
              v.description("Parameters for registering a new perpetual asset."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("perpDeploy"),
              v.description("Type of action."),
            ),
            /** Parameters for setting oracle and mark prices for assets. */
            setOracle: v.pipe(
              v.object({
                /** Name of the dex. */
                dex: v.pipe(
                  v.string(),
                  v.minLength(1),
                  v.description("Name of the dex."),
                ),
                /** A list (sorted by key) of asset and oracle prices. */
                oraclePxs: v.pipe(
                  v.array(v.tuple([v.string(), UnsignedDecimal])),
                  v.description("A list (sorted by key) of asset and oracle prices."),
                ),
                /** An outer list of inner lists (inner list sorted by key) of asset and mark prices. */
                markPxs: v.pipe(
                  v.array(v.array(v.tuple([v.string(), UnsignedDecimal]))),
                  v.description(
                    "An outer list of inner lists (inner list sorted by key) of asset and mark prices.",
                  ),
                ),
                /** A list (sorted by key) of asset and external prices which prevent sudden mark price deviations. */
                externalPerpPxs: v.pipe(
                  v.array(v.tuple([v.string(), UnsignedDecimal])),
                  v.description(
                    "A list (sorted by key) of asset and external prices which prevent sudden mark price deviations.",
                  ),
                ),
              }),
              v.description("Parameters for setting oracle and mark prices for assets."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("perpDeploy"),
              v.description("Type of action."),
            ),
            /** A list (sorted by key) of asset and funding multiplier. */
            setFundingMultipliers: v.pipe(
              v.array(v.tuple([v.string(), UnsignedDecimal])),
              v.description("A list (sorted by key) of asset and funding multiplier."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("perpDeploy"),
              v.description("Type of action."),
            ),
            /** Parameters for halting or resuming trading for an asset. */
            haltTrading: v.pipe(
              v.object({
                coin: v.pipe(
                  v.string(),
                  v.description("Coin symbol for the asset to halt or resume."),
                ),
                isHalted: v.pipe(
                  v.boolean(),
                  v.description("Whether trading should be halted (true) or resumed (false)."),
                ),
              }),
              v.description("Parameters for halting or resuming trading for an asset."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("perpDeploy"),
              v.description("Type of action."),
            ),
            /** A list (sorted by key) of asset and margin table ids. */
            setMarginTableIds: v.pipe(
              v.array(v.tuple([v.string(), UnsignedInteger])),
              v.description("A list (sorted by key) of asset and margin table ids."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("perpDeploy"),
              v.description("Type of action."),
            ),
            /** Parameters for setting the fee recipient. */
            setFeeRecipient: v.pipe(
              v.object({
                /** Name of the DEX. */
                dex: v.pipe(
                  v.string(),
                  v.description("Name of the DEX."),
                ),
                /** Address of the fee recipient. */
                feeRecipient: v.pipe(
                  Address,
                  v.description("Address of the fee recipient."),
                ),
              }),
              v.description("Parameters for setting the fee recipient."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("perpDeploy"),
              v.description("Type of action."),
            ),
            /** A list (sorted by key) of asset and open interest cap notionals. */
            setOpenInterestCaps: v.pipe(
              v.array(v.tuple([v.string(), UnsignedInteger])),
              v.description("A list (sorted by key) of asset and open interest cap notionals."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("perpDeploy"),
              v.description("Type of action."),
            ),
            /** A modification to sub-deployer permissions. */
            setSubDeployers: v.pipe(
              v.object({
                /** Name of the DEX. */
                dex: v.pipe(
                  v.string(),
                  v.description("Name of the DEX."),
                ),
                /** A modification to sub-deployer permissions. */
                subDeployers: v.pipe(
                  v.array(
                    v.object({
                      /** Corresponds to a variant of PerpDeployAction. */
                      variant: v.pipe(
                        v.string(),
                        v.description("Corresponds to a variant of PerpDeployAction."),
                      ),
                      /** Sub-deployer address. */
                      user: v.pipe(
                        Address,
                        v.description("Sub-deployer address."),
                      ),
                      /** Add or remove the subDeployer from the authorized set for the action variant. */
                      allowed: v.pipe(
                        v.boolean(),
                        v.description(
                          "Add or remove the subDeployer from the authorized set for the action variant.",
                        ),
                      ),
                    }),
                  ),
                  v.description("A modification to sub-deployer permissions."),
                ),
              }),
              v.description("A modification to sub-deployer permissions."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("perpDeploy"),
              v.description("Type of action."),
            ),
            /** Set fee scale. */
            setFeeScale: v.pipe(
              v.object({
                /** Name of the dex. */
                dex: v.pipe(
                  v.string(),
                  v.description("Name of the dex."),
                ),
                /** Fee scale (between 0.0 and 3.0). */
                scale: v.pipe(
                  UnsignedDecimal,
                  v.description("Fee scale (between 0.0 and 3.0)."),
                ),
              }),
              v.description("Set fee scale."),
            ),
          }),
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
    v.description("Deploying HIP-3 assets."),
  );
})();
export type PerpDeployRequest = v.InferOutput<typeof PerpDeployRequest>;

import { SuccessResponse } from "./_base/mod.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode perpDeploy} function. */
export type PerpDeployParameters = ExtractRequestAction<v.InferInput<typeof PerpDeployRequest>>;
/** Request options for the {@linkcode perpDeploy} function. */
export type PerpDeployOptions = ExtractRequestOptions<v.InferInput<typeof PerpDeployRequest>>;

/**
 * Deploying HIP-3 assets.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-3-assets
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
 */
export async function perpDeploy(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<PerpDeployParameters>,
  opts?: PerpDeployOptions,
): Promise<SuccessResponse> {
  const request = parser(PerpDeployRequest)({
    action: {
      type: "perpDeploy",
      ...params,
    },
    nonce: 0, // Placeholder; actual nonce generated in `executeL1Action`
    signature: { // Placeholder; actual signature generated in `executeL1Action`
      r: "0x0000000000000000000000000000000000000000000000000000000000000000",
      s: "0x0000000000000000000000000000000000000000000000000000000000000000",
      v: 27,
    },
    expiresAfter: typeof config.defaultExpiresAfter === "number"
      ? config.defaultExpiresAfter
      : await config.defaultExpiresAfter?.(),
  });
  return await executeL1Action(config, request, opts?.signal);
}
