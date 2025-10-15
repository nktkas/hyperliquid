import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

import { OrderSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/**
 * Request open orders.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
 */
export const OpenOrdersRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("openOrders"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.optional(v.string()),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Request open orders."),
  );
})();
export type OpenOrdersRequest = v.InferOutput<typeof OpenOrdersRequest>;

/**
 * Array of open orders.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
 */
export const OpenOrdersResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(OrderSchema),
    v.description("Array of open orders."),
  );
})();
export type OpenOrdersResponse = v.InferOutput<typeof OpenOrdersResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode openOrders} function. */
export type OpenOrdersParameters = Omit<v.InferInput<typeof OpenOrdersRequest>, "type">;

/**
 * Request open orders.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of open orders.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { openOrders } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await openOrders(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function openOrders(
  config: InfoRequestConfig,
  params: DeepImmutable<OpenOrdersParameters>,
  signal?: AbortSignal,
): Promise<OpenOrdersResponse> {
  const request = parser(OpenOrdersRequest)({
    type: "openOrders",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
