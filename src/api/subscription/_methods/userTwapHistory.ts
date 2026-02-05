import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { TwapHistoryResponse } from "../../info/_methods/twapHistory.ts";

/** Subscription to user TWAP history events for a specific user. */
export const UserTwapHistoryRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("userTwapHistory"),
    /** User address. */
    user: Address,
  });
})();
export type UserTwapHistoryRequest = v.InferOutput<typeof UserTwapHistoryRequest>;

/** Event of user TWAP history. */
export const UserTwapHistoryEvent = /* @__PURE__ */ (() => {
  return v.object({
    /** User address. */
    user: Address,
    /** Array of user's TWAP history. */
    history: TwapHistoryResponse,
    /** Whether this is an initial snapshot. */
    isSnapshot: v.optional(v.literal(true)),
  });
})();
export type UserTwapHistoryEvent = v.InferOutput<typeof UserTwapHistoryEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode userTwapHistory} function. */
export type UserTwapHistoryParameters = Omit<v.InferInput<typeof UserTwapHistoryRequest>, "type">;

/**
 * Subscribe to TWAP order history updates for a specific user.
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
 * import { userTwapHistory } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await userTwapHistory(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function userTwapHistory(
  config: SubscriptionConfig,
  params: UserTwapHistoryParameters,
  listener: (data: UserTwapHistoryEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(UserTwapHistoryRequest, { type: "userTwapHistory", ...params });
  return config.transport.subscribe<UserTwapHistoryEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
