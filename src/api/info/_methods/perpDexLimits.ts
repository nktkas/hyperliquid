import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal } from "../../_schemas.ts";

/**
 * Request builder deployed perpetual market limits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-builder-deployed-perp-market-limits
 */
export const PerpDexLimitsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("perpDexLimits"),
    /** DEX name (empty string for main dex). */
    dex: v.string(),
  });
})();
export type PerpDexLimitsRequest = v.InferOutput<typeof PerpDexLimitsRequest>;

/**
 * Builder deployed perpetual market limits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-builder-deployed-perp-market-limits
 */
export const PerpDexLimitsResponse = /* @__PURE__ */ (() => {
  return v.nullable(
    v.object({
      /** Total open interest cap. */
      totalOiCap: UnsignedDecimal,
      /** Open interest size cap per perpetual. */
      oiSzCapPerPerp: UnsignedDecimal,
      /** Maximum transfer notional amount. */
      maxTransferNtl: UnsignedDecimal,
      /** Coin to open interest cap mapping. */
      coinToOiCap: v.array(v.tuple([v.string(), UnsignedDecimal])),
    }),
  );
})();
export type PerpDexLimitsResponse = v.InferOutput<typeof PerpDexLimitsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode perpDexLimits} function. */
export type PerpDexLimitsParameters = Omit<v.InferInput<typeof PerpDexLimitsRequest>, "type">;

/**
 * Request builder deployed perpetual market limits.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Builder deployed perpetual market limits.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { perpDexLimits } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await perpDexLimits(
 *   { transport },
 *   { dex: "test" },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-builder-deployed-perp-market-limits
 */
export function perpDexLimits(
  config: InfoConfig,
  params: PerpDexLimitsParameters,
  signal?: AbortSignal,
): Promise<PerpDexLimitsResponse> {
  const request = v.parse(PerpDexLimitsRequest, {
    type: "perpDexLimits",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
