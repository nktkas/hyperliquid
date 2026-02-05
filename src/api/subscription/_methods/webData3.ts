import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { LeadingVaultsResponse } from "../../info/_methods/leadingVaults.ts";
import { PerpsAtOpenInterestCapResponse } from "../../info/_methods/perpsAtOpenInterestCap.ts";

/** Subscription to comprehensive user and market data events. */
export const WebData3Request = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("webData3"),
    /** User address. */
    user: Address,
  });
})();
export type WebData3Request = v.InferOutput<typeof WebData3Request>;

/** Event of comprehensive user and market data. */
export const WebData3Event = /* @__PURE__ */ (() => {
  return v.object({
    /** User state information. */
    userState: v.object({
      /** Agent address if one exists. */
      agentAddress: v.nullable(Address),
      /** Timestamp until which the agent is valid. */
      agentValidUntil: v.nullable(UnsignedInteger),
      /** Cumulative ledger value. */
      cumLedger: UnsignedDecimal,
      /** Server timestamp (in ms since epoch). */
      serverTime: UnsignedInteger,
      /** Whether this account is a vault. */
      isVault: v.boolean(),
      /** User address. */
      user: Address,
      /** Whether the user has opted out of spot dusting. */
      optOutOfSpotDusting: v.optional(v.literal(true)),
      /** Whether DEX abstraction is enabled. */
      dexAbstractionEnabled: v.optional(v.boolean()),
      /** Abstraction mode for the user account. */
      abstraction: v.optional(v.picklist(["dexAbstraction", "unifiedAccount", "portfolioMargin", "disabled"])),
    }),
    /** Array of perpetual DEX states. */
    perpDexStates: v.array(
      v.object({
        /** Total equity in vaults. */
        totalVaultEquity: UnsignedDecimal,
        /** Assets currently at their open interest cap. */
        perpsAtOpenInterestCap: v.optional(PerpsAtOpenInterestCapResponse),
        /** Array of leading vaults. */
        leadingVaults: v.optional(LeadingVaultsResponse),
      }),
    ),
  });
})();
export type WebData3Event = v.InferOutput<typeof WebData3Event>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/** Request parameters for the {@linkcode webData3} function. */
export type WebData3Parameters = Omit<v.InferInput<typeof WebData3Request>, "type">;

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
 * import { webData3 } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport(); // only `WebSocketTransport`
 *
 * const sub = await webData3(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function webData3(
  config: SubscriptionConfig,
  params: WebData3Parameters,
  listener: (data: WebData3Event) => void,
): Promise<ISubscription> {
  const payload = v.parse(WebData3Request, { type: "webData3", ...params });
  return config.transport.subscribe<WebData3Event>(payload.type, payload, (e) => {
    if (e.detail.userState.user === payload.user) {
      listener(e.detail);
    }
  });
}
