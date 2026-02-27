import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { LeadingVaultsResponse } from "../../info/_methods/leadingVaults.ts";
import type { PerpsAtOpenInterestCapResponse } from "../../info/_methods/perpsAtOpenInterestCap.ts";

/**
 * Subscription to comprehensive user and market data events.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const WebData3Request = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("webData3"),
    /** User address. */
    user: Address,
  });
})();
export type WebData3Request = v.InferOutput<typeof WebData3Request>;

/**
 * Event of comprehensive user and market data.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export type WebData3Event = {
  /** User state information. */
  userState: {
    /**
     * Agent address if one exists.
     * @pattern ^0x[a-fA-F0-9]{40}$
     */
    agentAddress: `0x${string}` | null;
    /** Timestamp until which the agent is valid. */
    agentValidUntil: number | null;
    /**
     * Cumulative ledger value.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    cumLedger: string;
    /** Server timestamp (in ms since epoch). */
    serverTime: number;
    /** Whether this account is a vault. */
    isVault: boolean;
    /**
     * User address.
     * @pattern ^0x[a-fA-F0-9]{40}$
     */
    user: `0x${string}`;
    /** Whether the user has opted out of spot dusting. */
    optOutOfSpotDusting?: true;
    /** Whether DEX abstraction is enabled. */
    dexAbstractionEnabled?: boolean;
    /** Abstraction mode for the user account. */
    abstraction?: "dexAbstraction" | "unifiedAccount" | "portfolioMargin" | "disabled";
  };
  /** Array of perpetual DEX states. */
  perpDexStates: {
    /**
     * Total equity in vaults.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    totalVaultEquity: string;
    /** Assets currently at their open interest cap. */
    perpsAtOpenInterestCap?: PerpsAtOpenInterestCapResponse;
    /** Array of leading vaults. */
    leadingVaults?: LeadingVaultsResponse;
  }[];
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ISubscription } from "../../../transport/mod.ts";
import type { SubscriptionConfig } from "./_types.ts";

/** Request parameters for the {@linkcode webData3} function. */
export type WebData3Parameters = Omit<v.InferInput<typeof WebData3Request>, "type">;

/**
 * Subscribe to comprehensive user and market data updates.
 *
 * @param config General configuration for Subscription API subscriptions.
 * @param params Parameters specific to the API subscription.
 * @param listener A callback function to be called when the event is received.
 * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { webData3 } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
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
  const payload = parse(WebData3Request, { type: "webData3", ...params });
  return config.transport.subscribe<WebData3Event>(payload.type, payload, (e) => {
    if (e.detail.userState.user === payload.user) {
      listener(e.detail);
    }
  });
}
