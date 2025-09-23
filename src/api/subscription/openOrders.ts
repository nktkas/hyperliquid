import * as v from "valibot";
import { Address, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/** Subscription to open order events for a specific user. */
export const OpenOrdersRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("openOrders"),
        v.description("Type of subscription."),
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
    v.description("Subscription to open order events for a specific user."),
  );
})();
export type OpenOrdersRequest = v.InferOutput<typeof OpenOrdersRequest>;

/** Event of open orders for a specific user. */
export const OpenOrdersEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.string(),
        v.description("DEX name (empty string for main dex)."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Array of open orders with additional display information. */
      orders: v.pipe(
        v.array(
          /** Open order with additional display information. */
          v.pipe(
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
                v.lazy<any>(() => OpenOrdersEvent.entries.orders),
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
            v.description("Open order with additional display information."),
          ),
        ),
        v.description("Array of open orders with additional display information."),
      ),
    }),
    v.description("Event of open orders for a specific user."),
  );
})();
export type OpenOrdersEvent = v.InferOutput<typeof OpenOrdersEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode openOrders} function. */
export type OpenOrdersParameters = Omit<v.InferInput<typeof OpenOrdersRequest>, "type">;

/**
 * Subscribe to open orders updates for a specific user.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { openOrders } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await openOrders(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function openOrders(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<OpenOrdersParameters>,
  listener: (data: OpenOrdersEvent) => void,
): Promise<Subscription> {
  const payload = parser(OpenOrdersRequest)({
    type: "openOrders",
    ...params,
    dex: params.dex ?? "",
  });
  return config.transport.subscribe<OpenOrdersEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user.toLowerCase() && e.detail.dex === payload.dex) {
      listener(e.detail);
    }
  });
}
