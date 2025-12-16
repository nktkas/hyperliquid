import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { WebData2Response } from "../../info/_methods/webData2.ts";

/** Subscription to comprehensive user and market data events. */
export const WebData2Request = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("webData2"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to comprehensive user and market data events."),
  );
})();
export type WebData2Request = v.InferOutput<typeof WebData2Request>;

/** Event of comprehensive user and market data. */
export const WebData2Event = /* @__PURE__ */ (() => {
  return v.pipe(
    WebData2Response,
    v.description("Event of comprehensive user and market data."),
  );
})();
export type WebData2Event = v.InferOutput<typeof WebData2Event>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/_base.ts";

/** Request parameters for the {@linkcode webData2} function. */
export type WebData2Parameters = Omit<v.InferInput<typeof WebData2Request>, "type">;

/**
 * Subscribe to comprehensive user and market data updates.
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
 * import { webData2 } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await webData2(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function webData2(
  config: SubscriptionConfig,
  params: WebData2Parameters,
  listener: (data: WebData2Event) => void,
): Promise<ISubscription> {
  const payload = v.parse(WebData2Request, { type: "webData2", ...params });
  return config.transport.subscribe<WebData2Event>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
