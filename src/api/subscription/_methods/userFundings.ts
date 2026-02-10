import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Subscription to user funding events for a specific user.
 */
export const UserFundingsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("userFundings"),
    /** User address. */
    user: Address,
  });
})();
export type UserFundingsRequest = v.InferOutput<typeof UserFundingsRequest>;

/**
 * Event of user fundings.
 */
export type UserFundingsEvent = {
  /**
   * User address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  user: `0x${string}`;
  /** Array of user funding ledger updates. */
  fundings: {
    /** Timestamp of the update (in ms since epoch). */
    time: number;
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
  }[];
  /** Whether this is an initial snapshot. */
  isSnapshot?: true | undefined;
};

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode userFundings} function. */
export type UserFundingsParameters = Omit<v.InferInput<typeof UserFundingsRequest>, "type">;

/**
 * Subscribe to funding payment updates for a specific user.
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
 * import { userFundings } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await userFundings(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function userFundings(
  config: SubscriptionConfig,
  params: UserFundingsParameters,
  listener: (data: UserFundingsEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(UserFundingsRequest, { type: "userFundings", ...params });
  return config.transport.subscribe<UserFundingsEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
