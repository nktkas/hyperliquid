import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_base.ts";
import type { Subscription } from "../../transport/base.ts";

import { FillSchema, TwapFillSchema, TwapStateSchema, TwapStatusSchema } from "../_common_schemas.ts";

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
        v.array(FillSchema),
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
            v.nullable(UnsignedInteger),
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
              state: TwapStateSchema,
              /** Current status of the TWAP order. */
              status: TwapStatusSchema,
              /** TWAP ID. */
              twapId: v.pipe(
                UnsignedInteger,
                v.description("TWAP ID."),
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
        v.array(TwapFillSchema),
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
