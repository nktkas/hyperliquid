import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, UnsignedInteger } from "../../_schemas.ts";

/** Subscription to user funding events for a specific user. */
export const UserFundingsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("userFundings"),
    /** User address. */
    user: Address,
  });
})();
export type UserFundingsRequest = v.InferOutput<typeof UserFundingsRequest>;

/** Event of user fundings. */
export const UserFundingsEvent = /* @__PURE__ */ (() => {
  return v.object({
    /** User address. */
    user: Address,
    /** Array of user funding ledger updates. */
    fundings: v.array(
      v.object({
        /** Timestamp of the update (in ms since epoch). */
        time: UnsignedInteger,
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
    ),
    /** Whether this is an initial snapshot. */
    isSnapshot: v.optional(v.literal(true)),
  });
})();
export type UserFundingsEvent = v.InferOutput<typeof UserFundingsEvent>;

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
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
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
