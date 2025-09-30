import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/** Subscription to clearinghouse state events for a specific user. */
export const ClearinghouseStateRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("clearinghouseState"),
        v.description("Type of subscription."),
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
    v.description("Subscription to clearinghouse state events for a specific user."),
  );
})();
export type ClearinghouseStateRequest = v.InferOutput<typeof ClearinghouseStateRequest>;

/** Event of clearinghouse state for a specific user. */
export const ClearinghouseStateEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** DEX name (empty string for main dex). */
      dex: v.pipe(
        v.string(),
        v.description("DEX name (empty string for main dex)."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Account summary for perpetual trading. */
      clearinghouseState: v.pipe(
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
              /** Position for a specific asset. */
              v.pipe(
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
                        v.union([
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
                            /** Amount of USD used (1 = 1$). */
                            rawUsd: v.pipe(
                              UnsignedDecimal,
                              v.description("Amount of USD used (1 = 1$)."),
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
                        v.union([UnsignedDecimal, v.null()]),
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
                v.description("Position for a specific asset."),
              ),
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
      ),
    }),
    v.description("Event of clearinghouse state for a specific user."),
  );
})();
export type ClearinghouseStateEvent = v.InferOutput<typeof ClearinghouseStateEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode clearinghouseState} function. */
export type ClearinghouseStateParameters = Omit<v.InferInput<typeof ClearinghouseStateRequest>, "type">;

/**
 * Subscribe to clearinghouse state updates for a specific user.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { clearinghouseState } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await clearinghouseState(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function clearinghouseState(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<ClearinghouseStateParameters>,
  listener: (data: ClearinghouseStateEvent) => void,
): Promise<Subscription> {
  const payload = parser(ClearinghouseStateRequest)({
    type: "clearinghouseState",
    ...params,
    dex: params.dex ?? "", // same value as in response
  });
  return config.transport.subscribe<ClearinghouseStateEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user.toLowerCase() && e.detail.dex === payload.dex) {
      listener(e.detail);
    }
  });
}
