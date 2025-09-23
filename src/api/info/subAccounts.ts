import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request user sub-accounts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 */
export const SubAccountsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("subAccounts"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user sub-accounts."),
  );
})();
export type SubAccountsRequest = v.InferOutput<typeof SubAccountsRequest>;

/**
 * Array of user sub-account or null if the user does not have any sub-accounts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 */
export const SubAccountsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.nullable(
      v.array(
        /** Sub-account details for a user. */
        v.pipe(
          v.object({
            /** Sub-account name. */
            name: v.pipe(
              v.string(),
              v.minLength(1),
              v.description("Sub-account name."),
            ),
            /** Sub-account address. */
            subAccountUser: v.pipe(
              Address,
              v.description("Sub-account address."),
            ),
            /** Master account address. */
            master: v.pipe(
              Address,
              v.description("Master account address."),
            ),
            /** Perpetual trading clearinghouse state summary. */
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
              v.description("Perpetual trading clearinghouse state summary."),
            ),
            /** Spot tokens clearinghouse state. */
            spotState: v.pipe(
              v.object({
                /** Balance for each token. */
                balances: v.pipe(
                  v.array(
                    /** Balance for a specific spot token. */
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
                      v.description("Balance for a specific spot token."),
                    ),
                  ),
                  v.description("Balance for each token."),
                ),
                /** Escrowed balances. */
                evmEscrows: v.pipe(
                  v.optional(
                    v.array(
                      /** Escrowed balance for a specific asset. */
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
                        v.description("Escrowed balance for a specific asset."),
                      ),
                    ),
                  ),
                  v.description("Escrowed balances."),
                ),
              }),
              v.description("Spot tokens clearinghouse state."),
            ),
          }),
          v.description("Sub-account details for a user."),
        ),
      ),
    ),
    v.description("Array of user sub-account or null if the user does not have any sub-accounts."),
  );
})();
export type SubAccountsResponse = v.InferOutput<typeof SubAccountsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode subAccounts} function. */
export type SubAccountsParameters = Omit<v.InferInput<typeof SubAccountsRequest>, "type">;

/**
 * Request user sub-accounts.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of user sub-account or null if the user does not have any sub-accounts.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { subAccounts } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await subAccounts(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function subAccounts(
  config: InfoRequestConfig,
  params: DeepImmutable<SubAccountsParameters>,
  signal?: AbortSignal,
): Promise<SubAccountsResponse> {
  const request = parser(SubAccountsRequest)({
    type: "subAccounts",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
