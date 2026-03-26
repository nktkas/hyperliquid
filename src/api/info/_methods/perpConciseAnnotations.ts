import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request concise annotations for all perpetual assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-concise-perp-annotations
 */
export const PerpConciseAnnotationsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("perpConciseAnnotations"),
  });
})();
export type PerpConciseAnnotationsRequest = v.InferOutput<typeof PerpConciseAnnotationsRequest>;

/**
 * Array of tuples mapping coin names to their concise annotations.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-concise-perp-annotations
 */
export type PerpConciseAnnotationsResponse = [
  /** Coin symbol. */
  coin: string,
  /** Concise annotation. */
  annotation: {
    /** Classification category assigned to the perpetual. */
    category: string;
    /** Display name for frontends to use instead of the L1 name. */
    displayName?: string;
    /** Keywords used as hints to match against searches. */
    keywords?: string[];
  },
][];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/**
 * Request concise annotations for all perpetual assets.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of tuples mapping coin names to their concise annotations.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { perpConciseAnnotations } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await perpConciseAnnotations({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-concise-perp-annotations
 */
export function perpConciseAnnotations(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<PerpConciseAnnotationsResponse> {
  const request = parse(PerpConciseAnnotationsRequest, {
    type: "perpConciseAnnotations",
  });
  return config.transport.request("info", request, signal);
}
