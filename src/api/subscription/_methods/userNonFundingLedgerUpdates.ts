import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { UserNonFundingLedgerUpdatesResponse } from "../../info/_methods/userNonFundingLedgerUpdates.ts";

/** Subscription to user non-funding ledger updates for a specific user. */
export const UserNonFundingLedgerUpdatesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("userNonFundingLedgerUpdates"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to user non-funding ledger updates for a specific user."),
  );
})();
export type UserNonFundingLedgerUpdatesRequest = v.InferOutput<typeof UserNonFundingLedgerUpdatesRequest>;

/** Event of user non-funding ledger updates. */
export const UserNonFundingLedgerUpdatesEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Array of user's non-funding ledger update. */
      nonFundingLedgerUpdates: UserNonFundingLedgerUpdatesResponse,
      /** Whether this is an initial snapshot. */
      isSnapshot: v.pipe(
        v.optional(v.literal(true)),
        v.description("Whether this is an initial snapshot."),
      ),
    }),
    v.description("Event of user non-funding ledger updates."),
  );
})();
export type UserNonFundingLedgerUpdatesEvent = v.InferOutput<typeof UserNonFundingLedgerUpdatesEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { WebSocketSubscription } from "../../../transport/websocket/mod.ts";

/** Request parameters for the {@linkcode userNonFundingLedgerUpdates} function. */
export type UserNonFundingLedgerUpdatesParameters = Omit<
  v.InferInput<typeof UserNonFundingLedgerUpdatesRequest>,
  "type"
>;

/**
 * Subscribe to non-funding ledger updates for a specific user.
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
 * import { userNonFundingLedgerUpdates } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await userNonFundingLedgerUpdates(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function userNonFundingLedgerUpdates(
  config: SubscriptionConfig,
  params: UserNonFundingLedgerUpdatesParameters,
  listener: (data: UserNonFundingLedgerUpdatesEvent) => void,
): Promise<WebSocketSubscription> {
  const payload = v.parse(UserNonFundingLedgerUpdatesRequest, { type: "userNonFundingLedgerUpdates", ...params });
  return config.transport.subscribe<UserNonFundingLedgerUpdatesEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
