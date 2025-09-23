import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/** Subscription to user events for a specific user. */
export const UserEventsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("userEvents"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to user events for a specific user."),
  );
})();
export type UserEventsRequest = v.InferOutput<typeof UserEventsRequest>;

/** Event of array of user trade fills. */
export const FillEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
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
    }),
    v.description("Event of array of user trade fills."),
  );
})();
export type FillEvent = v.InferOutput<typeof FillEvent>;

/** Event of user funding update. */
export const FundingEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Funding update details. */
      funding: v.pipe(
        v.object({
          /** Asset symbol. */
          coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
          ),
          /** Amount transferred in USDC. */
          usdc: v.pipe(
            Decimal,
            v.description("Amount transferred in USDC."),
          ),
          /** Signed position size. */
          szi: v.pipe(
            Decimal,
            v.description("Signed position size."),
          ),
          /** Applied funding rate. */
          fundingRate: v.pipe(
            Decimal,
            v.description("Applied funding rate."),
          ),
          /** Number of samples. */
          nSamples: v.pipe(
            v.union([UnsignedInteger, v.null()]),
            v.description("Number of samples."),
          ),
        }),
        v.description("Funding update details."),
      ),
    }),
    v.description("Event of user funding update."),
  );
})();
export type FundingEvent = v.InferOutput<typeof FundingEvent>;

/** Event of user liquidation. */
export const LiquidationEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Liquidation details. */
      liquidation: v.pipe(
        v.object({
          /** Unique liquidation ID. */
          lid: v.pipe(
            UnsignedInteger,
            v.description("Unique liquidation ID."),
          ),
          /** Address of the liquidator. */
          liquidator: v.pipe(
            Address,
            v.description("Address of the liquidator."),
          ),
          /** Address of the liquidated user. */
          liquidated_user: v.pipe(
            Address,
            v.description("Address of the liquidated user."),
          ),
          /** Notional position size that was liquidated. */
          liquidated_ntl_pos: v.pipe(
            UnsignedDecimal,
            v.description("Notional position size that was liquidated."),
          ),
          /** Account value at time of liquidation. */
          liquidated_account_value: v.pipe(
            UnsignedDecimal,
            v.description("Account value at time of liquidation."),
          ),
        }),
        v.description("Liquidation details."),
      ),
    }),
    v.description("Event of user liquidation."),
  );
})();
export type LiquidationEvent = v.InferOutput<typeof LiquidationEvent>;

/** Event of array of non-user initiated order cancellations. */
export const NonUserCancelEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Array of non-user initiated order cancellations. */
      nonUserCancel: v.pipe(
        v.array(
          /** Cancelled order not initiated by the user. */
          v.pipe(
            v.object({
              /** Asset symbol (e.g., BTC). */
              coin: v.pipe(
                v.string(),
                v.description("Asset symbol (e.g., BTC)."),
              ),
              /** Order ID. */
              oid: v.pipe(
                UnsignedInteger,
                v.description("Order ID."),
              ),
            }),
            v.description("Cancelled order not initiated by the user."),
          ),
        ),
        v.description("Array of non-user initiated order cancellations."),
      ),
    }),
    v.description("Event of array of non-user initiated order cancellations."),
  );
})();
export type NonUserCancelEvent = v.InferOutput<typeof NonUserCancelEvent>;

/** Event of a TWAP history entry. */
export const TwapHistoryEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Array of user's TWAP history. */
      twapHistory: v.pipe(
        v.array(
          /** TWAP history record. */
          v.pipe(
            v.object({
              /** Creation time of the history record (in seconds since epoch). */
              time: v.pipe(
                UnsignedInteger,
                v.description("Creation time of the history record (in seconds since epoch)."),
              ),
              /** State of the TWAP order. */
              state: v.pipe(
                v.object({
                  /** Asset symbol. */
                  coin: v.pipe(
                    v.string(),
                    v.description("Asset symbol."),
                  ),
                  /** Executed notional value. */
                  executedNtl: v.pipe(
                    UnsignedDecimal,
                    v.description("Executed notional value."),
                  ),
                  /** Executed size. */
                  executedSz: v.pipe(
                    UnsignedDecimal,
                    v.description("Executed size."),
                  ),
                  /** Duration in minutes. */
                  minutes: v.pipe(
                    UnsignedInteger,
                    v.description("Duration in minutes."),
                  ),
                  /** Indicates if the TWAP randomizes execution. */
                  randomize: v.pipe(
                    v.boolean(),
                    v.description("Indicates if the TWAP randomizes execution."),
                  ),
                  /** Indicates if the order is reduce-only. */
                  reduceOnly: v.pipe(
                    v.boolean(),
                    v.description("Indicates if the order is reduce-only."),
                  ),
                  /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
                  side: v.pipe(
                    v.union([v.literal("B"), v.literal("A")]),
                    v.description('Order side ("B" = Bid/Buy, "A" = Ask/Sell).'),
                  ),
                  /** Order size. */
                  sz: v.pipe(
                    UnsignedDecimal,
                    v.description("Order size."),
                  ),
                  /** Start time of the TWAP order (in ms since epoch). */
                  timestamp: v.pipe(
                    UnsignedInteger,
                    v.description("Start time of the TWAP order (in ms since epoch)."),
                  ),
                  /** User address. */
                  user: v.pipe(
                    Address,
                    v.description("User address."),
                  ),
                }),
                v.description("State of the TWAP order."),
              ),
              /**
               * Current status of the TWAP order.
               * - `"finished"`: Fully executed.
               * - `"activated"`: Active and executing.
               * - `"terminated"`: Terminated.
               * - `"error"`: An error occurred.
               */
              status: v.pipe(
                v.union([
                  v.object({
                    /** Status of the TWAP order. */
                    status: v.pipe(
                      v.union([
                        v.literal("finished"),
                        v.literal("activated"),
                        v.literal("terminated"),
                      ]),
                      v.description("Status of the TWAP order."),
                    ),
                  }),
                  v.object({
                    /** Status of the TWAP order. */
                    status: v.pipe(
                      v.literal("error"),
                      v.description("Status of the TWAP order."),
                    ),
                    /** Error message. */
                    description: v.pipe(
                      v.string(),
                      v.description("Error message."),
                    ),
                  }),
                ]),
                v.description(
                  "Current status of the TWAP order." +
                    '\n- `"finished"`: Fully executed. ' +
                    '\n- `"activated"`: Active and executing. ' +
                    '\n- `"terminated"`: Terminated. ' +
                    '\n- `"error"`: An error occurred.',
                ),
              ),
            }),
            v.description("TWAP history record."),
          ),
        ),
        v.description("Array of user's TWAP history."),
      ),
    }),
    v.description("Event of a TWAP history entry."),
  );
})();
export type TwapHistoryEvent = v.InferOutput<typeof TwapHistoryEvent>;

/** Event of TWAP slice fills. */
export const TwapSliceFillsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Array of TWAP slice fills. */
      twapSliceFills: v.pipe(
        v.array(
          /** Fill details for the TWAP slice. */
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
            v.description("Fill details for the TWAP slice."),
          ),
        ),
        v.description("Array of TWAP slice fills."),
      ),
    }),
    v.description("Event of TWAP slice fills."),
  );
})();
export type TwapSliceFillsEvent = v.InferOutput<typeof TwapSliceFillsEvent>;

/** Event of one of possible user events. */
export const UserEventsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([
      FillEvent,
      FundingEvent,
      LiquidationEvent,
      NonUserCancelEvent,
      TwapHistoryEvent,
      TwapSliceFillsEvent,
    ]),
    v.description("Event of one of possible user events."),
  );
})();
export type UserEventsEvent = v.InferOutput<typeof UserEventsEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userEvents} function. */
export type UserEventsParameters = Omit<v.InferInput<typeof UserEventsRequest>, "type">;

/**
 * Subscribe to non-order events for a specific user.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 * @note Different subscriptions cannot be distinguished from each other.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { userEvents } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await userEvents(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function userEvents(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<UserEventsParameters>,
  listener: (data: UserEventsEvent) => void,
): Promise<Subscription> {
  const payload = parser(UserEventsRequest)({ type: "userEvents", ...params });
  return config.transport.subscribe<UserEventsEvent>("user", payload, (e) => {
    listener(e.detail);
  });
}
