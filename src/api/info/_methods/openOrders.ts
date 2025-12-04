import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

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
    v.array(
      v.pipe(
        v.object({
          /** Asset symbol. */
          coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
          ),
          /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
          side: v.pipe(
            v.picklist(["B", "A"]),
            v.description('Order side ("B" = Bid/Buy, "A" = Ask/Sell).'),
          ),
          /** Limit price. */
          limitPx: v.pipe(
            UnsignedDecimal,
            v.description("Limit price."),
          ),
          /** Size. */
          sz: v.pipe(
            UnsignedDecimal,
            v.description("Size."),
          ),
          /** Order ID. */
          oid: v.pipe(
            UnsignedInteger,
            v.description("Order ID."),
          ),
          /** Timestamp when the order was placed (in ms since epoch). */
          timestamp: v.pipe(
            UnsignedInteger,
            v.description("Timestamp when the order was placed (in ms since epoch)."),
          ),
          /** Original size at order placement. */
          origSz: v.pipe(
            UnsignedDecimal,
            v.description("Original size at order placement."),
          ),
          /** Client Order ID. */
          cloid: v.pipe(
            v.optional(v.pipe(Hex, v.length(34))),
            v.description("Client Order ID."),
          ),
          /** Indicates if the order is reduce-only. */
          reduceOnly: v.pipe(
            v.optional(v.literal(true)),
            v.description("Indicates if the order is reduce-only."),
          ),
        }),
        v.description("Order details."),
      ),
    ),
    v.description("Array of open orders."),
  );
})();
export type OpenOrdersResponse = v.InferOutput<typeof OpenOrdersResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/** Request parameters for the {@linkcode openOrders} function. */
export type OpenOrdersParameters = Omit<v.InferInput<typeof OpenOrdersRequest>, "type">;

/**
 * Request open orders.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Array of open orders.
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
