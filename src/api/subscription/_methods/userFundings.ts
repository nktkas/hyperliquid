import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, UnsignedInteger } from "../../_schemas.ts";

/** Subscription to user funding events for a specific user. */
export const UserFundingsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("userFundings"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to user funding events for a specific user."),
  );
})();
export type UserFundingsRequest = v.InferOutput<typeof UserFundingsRequest>;

/** Event of user fundings. */
export const UserFundingsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Array of user funding ledger updates. */
      fundings: v.pipe(
        v.array(
          v.object({
            /** Timestamp of the update (in ms since epoch). */
            time: v.pipe(
              UnsignedInteger,
              v.description("Timestamp of the update (in ms since epoch)."),
            ),
            /** Asset symbol. */
            coin: v.pipe(
              v.string(),
              v.description("Asset symbol."),
            ),
            /** Amount transferred in USDC. */
            usdc: v.pipe(
              Decimal,
              v.description("Amount transferred in USDC."),
            ),
            /** Signed position size. */
            szi: v.pipe(
              Decimal,
              v.description("Signed position size."),
            ),
            /** Applied funding rate. */
            fundingRate: v.pipe(
              Decimal,
              v.description("Applied funding rate."),
            ),
            /** Number of samples. */
            nSamples: v.pipe(
              v.nullable(UnsignedInteger),
              v.description("Number of samples."),
            ),
          }),
        ),
        v.description("Array of user funding ledger updates."),
      ),
      /** Whether this is an initial snapshot. */
      isSnapshot: v.pipe(
        v.optional(v.literal(true)),
        v.description("Whether this is an initial snapshot."),
      ),
    }),
    v.description("Event of user fundings."),
  );
})();
export type UserFundingsEvent = v.InferOutput<typeof UserFundingsEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/_base.ts";

/** Request parameters for the {@linkcode userFundings} function. */
export type UserFundingsParameters = Omit<v.InferInput<typeof UserFundingsRequest>, "type">;

/**
 * Subscribe to funding payment updates for a specific user.
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
 * import { userFundings } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await userFundings(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function userFundings(
  config: SubscriptionConfig,
  params: UserFundingsParameters,
  listener: (data: UserFundingsEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(UserFundingsRequest, { type: "userFundings", ...params });
  return config.transport.subscribe<UserFundingsEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
