import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/** Subscription to user fill events for a specific user. */
export const UserFillsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("userFills"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
      aggregateByTime: v.pipe(
        v.optional(v.boolean()),
        v.description("If true, partial fills are aggregated when a crossing order fills multiple resting orders."),
      ),
    }),
    v.description("Subscription to user fill events for a specific user."),
  );
})();
export type UserFillsRequest = v.InferOutput<typeof UserFillsRequest>;

/** Event of user trade fill. */
export const UserFillsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Array of user trade fills. */
      fills: v.pipe(
        v.array(
          /** Trade fill record. */
          v.pipe(
            v.object({
              /** Asset symbol. */
              coin: v.pipe(
                v.string(),
                v.description("Asset symbol."),
              ),
              /** Price. */
              px: v.pipe(
                UnsignedDecimal,
                v.description("Price."),
              ),
              /** Size. */
              sz: v.pipe(
                UnsignedDecimal,
                v.description("Size."),
              ),
              /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
              side: v.pipe(
                v.union([v.literal("B"), v.literal("A")]),
                v.description('Order side ("B" = Bid/Buy, "A" = Ask/Sell).'),
              ),
              /** Timestamp when the trade occurred (in ms since epoch). */
              time: v.pipe(
                UnsignedInteger,
                v.description("Timestamp when the trade occurred (in ms since epoch)."),
              ),
              /** Start position size. */
              startPosition: v.pipe(
                Decimal,
                v.description("Start position size."),
              ),
              /** Direction indicator for frontend display. */
              dir: v.pipe(
                v.string(),
                v.description("Direction indicator for frontend display."),
              ),
              /** Realized PnL. */
              closedPnl: v.pipe(
                Decimal,
                v.description("Realized PnL."),
              ),
              /** L1 transaction hash. */
              hash: v.pipe(
                v.pipe(Hex, v.length(66)),
                v.description("L1 transaction hash."),
              ),
              /** Order ID. */
              oid: v.pipe(
                UnsignedInteger,
                v.description("Order ID."),
              ),
              /** Indicates if the fill was a taker order. */
              crossed: v.pipe(
                v.boolean(),
                v.description("Indicates if the fill was a taker order."),
              ),
              /** Fee charged or rebate received (negative indicates rebate). */
              fee: v.pipe(
                Decimal,
                v.description("Fee charged or rebate received (negative indicates rebate)."),
              ),
              /** Unique transaction identifier for a partial fill of an order. */
              tid: v.pipe(
                UnsignedInteger,
                v.description("Unique transaction identifier for a partial fill of an order."),
              ),
              /** Client Order ID. */
              cloid: v.pipe(
                v.optional(v.pipe(Hex, v.length(34))),
                v.description("Client Order ID."),
              ),
              /** Liquidation details. */
              liquidation: v.pipe(
                v.optional(
                  v.object({
                    /** Address of the liquidated user. */
                    liquidatedUser: v.pipe(
                      Address,
                      v.description("Address of the liquidated user."),
                    ),
                    /** Mark price at the time of liquidation. */
                    markPx: v.pipe(
                      UnsignedDecimal,
                      v.description("Mark price at the time of liquidation."),
                    ),
                    /** Liquidation method. */
                    method: v.pipe(
                      v.union([v.literal("market"), v.literal("backstop")]),
                      v.description("Liquidation method."),
                    ),
                  }),
                ),
                v.description("Liquidation details."),
              ),
              /** Token in which the fee is denominated (e.g., "USDC"). */
              feeToken: v.pipe(
                v.string(),
                v.description('Token in which the fee is denominated (e.g., "USDC").'),
              ),
              /** ID of the TWAP. */
              twapId: v.pipe(
                v.union([UnsignedInteger, v.null()]),
                v.description("ID of the TWAP."),
              ),
            }),
            v.description("Trade fill record."),
          ),
        ),
        v.description("Array of user trade fills."),
      ),
      /** Whether this is an initial snapshot. */
      isSnapshot: v.pipe(
        v.optional(v.literal(true)),
        v.description("Whether this is an initial snapshot."),
      ),
    }),
    v.description("Event of user trade fill."),
  );
})();
export type UserFillsEvent = v.InferOutput<typeof UserFillsEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userFills} function. */
export type UserFillsParameters = Omit<v.InferInput<typeof UserFillsRequest>, "type">;

/**
 * Subscribe to trade fill updates for a specific user.
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
 * import { userFills } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await userFills(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function userFills(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<UserFillsParameters>,
  listener: (data: UserFillsEvent) => void,
): Promise<Subscription> {
  const payload = parser(UserFillsRequest)({
    type: "userFills",
    ...params,
    aggregateByTime: params.aggregateByTime ?? false,
  });
  return config.transport.subscribe<UserFillsEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user.toLowerCase()) {
      listener(e.detail);
    }
  });
}
