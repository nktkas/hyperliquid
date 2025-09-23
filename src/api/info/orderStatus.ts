import * as v from "valibot";
import { Address, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

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
    v.union([
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
            order: v.pipe(
              v.object({
                /** Asset symbol. */
                coin: v.pipe(
                  v.string(),
                  v.description("Asset symbol."),
                ),
                /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
                side: v.pipe(
                  v.union([v.literal("B"), v.literal("A")]),
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
                /** Condition for triggering the order. */
                triggerCondition: v.pipe(
                  v.string(),
                  v.description("Condition for triggering the order."),
                ),
                /** Indicates if the order is a trigger order. */
                isTrigger: v.pipe(
                  v.boolean(),
                  v.description("Indicates if the order is a trigger order."),
                ),
                /** Trigger price. */
                triggerPx: v.pipe(
                  UnsignedDecimal,
                  v.description("Trigger price."),
                ),
                /** Child orders associated with this order. */
                children: v.pipe(
                  // deno-lint-ignore no-explicit-any
                  v.array(v.lazy<any>(() => OrderStatusResponse.options[0].entries.order)),
                  v.description("Child orders associated with this order."),
                ),
                /** Indicates if the order is a position TP/SL order. */
                isPositionTpsl: v.pipe(
                  v.boolean(),
                  v.description("Indicates if the order is a position TP/SL order."),
                ),
                /** Indicates whether the order is reduce-only. */
                reduceOnly: v.pipe(
                  v.boolean(),
                  v.description("Indicates whether the order is reduce-only."),
                ),
                /**
                 * Order type for market execution.
                 * - `"Market"`: Executes immediately at the market price.
                 * - `"Limit"`: Executes at the specified limit price or better.
                 * - `"Stop Market"`: Activates as a market order when a stop price is reached.
                 * - `"Stop Limit"`: Activates as a limit order when a stop price is reached.
                 * - `"Take Profit Market"`: Executes as a market order when a take profit price is reached.
                 * - `"Take Profit Limit"`: Executes as a limit order when a take profit price is reached.
                 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/order-types
                 */
                orderType: v.pipe(
                  v.union([
                    v.literal("Market"),
                    v.literal("Limit"),
                    v.literal("Stop Market"),
                    v.literal("Stop Limit"),
                    v.literal("Take Profit Market"),
                    v.literal("Take Profit Limit"),
                  ]),
                  v.description(
                    "Order type for market execution." +
                      '\n- `"Market"`: Executes immediately at the market price. ' +
                      '\n- `"Limit"`: Executes at the specified limit price or better. ' +
                      '\n- `"Stop Market"`: Activates as a market order when a stop price is reached. ' +
                      '\n- `"Stop Limit"`: Activates as a limit order when a stop price is reached. ' +
                      '\n- `"Take Profit Market"`: Executes as a market order when a take profit price is reached. ' +
                      '\n- `"Take Profit Limit"`: Executes as a limit order when a take profit price is reached. ',
                  ),
                ),
                /**
                 * Time-in-force options.
                 * - `"Gtc"`: Remains active until filled or canceled.
                 * - `"Ioc"`: Fills immediately or cancels any unfilled portion.
                 * - `"Alo"`: Adds liquidity only.
                 * - `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.
                 * - `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.
                 */
                tif: v.pipe(
                  v.union([
                    v.union([
                      v.literal("Gtc"),
                      v.literal("Ioc"),
                      v.literal("Alo"),
                      v.literal("FrontendMarket"),
                      v.literal("LiquidationMarket"),
                    ]),
                    v.null(),
                  ]),
                  v.description(
                    "Time-in-force options." +
                      '\n- `"Gtc"`: Remains active until filled or canceled. ' +
                      '\n- `"Ioc"`: Fills immediately or cancels any unfilled portion. ' +
                      '\n- `"Alo"`: Adds liquidity only. ' +
                      '\n- `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI. ' +
                      '\n- `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.',
                  ),
                ),
                /** Client Order ID. */
                cloid: v.pipe(
                  v.union([v.pipe(Hex, v.length(34)), v.null()]),
                  v.description("Client Order ID."),
                ),
              }),
              v.description("Order details."),
            ),
            /**
             * Order processing status.
             * - `"open"`: Order active and waiting to be filled.
             * - `"filled"`: Order fully executed.
             * - `"canceled"`: Order canceled by the user.
             * - `"triggered"`: Order triggered and awaiting execution.
             * - `"rejected"`: Order rejected by the system.
             * - `"marginCanceled"`: Order canceled due to insufficient margin.
             * - `"vaultWithdrawalCanceled"`: Canceled due to a user withdrawal from vault.
             * - `"openInterestCapCanceled"`: Canceled due to order being too aggressive when open interest was at cap.
             * - `"selfTradeCanceled"`: Canceled due to self-trade prevention.
             * - `"reduceOnlyCanceled"`: Canceled reduced-only order that does not reduce position.
             * - `"siblingFilledCanceled"`: Canceled due to sibling ordering being filled.
             * - `"delistedCanceled"`: Canceled due to asset delisting.
             * - `"liquidatedCanceled"`: Canceled due to liquidation.
             * - `"scheduledCancel"`: Canceled due to exceeding scheduled cancel deadline (dead man's switch).
             */
            status: v.pipe(
              v.union([
                v.literal("open"),
                v.literal("filled"),
                v.literal("canceled"),
                v.literal("triggered"),
                v.literal("rejected"),
                v.literal("marginCanceled"),
                v.literal("vaultWithdrawalCanceled"),
                v.literal("openInterestCapCanceled"),
                v.literal("selfTradeCanceled"),
                v.literal("reduceOnlyCanceled"),
                v.literal("siblingFilledCanceled"),
                v.literal("delistedCanceled"),
                v.literal("liquidatedCanceled"),
                v.literal("scheduledCancel"),
                v.literal("reduceOnlyRejected"),
              ]),
              v.description(
                "Order processing status." +
                  '\n- `"open"`: Order active and waiting to be filled. ' +
                  '\n- `"filled"`: Order fully executed. ' +
                  '\n- `"canceled"`: Order canceled by the user. ' +
                  '\n- `"triggered"`: Order triggered and awaiting execution. ' +
                  '\n- `"rejected"`: Order rejected by the system. ' +
                  '\n- `"marginCanceled"`: Order canceled due to insufficient margin. ' +
                  '\n- `"vaultWithdrawalCanceled"`: Canceled due to a user withdrawal from vault. ' +
                  '\n- `"openInterestCapCanceled"`: Canceled due to order being too aggressive when open interest was at cap. ' +
                  '\n- `"selfTradeCanceled"`: Canceled due to self-trade prevention. ' +
                  '\n- `"reduceOnlyCanceled"`: Canceled reduced-only order that does not reduce position. ' +
                  '\n- `"siblingFilledCanceled"`: Canceled due to sibling ordering being filled. ' +
                  '\n- `"delistedCanceled"`: Canceled due to asset delisting. ' +
                  '\n- `"liquidatedCanceled"`: Canceled due to liquidation. ' +
                  '\n- `"scheduledCancel"`: Canceled due to exceeding scheduled cancel deadline (dead man\'s switch).',
              ),
            ),
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
