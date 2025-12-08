import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

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
        v.array(
          v.tuple([
            UnsignedInteger,
            v.pipe(
              v.object({
                /** Asset symbol. */
                coin: v.pipe(
                  v.string(),
                  v.description("Asset symbol."),
                ),
                /** Executed notional value. */
                executedNtl: v.pipe(
                  UnsignedDecimal,
                  v.description("Executed notional value."),
                ),
                /** Executed size. */
                executedSz: v.pipe(
                  UnsignedDecimal,
                  v.description("Executed size."),
                ),
                /** Duration in minutes. */
                minutes: v.pipe(
                  UnsignedInteger,
                  v.description("Duration in minutes."),
                ),
                /** Indicates if the TWAP randomizes execution. */
                randomize: v.pipe(
                  v.boolean(),
                  v.description("Indicates if the TWAP randomizes execution."),
                ),
                /** Indicates if the order is reduce-only. */
                reduceOnly: v.pipe(
                  v.boolean(),
                  v.description("Indicates if the order is reduce-only."),
                ),
                /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
                side: v.pipe(
                  v.picklist(["B", "A"]),
                  v.description('Order side ("B" = Bid/Buy, "A" = Ask/Sell).'),
                ),
                /** Order size. */
                sz: v.pipe(
                  UnsignedDecimal,
                  v.description("Order size."),
                ),
                /** Start time of the TWAP order (in ms since epoch). */
                timestamp: v.pipe(
                  UnsignedInteger,
                  v.description("Start time of the TWAP order (in ms since epoch)."),
                ),
                /** User address. */
                user: v.pipe(
                  Address,
                  v.description("User address."),
                ),
              }),
              v.description("State of the TWAP order."),
            ),
          ]),
        ),
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
import type { WebSocketSubscription } from "../../../transport/websocket/mod.ts";

/** Request parameters for the {@linkcode twapStates} function. */
export type TwapStatesParameters = Omit<v.InferInput<typeof TwapStatesRequest>, "type">;

/**
 * Subscribe to TWAP states updates for a specific user.
 *
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 *
 * @returns A request-promise that resolves with a {@link WebSocketSubscription} object to manage the subscription lifecycle.
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
): Promise<WebSocketSubscription> {
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
