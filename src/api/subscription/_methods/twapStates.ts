import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { TwapStateSchema } from "../../info/_methods/_base/commonSchemas.ts";

/** Subscribe to TWAP states updates for a specific user. */
export const TwapStatesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("twapStates"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscribe to TWAP states updates for a specific user."),
  );
})();
export type TwapStatesRequest = v.InferOutput<typeof TwapStatesRequest>;

/** Event of user TWAP states. */
export const TwapStatesEvent = /* @__PURE__ */ (() => {
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
      /** Array of tuples of TWAP ID and TWAP state. */
      states: v.pipe(
        v.array(v.tuple([UnsignedInteger, TwapStateSchema])),
        v.description("Array of tuples of TWAP ID and TWAP state."),
      ),
    }),
    v.description("Event of user TWAP states."),
  );
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
 */
export function twapStates(
  config: SubscriptionConfig,
  params: TwapStatesParameters,
  listener: (data: TwapStatesEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(TwapStatesRequest, {
    type: "twapStates",
    ...params,
  });
  return config.transport.subscribe<TwapStatesEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
