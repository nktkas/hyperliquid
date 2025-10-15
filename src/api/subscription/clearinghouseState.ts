import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_base.ts";
import type { Subscription } from "../../transport/base.ts";

import { ClearinghouseStateResponse } from "../info/clearinghouseState.ts";

// -------------------- Schemas --------------------

/** Subscription to clearinghouse state events for a specific user. */
export const ClearinghouseStateRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("clearinghouseState"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.optional(v.string()),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Subscription to clearinghouse state events for a specific user."),
  );
})();
export type ClearinghouseStateRequest = v.InferOutput<typeof ClearinghouseStateRequest>;

/** Event of clearinghouse state for a specific user. */
export const ClearinghouseStateEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.string(),
        v.description("DEX name (empty string for main dex)."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Account summary for perpetual trading. */
      clearinghouseState: ClearinghouseStateResponse,
    }),
    v.description("Event of clearinghouse state for a specific user."),
  );
})();
export type ClearinghouseStateEvent = v.InferOutput<typeof ClearinghouseStateEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode clearinghouseState} function. */
export type ClearinghouseStateParameters = Omit<v.InferInput<typeof ClearinghouseStateRequest>, "type">;

/**
 * Subscribe to clearinghouse state updates for a specific user.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { clearinghouseState } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await clearinghouseState(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function clearinghouseState(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<ClearinghouseStateParameters>,
  listener: (data: ClearinghouseStateEvent) => void,
): Promise<Subscription> {
  const payload = parser(ClearinghouseStateRequest)({
    type: "clearinghouseState",
    ...params,
    dex: params.dex ?? "", // same value as in response
  });
  return config.transport.subscribe<ClearinghouseStateEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user && e.detail.dex === payload.dex) {
      listener(e.detail);
    }
  });
}
