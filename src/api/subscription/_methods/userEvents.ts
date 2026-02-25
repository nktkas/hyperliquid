import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { TwapHistoryResponse } from "../../info/_methods/twapHistory.ts";
import type { UserFillsResponse } from "../../info/_methods/userFills.ts";
import type { UserTwapSliceFillsResponse } from "../../info/_methods/userTwapSliceFills.ts";

/**
 * Subscription to user events for a specific user.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const UserEventsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("userEvents"),
    /** User address. */
    user: Address,
  });
})();
export type UserEventsRequest = v.InferOutput<typeof UserEventsRequest>;

/**
 * Event of one of possible user events.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export type UserEventsEvent =
  | {
    /** Array of user trade fills. */
    fills: UserFillsResponse;
  }
  | {
    /** Funding update details. */
    funding: {
      /** Asset symbol. */
      coin: string;
      /**
       * Amount transferred in USDC.
       * @pattern ^-?[0-9]+(\.[0-9]+)?$
       */
      usdc: string;
      /**
       * Signed position size.
       * @pattern ^-?[0-9]+(\.[0-9]+)?$
       */
      szi: string;
      /**
       * Applied funding rate.
       * @pattern ^-?[0-9]+(\.[0-9]+)?$
       */
      fundingRate: string;
      /** Number of samples. */
      nSamples: number | null;
    };
  }
  | {
    /** Liquidation details. */
    liquidation: {
      /** Unique liquidation ID. */
      lid: number;
      /**
       * Address of the liquidator.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      liquidator: `0x${string}`;
      /**
       * Address of the liquidated user.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      liquidated_user: `0x${string}`;
      /**
       * Notional position size that was liquidated.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      liquidated_ntl_pos: string;
      /**
       * Account value at time of liquidation.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      liquidated_account_value: string;
    };
  }
  | {
    /** Array of non-user initiated order cancellations. */
    nonUserCancel: {
      /** Asset symbol (e.g., BTC). */
      coin: string;
      /** Order ID. */
      oid: number;
    }[];
  }
  | {
    /** Array of user's TWAP history. */
    twapHistory: TwapHistoryResponse;
  }
  | {
    /** Array of user's TWAP slice fills. */
    twapSliceFills: UserTwapSliceFillsResponse;
  };

// ============================================================
// Execution Logic
// ============================================================

import type { ISubscription } from "../../../transport/mod.ts";
import type { SubscriptionConfig } from "./_types.ts";

/** Request parameters for the {@linkcode userEvents} function. */
export type UserEventsParameters = Omit<v.InferInput<typeof UserEventsRequest>, "type">;

/**
 * Subscribe to non-order events for a specific user.
 *
 * @param config General configuration for Subscription API subscriptions.
 * @param params Parameters specific to the API subscription.
 * @param listener A callback function to be called when the event is received.
 * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
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
