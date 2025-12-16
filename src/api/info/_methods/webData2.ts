import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { PerpAssetCtxSchema, SpotAssetCtxSchema, TwapStateSchema } from "./_base/commonSchemas.ts";
import { ClearinghouseStateResponse } from "./clearinghouseState.ts";
import { MetaResponse } from "./meta.ts";
import { SpotClearinghouseStateResponse } from "./spotClearinghouseState.ts";
import { FrontendOpenOrdersResponse } from "./frontendOpenOrders.ts";
import { LeadingVaultsResponse } from "./leadingVaults.ts";
import { PerpsAtOpenInterestCapResponse } from "./perpsAtOpenInterestCap.ts";

/**
 * Request comprehensive user and market data.
 */
export const WebData2Request = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("webData2"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request comprehensive user and market data."),
  );
})();
export type WebData2Request = v.InferOutput<typeof WebData2Request>;

/**
 * Comprehensive user and market data.
 */
export const WebData2Response = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Account summary for perpetual trading. */
      clearinghouseState: v.pipe(
        ClearinghouseStateResponse,
        v.description("Account summary for perpetual trading."),
      ),
      /** Array of leading vaults for a user. */
      leadingVaults: v.pipe(
        LeadingVaultsResponse,
        v.description("Array of leading vaults for a user."),
      ),
      /** Total equity in vaults. */
      totalVaultEquity: v.pipe(
        UnsignedDecimal,
        v.description("Total equity in vaults."),
      ),
      /** Array of open orders with additional display information. */
      openOrders: v.pipe(
        FrontendOpenOrdersResponse,
        v.description("Array of open orders with additional display information."),
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
      meta: v.pipe(
        MetaResponse,
        v.description("Metadata for perpetual assets."),
      ),
      /** Array of contexts for each perpetual asset. */
      assetCtxs: v.pipe(
        v.array(PerpAssetCtxSchema),
        v.description("Array of contexts for each perpetual asset."),
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
      /** Array of tuples containing TWAP order ID and its state. */
      twapStates: v.pipe(
        v.array(v.tuple([UnsignedInteger, TwapStateSchema])),
        v.description("Array of tuples containing TWAP order ID and its state."),
      ),
      /** Account summary for spot trading. */
      spotState: v.pipe(
        v.optional(SpotClearinghouseStateResponse),
        v.description("Account summary for spot trading."),
      ),
      /** Asset context for each spot asset. */
      spotAssetCtxs: v.pipe(
        v.array(SpotAssetCtxSchema),
        v.description("Asset context for each spot asset."),
      ),
      /** Whether the user has opted out of spot dusting. */
      optOutOfSpotDusting: v.pipe(
        v.optional(v.literal(true)),
        v.description("Whether the user has opted out of spot dusting."),
      ),
      /** Assets currently at their open interest cap. */
      perpsAtOpenInterestCap: v.pipe(
        v.optional(PerpsAtOpenInterestCapResponse),
        v.description("Assets currently at their open interest cap."),
      ),
    }),
    v.description("Comprehensive user and market data."),
  );
})();
export type WebData2Response = v.InferOutput<typeof WebData2Response>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode webData2} function. */
export type WebData2Parameters = Omit<v.InferInput<typeof WebData2Request>, "type">;

/**
 * Request comprehensive user and market data.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Comprehensive user and market data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { webData2 } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await webData2(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function webData2(
  config: InfoConfig,
  params: WebData2Parameters,
  signal?: AbortSignal,
): Promise<WebData2Response> {
  const request = v.parse(WebData2Request, {
    type: "webData2",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
