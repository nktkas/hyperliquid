import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { SpotClearinghouseStateResponse } from "../../info/_methods/spotClearinghouseState.ts";

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
      /** Whether to ignore portfolio margin calculations. */
      ignorePortfolioMargin: v.pipe(
        v.optional(v.boolean(), false),
        v.description("Whether to ignore portfolio margin calculations."),
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
      /** Account summary for spot trading. */
      spotState: v.pipe(
        SpotClearinghouseStateResponse,
        v.description("Account summary for spot trading."),
      ),
    }),
    v.description("Event of user spot state."),
  );
})();
export type SpotStateEvent = v.InferOutput<typeof SpotStateEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { WebSocketSubscription } from "../../../transport/websocket/mod.ts";

/** Request parameters for the {@linkcode spotState} function. */
export type SpotStateParameters = Omit<v.InferInput<typeof SpotStateRequest>, "type">;

/**
 * Subscribe to spot state updates for a specific user.
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
 * import { spotState } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await spotState(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function spotState(
  config: SubscriptionConfig,
  params: SpotStateParameters,
  listener: (data: SpotStateEvent) => void,
): Promise<WebSocketSubscription> {
  const payload = v.parse(SpotStateRequest, { type: "spotState", user: params.user });
  return config.transport.subscribe<SpotStateEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
