import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { ISO8601WithoutTimezone, UnsignedInteger } from "../../_schemas.ts";
import { MarginTableResponse } from "./marginTable.ts";

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
export const MetaResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Trading universes available for perpetual trading. */
    universe: v.array(
      v.object({
        /** Minimum decimal places for order sizes. */
        szDecimals: UnsignedInteger,
        /** Name of the universe. */
        name: v.string(),
        /** Maximum allowed leverage. */
        maxLeverage: v.pipe(UnsignedInteger, v.minValue(1)),
        /** Unique identifier for the margin requirements table. */
        marginTableId: UnsignedInteger,
        /** Indicates if only isolated margin trading is allowed. */
        onlyIsolated: v.optional(v.literal(true)),
        /** Indicates if the universe is delisted. */
        isDelisted: v.optional(v.literal(true)),
        /** Trading margin mode constraint. */
        marginMode: v.optional(v.picklist(["strictIsolated", "noCross"])),
        /** Indicates if growth mode is enabled. */
        growthMode: v.optional(v.literal("enabled")),
        /** Timestamp of the last growth mode change. */
        lastGrowthModeChangeTime: v.optional(ISO8601WithoutTimezone),
      }),
    ),
    /** Margin requirement tables for different leverage tiers. */
    marginTables: v.array(v.tuple([UnsignedInteger, MarginTableResponse])),
    /** Collateral token index. */
    collateralToken: UnsignedInteger,
  });
})();
export type MetaResponse = v.InferOutput<typeof MetaResponse>;

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
