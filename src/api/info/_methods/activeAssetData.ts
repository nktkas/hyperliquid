import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user active asset data.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
 */
export const ActiveAssetDataRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("activeAssetData"),
        v.description("Type of request."),
      ),
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user active asset data."),
  );
})();
export type ActiveAssetDataRequest = v.InferOutput<typeof ActiveAssetDataRequest>;

/**
 * User active asset data.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
 */
export const ActiveAssetDataResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
      /** Leverage configuration. */
      leverage: v.pipe(
        v.variant("type", [
          v.object({
            /** Leverage type. */
            type: v.pipe(
              v.literal("isolated"),
              v.description("Leverage type."),
            ),
            /** Leverage value used. */
            value: v.pipe(
              UnsignedInteger,
              v.minValue(1),
              v.description("Leverage value used."),
            ),
            /** Amount of USD used (1 = $1). */
            rawUsd: v.pipe(
              UnsignedDecimal,
              v.description("Amount of USD used (1 = $1)."),
            ),
          }),
          v.object({
            /** Leverage type. */
            type: v.pipe(
              v.literal("cross"),
              v.description("Leverage type."),
            ),
            /** Leverage value used. */
            value: v.pipe(
              UnsignedInteger,
              v.minValue(1),
              v.description("Leverage value used."),
            ),
          }),
        ]),
        v.description("Leverage configuration."),
      ),
      /** Maximum trade size range [min, max]. */
      maxTradeSzs: v.pipe(
        v.tuple([UnsignedDecimal, UnsignedDecimal]),
        v.description("Maximum trade size range [min, max]."),
      ),
      /** Available to trade range [min, max]. */
      availableToTrade: v.pipe(
        v.tuple([UnsignedDecimal, UnsignedDecimal]),
        v.description("Available to trade range [min, max]."),
      ),
      /** Mark price. */
      markPx: v.pipe(
        UnsignedDecimal,
        v.description("Mark price."),
      ),
    }),
    v.description("User active asset data."),
  );
})();
export type ActiveAssetDataResponse = v.InferOutput<typeof ActiveAssetDataResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode activeAssetData} function. */
export type ActiveAssetDataParameters = Omit<v.InferInput<typeof ActiveAssetDataRequest>, "type">;

/**
 * Request user active asset data.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns User active asset data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { activeAssetData } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await activeAssetData(
 *   { transport },
 *   { user: "0x...", coin: "ETH" },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
 */
export function activeAssetData(
  config: InfoConfig,
  params: ActiveAssetDataParameters,
  signal?: AbortSignal,
): Promise<ActiveAssetDataResponse> {
  const request = v.parse(ActiveAssetDataRequest, {
    type: "activeAssetData",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
