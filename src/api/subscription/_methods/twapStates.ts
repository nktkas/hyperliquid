import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { TwapState } from "../../info/_methods/_base/mod.ts";

/**
 * Subscription to TWAP states updates for a specific user.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const TwapStatesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("twapStates"),
    /** User address. */
    user: Address,
    /** DEX name (empty string for main dex). */
    dex: v.optional(v.string()),
  });
})();
export type TwapStatesRequest = v.InferOutput<typeof TwapStatesRequest>;

/**
 * Event of user TWAP states.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export type TwapStatesEvent = {
  /** DEX name (empty string for main dex). */
  dex: string;
  /**
   * User address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  user: `0x${string}`;
  /** Array of tuples of TWAP ID and TWAP state. */
  states: [twapId: number, state: TwapState][];
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ISubscription, WebSocketRequestError } from "../../../transport/mod.ts";
import type { SubscriptionConfig } from "./_base/mod.ts";

/** Request parameters for the {@linkcode twapStates} function. */
export type TwapStatesParameters = Omit<v.InferInput<typeof TwapStatesRequest>, "type">;

/**
 * Subscribe to TWAP states updates for a specific user.
 *
 * @param config General configuration for Subscription API subscriptions.
 * @param params Parameters specific to the API subscription.
 * @param listener A callback function to be called when the event is received.
 * @param onError An optional callback function to be called when the subscription fails.
 * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { twapStates } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await twapStates(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function twapStates(
  config: SubscriptionConfig,
  params: TwapStatesParameters,
  listener: (data: TwapStatesEvent) => void,
  onError?: (error: WebSocketRequestError) => void,
): Promise<ISubscription> {
  const payload = parse(TwapStatesRequest, {
    type: "twapStates",
    ...params,
    dex: params.dex ?? "", // Same value as in response
  });
  return config.transport.subscribe<TwapStatesEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user && e.detail.dex === payload.dex) {
      listener(e.detail);
    }
  }, onError);
}
