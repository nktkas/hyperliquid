import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal } from "../../_schemas.ts";

/**
 * Request mid coin prices.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
 */
export const AllMidsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("allMids"),
        v.description("Type of request."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.optional(v.string()),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Request mid coin prices."),
  );
})();
export type AllMidsRequest = v.InferOutput<typeof AllMidsRequest>;

/**
 * Mapping of coin symbols to mid prices.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
 */
export const AllMidsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.record(v.string(), UnsignedDecimal),
    v.description("Mapping of coin symbols to mid prices."),
  );
})();
export type AllMidsResponse = v.InferOutput<typeof AllMidsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode allMids} function. */
export type AllMidsParameters = Omit<v.InferInput<typeof AllMidsRequest>, "type">;

/**
 * Request mid coin prices.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Mapping of coin symbols to mid prices.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { allMids } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await allMids({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-coins
 */
export function allMids(
  config: InfoConfig,
  params?: AllMidsParameters,
  signal?: AbortSignal,
): Promise<AllMidsResponse>;
export function allMids(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<AllMidsResponse>;
export function allMids(
  config: InfoConfig,
  paramsOrSignal?: AllMidsParameters | AbortSignal,
  maybeSignal?: AbortSignal,
): Promise<AllMidsResponse> {
  const params = paramsOrSignal instanceof AbortSignal ? {} : paramsOrSignal;
  const signal = paramsOrSignal instanceof AbortSignal ? paramsOrSignal : maybeSignal;

  const request = v.parse(AllMidsRequest, {
    type: "allMids",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
