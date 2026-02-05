import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { TwapStateSchema } from "../../info/_methods/_base/commonSchemas.ts";

/** Subscribe to TWAP states updates for a specific user. */
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

/** Event of user TWAP states. */
export const TwapStatesEvent = /* @__PURE__ */ (() => {
  return v.object({
    /** DEX name (empty string for main dex). */
    dex: v.string(),
    /** User address. */
    user: Address,
    /** Array of tuples of TWAP ID and TWAP state. */
    states: v.array(v.tuple([UnsignedInteger, TwapStateSchema])),
  });
})();
export type TwapStatesEvent = v.InferOutput<typeof TwapStatesEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode twapStates} function. */
export type TwapStatesParameters = Omit<v.InferInput<typeof TwapStatesRequest>, "type">;

/**
 * Subscribe to TWAP states updates for a specific user.
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
 * import { twapStates } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
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
): Promise<ISubscription> {
  const payload = v.parse(TwapStatesRequest, {
    type: "twapStates",
    ...params,
    dex: params.dex ?? "", // same value as in response
  });
  return config.transport.subscribe<TwapStatesEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user && e.detail.dex === payload.dex) {
      listener(e.detail);
    }
  });
}
