import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_base.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/** Subscription to notification events for a specific user. */
export const NotificationRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("notification"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to notification events for a specific user."),
  );
})();
export type NotificationRequest = v.InferOutput<typeof NotificationRequest>;

/** Event of user notification. */
export const NotificationEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Notification content. */
      notification: v.pipe(
        v.string(),
        v.description("Notification content."),
      ),
    }),
    v.description("Event of user notification."),
  );
})();
export type NotificationEvent = v.InferOutput<typeof NotificationEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode notification} function. */
export type NotificationParameters = Omit<v.InferInput<typeof NotificationRequest>, "type">;

/**
 * Subscribe to notification updates for a specific user.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { notification } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await notification(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function notification(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<NotificationParameters>,
  listener: (data: NotificationEvent) => void,
): Promise<Subscription> {
  const payload = parser(NotificationRequest)({ type: "notification", ...params });
  return config.transport.subscribe<NotificationEvent>(payload.type, payload, (e) => {
    listener(e.detail);
  });
}
