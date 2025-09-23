import { Address, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_common.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/**
 * Place an order(s).
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
 */
export const OrderRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("order"),
            v.description("Type of action."),
          ),
          /** Order parameters. */
          orders: v.pipe(
            v.array(
              /** Order parameters. */
              v.pipe(
                v.object({
                  /** Asset ID. */
                  a: v.pipe(
                    UnsignedInteger,
                    v.description("Asset ID."),
                  ),
                  /** Position side (`true` for long, `false` for short). */
                  b: v.pipe(
                    v.boolean(),
                    v.description("Position side (`true` for long, `false` for short)."),
                  ),
                  /** Price. */
                  p: v.pipe(
                    UnsignedDecimal,
                    v.description("Price."),
                  ),
                  /** Size (in base currency units). */
                  s: v.pipe(
                    UnsignedDecimal,
                    v.description("Size (in base currency units)."),
                  ),
                  /** Is reduce-only? */
                  r: v.pipe(
                    v.boolean(),
                    v.description("Is reduce-only?"),
                  ),
                  /** Order type. */
                  t: v.pipe(
                    v.union([
                      v.object({
                        /** Limit order parameters. */
                        limit: v.pipe(
                          v.object({
                            /**
                             * Time-in-force.
                             * - `"Gtc"`: Remains active until filled or canceled.
                             * - `"Ioc"`: Fills immediately or cancels any unfilled portion.
                             * - `"Alo"`: Adds liquidity only.
                             * - `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.
                             * - `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.
                             */
                            tif: v.pipe(
                              v.union([
                                v.literal("Gtc"),
                                v.literal("Ioc"),
                                v.literal("Alo"),
                                v.literal("FrontendMarket"),
                                v.literal("LiquidationMarket"),
                              ]),
                              v.description(
                                "Time-in-force." +
                                  '\n- `"Gtc"`: Remains active until filled or canceled.' +
                                  '\n- `"Ioc"`: Fills immediately or cancels any unfilled portion.' +
                                  '\n- `"Alo"`: Adds liquidity only.' +
                                  '\n- `"FrontendMarket"`: Similar to Ioc, used in Hyperliquid UI.' +
                                  '\n- `"LiquidationMarket"`: Similar to Ioc, used in Hyperliquid UI.',
                              ),
                            ),
                          }),
                          v.description("Limit order parameters."),
                        ),
                      }),
                      v.object({
                        /** Trigger order parameters. */
                        trigger: v.pipe(
                          v.object({
                            /** Is market order? */
                            isMarket: v.pipe(
                              v.boolean(),
                              v.description("Is market order?"),
                            ),
                            /** Trigger price. */
                            triggerPx: v.pipe(
                              UnsignedDecimal,
                              v.description("Trigger price."),
                            ),
                            /** Indicates whether it is take profit or stop loss. */
                            tpsl: v.pipe(
                              v.union([v.literal("tp"), v.literal("sl")]),
                              v.description("Indicates whether it is take profit or stop loss."),
                            ),
                          }),
                          v.description("Trigger order parameters."),
                        ),
                      }),
                    ]),
                    v.description("Order type."),
                  ),
                  /** Client Order ID. */
                  c: v.pipe(
                    v.optional(v.pipe(Hex, v.length(34))),
                    v.description("Client Order ID."),
                  ),
                }),
                v.description("Order parameters."),
              ),
            ),
            v.description("Order parameters."),
          ),
          /**
           * Order grouping strategy:
           * - `na`: Standard order without grouping (default).
           * - `normalTpsl`: TP/SL order with fixed size that doesn't adjust with position changes.
           * - `positionTpsl`: TP/SL order that adjusts proportionally with the position size.
           */
          grouping: v.pipe(
            v.optional(v.union([v.literal("na"), v.literal("normalTpsl"), v.literal("positionTpsl")]), "na"),
            v.description(
              "Order grouping strategy:" +
                "\n- `na`: Standard order without grouping." +
                "\n- `normalTpsl`: TP/SL order with fixed size that doesn't adjust with position changes." +
                "\n- `positionTpsl`: TP/SL order that adjusts proportionally with the position size.",
            ),
          ),
          /** Builder fee. */
          builder: v.pipe(
            v.optional(v.object({
              /** Builder address. */
              b: v.pipe(
                Address,
                v.description("Builder address."),
              ),
              /** Builder fee in 0.1bps (1 = 0.0001%). */
              f: v.pipe(
                UnsignedInteger,
                v.description("Builder fee in 0.1bps (1 = 0.0001%)."),
              ),
            })),
            v.description("Builder fee."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Unique request identifier (current timestamp in ms). */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Unique request identifier (current timestamp in ms)."),
      ),
      /** Cryptographic signature. */
      signature: v.pipe(
        Signature,
        v.description("Cryptographic signature."),
      ),
      /** Vault address (for vault trading). */
      vaultAddress: v.pipe(
        v.optional(Address),
        v.description("Vault address (for vault trading)."),
      ),
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Place an order(s)."),
  );
})();
export type OrderRequest = v.InferOutput<typeof OrderRequest>;

/** Response for order placement and batch modifications. */
export const OrderResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Successful status. */
      status: v.pipe(
        v.literal("ok"),
        v.description("Successful status."),
      ),
      /** Response details. */
      response: v.pipe(
        v.object({
          /** Type of response. */
          type: v.pipe(
            v.literal("order"),
            v.description("Type of response."),
          ),
          /** Specific data. */
          data: v.pipe(
            v.object({
              /** Array of statuses or error messages. */
              statuses: v.pipe(
                v.array(
                  v.union([
                    v.object({
                      /** Resting order status. */
                      resting: v.pipe(
                        v.object({
                          /** Order ID. */
                          oid: v.pipe(
                            UnsignedInteger,
                            v.description("Order ID."),
                          ),
                          /** Client Order ID. */
                          cloid: v.pipe(
                            v.optional(v.pipe(Hex, v.length(34))),
                            v.description("Client Order ID."),
                          ),
                        }),
                        v.description("Resting order status."),
                      ),
                    }),
                    v.object({
                      /** Filled order status. */
                      filled: v.pipe(
                        v.object({
                          /** Total size filled. */
                          totalSz: v.pipe(
                            UnsignedDecimal,
                            v.description("Total size filled."),
                          ),
                          /** Average price of fill. */
                          avgPx: v.pipe(
                            UnsignedDecimal,
                            v.description("Average price of fill."),
                          ),
                          /** Order ID. */
                          oid: v.pipe(
                            UnsignedInteger,
                            v.description("Order ID."),
                          ),
                          /** Client Order ID. */
                          cloid: v.pipe(
                            v.optional(v.pipe(Hex, v.length(34))),
                            v.description("Client Order ID."),
                          ),
                        }),
                        v.description("Filled order status."),
                      ),
                    }),
                    v.object({
                      /** Error message. */
                      error: v.pipe(
                        v.string(),
                        v.description("Error message."),
                      ),
                    }),
                  ]),
                ),
                v.description("Array of statuses or error messages."),
              ),
            }),
            v.description("Specific data."),
          ),
        }),
        v.description("Response details."),
      ),
    }),
    v.description("Response for order placement and batch modifications."),
  );
})();
export type OrderResponse = v.InferOutput<typeof OrderResponse>;

/** Successful variant of {@linkcode OrderResponse} without errors. */
export const OrderSuccessResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Successful status. */
      status: v.pipe(
        v.literal("ok"),
        v.description("Successful status."),
      ),
      /** Response details. */
      response: v.pipe(
        v.object({
          /** Type of response. */
          type: v.pipe(
            v.literal("order"),
            v.description("Type of response."),
          ),
          /** Specific data. */
          data: v.pipe(
            v.object({
              /** Array of successful order statuses. */
              statuses: v.pipe(
                v.array(
                  v.union([
                    v.object({
                      /** Resting order status. */
                      resting: v.pipe(
                        v.object({
                          /** Order ID. */
                          oid: v.pipe(
                            UnsignedInteger,
                            v.description("Order ID."),
                          ),
                          /** Client Order ID. */
                          cloid: v.pipe(
                            v.optional(v.pipe(Hex, v.length(34))),
                            v.description("Client Order ID."),
                          ),
                        }),
                        v.description("Resting order status."),
                      ),
                    }),
                    v.object({
                      /** Filled order status. */
                      filled: v.pipe(
                        v.object({
                          /** Total size filled. */
                          totalSz: v.pipe(
                            UnsignedDecimal,
                            v.description("Total size filled."),
                          ),
                          /** Average price of fill. */
                          avgPx: v.pipe(
                            UnsignedDecimal,
                            v.description("Average price of fill."),
                          ),
                          /** Order ID. */
                          oid: v.pipe(
                            UnsignedInteger,
                            v.description("Order ID."),
                          ),
                          /** Client Order ID. */
                          cloid: v.pipe(
                            v.optional(v.pipe(Hex, v.length(34))),
                            v.description("Client Order ID."),
                          ),
                        }),
                        v.description("Filled order status."),
                      ),
                    }),
                  ]),
                ),
                v.description("Array of successful order statuses."),
              ),
            }),
            v.description("Specific data."),
          ),
        }),
        v.description("Response details."),
      ),
    }),
    v.description("Successful variant of `OrderResponse` without errors."),
  );
})();
export type OrderSuccessResponse = v.InferOutput<typeof OrderSuccessResponse>;

// -------------------- Function --------------------

/** Action parameters for the {@linkcode order} function. */
export type OrderParameters = ExtractRequestAction<v.InferInput<typeof OrderRequest>>;
/** Request options for the {@linkcode order} function. */
export type OrderOptions = ExtractRequestOptions<v.InferInput<typeof OrderRequest>>;

/**
 * Place an order(s).
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful variant of {@link OrderResponse} without error statuses.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { order } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await order(
 *   { transport, wallet },
 *   {
 *     orders: [
 *       {
 *         a: 0,
 *         b: true,
 *         p: "30000",
 *         s: "0.1",
 *         r: false,
 *         t: { limit: { tif: "Gtc" } },
 *         c: "0x...",
 *       },
 *     ],
 *     grouping: "na",
 *   },
 * );
 * ```
 */
export async function order(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<OrderParameters>,
  opts?: OrderOptions,
): Promise<OrderSuccessResponse> {
  const action = parser(OrderRequest.entries.action)({
    type: "order",
    ...params,
  });
  const vaultAddress = opts?.vaultAddress ?? config.defaultVaultAddress;
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, vaultAddress, expiresAfter }, opts?.signal);
}
