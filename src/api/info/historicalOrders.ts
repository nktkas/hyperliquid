import * as v from "valibot";
import { Address, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

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
                v.array(v.lazy<any>(() => HistoricalOrdersResponse.item.entries.order)),
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
