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
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("clearinghouseState"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.optional(v.string()),
        v.description("DEX name (empty string for main dex)."),
      ),
    }),
    v.description("Request clearinghouse state."),
  );
})();
export type ClearinghouseStateRequest = v.InferOutput<typeof ClearinghouseStateRequest>;

/**
 * Account summary for perpetual trading.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
 */
export const ClearinghouseStateResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Margin summary details. */
      marginSummary: v.pipe(
        v.object({
          /** Total account value. */
          accountValue: v.pipe(
            UnsignedDecimal,
            v.description("Total account value."),
          ),
          /** Total notional position value. */
          totalNtlPos: v.pipe(
            UnsignedDecimal,
            v.description("Total notional position value."),
          ),
          /** Total raw USD value. */
          totalRawUsd: v.pipe(
            UnsignedDecimal,
            v.description("Total raw USD value."),
          ),
          /** Total margin used. */
          totalMarginUsed: v.pipe(
            UnsignedDecimal,
            v.description("Total margin used."),
          ),
        }),
        v.description("Margin summary details."),
      ),
      /** Cross-margin summary details. */
      crossMarginSummary: v.pipe(
        v.object({
          /** Total account value. */
          accountValue: v.pipe(
            UnsignedDecimal,
            v.description("Total account value."),
          ),
          /** Total notional position value. */
          totalNtlPos: v.pipe(
            UnsignedDecimal,
            v.description("Total notional position value."),
          ),
          /** Total raw USD value. */
          totalRawUsd: v.pipe(
            UnsignedDecimal,
            v.description("Total raw USD value."),
          ),
          /** Total margin used. */
          totalMarginUsed: v.pipe(
            UnsignedDecimal,
            v.description("Total margin used."),
          ),
        }),
        v.description("Cross-margin summary details."),
      ),
      /** Maintenance margin used for cross-margin positions. */
      crossMaintenanceMarginUsed: v.pipe(
        UnsignedDecimal,
        v.description("Maintenance margin used for cross-margin positions."),
      ),
      /** Amount available for withdrawal. */
      withdrawable: v.pipe(
        UnsignedDecimal,
        v.description("Amount available for withdrawal."),
      ),
      /** Array of asset positions. */
      assetPositions: v.pipe(
        v.array(
          v.object({
            /** Position type. */
            type: v.pipe(
              v.literal("oneWay"),
              v.description("Position type."),
            ),
            /** Position details. */
            position: v.pipe(
              v.object({
                /** Asset symbol. */
                coin: v.pipe(
                  v.string(),
                  v.description("Asset symbol."),
                ),
                /** Signed position size. */
                szi: v.pipe(
                  Decimal,
                  v.description("Signed position size."),
                ),
                /** Leverage details. */
                leverage: v.pipe(
                  v.variant("type", [
                    v.object({
                      /** Leverage type. */
                      type: v.pipe(
                        v.literal("isolated"),
                        v.description("Leverage type."),
                      ),
                      /** Leverage value used. */
                      value: v.pipe(
                        UnsignedInteger,
                        v.minValue(1),
                        v.description("Leverage value used."),
                      ),
                      /** Amount of USD used (1 = $1). */
                      rawUsd: v.pipe(
                        UnsignedDecimal,
                        v.description("Amount of USD used (1 = $1)."),
                      ),
                    }),
                    v.object({
                      /** Leverage type. */
                      type: v.pipe(
                        v.literal("cross"),
                        v.description("Leverage type."),
                      ),
                      /** Leverage value used. */
                      value: v.pipe(
                        UnsignedInteger,
                        v.minValue(1),
                        v.description("Leverage value used."),
                      ),
                    }),
                  ]),
                  v.description("Leverage details."),
                ),
                /** Average entry price. */
                entryPx: v.pipe(
                  UnsignedDecimal,
                  v.description("Average entry price."),
                ),
                /** Position value. */
                positionValue: v.pipe(
                  UnsignedDecimal,
                  v.description("Position value."),
                ),
                /** Unrealized profit and loss. */
                unrealizedPnl: v.pipe(
                  Decimal,
                  v.description("Unrealized profit and loss."),
                ),
                /** Return on equity. */
                returnOnEquity: v.pipe(
                  Decimal,
                  v.description("Return on equity."),
                ),
                /** Liquidation price. */
                liquidationPx: v.pipe(
                  v.nullable(UnsignedDecimal),
                  v.description("Liquidation price."),
                ),
                /** Margin used. */
                marginUsed: v.pipe(
                  UnsignedDecimal,
                  v.description("Margin used."),
                ),
                /** Maximum allowed leverage. */
                maxLeverage: v.pipe(
                  UnsignedInteger,
                  v.minValue(1),
                  v.description("Maximum allowed leverage."),
                ),
                /** Cumulative funding details. */
                cumFunding: v.pipe(
                  v.object({
                    /** Total funding paid or received since account opening. */
                    allTime: v.pipe(
                      Decimal,
                      v.description("Total funding paid or received since account opening."),
                    ),
                    /** Funding accumulated since the position was opened. */
                    sinceOpen: v.pipe(
                      Decimal,
                      v.description("Funding accumulated since the position was opened."),
                    ),
                    /** Funding accumulated since the last change in position size. */
                    sinceChange: v.pipe(
                      Decimal,
                      v.description("Funding accumulated since the last change in position size."),
                    ),
                  }),
                  v.description("Cumulative funding details."),
                ),
              }),
              v.description("Position details."),
            ),
          }),
        ),
        v.description("Array of asset positions."),
      ),
      /** Timestamp when data was retrieved (in ms since epoch). */
      time: v.pipe(
        UnsignedInteger,
        v.description("Timestamp when data was retrieved (in ms since epoch)."),
      ),
    }),
    v.description("Account summary for perpetual trading."),
  );
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
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
