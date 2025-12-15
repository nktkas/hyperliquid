import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { UserTwapSliceFillsResponse } from "../../info/_methods/userTwapSliceFills.ts";

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
      /** Array of user's twap slice fills. */
      twapSliceFills: v.pipe(
        UserTwapSliceFillsResponse,
        v.description("Array of user's twap slice fills."),
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

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { WebSocketSubscription } from "../../../transport/websocket/mod.ts";

/** Request parameters for the {@linkcode userTwapSliceFills} function. */
export type UserTwapSliceFillsParameters = Omit<v.InferInput<typeof UserTwapSliceFillsRequest>, "type">;

/**
 * Subscribe to TWAP execution updates for a specific user.
 *
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 *
 * @returns A request-promise that resolves with a {@link WebSocketSubscription} object to manage the subscription lifecycle.
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
): Promise<WebSocketSubscription> {
  const payload = v.parse(UserTwapSliceFillsRequest, { type: "userTwapSliceFills", ...params });
  return config.transport.subscribe<UserTwapSliceFillsEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
