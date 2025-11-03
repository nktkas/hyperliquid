import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_types.ts";
import type { Subscription } from "../../transport/base.ts";

import { BalanceSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/** Subscription to spot state events for a specific user. */
export const SpotStateRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("spotState"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to spot state events for a specific user."),
  );
})();
export type SpotStateRequest = v.InferOutput<typeof SpotStateRequest>;

/** Event of user spot state. */
export const SpotStateEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Spot state of the user. */
      spotState: v.pipe(
        v.object({
          /** Balance for each token. */
          balances: v.pipe(
            v.array(BalanceSchema),
            v.description("Balance for each token."),
          ),
        }),
        v.description("Spot state of the user."),
      ),
    }),
    v.description("Event of user spot state."),
  );
})();
export type SpotStateEvent = v.InferOutput<typeof SpotStateEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode spotState} function. */
export type SpotStateParameters = Omit<v.InferInput<typeof SpotStateRequest>, "type">;

/**
 * Subscribe to spot state updates for a specific user.
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
 * import { spotState } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await spotState(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function spotState(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<SpotStateParameters>,
  listener: (data: SpotStateEvent) => void,
): Promise<Subscription> {
  const payload = parser(SpotStateRequest)({ type: "spotState", user: params.user });
  return config.transport.subscribe<SpotStateEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
