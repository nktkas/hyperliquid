import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request perpetuals at open interest cap.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
 */
export const PerpsAtOpenInterestCapRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("perpsAtOpenInterestCap"),
        v.description("Type of request."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.optional(v.string()),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Request perpetuals at open interest cap."),
  );
})();
export type PerpsAtOpenInterestCapRequest = v.InferOutput<typeof PerpsAtOpenInterestCapRequest>;

/**
 * Array of perpetuals at open interest caps.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
 */
export const PerpsAtOpenInterestCapResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(v.string()),
    v.description("Array of perpetuals at open interest caps."),
  );
})();
export type PerpsAtOpenInterestCapResponse = v.InferOutput<typeof PerpsAtOpenInterestCapResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode perpsAtOpenInterestCap} function. */
export type PerpsAtOpenInterestCapParameters = Omit<v.InferInput<typeof PerpsAtOpenInterestCapRequest>, "type">;

/**
 * Request perpetuals at open interest cap.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Array of perpetuals at open interest caps.
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
