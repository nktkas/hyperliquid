import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { SubscriptionRequestConfig } from "./_base.ts";
import type { Subscription } from "../../transport/base.ts";

import { DetailedOrderSchema, TwapStateSchema } from "../_common_schemas.ts";
import { MetaAndAssetCtxsResponse } from "../info/metaAndAssetCtxs.ts";
import { ClearinghouseStateResponse } from "../info/clearinghouseState.ts";
import { SpotClearinghouseStateResponse } from "../info/spotClearinghouseState.ts";
import { SpotMetaAndAssetCtxsResponse } from "../info/spotMetaAndAssetCtxs.ts";

// -------------------- Schemas --------------------

/** Subscription to comprehensive user and market data events. */
export const WebData2Request = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("webData2"),
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
export type WebData2Request = v.InferOutput<typeof WebData2Request>;

/** Event of comprehensive user and market data. */
export const WebData2Event = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Account summary for perpetual trading. */
      clearinghouseState: ClearinghouseStateResponse,
      /** Array of leading vaults. */
      leadingVaults: v.pipe(
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
        v.description("Array of leading vaults."),
      ),
      /** Total equity in vaults. */
      totalVaultEquity: v.pipe(
        UnsignedDecimal,
        v.description("Total equity in vaults."),
      ),
      /** Array of user open orders with frontend information. */
      openOrders: v.pipe(
        v.array(DetailedOrderSchema),
        v.description("User open orders with frontend information."),
      ),
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
      /** Metadata for perpetual assets. */
      meta: MetaAndAssetCtxsResponse.items[0],
      /** Context for each perpetual asset. */
      assetCtxs: MetaAndAssetCtxsResponse.items[1],
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
      /** Array of TWAP states. */
      twapStates: v.pipe(
        v.array(
          /** TWAP ID and state. */
          v.pipe(
            v.tuple([
              UnsignedInteger,
              TwapStateSchema,
            ]),
            v.description("TWAP ID and state."),
          ),
        ),
        v.description("Array of TWAP states."),
      ),
      /** Account summary for spot trading. */
      spotState: SpotClearinghouseStateResponse,
      /** Context for each spot asset. */
      spotAssetCtxs: SpotMetaAndAssetCtxsResponse.items[1],
      /** Whether the user has opted out of spot dusting. */
      optOutOfSpotDusting: v.pipe(
        v.optional(v.literal(true)),
        v.description("Whether the user has opted out of spot dusting."),
      ),
      /** Assets currently at their open interest cap. */
      perpsAtOpenInterestCap: v.pipe(
        v.optional(v.array(v.string())),
        v.description("Assets currently at their open interest cap."),
      ),
    }),
    v.description("Comprehensive user and market data."),
  );
})();
export type WebData2Event = v.InferOutput<typeof WebData2Event>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode webData2} function. */
export type WebData2Parameters = Omit<v.InferInput<typeof WebData2Request>, "type">;

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
 * import { webData2 } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await webData2(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function webData2(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<WebData2Parameters>,
  listener: (data: WebData2Event) => void,
): Promise<Subscription> {
  const payload = parser(WebData2Request)({ type: "webData2", ...params });
  return config.transport.subscribe<WebData2Event>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user) {
      listener(e.detail);
    }
  });
}
