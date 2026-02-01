import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request clearinghouse state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
 */
export const ClearinghouseStateRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("clearinghouseState"),
    /** User address. */
    user: Address,
    /** DEX name (empty string for main dex). */
    dex: v.optional(v.string()),
  });
})();
export type ClearinghouseStateRequest = v.InferOutput<typeof ClearinghouseStateRequest>;

/**
 * Account summary for perpetual trading.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
 */
export const ClearinghouseStateResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Margin summary details. */
    marginSummary: v.object({
      /** Total account value. */
      accountValue: UnsignedDecimal,
      /** Total notional position value. */
      totalNtlPos: UnsignedDecimal,
      /** Total raw USD value. */
      totalRawUsd: Decimal,
      /** Total margin used. */
      totalMarginUsed: UnsignedDecimal,
    }),
    /** Cross-margin summary details. */
    crossMarginSummary: v.object({
      /** Total account value. */
      accountValue: UnsignedDecimal,
      /** Total notional position value. */
      totalNtlPos: UnsignedDecimal,
      /** Total raw USD value. */
      totalRawUsd: Decimal,
      /** Total margin used. */
      totalMarginUsed: UnsignedDecimal,
    }),
    /** Maintenance margin used for cross-margin positions. */
    crossMaintenanceMarginUsed: UnsignedDecimal,
    /** Amount available for withdrawal. */
    withdrawable: UnsignedDecimal,
    /** Array of asset positions. */
    assetPositions: v.array(
      v.object({
        /** Position type. */
        type: v.literal("oneWay"),
        /** Position details. */
        position: v.object({
          /** Asset symbol. */
          coin: v.string(),
          /** Signed position size. */
          szi: Decimal,
          /** Leverage details. */
          leverage: v.variant("type", [
            v.object({
              /** Leverage type. */
              type: v.literal("isolated"),
              /** Leverage value used. */
              value: v.pipe(UnsignedInteger, v.minValue(1)),
              /** Amount of USD used (1 = $1). */
              rawUsd: Decimal,
            }),
            v.object({
              /** Leverage type. */
              type: v.literal("cross"),
              /** Leverage value used. */
              value: v.pipe(UnsignedInteger, v.minValue(1)),
            }),
          ]),
          /** Average entry price. */
          entryPx: UnsignedDecimal,
          /** Position value. */
          positionValue: UnsignedDecimal,
          /** Unrealized profit and loss. */
          unrealizedPnl: Decimal,
          /** Return on equity. */
          returnOnEquity: Decimal,
          /** Liquidation price. */
          liquidationPx: v.nullable(UnsignedDecimal),
          /** Margin used. */
          marginUsed: UnsignedDecimal,
          /** Maximum allowed leverage. */
          maxLeverage: v.pipe(UnsignedInteger, v.minValue(1)),
          /** Cumulative funding details. */
          cumFunding: v.object({
            /** Total funding paid or received since account opening. */
            allTime: Decimal,
            /** Funding accumulated since the position was opened. */
            sinceOpen: Decimal,
            /** Funding accumulated since the last change in position size. */
            sinceChange: Decimal,
          }),
        }),
      }),
    ),
    /** Timestamp when data was retrieved (in ms since epoch). */
    time: UnsignedInteger,
  });
})();
export type ClearinghouseStateResponse = v.InferOutput<typeof ClearinghouseStateResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode clearinghouseState} function. */
export type ClearinghouseStateParameters = Omit<v.InferInput<typeof ClearinghouseStateRequest>, "type">;

/**
 * Request clearinghouse state.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Account summary for perpetual trading.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { clearinghouseState } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await clearinghouseState(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
 */
export function clearinghouseState(
  config: InfoConfig,
  params: ClearinghouseStateParameters,
  signal?: AbortSignal,
): Promise<ClearinghouseStateResponse> {
  const request = v.parse(ClearinghouseStateRequest, {
    type: "clearinghouseState",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
