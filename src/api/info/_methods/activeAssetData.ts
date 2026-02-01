import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user active asset data.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
 */
export const ActiveAssetDataRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("activeAssetData"),
    /** Asset symbol (e.g., BTC). */
    coin: v.string(),
    /** User address. */
    user: Address,
  });
})();
export type ActiveAssetDataRequest = v.InferOutput<typeof ActiveAssetDataRequest>;

/**
 * User active asset data.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
 */
export const ActiveAssetDataResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** User address. */
    user: Address,
    /** Asset symbol (e.g., BTC). */
    coin: v.string(),
    /** Leverage configuration. */
    leverage: v.variant("type", [
      v.object({
        /** Leverage type. */
        type: v.literal("isolated"),
        /** Leverage value used. */
        value: v.pipe(UnsignedInteger, v.minValue(1)),
        /** Amount of USD used (1 = $1). */
        rawUsd: Decimal,
      }),
      v.object({
        /** Leverage type. */
        type: v.literal("cross"),
        /** Leverage value used. */
        value: v.pipe(UnsignedInteger, v.minValue(1)),
      }),
    ]),
    /** Maximum trade size range [min, max]. */
    maxTradeSzs: v.tuple([UnsignedDecimal, UnsignedDecimal]),
    /** Available to trade range [min, max]. */
    availableToTrade: v.tuple([UnsignedDecimal, UnsignedDecimal]),
    /** Mark price. */
    markPx: UnsignedDecimal,
  });
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
