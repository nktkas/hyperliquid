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
  return v.object({
    /** Type of request. */
    type: v.literal("webData2"),
    /** User address. */
    user: Address,
  });
})();
export type WebData2Request = v.InferOutput<typeof WebData2Request>;

/**
 * Comprehensive user and market data.
 */
export const WebData2Response = /* @__PURE__ */ (() => {
  return v.object({
    /** Account summary for perpetual trading. */
    clearinghouseState: ClearinghouseStateResponse,
    /** Array of leading vaults for a user. */
    leadingVaults: LeadingVaultsResponse,
    /** Total equity in vaults. */
    totalVaultEquity: UnsignedDecimal,
    /** Array of open orders with additional display information. */
    openOrders: FrontendOpenOrdersResponse,
    /** Agent address if one exists. */
    agentAddress: v.nullable(Address),
    /** Timestamp until which the agent is valid. */
    agentValidUntil: v.nullable(UnsignedInteger),
    /** Cumulative ledger value. */
    cumLedger: UnsignedDecimal,
    /** Metadata for perpetual assets. */
    meta: MetaResponse,
    /** Array of contexts for each perpetual asset. */
    assetCtxs: v.array(PerpAssetCtxSchema),
    /** Server timestamp (in ms since epoch). */
    serverTime: UnsignedInteger,
    /** Whether this account is a vault. */
    isVault: v.boolean(),
    /** User address. */
    user: Address,
    /** Array of tuples containing TWAP order ID and its state. */
    twapStates: v.array(v.tuple([UnsignedInteger, TwapStateSchema])),
    /** Account summary for spot trading. */
    spotState: v.optional(SpotClearinghouseStateResponse),
    /** Asset context for each spot asset. */
    spotAssetCtxs: v.array(SpotAssetCtxSchema),
    /** Whether the user has opted out of spot dusting. */
    optOutOfSpotDusting: v.optional(v.literal(true)),
    /** Assets currently at their open interest cap. */
    perpsAtOpenInterestCap: v.optional(PerpsAtOpenInterestCapResponse),
  });
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
