import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_types.ts";
import type { Subscription } from "../../transport/base.ts";

import { DetailedOrderSchema } from "../_common_schemas.ts";
import { MetaAndAssetCtxsResponse } from "../info/metaAndAssetCtxs.ts";
import { ClearinghouseStateResponse } from "../info/clearinghouseState.ts";

// -------------------- Schemas --------------------

/** Subscription to comprehensive user and market data events. */
export const WebData3Request = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("webData3"),
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
export type WebData3Request = v.InferOutput<typeof WebData3Request>;

/** Event of comprehensive user and market data. */
export const WebData3Event = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User state information. */
      userState: v.pipe(
        v.object({
          /** Agent address if one exists. */
          agentAddress: v.pipe(
            v.nullable(Address),
            v.description("Agent address if one exists."),
          ),
          /** Timestamp until which the agent is valid. */
          agentValidUntil: v.pipe(
            v.nullable(UnsignedInteger),
            v.description("Timestamp until which the agent is valid."),
          ),
          /** Cumulative ledger value. */
          cumLedger: v.pipe(
            UnsignedDecimal,
            v.description("Cumulative ledger value."),
          ),
          /** Server timestamp (in ms since epoch). */
          serverTime: v.pipe(
            UnsignedInteger,
            v.description("Server timestamp (in ms since epoch)."),
          ),
          /** Whether this account is a vault. */
          isVault: v.pipe(
            v.boolean(),
            v.description("Whether this account is a vault."),
          ),
          /** User address. */
          user: v.pipe(
            Address,
            v.description("User address."),
          ),
          /** Whether the user has opted out of spot dusting. */
          optOutOfSpotDusting: v.pipe(
            v.optional(v.literal(true)),
            v.description("Whether the user has opted out of spot dusting."),
          ),
          /** Whether DEX abstraction is enabled. */
          dexAbstractionEnabled: v.pipe(
            v.optional(v.boolean()),
            v.description("Whether DEX abstraction is enabled."),
          ),
        }),
        v.description("User state information."),
      ),
      /** Array of perpetual DEX states. */
      perpDexStates: v.pipe(
        v.array(
          v.object({
            /** Account summary for perpetual trading. */
            clearinghouseState: ClearinghouseStateResponse,
            /** Total equity in vaults. */
            totalVaultEquity: v.pipe(
              UnsignedDecimal,
              v.description("Total equity in vaults."),
            ),
            /** Array of user open orders with frontend information. */
            openOrders: v.pipe(
              v.optional(v.array(DetailedOrderSchema)),
              v.description("User open orders with frontend information."),
            ),
            /** Context for each perpetual asset. */
            assetCtxs: MetaAndAssetCtxsResponse.items[1],
            /** Assets currently at their open interest cap. */
            perpsAtOpenInterestCap: v.pipe(
              v.optional(v.array(v.string())),
              v.description("Assets currently at their open interest cap."),
            ),
            /** Array of leading vaults. */
            leadingVaults: v.pipe(
              v.optional(
                v.array(
                  /** Vault that a user is leading. */
                  v.pipe(
                    v.object({
                      /** Address of the vault. */
                      address: v.pipe(
                        Address,
                        v.description("Address of the vault."),
                      ),
                      /** Name of the vault. */
                      name: v.pipe(
                        v.string(),
                        v.description("Name of the vault."),
                      ),
                    }),
                    v.description("Vault that a user is leading."),
                  ),
                ),
              ),
              v.description("Array of leading vaults."),
            ),
          }),
        ),
        v.description("Array of perpetual DEX states."),
      ),
    }),
    v.description("Comprehensive user and market data."),
  );
})();
export type WebData3Event = v.InferOutput<typeof WebData3Event>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode webData3} function. */
export type WebData3Parameters = Omit<v.InferInput<typeof WebData3Request>, "type">;

/**
 * Subscribe to comprehensive user and market data updates.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
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
 */
export function webData3(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<WebData3Parameters>,
  listener: (data: WebData3Event) => void,
): Promise<Subscription> {
  const payload = parser(WebData3Request)({ type: "webData3", ...params });
  return config.transport.subscribe<WebData3Event>(payload.type, payload, (e) => {
    if (e.detail.userState.user === payload.user) {
      listener(e.detail);
    }
  });
}
