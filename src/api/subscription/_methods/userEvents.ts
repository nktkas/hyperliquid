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

/** Event of one of possible user events. */
export const UserEventsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([
      /** Event of array of user trade fills. */
      v.object({
        /** Array of user trade fills. */
        fills: v.pipe(
          UserFillsResponse,
          v.description("Array of user trade fills."),
        ),
      }),
      /** Event of user funding update. */
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
      /** Event of user liquidation. */
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
      /** Event of array of non-user initiated order cancellations. */
      v.object({
        /** Array of non-user initiated order cancellations. */
        nonUserCancel: v.pipe(
          v.array(
            /** Cancelled order not initiated by the user. */
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
          ),
          v.description("Array of non-user initiated order cancellations."),
        ),
      }),
      /** Event of a TWAP history entry. */
      v.object({
        /** Array of user's TWAP history. */
        twapHistory: v.pipe(
          TwapHistoryResponse,
          v.description("Array of user's TWAP history."),
        ),
      }),
      /** Event of TWAP slice fills. */
      v.object({
        /** Array of user's twap slice fills. */
        twapSliceFills: v.pipe(
          UserTwapSliceFillsResponse,
          v.description("Array of user's twap slice fills."),
        ),
      }),
    ]),
    v.description("Event of one of possible user events."),
  );
})();
export type UserEventsEvent = v.InferOutput<typeof UserEventsEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/_base.ts";

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
