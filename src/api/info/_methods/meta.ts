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
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("meta"),
        v.description("Type of request."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.optional(v.string()),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Request trading metadata."),
  );
})();
export type MetaRequest = v.InferOutput<typeof MetaRequest>;

/**
 * Metadata for perpetual assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata-universe-and-margin-tables
 */
export const MetaResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Trading universes available for perpetual trading. */
      universe: v.pipe(
        v.array(
          /** Trading universe parameters for perpetual asset. */
          v.pipe(
            v.object({
              /** Minimum decimal places for order sizes. */
              szDecimals: v.pipe(
                UnsignedInteger,
                v.description("Minimum decimal places for order sizes."),
              ),
              /** Name of the universe. */
              name: v.pipe(
                v.string(),
                v.description("Name of the universe."),
              ),
              /** Maximum allowed leverage. */
              maxLeverage: v.pipe(
                UnsignedInteger,
                v.minValue(1),
                v.description("Maximum allowed leverage."),
              ),
              /** Unique identifier for the margin requirements table. */
              marginTableId: v.pipe(
                UnsignedInteger,
                v.description("Unique identifier for the margin requirements table."),
              ),
              /** Indicates if only isolated margin trading is allowed. */
              onlyIsolated: v.pipe(
                v.optional(v.literal(true)),
                v.description("Indicates if only isolated margin trading is allowed."),
              ),
              /** Indicates if the universe is delisted. */
              isDelisted: v.pipe(
                v.optional(v.literal(true)),
                v.description("Indicates if the universe is delisted."),
              ),
              /** Trading margin mode constraint. */
              marginMode: v.pipe(
                v.optional(v.picklist(["strictIsolated", "noCross"])),
                v.description("Trading margin mode constraint."),
              ),
              /** Indicates if growth mode is enabled. */
              growthMode: v.pipe(
                v.optional(v.literal("enabled")),
                v.description("Indicates if growth mode is enabled."),
              ),
              /** Timestamp of the last growth mode change. */
              lastGrowthModeChangeTime: v.pipe(
                v.optional(ISO8601WithoutTimezone),
                v.description("Timestamp of the last growth mode change."),
              ),
            }),
            v.description("Trading universe parameters for perpetual asset."),
          ),
        ),
        v.description("Trading universes available for perpetual trading."),
      ),
      /** Margin requirement tables for different leverage tiers. */
      marginTables: v.pipe(
        v.array(
          /** Tuple of margin table ID and its details. */
          v.pipe(
            v.tuple([
              UnsignedInteger,
              MarginTableResponse,
            ]),
            v.description("Tuple of margin table ID and its details."),
          ),
        ),
        v.description("Margin requirement tables for different leverage tiers."),
      ),
      /** Collateral token index. */
      collateralToken: v.pipe(
        UnsignedInteger,
        v.description("Collateral token index."),
      ),
    }),
    v.description("Metadata for perpetual assets."),
  );
})();
export type MetaResponse = v.InferOutput<typeof MetaResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/** Request parameters for the {@linkcode meta} function. */
export type MetaParameters = Omit<v.InferInput<typeof MetaRequest>, "type">;

/**
 * Request trading metadata.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
