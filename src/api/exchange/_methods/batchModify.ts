import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { Nonce, Signature } from "./_base/schemas.ts";
import { OrderResponse } from "./order.ts";

/**
 * Modify multiple orders.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
 */
export const BatchModifyRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("batchModify"),
            v.description("Type of action."),
          ),
          /** Order modifications. */
          modifies: v.pipe(
            v.array(
              v.object({
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
                                v.picklist(["Gtc", "Ioc", "Alo", "FrontendMarket", "LiquidationMarket"]),
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
                                v.picklist(["tp", "sl"]),
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
            ),
            v.description("Order modifications."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
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
    v.description("Modify multiple orders."),
  );
})();
export type BatchModifyRequest = v.InferOutput<typeof BatchModifyRequest>;

/**
 * Response for order batch modifications.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
 */
export const BatchModifyResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    OrderResponse,
    v.description("Response for order batch modifications."),
  );
})();
export type BatchModifyResponse = OrderResponse;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const BatchModifyParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(BatchModifyRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode batchModify} function. */
export type BatchModifyParameters = v.InferInput<typeof BatchModifyParameters>;

/** Request options for the {@linkcode batchModify} function. */
export type BatchModifyOptions = ExtractRequestOptions<v.InferInput<typeof BatchModifyRequest>>;

/** Successful variant of {@linkcode BatchModifyResponse} without errors. */
export type BatchModifySuccessResponse = ExcludeErrorResponse<BatchModifyResponse>;

/**
 * Modify multiple orders.
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Successful variant of {@link OrderResponse} without error statuses.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { batchModify } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await batchModify(
 *   { transport, wallet },
 *   {
 *     modifies: [
 *       {
 *         oid: 123,
 *         order: {
 *           a: 0,
 *           b: true,
 *           p: "31000",
 *           s: "0.2",
 *           r: false,
 *           t: { limit: { tif: "Gtc" } },
 *         },
 *       },
 *     ],
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
 */
export function batchModify(
  config: ExchangeConfig,
  params: BatchModifyParameters,
  opts?: BatchModifyOptions,
): Promise<BatchModifySuccessResponse> {
  const action = v.parse(BatchModifyParameters, params);
  return executeL1Action(config, { type: "batchModify", ...action }, opts);
}
