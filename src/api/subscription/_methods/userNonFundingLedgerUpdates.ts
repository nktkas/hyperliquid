import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { UserNonFundingLedgerUpdatesResponse } from "../../info/_methods/userNonFundingLedgerUpdates.ts";

/**
 * Subscription to user non-funding ledger updates for a specific user.
 */
export const UserNonFundingLedgerUpdatesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("userNonFundingLedgerUpdates"),
    /** User address. */
    user: Address,
  });
})();
export type UserNonFundingLedgerUpdatesRequest = v.InferOutput<typeof UserNonFundingLedgerUpdatesRequest>;

/**
 * Event of user non-funding ledger updates.
 */
export type UserNonFundingLedgerUpdatesEvent = {
  /**
   * User address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  user: `0x${string}`;
  /** Array of user's non-funding ledger update. */
  nonFundingLedgerUpdates: UserNonFundingLedgerUpdatesResponse;
  /** Whether this is an initial snapshot. */
  isSnapshot?: true;
};

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

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
 * @returns A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
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
): Promise<ISubscription> {
  const payload = v.parse(UserNonFundingLedgerUpdatesRequest, { type: "userNonFundingLedgerUpdates", ...params });
  return config.transport.subscribe<UserNonFundingLedgerUpdatesEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
