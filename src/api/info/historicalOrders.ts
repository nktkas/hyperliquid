import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

import { DetailedOrderSchema, OrderProcessingStatusSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/**
 * Request user historical orders.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
 */
export const HistoricalOrdersRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("historicalOrders"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user historical orders."),
  );
})();
export type HistoricalOrdersRequest = v.InferOutput<typeof HistoricalOrdersRequest>;

/**
 * Array of frontend orders with current processing status.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
 */
export const HistoricalOrdersResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Frontend order with current processing status. */
      v.pipe(
        v.object({
          /** Order details. */
          order: DetailedOrderSchema,
          /** Order processing status. */
          status: OrderProcessingStatusSchema,
          /** Timestamp when the status was last updated (in ms since epoch). */
          statusTimestamp: v.pipe(
            UnsignedInteger,
            v.description("Timestamp when the status was last updated (in ms since epoch)."),
          ),
        }),
        v.description("Frontend order with current processing status."),
      ),
    ),
    v.description("Array of frontend orders with current processing status."),
  );
})();
export type HistoricalOrdersResponse = v.InferOutput<typeof HistoricalOrdersResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode historicalOrders} function. */
export type HistoricalOrdersParameters = Omit<v.InferInput<typeof HistoricalOrdersRequest>, "type">;

/**
 * Request user historical orders.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of frontend orders with current processing status.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { historicalOrders } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await historicalOrders(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function historicalOrders(
  config: InfoRequestConfig,
  params: DeepImmutable<HistoricalOrdersParameters>,
  signal?: AbortSignal,
): Promise<HistoricalOrdersResponse> {
  const request = parser(HistoricalOrdersRequest)({
    type: "historicalOrders",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
