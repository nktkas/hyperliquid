import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { UserTwapSliceFillsResponse } from "../../info/_methods/userTwapSliceFills.ts";

/**
 * Subscription to user TWAP slice fill events for a specific user.
 */
export const UserTwapSliceFillsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("userTwapSliceFills"),
    /** User address. */
    user: Address,
  });
})();
export type UserTwapSliceFillsRequest = v.InferOutput<typeof UserTwapSliceFillsRequest>;

/**
 * Event of user TWAP slice fill.
 */
export type UserTwapSliceFillsEvent = {
  /**
   * User address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  user: `0x${string}`;
  /** Array of user's twap slice fills. */
  twapSliceFills: UserTwapSliceFillsResponse;
  /** Whether this is an initial snapshot. */
  isSnapshot?: true;
};

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode userTwapSliceFills} function. */
export type UserTwapSliceFillsParameters = Omit<v.InferInput<typeof UserTwapSliceFillsRequest>, "type">;

/**
 * Subscribe to TWAP execution updates for a specific user.
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
 * import { userTwapSliceFills } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await userTwapSliceFills(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function userTwapSliceFills(
  config: SubscriptionConfig,
  params: UserTwapSliceFillsParameters,
  listener: (data: UserTwapSliceFillsEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(UserTwapSliceFillsRequest, { type: "userTwapSliceFills", ...params });
  return config.transport.subscribe<UserTwapSliceFillsEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
