import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal } from "../../_schemas.ts";

/**
 * Request perp DEX status.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#get-perp-market-status
 */
export const PerpDexStatusRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("perpDexStatus"),
        v.description("Type of request."),
      ),
      /** Perp dex name of builder-deployed dex market. The empty string represents the first perp dex. */
      dex: v.pipe(
        v.string(),
        v.description("Perp dex name of builder-deployed dex market. The empty string represents the first perp dex."),
      ),
    }),
    v.description("Request perp DEX status."),
  );
})();
export type PerpDexStatusRequest = v.InferOutput<typeof PerpDexStatusRequest>;

/**
 * Status of a perp DEX.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#get-perp-market-status
 */
export const PerpDexStatusResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Total net deposit. */
      totalNetDeposit: v.pipe(
        UnsignedDecimal,
        v.description("Total net deposit."),
      ),
    }),
    v.description("Status of a perp DEX."),
  );
})();
export type PerpDexStatusResponse = v.InferOutput<typeof PerpDexStatusResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/** Request parameters for the {@linkcode perpDexStatus} function. */
export type PerpDexStatusParameters = Omit<v.InferInput<typeof PerpDexStatusRequest>, "type">;

/**
 * Request perp DEX status.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request.
 *
 * @returns Status of a perp DEX.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { perpDexStatus } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await perpDexStatus({ transport }, { dex: "test" });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#get-perp-market-status
 */
export function perpDexStatus(
  config: InfoConfig,
  params: PerpDexStatusParameters,
  signal?: AbortSignal,
): Promise<PerpDexStatusResponse> {
  const request = v.parse(PerpDexStatusRequest, {
    type: "perpDexStatus",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
