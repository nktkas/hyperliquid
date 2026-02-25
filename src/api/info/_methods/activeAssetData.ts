import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

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
export type ActiveAssetDataResponse = {
  /**
   * User address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  user: `0x${string}`;
  /** Asset symbol (e.g., BTC). */
  coin: string;
  /** Leverage configuration. */
  leverage: {
    /** Leverage type. */
    type: "isolated";
    /** Leverage value used. */
    value: number;
    /**
     * Amount of USD used (1 = $1).
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    rawUsd: string;
  } | {
    /** Leverage type. */
    type: "cross";
    /** Leverage value used. */
    value: number;
  };
  /** Maximum trade size range [min, max]. */
  maxTradeSzs: [
    /** @pattern ^[0-9]+(\.[0-9]+)?$ */
    min: string,
    /** @pattern ^[0-9]+(\.[0-9]+)?$ */
    max: string,
  ];
  /** Available to trade range [min, max]. */
  availableToTrade: [
    /** @pattern ^[0-9]+(\.[0-9]+)?$ */
    min: string,
    /** @pattern ^[0-9]+(\.[0-9]+)?$ */
    max: string,
  ];
  /**
   * Mark price.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  markPx: string;
};

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode activeAssetData} function. */
export type ActiveAssetDataParameters = Omit<v.InferInput<typeof ActiveAssetDataRequest>, "type">;

/**
 * Request user active asset data.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return User active asset data.
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
