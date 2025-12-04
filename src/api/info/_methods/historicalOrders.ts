import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

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
          /** Open order with additional display information. */
          order: v.pipe(
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
                v.array(v.unknown()),
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
                v.picklist(["Market", "Limit", "Stop Market", "Stop Limit", "Take Profit Market", "Take Profit Limit"]),
                v.description(
                  "Order type for market execution." +
                    '\n- `"Market"`: Executes immediately at the market price.' +
                    '\n- `"Limit"`: Executes at the specified limit price or better.' +
                    '\n- `"Stop Market"`: Activates as a market order when a stop price is reached.' +
                    '\n- `"Stop Limit"`: Activates as a limit order when a stop price is reached.' +
                    '\n- `"Take Profit Market"`: Executes as a market order when a take profit price is reached.' +
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
                v.nullable(v.picklist(["Gtc", "Ioc", "Alo", "FrontendMarket", "LiquidationMarket"])),
                v.description(
                  "Time-in-force." +
                    '\n- `"Gtc"`: Remains active until filled or canceled.' +
                    '\n- `"Ioc"`: Fills immediately or cancels any unfilled portion.' +
                    '\n- `"Alo"`: Adds liquidity only.' +
                    '\n- `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.' +
                    '\n- `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.',
                ),
              ),
              /** Client Order ID. */
              cloid: v.pipe(
                v.nullable(v.pipe(Hex, v.length(34))),
                v.description("Client Order ID."),
              ),
            }),
            v.description("Open order with additional display information."),
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
           * - `"tickRejected"`: Rejected due to invalid tick price.
           * - `"minTradeNtlRejected"`: Rejected due to order notional below minimum.
           * - `"perpMarginRejected"`: Rejected due to insufficient margin.
           * - `"reduceOnlyRejected"`: Rejected due to reduce only.
           * - `"badAloPxRejected"`: Rejected due to post-only immediate match.
           * - `"iocCancelRejected"`: Rejected due to IOC not able to match.
           * - `"badTriggerPxRejected"`: Rejected due to invalid TP/SL price.
           * - `"marketOrderNoLiquidityRejected"`: Rejected due to lack of liquidity for market order.
           * - `"positionIncreaseAtOpenInterestCapRejected"`: Rejected due to open interest cap.
           * - `"positionFlipAtOpenInterestCapRejected"`: Rejected due to open interest cap.
           * - `"tooAggressiveAtOpenInterestCapRejected"`: Rejected due to price too aggressive at open interest cap.
           * - `"openInterestIncreaseRejected"`: Rejected due to open interest cap.
           * - `"insufficientSpotBalanceRejected"`: Rejected due to insufficient spot balance.
           * - `"oracleRejected"`: Rejected due to price too far from oracle.
           * - `"perpMaxPositionRejected"`: Rejected due to exceeding margin tier limit at current leverage.
           */
          status: v.pipe(
            v.picklist([
              "open",
              "filled",
              "canceled",
              "triggered",
              "rejected",
              "marginCanceled",
              "vaultWithdrawalCanceled",
              "openInterestCapCanceled",
              "selfTradeCanceled",
              "reduceOnlyCanceled",
              "siblingFilledCanceled",
              "delistedCanceled",
              "liquidatedCanceled",
              "scheduledCancel",
              "tickRejected",
              "minTradeNtlRejected",
              "perpMarginRejected",
              "reduceOnlyRejected",
              "badAloPxRejected",
              "iocCancelRejected",
              "badTriggerPxRejected",
              "marketOrderNoLiquidityRejected",
              "positionIncreaseAtOpenInterestCapRejected",
              "positionFlipAtOpenInterestCapRejected",
              "tooAggressiveAtOpenInterestCapRejected",
              "openInterestIncreaseRejected",
              "insufficientSpotBalanceRejected",
              "oracleRejected",
              "perpMaxPositionRejected",
            ]),
            v.description(
              "Order processing status." +
                '\n- `"open"`: Order active and waiting to be filled.' +
                '\n- `"filled"`: Order fully executed.' +
                '\n- `"canceled"`: Order canceled by the user.' +
                '\n- `"triggered"`: Order triggered and awaiting execution.' +
                '\n- `"rejected"`: Order rejected by the system.' +
                '\n- `"marginCanceled"`: Order canceled due to insufficient margin.' +
                '\n- `"vaultWithdrawalCanceled"`: Canceled due to a user withdrawal from vault.' +
                '\n- `"openInterestCapCanceled"`: Canceled due to order being too aggressive when open interest was at cap.' +
                '\n- `"selfTradeCanceled"`: Canceled due to self-trade prevention.' +
                '\n- `"reduceOnlyCanceled"`: Canceled reduced-only order that does not reduce position.' +
                '\n- `"siblingFilledCanceled"`: Canceled due to sibling ordering being filled.' +
                '\n- `"delistedCanceled"`: Canceled due to asset delisting.' +
                '\n- `"liquidatedCanceled"`: Canceled due to liquidation.' +
                '\n- `"scheduledCancel"`: Canceled due to exceeding scheduled cancel deadline (dead man\'s switch).' +
                '\n- `"tickRejected"`: Rejected due to invalid tick price.' +
                '\n- `"minTradeNtlRejected"`: Rejected due to order notional below minimum.' +
                '\n- `"perpMarginRejected"`: Rejected due to insufficient margin.' +
                '\n- `"reduceOnlyRejected"`: Rejected due to reduce only.' +
                '\n- `"badAloPxRejected"`: Rejected due to post-only immediate match.' +
                '\n- `"iocCancelRejected"`: Rejected due to IOC not able to match.' +
                '\n- `"badTriggerPxRejected"`: Rejected due to invalid TP/SL price.' +
                '\n- `"marketOrderNoLiquidityRejected"`: Rejected due to lack of liquidity for market order.' +
                '\n- `"positionIncreaseAtOpenInterestCapRejected"`: Rejected due to open interest cap.' +
                '\n- `"positionFlipAtOpenInterestCapRejected"`: Rejected due to open interest cap.' +
                '\n- `"tooAggressiveAtOpenInterestCapRejected"`: Rejected due to price too aggressive at open interest cap.' +
                '\n- `"openInterestIncreaseRejected"`: Rejected due to open interest cap.' +
                '\n- `"insufficientSpotBalanceRejected"`: Rejected due to insufficient spot balance.' +
                '\n- `"oracleRejected"`: Rejected due to price too far from oracle.' +
                '\n- `"perpMaxPositionRejected"`: Rejected due to exceeding margin tier limit at current leverage.',
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

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/** Request parameters for the {@linkcode historicalOrders} function. */
export type HistoricalOrdersParameters = Omit<v.InferInput<typeof HistoricalOrdersRequest>, "type">;

/**
 * Request user historical orders.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Array of frontend orders with current processing status.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { historicalOrders } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await historicalOrders(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
 */
export function historicalOrders(
  config: InfoConfig,
  params: HistoricalOrdersParameters,
  signal?: AbortSignal,
): Promise<HistoricalOrdersResponse> {
  const request = v.parse(HistoricalOrdersRequest, {
    type: "historicalOrders",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
