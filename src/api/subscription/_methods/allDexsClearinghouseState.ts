import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { ClearinghouseStateResponse } from "../../info/_methods/clearinghouseState.ts";

/** Subscription to clearinghouse state events for all DEXs for a specific user. */
export const AllDexsClearinghouseStateRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("allDexsClearinghouseState"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to clearinghouse state events for all DEXs for a specific user."),
  );
})();
export type AllDexsClearinghouseStateRequest = v.InferOutput<typeof AllDexsClearinghouseStateRequest>;

/** Event of clearinghouse states for all DEXs for a specific user. */
export const AllDexsClearinghouseStateEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Array of tuples of dex names and clearinghouse states. */
      clearinghouseStates: v.pipe(
        v.array(
          v.tuple([
            v.string(),
            ClearinghouseStateResponse,
          ]),
        ),
        v.description("Array of tuples of dex names and clearinghouse states."),
      ),
    }),
    v.description("Event of clearinghouse states for all DEXs for a specific user."),
  );
})();
export type AllDexsClearinghouseStateEvent = v.InferOutput<typeof AllDexsClearinghouseStateEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode allDexsClearinghouseState} function. */
export type AllDexsClearinghouseStateParameters = Omit<v.InferInput<typeof AllDexsClearinghouseStateRequest>, "type">;

/**
 * Subscribe to clearinghouse states for all DEXs for a specific user.
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
 * import { allDexsClearinghouseState } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await allDexsClearinghouseState(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function allDexsClearinghouseState(
  config: SubscriptionConfig,
  params: AllDexsClearinghouseStateParameters,
  listener: (data: AllDexsClearinghouseStateEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(AllDexsClearinghouseStateRequest, {
    type: "allDexsClearinghouseState",
    ...params,
  });
  return config.transport.subscribe<AllDexsClearinghouseStateEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
