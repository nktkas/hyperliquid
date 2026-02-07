import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import type { MarginTableResponse } from "./marginTable.ts";

/**
 * Request trading metadata.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata-universe-and-margin-tables
 */
export const MetaRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("meta"),
    /** DEX name (empty string for main dex). */
    dex: v.optional(v.string()),
  });
})();
export type MetaRequest = v.InferOutput<typeof MetaRequest>;

/**
 * Metadata for perpetual assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata-universe-and-margin-tables
 */
export type MetaResponse = {
  /** Trading universes available for perpetual trading. */
  universe: {
    /** Minimum decimal places for order sizes. */
    szDecimals: number;
    /** Name of the universe. */
    name: string;
    /** Maximum allowed leverage. */
    maxLeverage: number;
    /** Unique identifier for the margin requirements table. */
    marginTableId: number;
    /** Indicates if only isolated margin trading is allowed. */
    onlyIsolated?: true;
    /** Indicates if the universe is delisted. */
    isDelisted?: true;
    /** Trading margin mode constraint. */
    marginMode?: "strictIsolated" | "noCross";
    /** Indicates if growth mode is enabled. */
    growthMode?: "enabled";
    /** Timestamp of the last growth mode change. */
    lastGrowthModeChangeTime?: string;
  }[];
  /** Margin requirement tables for different leverage tiers. */
  marginTables: [id: number, table: MarginTableResponse][];
  /** Collateral token index. */
  collateralToken: number;
};

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode meta} function. */
export type MetaParameters = Omit<v.InferInput<typeof MetaRequest>, "type">;

/**
 * Request trading metadata.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Metadata for perpetual assets.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { meta } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await meta({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata-universe-and-margin-tables
 */
export function meta(
  config: InfoConfig,
  params?: MetaParameters,
  signal?: AbortSignal,
): Promise<MetaResponse>;
export function meta(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<MetaResponse>;
export function meta(
  config: InfoConfig,
  paramsOrSignal?: MetaParameters | AbortSignal,
  maybeSignal?: AbortSignal,
): Promise<MetaResponse> {
  const params = paramsOrSignal instanceof AbortSignal ? {} : paramsOrSignal;
  const signal = paramsOrSignal instanceof AbortSignal ? paramsOrSignal : maybeSignal;

  const request = v.parse(MetaRequest, {
    type: "meta",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
