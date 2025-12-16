import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { UserFillsResponse } from "../../info/_methods/userFills.ts";

/** Subscription to user fill events for a specific user. */
export const UserFillsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("userFills"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
      aggregateByTime: v.pipe(
        v.optional(v.boolean()),
        v.description("If true, partial fills are aggregated when a crossing order fills multiple resting orders."),
      ),
    }),
    v.description("Subscription to user fill events for a specific user."),
  );
})();
export type UserFillsRequest = v.InferOutput<typeof UserFillsRequest>;

/** Event of user trade fill. */
export const UserFillsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Array of user trade fills. */
      fills: v.pipe(
        UserFillsResponse,
        v.description("Array of user trade fills."),
      ),
      /** Whether this is an initial snapshot. */
      isSnapshot: v.pipe(
        v.optional(v.literal(true)),
        v.description("Whether this is an initial snapshot."),
      ),
    }),
    v.description("Event of user trade fill."),
  );
})();
export type UserFillsEvent = v.InferOutput<typeof UserFillsEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/_base.ts";

/** Request parameters for the {@linkcode userFills} function. */
export type UserFillsParameters = Omit<v.InferInput<typeof UserFillsRequest>, "type">;

/**
 * Subscribe to trade fill updates for a specific user.
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
 * import { userFills } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await userFills(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function userFills(
  config: SubscriptionConfig,
  params: UserFillsParameters,
  listener: (data: UserFillsEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(UserFillsRequest, {
    type: "userFills",
    ...params,
    aggregateByTime: params.aggregateByTime ?? false,
  });
  return config.transport.subscribe<UserFillsEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
