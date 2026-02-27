import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { PerpAssetCtxSchema, SpotAssetCtxSchema, TwapStateSchema } from "./_base/commonSchemas.ts";
import type { ClearinghouseStateResponse } from "./clearinghouseState.ts";
import type { FrontendOpenOrdersResponse } from "./frontendOpenOrders.ts";
import type { LeadingVaultsResponse } from "./leadingVaults.ts";
import type { MetaResponse } from "./meta.ts";
import type { PerpsAtOpenInterestCapResponse } from "./perpsAtOpenInterestCap.ts";
import type { SpotClearinghouseStateResponse } from "./spotClearinghouseState.ts";

/**
 * Request comprehensive user and market data.
 * @see null
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
 * @see null
 */
export type WebData2Response = {
  /** Account summary for perpetual trading. */
  clearinghouseState: ClearinghouseStateResponse;
  /** Array of leading vaults for a user. */
  leadingVaults: LeadingVaultsResponse;
  /**
   * Total equity in vaults.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  totalVaultEquity: string;
  /** Array of open orders with additional display information. */
  openOrders: FrontendOpenOrdersResponse;
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
  /** Metadata for perpetual assets. */
  meta: MetaResponse;
  /** Array of contexts for each perpetual asset. */
  assetCtxs: PerpAssetCtxSchema[];
  /** Server timestamp (in ms since epoch). */
  serverTime: number;
  /** Whether this account is a vault. */
  isVault: boolean;
  /**
   * User address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  user: `0x${string}`;
  /** Array of tuples containing TWAP order ID and its state. */
  twapStates: [id: number, state: TwapStateSchema][];
  /** Account summary for spot trading. */
  spotState?: SpotClearinghouseStateResponse;
  /** Asset context for each spot asset. */
  spotAssetCtxs: SpotAssetCtxSchema[];
  /** Whether the user has opted out of spot dusting. */
  optOutOfSpotDusting?: true;
  /** Assets currently at their open interest cap. */
  perpsAtOpenInterestCap?: PerpsAtOpenInterestCapResponse;
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode webData2} function. */
export type WebData2Parameters = Omit<v.InferInput<typeof WebData2Request>, "type">;

/**
 * Request comprehensive user and market data.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Comprehensive user and market data.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
 *
 * @see null
 */
export function webData2(
  config: InfoConfig,
  params: WebData2Parameters,
  signal?: AbortSignal,
): Promise<WebData2Response> {
  const request = parse(WebData2Request, {
    type: "webData2",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
