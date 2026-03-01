import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request perp annotation.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perp-annotation
 */
export const PerpAnnotationRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("perpAnnotation"),
    /** Coin symbol for the perpetual asset. */
    coin: v.string(),
  });
})();
export type PerpAnnotationRequest = v.InferOutput<typeof PerpAnnotationRequest>;

/**
 * Perp annotation for an asset.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perp-annotation
 */
export type PerpAnnotationResponse = {
  /** Classification category assigned to the perpetual. */
  category: string;
  /** Human-readable description of the category. */
  description: string;
} | null;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode perpAnnotation} function. */
export type PerpAnnotationParameters = Omit<v.InferInput<typeof PerpAnnotationRequest>, "type">;

/**
 * Request perp annotation.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Perp annotation for an asset.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { perpAnnotation } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await perpAnnotation({ transport }, { coin: "BTC" });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perp-annotation
 */
export function perpAnnotation(
  config: InfoConfig,
  params: PerpAnnotationParameters,
  signal?: AbortSignal,
): Promise<PerpAnnotationResponse> {
  const request = parse(PerpAnnotationRequest, {
    type: "perpAnnotation",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
