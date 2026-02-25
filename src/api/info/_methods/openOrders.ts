import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { OpenOrderSchema } from "./_base/commonSchemas.ts";

/**
 * Request open orders.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
 */
export const OpenOrdersRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("openOrders"),
    /** User address. */
    user: Address,
    /** DEX name (empty string for main dex). */
    dex: v.optional(v.string()),
  });
})();
export type OpenOrdersRequest = v.InferOutput<typeof OpenOrdersRequest>;

/**
 * Array of open orders.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
 */
export type OpenOrdersResponse = OpenOrderSchema[];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode openOrders} function. */
export type OpenOrdersParameters = Omit<v.InferInput<typeof OpenOrdersRequest>, "type">;

/**
 * Request open orders.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of open orders.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { openOrders } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await openOrders(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
 */
export function openOrders(
  config: InfoConfig,
  params: OpenOrdersParameters,
  signal?: AbortSignal,
): Promise<OpenOrdersResponse> {
  const request = v.parse(OpenOrdersRequest, {
    type: "openOrders",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
