import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
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
      clearinghouseState: ClearinghouseStateResponse,
      /** Array of leading vaults for a user. */
      leadingVaults: LeadingVaultsResponse,
      /** Total equity in vaults. */
      totalVaultEquity: v.pipe(
        UnsignedDecimal,
        v.description("Total equity in vaults."),
      ),
      /** Array of open orders with additional display information. */
      openOrders: FrontendOpenOrdersResponse,
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
      meta: MetaResponse,
      /** Array of contexts for each perpetual asset. */
      assetCtxs: v.pipe(
        v.array(
          /** Context for a specific perpetual asset. */
          v.pipe(
            v.object({
              /** Previous day's closing price. */
              prevDayPx: v.pipe(
                UnsignedDecimal,
                v.description("Previous day's closing price."),
              ),
              /** Daily notional volume. */
              dayNtlVlm: v.pipe(
                UnsignedDecimal,
                v.description("Daily notional volume."),
              ),
              /** Mark price. */
              markPx: v.pipe(
                UnsignedDecimal,
                v.description("Mark price."),
              ),
              /** Mid price. */
              midPx: v.pipe(
                v.nullable(UnsignedDecimal),
                v.description("Mid price."),
              ),
              /** Funding rate. */
              funding: v.pipe(
                Decimal,
                v.description("Funding rate."),
              ),
              /** Total open interest. */
              openInterest: v.pipe(
                UnsignedDecimal,
                v.description("Total open interest."),
              ),
              /** Premium price. */
              premium: v.pipe(
                v.nullable(Decimal),
                v.description("Premium price."),
              ),
              /** Oracle price. */
              oraclePx: v.pipe(
                UnsignedDecimal,
                v.description("Oracle price."),
              ),
              /** Array of impact prices. */
              impactPxs: v.pipe(
                v.nullable(v.array(v.string())),
                v.description("Array of impact prices."),
              ),
              /** Daily volume in base currency. */
              dayBaseVlm: v.pipe(
                UnsignedDecimal,
                v.description("Daily volume in base currency."),
              ),
            }),
            v.description("Context for a specific perpetual asset."),
          ),
        ),
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
      /** Array of TWAP states. */
      twapStates: v.pipe(
        v.array(
          /** TWAP ID and state. */
          v.pipe(
            v.tuple([
              UnsignedInteger,
              v.pipe(
                v.object({
                  /** Asset symbol. */
                  coin: v.pipe(
                    v.string(),
                    v.description("Asset symbol."),
                  ),
                  /** Executed notional value. */
                  executedNtl: v.pipe(
                    UnsignedDecimal,
                    v.description("Executed notional value."),
                  ),
                  /** Executed size. */
                  executedSz: v.pipe(
                    UnsignedDecimal,
                    v.description("Executed size."),
                  ),
                  /** Duration in minutes. */
                  minutes: v.pipe(
                    UnsignedInteger,
                    v.description("Duration in minutes."),
                  ),
                  /** Indicates if the TWAP randomizes execution. */
                  randomize: v.pipe(
                    v.boolean(),
                    v.description("Indicates if the TWAP randomizes execution."),
                  ),
                  /** Indicates if the order is reduce-only. */
                  reduceOnly: v.pipe(
                    v.boolean(),
                    v.description("Indicates if the order is reduce-only."),
                  ),
                  /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
                  side: v.pipe(
                    v.picklist(["B", "A"]),
                    v.description('Order side ("B" = Bid/Buy, "A" = Ask/Sell).'),
                  ),
                  /** Order size. */
                  sz: v.pipe(
                    UnsignedDecimal,
                    v.description("Order size."),
                  ),
                  /** Start time of the TWAP order (in ms since epoch). */
                  timestamp: v.pipe(
                    UnsignedInteger,
                    v.description("Start time of the TWAP order (in ms since epoch)."),
                  ),
                  /** User address. */
                  user: v.pipe(
                    Address,
                    v.description("User address."),
                  ),
                }),
                v.description("State of the TWAP order."),
              ),
            ]),
            v.description("TWAP ID and state."),
          ),
        ),
        v.description("Array of TWAP states."),
      ),
      /** Account summary for spot trading. */
      spotState: v.optional(SpotClearinghouseStateResponse),
      /** Asset context for each spot asset. */
      spotAssetCtxs: v.pipe(
        v.array(
          /** Context for a specific spot asset. */
          v.pipe(
            v.object({
              /** Previous day's closing price. */
              prevDayPx: v.pipe(
                UnsignedDecimal,
                v.description("Previous day's closing price."),
              ),
              /** Daily notional volume. */
              dayNtlVlm: v.pipe(
                UnsignedDecimal,
                v.description("Daily notional volume."),
              ),
              /** Mark price. */
              markPx: v.pipe(
                UnsignedDecimal,
                v.description("Mark price."),
              ),
              /** Mid price. */
              midPx: v.pipe(
                v.nullable(UnsignedDecimal),
                v.description("Mid price."),
              ),
              /** Circulating supply. */
              circulatingSupply: v.pipe(
                UnsignedDecimal,
                v.description("Circulating supply."),
              ),
              /** Asset symbol. */
              coin: v.pipe(
                v.string(),
                v.description("Asset symbol."),
              ),
              /** Total supply. */
              totalSupply: v.pipe(
                UnsignedDecimal,
                v.description("Total supply."),
              ),
              /** Daily volume in base currency. */
              dayBaseVlm: v.pipe(
                UnsignedDecimal,
                v.description("Daily volume in base currency."),
              ),
            }),
            v.description("Context for a specific spot asset."),
          ),
        ),
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

import type { InfoConfig } from "./_types.ts";

/** Request parameters for the {@linkcode webData2} function. */
export type WebData2Parameters = Omit<v.InferInput<typeof WebData2Request>, "type">;

/**
 * Request comprehensive user and market data.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
