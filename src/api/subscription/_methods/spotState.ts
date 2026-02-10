import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { SpotClearinghouseStateResponse } from "../../info/_methods/spotClearinghouseState.ts";

/**
 * Subscription to spot state events for a specific user.
 */
export const SpotStateRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("spotState"),
    /** User address. */
    user: Address,
    /** Whether to ignore portfolio margin calculations. */
    ignorePortfolioMargin: v.optional(v.boolean(), false),
  });
})();
export type SpotStateRequest = v.InferOutput<typeof SpotStateRequest>;

/**
 * Event of user spot state.
 */
export type SpotStateEvent = {
  /**
   * User address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  user: `0x${string}`;
  /** Account summary for spot trading. */
  spotState: SpotClearinghouseStateResponse;
};

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode spotState} function. */
export type SpotStateParameters = Omit<v.InferInput<typeof SpotStateRequest>, "type">;

/**
 * Subscribe to spot state updates for a specific user.
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
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function spotState(
  config: SubscriptionConfig,
  params: SpotStateParameters,
  listener: (data: SpotStateEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(SpotStateRequest, { type: "spotState", user: params.user });
  return config.transport.subscribe<SpotStateEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
