import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request perpetuals at open interest cap.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
 */
export const PerpsAtOpenInterestCapRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("perpsAtOpenInterestCap"),
    /** DEX name (empty string for main dex). */
    dex: v.optional(v.string()),
  });
})();
export type PerpsAtOpenInterestCapRequest = v.InferOutput<typeof PerpsAtOpenInterestCapRequest>;

/**
 * Array of perpetuals at open interest caps.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
 */
export type PerpsAtOpenInterestCapResponse = string[];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode perpsAtOpenInterestCap} function. */
export type PerpsAtOpenInterestCapParameters = Omit<v.InferInput<typeof PerpsAtOpenInterestCapRequest>, "type">;

/**
 * Request perpetuals at open interest cap.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of perpetuals at open interest caps.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { perpsAtOpenInterestCap } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await perpsAtOpenInterestCap({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
 */
export function perpsAtOpenInterestCap(
  config: InfoConfig,
  params?: PerpsAtOpenInterestCapParameters,
  signal?: AbortSignal,
): Promise<PerpsAtOpenInterestCapResponse>;
export function perpsAtOpenInterestCap(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<PerpsAtOpenInterestCapResponse>;
export function perpsAtOpenInterestCap(
  config: InfoConfig,
  paramsOrSignal?: PerpsAtOpenInterestCapParameters | AbortSignal,
  maybeSignal?: AbortSignal,
): Promise<PerpsAtOpenInterestCapResponse> {
  const params = paramsOrSignal instanceof AbortSignal ? {} : paramsOrSignal;
  const signal = paramsOrSignal instanceof AbortSignal ? paramsOrSignal : maybeSignal;

  const request = v.parse(PerpsAtOpenInterestCapRequest, {
    type: "perpsAtOpenInterestCap",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
