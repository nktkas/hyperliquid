import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { UserTwapSliceFillsResponse } from "../../info/_methods/userTwapSliceFills.ts";
import { UserFillsResponse } from "../../info/_methods/userFills.ts";
import { TwapHistoryResponse } from "../../info/_methods/twapHistory.ts";

/** Subscription to user events for a specific user. */
export const UserEventsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("userEvents"),
    /** User address. */
    user: Address,
  });
})();
export type UserEventsRequest = v.InferOutput<typeof UserEventsRequest>;

/** Event of one of possible user events. */
export const UserEventsEvent = /* @__PURE__ */ (() => {
  return v.union([
    /** Event of array of user trade fills. */
    v.object({
      /** Array of user trade fills. */
      fills: UserFillsResponse,
    }),
    /** Event of user funding update. */
    v.object({
      /** Funding update details. */
      funding: v.object({
        /** Asset symbol. */
        coin: v.string(),
        /** Amount transferred in USDC. */
        usdc: Decimal,
        /** Signed position size. */
        szi: Decimal,
        /** Applied funding rate. */
        fundingRate: Decimal,
        /** Number of samples. */
        nSamples: v.nullable(UnsignedInteger),
      }),
    }),
    /** Event of user liquidation. */
    v.object({
      /** Liquidation details. */
      liquidation: v.object({
        /** Unique liquidation ID. */
        lid: UnsignedInteger,
        /** Address of the liquidator. */
        liquidator: Address,
        /** Address of the liquidated user. */
        liquidated_user: Address,
        /** Notional position size that was liquidated. */
        liquidated_ntl_pos: UnsignedDecimal,
        /** Account value at time of liquidation. */
        liquidated_account_value: UnsignedDecimal,
      }),
    }),
    /** Event of array of non-user initiated order cancellations. */
    v.object({
      /** Array of non-user initiated order cancellations. */
      nonUserCancel: v.array(
        /** Cancelled order not initiated by the user. */
        v.object({
          /** Asset symbol (e.g., BTC). */
          coin: v.string(),
          /** Order ID. */
          oid: UnsignedInteger,
        }),
      ),
    }),
    /** Event of a TWAP history entry. */
    v.object({
      /** Array of user's TWAP history. */
      twapHistory: TwapHistoryResponse,
    }),
    /** Event of TWAP slice fills. */
    v.object({
      /** Array of user's twap slice fills. */
      twapSliceFills: UserTwapSliceFillsResponse,
    }),
  ]);
})();
export type UserEventsEvent = v.InferOutput<typeof UserEventsEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode userEvents} function. */
export type UserEventsParameters = Omit<v.InferInput<typeof UserEventsRequest>, "type">;

/**
 * Subscribe to non-order events for a specific user.
 *
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 *
 * @returns A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { userEvents } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await userEvents(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function userEvents(
  config: SubscriptionConfig,
  params: UserEventsParameters,
  listener: (data: UserEventsEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(UserEventsRequest, { type: "userEvents", ...params });
  return config.transport.subscribe<UserEventsEvent>("user", payload, (e) => {
    listener(e.detail);
  });
}
