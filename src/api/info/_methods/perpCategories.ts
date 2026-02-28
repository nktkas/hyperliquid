import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request all perpetual asset categories.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetual-asset-categories
 */
export const PerpCategoriesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("perpCategories"),
  });
})();
export type PerpCategoriesRequest = v.InferOutput<typeof PerpCategoriesRequest>;

/**
 * Array of tuples mapping coin names to their categories.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetual-asset-categories
 */
export type PerpCategoriesResponse = [
  /** Coin symbol. */
  coin: string,
  /** Category name. */
  category: string,
][];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/**
 * Request all perpetual asset categories.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of tuples mapping coin names to their categories.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { perpCategories } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await perpCategories({ transport });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetual-asset-categories
 */
export function perpCategories(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<PerpCategoriesResponse> {
  const request = parse(PerpCategoriesRequest, {
    type: "perpCategories",
  });
  return config.transport.request("info", request, signal);
}
