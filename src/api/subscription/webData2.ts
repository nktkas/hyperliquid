import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

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
              /** Asset position. */
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
                v.description("Asset position."),
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
        v.array(
          /** User open order. */
          v.pipe(
            v.object({
              /** Asset symbol. */
              coin: v.pipe(
                v.string(),
                v.description("Asset symbol."),
              ),
              /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
              side: v.pipe(
                v.union([v.literal("B"), v.literal("A")]),
                v.description('Order side ("B" = Bid/Buy, "A" = Ask/Sell).'),
              ),
              /** Limit price. */
              limitPx: v.pipe(
                UnsignedDecimal,
                v.description("Limit price."),
              ),
              /** Size. */
              sz: v.pipe(
                UnsignedDecimal,
                v.description("Size."),
              ),
              /** Order ID. */
              oid: v.pipe(
                UnsignedInteger,
                v.description("Order ID."),
              ),
              /** Timestamp when the order was placed (in ms since epoch). */
              timestamp: v.pipe(
                UnsignedInteger,
                v.description("Timestamp when the order was placed (in ms since epoch)."),
              ),
              /** Original size at order placement. */
              origSz: v.pipe(
                UnsignedDecimal,
                v.description("Original size at order placement."),
              ),
              /** Condition for triggering the order. */
              triggerCondition: v.pipe(
                v.string(),
                v.description("Condition for triggering the order."),
              ),
              /** Indicates if the order is a trigger order. */
              isTrigger: v.pipe(
                v.boolean(),
                v.description("Indicates if the order is a trigger order."),
              ),
              /** Trigger price. */
              triggerPx: v.pipe(
                UnsignedDecimal,
                v.description("Trigger price."),
              ),
              /** Child orders associated with this order. */
              children: v.pipe(
                // deno-lint-ignore no-explicit-any
                v.lazy<any>(() => WebData2Event.entries.openOrders),
                v.description("Child orders associated with this order."),
              ),
              /** Indicates if the order is a position TP/SL order. */
              isPositionTpsl: v.pipe(
                v.boolean(),
                v.description("Indicates if the order is a position TP/SL order."),
              ),
              /** Indicates whether the order is reduce-only. */
              reduceOnly: v.pipe(
                v.boolean(),
                v.description("Indicates whether the order is reduce-only."),
              ),
              /**
               * Order type for market execution.
               * - `"Market"`: Executes immediately at the market price.
               * - `"Limit"`: Executes at the specified limit price or better.
               * - `"Stop Market"`: Activates as a market order when a stop price is reached.
               * - `"Stop Limit"`: Activates as a limit order when a stop price is reached.
               * - `"Take Profit Market"`: Executes as a market order when a take profit price is reached.
               * - `"Take Profit Limit"`: Executes as a limit order when a take profit price is reached.
               * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/order-types
               */
              orderType: v.pipe(
                v.union([
                  v.literal("Market"),
                  v.literal("Limit"),
                  v.literal("Stop Market"),
                  v.literal("Stop Limit"),
                  v.literal("Take Profit Market"),
                  v.literal("Take Profit Limit"),
                ]),
                v.description(
                  "Order type for market execution." +
                    '\n- `"Market"`: Executes immediately at the market price. ' +
                    '\n- `"Limit"`: Executes at the specified limit price or better. ' +
                    '\n- `"Stop Market"`: Activates as a market order when a stop price is reached. ' +
                    '\n- `"Stop Limit"`: Activates as a limit order when a stop price is reached. ' +
                    '\n- `"Take Profit Market"`: Executes as a market order when a take profit price is reached. ' +
                    '\n- `"Take Profit Limit"`: Executes as a limit order when a take profit price is reached. ',
                ),
              ),
              /**
               * Time-in-force options.
               * - `"Gtc"`: Remains active until filled or canceled.
               * - `"Ioc"`: Fills immediately or cancels any unfilled portion.
               * - `"Alo"`: Adds liquidity only.
               * - `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.
               * - `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.
               */
              tif: v.pipe(
                v.union([
                  v.union([
                    v.literal("Gtc"),
                    v.literal("Ioc"),
                    v.literal("Alo"),
                    v.literal("FrontendMarket"),
                    v.literal("LiquidationMarket"),
                  ]),
                  v.null(),
                ]),
                v.description(
                  "Time-in-force options." +
                    '\n- `"Gtc"`: Remains active until filled or canceled. ' +
                    '\n- `"Ioc"`: Fills immediately or cancels any unfilled portion. ' +
                    '\n- `"Alo"`: Adds liquidity only. ' +
                    '\n- `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI. ' +
                    '\n- `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.',
                ),
              ),
              /** Client Order ID. */
              cloid: v.pipe(
                v.union([v.pipe(Hex, v.length(34)), v.null()]),
                v.description("Client Order ID."),
              ),
            }),
            v.description("User open order."),
          ),
        ),
        v.description("User open orders with frontend information."),
      ),
      /** Agent address if one exists. */
      agentAddress: v.pipe(
        v.union([Address, v.null()]),
        v.description("Agent address if one exists."),
      ),
      /** Timestamp until which the agent is valid. */
      agentValidUntil: v.pipe(
        v.union([UnsignedInteger, v.null()]),
        v.description("Timestamp until which the agent is valid."),
      ),
      /** Cumulative ledger value. */
      cumLedger: v.pipe(
        UnsignedDecimal,
        v.description("Cumulative ledger value."),
      ),
      /** Metadata for perpetual assets. */
      meta: v.pipe(
        v.object({
          /** Trading universes available for perpetual trading. */
          universe: v.pipe(
            v.array(
              /** Trading universe. */
              v.pipe(
                v.object({
                  /** Minimum decimal places for order sizes. */
                  szDecimals: v.pipe(
                    UnsignedInteger,
                    v.description("Minimum decimal places for order sizes."),
                  ),
                  /** Name of the universe. */
                  name: v.pipe(
                    v.string(),
                    v.description("Name of the universe."),
                  ),
                  /** Maximum allowed leverage. */
                  maxLeverage: v.pipe(
                    UnsignedInteger,
                    v.minValue(1),
                    v.description("Maximum allowed leverage."),
                  ),
                  /** Unique identifier for the margin requirements table. */
                  marginTableId: v.pipe(
                    UnsignedInteger,
                    v.description("Unique identifier for the margin requirements table."),
                  ),
                  /** Indicates if only isolated margin trading is allowed. */
                  onlyIsolated: v.pipe(
                    v.optional(v.literal(true)),
                    v.description("Indicates if only isolated margin trading is allowed."),
                  ),
                  /** Indicates if the universe is delisted. */
                  isDelisted: v.pipe(
                    v.optional(v.literal(true)),
                    v.description("Indicates if the universe is delisted."),
                  ),
                }),
                v.description("Trading universe."),
              ),
            ),
            v.description("Trading universes available for perpetual trading."),
          ),
          /** Margin requirement tables for different leverage tiers. */
          marginTables: v.pipe(
            v.array(
              /** Margin requirement table. */
              v.pipe(
                v.tuple([
                  UnsignedInteger,
                  v.object({
                    /** Description of the margin table. */
                    description: v.pipe(
                      v.string(),
                      v.description("Description of the margin table."),
                    ),
                    /** Array of margin tiers defining leverage limits. */
                    marginTiers: v.pipe(
                      v.array(
                        /** Margin tier. */
                        v.pipe(
                          v.object({
                            /** Lower position size boundary for this tier. */
                            lowerBound: v.pipe(
                              UnsignedDecimal,
                              v.description("Lower position size boundary for this tier."),
                            ),
                            /** Maximum allowed leverage for this tier. */
                            maxLeverage: v.pipe(
                              UnsignedInteger,
                              v.minValue(1),
                              v.description("Maximum allowed leverage for this tier."),
                            ),
                          }),
                          v.description("Margin tier."),
                        ),
                      ),
                      v.description("Array of margin tiers defining leverage limits."),
                    ),
                  }),
                ]),
                v.description("Margin requirement table."),
              ),
            ),
            v.description("Margin requirement tables for different leverage tiers."),
          ),
        }),
        v.description("Metadata for perpetual assets."),
      ),
      /** Context for each perpetual asset. */
      assetCtxs: v.pipe(
        v.array(
          /** Perpetual asset context. */
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
            v.description("Perpetual asset context."),
          ),
        ),
        v.description("Context for each perpetual asset."),
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
          /** TWAP state. */
          v.pipe(
            v.tuple([
              UnsignedInteger,
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
                  v.union([v.literal("B"), v.literal("A")]),
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
            ]),
            v.description("TWAP state."),
          ),
        ),
        v.description("Array of TWAP states."),
      ),
      /** Account summary for spot trading. */
      spotState: v.pipe(
        v.optional(
          v.object({
            /** Balance for each token. */
            balances: v.pipe(
              v.array(
                /** Balance for the token. */
                v.pipe(
                  v.object({
                    /** Asset symbol. */
                    coin: v.pipe(
                      v.string(),
                      v.description("Asset symbol."),
                    ),
                    /** Unique identifier for the token. */
                    token: v.pipe(
                      UnsignedInteger,
                      v.description("Unique identifier for the token."),
                    ),
                    /** Total balance. */
                    total: v.pipe(
                      UnsignedDecimal,
                      v.description("Total balance."),
                    ),
                    /** Amount on hold. */
                    hold: v.pipe(
                      UnsignedDecimal,
                      v.description("Amount on hold."),
                    ),
                    /** Entry notional value. */
                    entryNtl: v.pipe(
                      UnsignedDecimal,
                      v.description("Entry notional value."),
                    ),
                  }),
                  v.description("Balance for the token."),
                ),
              ),
              v.description("Balance for each token."),
            ),
            /** Escrowed balances. */
            evmEscrows: v.pipe(
              v.optional(
                v.array(
                  /** Escrowed balance for the token. */
                  v.pipe(
                    v.object({
                      /** Asset symbol. */
                      coin: v.pipe(
                        v.string(),
                        v.description("Asset symbol."),
                      ),
                      /** Unique identifier for the token. */
                      token: v.pipe(
                        UnsignedInteger,
                        v.description("Unique identifier for the token."),
                      ),
                      /** Total balance. */
                      total: v.pipe(
                        UnsignedDecimal,
                        v.description("Total balance."),
                      ),
                    }),
                    v.description("Escrowed balance for the token."),
                  ),
                ),
              ),
              v.description("Escrowed balances."),
            ),
          }),
        ),
        v.description("Account summary for spot trading."),
      ),
      /** Context for each spot asset. */
      spotAssetCtxs: v.pipe(
        v.array(
          /** Spot asset context. */
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
            v.description("Spot asset context."),
          ),
        ),
        v.description("Context for each spot asset."),
      ),
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
    v.description("Event of comprehensive user and market data."),
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
    if (e.detail.user === payload.user.toLowerCase()) {
      listener(e.detail);
    }
  });
}
