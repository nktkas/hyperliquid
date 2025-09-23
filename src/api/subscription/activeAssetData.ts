import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/** Subscription to active asset data events for a specific user and coin. */
export const ActiveAssetDataRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("activeAssetData"),
        v.description("Type of subscription."),
      ),
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to active asset data events for a specific user and coin."),
  );
})();
export type ActiveAssetDataRequest = v.InferOutput<typeof ActiveAssetDataRequest>;

/** Event of user active asset data. */
export const ActiveAssetDataEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Asset symbol (e.g., BTC). */
      coin: v.pipe(
        v.string(),
        v.description("Asset symbol (e.g., BTC)."),
      ),
      /** Leverage configuration. */
      leverage: v.pipe(
        v.union([
          v.object({
            /** Leverage type. */
            type: v.pipe(
              v.literal("isolated"),
              v.description("Leverage type."),
            ),
            /** Leverage value used. */
            value: v.pipe(
              UnsignedInteger,
              v.minValue(1),
              v.description("Leverage value used."),
            ),
            /** Amount of USD used (1 = 1$). */
            rawUsd: v.pipe(
              UnsignedDecimal,
              v.description("Amount of USD used (1 = 1$)."),
            ),
          }),
          v.object({
            /** Leverage type. */
            type: v.pipe(
              v.literal("cross"),
              v.description("Leverage type."),
            ),
            /** Leverage value used. */
            value: v.pipe(
              UnsignedInteger,
              v.minValue(1),
              v.description("Leverage value used."),
            ),
          }),
        ]),
        v.description("Leverage configuration."),
      ),
      /** Maximum trade size range [min, max]. */
      maxTradeSzs: v.pipe(
        v.tuple([UnsignedDecimal, UnsignedDecimal]),
        v.description("Maximum trade size range [min, max]."),
      ),
      /** Available to trade range [min, max]. */
      availableToTrade: v.pipe(
        v.tuple([UnsignedDecimal, UnsignedDecimal]),
        v.description("Available to trade range [min, max]."),
      ),
      /** Mark price. */
      markPx: v.pipe(
        UnsignedDecimal,
        v.description("Mark price."),
      ),
    }),
    v.description("Event of user active asset data."),
  );
})();
export type ActiveAssetDataEvent = v.InferOutput<typeof ActiveAssetDataEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode activeAssetData} function. */
export type ActiveAssetDataParameters = Omit<v.InferInput<typeof ActiveAssetDataRequest>, "type">;

/**
 * Subscribe to trading data updates for a specific asset and user.
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
 * import { activeAssetData } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await activeAssetData(
 *   { transport },
 *   { coin: "ETH", user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function activeAssetData(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<ActiveAssetDataParameters>,
  listener: (data: ActiveAssetDataEvent) => void,
): Promise<Subscription> {
  const payload = parser(ActiveAssetDataRequest)({ type: "activeAssetData", ...params });
  return config.transport.subscribe<ActiveAssetDataEvent>(payload.type, payload, (e) => {
    if (e.detail.coin === payload.coin && e.detail.user === payload.user.toLowerCase()) {
      listener(e.detail);
    }
  });
}
