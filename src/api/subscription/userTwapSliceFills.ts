import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_base.ts";
import type { Subscription } from "../../transport/base.ts";

import { TwapFillSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

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
      /** Array of TWAP slice fills. */
      twapSliceFills: v.pipe(
        v.array(
          v.object({
            /** Fill details for the TWAP slice. */
            fill: TwapFillSchema,
            /** ID of the TWAP. */
            twapId: v.pipe(
              UnsignedInteger,
              v.description("ID of the TWAP."),
            ),
          }),
        ),
        v.description("Array of TWAP slice fills."),
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

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userTwapSliceFills} function. */
export type UserTwapSliceFillsParameters = Omit<v.InferInput<typeof UserTwapSliceFillsRequest>, "type">;

/**
 * Subscribe to TWAP execution updates for a specific user.
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
 * import { userTwapSliceFills } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await userTwapSliceFills(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function userTwapSliceFills(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<UserTwapSliceFillsParameters>,
  listener: (data: UserTwapSliceFillsEvent) => void,
): Promise<Subscription> {
  const payload = parser(UserTwapSliceFillsRequest)({ type: "userTwapSliceFills", ...params });
  return config.transport.subscribe<UserTwapSliceFillsEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
