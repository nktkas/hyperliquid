import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/** Subscription to user TWAP slice fill events for a specific user. */
export const UserTwapSliceFillsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("userTwapSliceFills"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to user TWAP slice fill events for a specific user."),
  );
})();
export type UserTwapSliceFillsRequest = v.InferOutput<typeof UserTwapSliceFillsRequest>;

/** Event of user TWAP slice fill. */
export const UserTwapSliceFillsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Array of TWAP slice fills. */
      twapSliceFills: v.pipe(
        v.array(
          v.object({
            /** Fill details for the TWAP slice. */
            fill: v.pipe(
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
            /** ID of the TWAP. */
            twapId: v.pipe(
              UnsignedInteger,
              v.description("ID of the TWAP."),
            ),
          }),
        ),
        v.description("Array of TWAP slice fills."),
      ),
      /** Whether this is an initial snapshot. */
      isSnapshot: v.pipe(
        v.optional(v.literal(true)),
        v.description("Whether this is an initial snapshot."),
      ),
    }),
    v.description("Event of user TWAP slice fill."),
  );
})();
export type UserTwapSliceFillsEvent = v.InferOutput<typeof UserTwapSliceFillsEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userTwapSliceFills} function. */
export type UserTwapSliceFillsParameters = Omit<v.InferInput<typeof UserTwapSliceFillsRequest>, "type">;

/**
 * Subscribe to TWAP execution updates for a specific user.
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
 * import { userTwapSliceFills } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await userTwapSliceFills(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function userTwapSliceFills(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<UserTwapSliceFillsParameters>,
  listener: (data: UserTwapSliceFillsEvent) => void,
): Promise<Subscription> {
  const payload = parser(UserTwapSliceFillsRequest)({ type: "userTwapSliceFills", ...params });
  return config.transport.subscribe<UserTwapSliceFillsEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user.toLowerCase()) {
      listener(e.detail);
    }
  });
}
