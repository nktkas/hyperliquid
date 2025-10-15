import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

import { DetailedOrderSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/**
 * Request frontend open orders.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info
 */
export const FrontendOpenOrdersRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("frontendOpenOrders"),
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
    v.description("Request frontend open orders."),
  );
})();
export type FrontendOpenOrdersRequest = v.InferOutput<typeof FrontendOpenOrdersRequest>;

/**
 * Array of open orders with additional display information.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info
 */
export const FrontendOpenOrdersResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(DetailedOrderSchema),
    v.description("Array of open orders with additional display information."),
  );
})();
export type FrontendOpenOrdersResponse = v.InferOutput<typeof FrontendOpenOrdersResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode frontendOpenOrders} function. */
export type FrontendOpenOrdersParameters = Omit<v.InferInput<typeof FrontendOpenOrdersRequest>, "type">;

/**
 * Request frontend open orders.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of open orders with additional display information.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { frontendOpenOrders } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await frontendOpenOrders(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function frontendOpenOrders(
  config: InfoRequestConfig,
  params: DeepImmutable<FrontendOpenOrdersParameters>,
  signal?: AbortSignal,
): Promise<FrontendOpenOrdersResponse> {
  const request = parser(FrontendOpenOrdersRequest)({
    type: "frontendOpenOrders",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
