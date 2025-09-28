import * as v from "valibot"
import { type DeepImmutable, parser, UnsignedDecimal } from "../_common.ts"
import type { SubscriptionRequestConfig } from "./_common.ts"
import type { Subscription } from "../../transport/base.ts"

// -------------------- Schemas --------------------

/** Subscription to mid price events for all coins. */
export const AllMidsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(v.literal("allMids"), v.description("Type of subscription.")),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(v.optional(v.string()), v.description("DEX name (empty string for main dex).")),
    }),
    v.description("Subscription to mid price events for all coins.")
  )
})()
export type AllMidsRequest = v.InferOutput<typeof AllMidsRequest>

/** Event of mid prices for all assets. */
export const AllMidsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Mapping of coin symbols to mid prices. */
      mids: v.pipe(
        v.record(v.string(), UnsignedDecimal),
        v.description("Mapping of coin symbols to mid prices.")
      ),
    }),
    v.description("Event of mid prices for all assets.")
  )
})()
export type AllMidsEvent = v.InferOutput<typeof AllMidsEvent>

// -------------------- Function --------------------

/** Request parameters for the {@linkcode allMids} function. */
export type AllMidsParameters = Omit<v.InferInput<typeof AllMidsRequest>, "type">

/**
 * Subscribe to mid prices for all actively traded assets.
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
 * import { allMids } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await allMids(
 *   { transport },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function allMids(
  config: SubscriptionRequestConfig,
  listener: (data: AllMidsEvent) => void
): Promise<Subscription>
export function allMids(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<AllMidsParameters>,
  listener: (data: AllMidsEvent) => void
): Promise<Subscription>
export function allMids(
  config: SubscriptionRequestConfig,
  paramsOrListener: DeepImmutable<AllMidsParameters> | ((data: AllMidsEvent) => void),
  maybeListener?: (data: AllMidsEvent) => void
): Promise<Subscription> {
  const params = typeof paramsOrListener === "function" ? {} : paramsOrListener
  const listener = typeof paramsOrListener === "function" ? paramsOrListener : maybeListener!

  const payload = parser(AllMidsRequest)({ type: "allMids", ...params })
  return config.transport.subscribe<AllMidsEvent>(payload.type, payload, (e) => {
    /** if dex is specified, only send events if the pairs have matching dex name */
    if (params.dex) {
      const pairs = Object.keys(e.detail.mids)
      if (pairs.length === 0) return
      const defaultPair = pairs[0]
      // mids is not for the requested dex
      if (!defaultPair.toLowerCase().startsWith(params.dex.toLowerCase())) return
    }
    listener(e.detail)
  })
}
