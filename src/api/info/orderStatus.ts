import * as v from "valibot";
import { Address, type DeepImmutable, Hex, parser, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

import { DetailedOrderSchema, OrderProcessingStatusSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/**
 * Request order status.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
 */
export const OrderStatusRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("orderStatus"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Order ID or Client Order ID. */
      oid: v.pipe(
        v.union([UnsignedInteger, v.pipe(Hex, v.length(34))]),
        v.description("Order ID or Client Order ID."),
      ),
    }),
    v.description("Request order status."),
  );
})();
export type OrderStatusRequest = v.InferOutput<typeof OrderStatusRequest>;

/**
 * Order status response.
 * - If the order is found, returns detailed order information and its current status.
 * - If the order is not found, returns a status of "unknownOid".
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
 */
export const OrderStatusResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.variant("status", [
      v.object({
        /** Indicates that the order was found. */
        status: v.pipe(
          v.literal("order"),
          v.description("Indicates that the order was found."),
        ),
        /** Order status details. */
        order: v.pipe(
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
          v.description("Order status details."),
        ),
      }),
      v.object({
        /** Indicates that the order was not found. */
        status: v.pipe(
          v.literal("unknownOid"),
          v.description("Indicates that the order was not found."),
        ),
      }),
    ]),
    v.description(
      "Order status response." +
        "\n- If the order is found, returns detailed order information and its current status." +
        '\n- If the order is not found, returns a status of "unknownOid".',
    ),
  );
})();
export type OrderStatusResponse = v.InferOutput<typeof OrderStatusResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode orderStatus} function. */
export type OrderStatusParameters = Omit<v.InferInput<typeof OrderStatusRequest>, "type">;

/**
 * Request order status.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Order status response.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { orderStatus } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await orderStatus(
 *   { transport },
 *   { user: "0x...", oid: 12345 },
 * );
 * ```
 */
export function orderStatus(
  config: InfoRequestConfig,
  params: DeepImmutable<OrderStatusParameters>,
  signal?: AbortSignal,
): Promise<OrderStatusResponse> {
  const request = parser(OrderStatusRequest)({
    type: "orderStatus",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
