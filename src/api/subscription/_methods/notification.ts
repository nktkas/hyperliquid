import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/** Subscription to notification events for a specific user. */
export const NotificationRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("notification"),
    /** User address. */
    user: Address,
  });
})();
export type NotificationRequest = v.InferOutput<typeof NotificationRequest>;

/** Event of user notification. */
export const NotificationEvent = /* @__PURE__ */ (() => {
  return v.object({
    /** Notification content. */
    notification: v.string(),
  });
})();
export type NotificationEvent = v.InferOutput<typeof NotificationEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode notification} function. */
export type NotificationParameters = Omit<v.InferInput<typeof NotificationRequest>, "type">;

/**
 * Subscribe to notification updates for a specific user.
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
 * import { notification } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await notification(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function notification(
  config: SubscriptionConfig,
  params: NotificationParameters,
  listener: (data: NotificationEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(NotificationRequest, { type: "notification", ...params });
  return config.transport.subscribe<NotificationEvent>(payload.type, payload, (e) => {
    listener(e.detail);
  });
}
