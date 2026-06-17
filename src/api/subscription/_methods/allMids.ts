import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import type { AllMidsResponse } from "../../info/_methods/allMids.ts";

/**
 * Subscription to mid price events for all coins.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const AllMidsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("allMids"),
    /** DEX name (empty string for main dex). */
    dex: v.optional(v.string()),
  });
})();
export type AllMidsRequest = v.InferOutput<typeof AllMidsRequest>;

/**
 * Event of mid prices for all assets.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export type AllMidsEvent = {
  /** Mapping of coin symbols to mid prices. */
  mids: AllMidsResponse;
  /** DEX name (empty string for main dex). */
  dex?: string;
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ISubscription } from "../../../transport/mod.ts";
import type { SubscriptionConfig, SubscriptionOptions } from "./_base/mod.ts";

/** Request parameters for the {@linkcode allMids} function. */
export type AllMidsParameters = Omit<v.InferInput<typeof AllMidsRequest>, "type">;

/**
 * Subscribe to mid prices for all actively traded assets.
 *
 * @param config General configuration for Subscription API subscriptions.
 * @param params Parameters specific to the API subscription.
 * @param listener A callback function to be called when the event is received.
 * @param options Options to control the subscription lifecycle.
 * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { allMids } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await allMids(
 *   { transport },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function allMids(
  config: SubscriptionConfig,
  listener: (data: AllMidsEvent) => void,
  options?: SubscriptionOptions,
): Promise<ISubscription>;
export function allMids(
  config: SubscriptionConfig,
  params: AllMidsParameters,
  listener: (data: AllMidsEvent) => void,
  options?: SubscriptionOptions,
): Promise<ISubscription>;
export function allMids(
  config: SubscriptionConfig,
  paramsOrListener: AllMidsParameters | ((data: AllMidsEvent) => void),
  listenerOrOptions?: ((data: AllMidsEvent) => void) | SubscriptionOptions,
  maybeOptions?: SubscriptionOptions,
): Promise<ISubscription> {
  const isListenerFirst = typeof paramsOrListener === "function";
  const params = isListenerFirst ? {} : paramsOrListener;
  const listener = isListenerFirst ? paramsOrListener : listenerOrOptions as (data: AllMidsEvent) => void;
  const options = isListenerFirst ? listenerOrOptions as SubscriptionOptions | undefined : maybeOptions;

  const payload = parse(AllMidsRequest, {
    type: "allMids",
    ...params,
    dex: params.dex || undefined, // Same value as in response
  });
  return config.transport.subscribe<AllMidsEvent>(payload.type, payload, (e) => {
    if (e.detail.dex === payload.dex) {
      listener(e.detail);
    }
  }, options);
}
