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
 * Modify an order.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order
 */
export const ModifyRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("modify"),
            v.description("Type of action."),
          ),
          /** Order ID or Client Order ID. */
          oid: v.pipe(
            v.union([
              UnsignedInteger,
              v.pipe(Hex, v.length(34)),
            ]),
            v.description("Order ID or Client Order ID."),
          ),
          /** New order parameters. */
          order: v.pipe(
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
            v.description("New order parameters."),
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
    v.description("Modify an order."),
  );
})();
export type ModifyRequest = v.InferOutput<typeof ModifyRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode modify} function. */
export type ModifyParameters = ExtractRequestAction<v.InferInput<typeof ModifyRequest>>;
/** Request options for the {@linkcode modify} function. */
export type ModifyOptions = ExtractRequestOptions<v.InferInput<typeof ModifyRequest>>;

/**
 * Modify an order.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { modify } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await modify(
 *   { transport, wallet },
 *   {
 *     oid: 123,
 *     order: {
 *       a: 0,
 *       b: true,
 *       p: "31000",
 *       s: "0.2",
 *       r: false,
 *       t: { limit: { tif: "Gtc" } },
 *       c: "0x...",
 *     },
 *   },
 * );
 * ```
 */
export async function modify(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<ModifyParameters>,
  opts?: ModifyOptions,
): Promise<SuccessResponse> {
  const action = parser(ModifyRequest.entries.action)({
    type: "modify",
    ...params,
  });
  const vaultAddress = opts?.vaultAddress ?? config.defaultVaultAddress;
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, vaultAddress, expiresAfter }, opts?.signal);
}
