import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, ISO8601WithoutTimezone, UnsignedDecimal } from "../../_schemas.ts";

/**
 * Request all perpetual dexs.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
 */
export const PerpDexsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("perpDexs"),
  });
})();
export type PerpDexsRequest = v.InferOutput<typeof PerpDexsRequest>;

/**
 * Array of perpetual dexes (null is main dex).
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
 */
export const PerpDexsResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.nullable(
      /** Perpetual dex metadata. */
      v.object({
        /** Short name of the perpetual dex. */
        name: v.string(),
        /** Complete name of the perpetual dex. */
        fullName: v.string(),
        /** Hex address of the dex deployer. */
        deployer: Address,
        /** Hex address of the oracle updater, or null if not available. */
        oracleUpdater: v.nullable(Address),
        /** Hex address of the fee recipient, or null if not available. */
        feeRecipient: v.nullable(Address),
        /** Mapping of asset names to their streaming open interest caps. */
        assetToStreamingOiCap: v.array(v.tuple([v.string(), v.string()])),
        /** List of delegated function names and their authorized executor addresses. */
        subDeployers: v.array(v.tuple([v.string(), v.array(Address)])),
        /** Fee scale applied to deployer fees. */
        deployerFeeScale: UnsignedDecimal,
        /** ISO 8601 timestamp (without timezone) of the last deployer fee scale change. */
        lastDeployerFeeScaleChangeTime: ISO8601WithoutTimezone,
        /** Array of tuples mapping asset names to their funding multipliers. */
        assetToFundingMultiplier: v.array(v.tuple([v.string(), v.string()])),
        /** Array of tuples mapping asset names to their funding interest rates. */
        assetToFundingInterestRate: v.array(v.tuple([v.string(), v.string()])),
      }),
    ),
  );
})();
export type PerpDexsResponse = v.InferOutput<typeof PerpDexsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request all perpetual dexs.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of perpetual dexes (null is main dex).
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { perpDexs } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await perpDexs({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
 */
export function perpDexs(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<PerpDexsResponse> {
  const request = v.parse(PerpDexsRequest, {
    type: "perpDexs",
  });
  return config.transport.request("info", request, signal);
}
