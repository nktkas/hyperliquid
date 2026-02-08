import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Cloid, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { SignatureSchema } from "./_base/commonSchemas.ts";
import type { OrderResponse } from "./order.ts";

/**
 * Modify multiple orders.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
 */
export const BatchModifyRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("batchModify"),
      /** Order modifications. */
      modifies: v.array(
        v.object({
          /** Order ID or Client Order ID. */
          oid: v.union([UnsignedInteger, Cloid]),
          /** New order parameters. */
          order: v.object({
            /** Asset ID. */
            a: UnsignedInteger,
            /** Position side (`true` for long, `false` for short). */
            b: v.boolean(),
            /** Price. */
            p: v.pipe(
              UnsignedDecimal,
              v.check((input) => Number(input) > 0, "Value must be greater than zero."),
            ),
            /** Size (in base currency units). */
            s: UnsignedDecimal,
            /** Is reduce-only? */
            r: v.boolean(),
            /** Order type (`limit` for limit orders, `trigger` for stop-loss/take-profit orders). */
            t: v.union([
              v.object({
                /** Limit order parameters. */
                limit: v.object({
                  /**
                   * Time-in-force.
                   * - `"Gtc"`: Remains active until filled or canceled.
                   * - `"Ioc"`: Fills immediately or cancels any unfilled portion.
                   * - `"Alo"`: Adds liquidity only.
                   * - `"FrontendMarket"`: Similar to Ioc, but add a note that this is market order.
                   */
                  tif: v.picklist(["Gtc", "Ioc", "Alo", "FrontendMarket"]),
                }),
              }),
              v.object({
                /** Trigger order parameters. */
                trigger: v.object({
                  /** Is market order? */
                  isMarket: v.boolean(),
                  /** Trigger price. */
                  triggerPx: v.pipe(
                    UnsignedDecimal,
                    v.check((input) => Number(input) > 0, "Value must be greater than zero."),
                  ),
                  /** Indicates whether it is take profit or stop loss. */
                  tpsl: v.picklist(["tp", "sl"]),
                }),
              }),
            ]),
            /** Client Order ID. */
            c: v.optional(Cloid),
          }),
        }),
      ),
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Vault address (for vault trading). */
    vaultAddress: v.optional(Address),
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type BatchModifyRequest = v.InferOutput<typeof BatchModifyRequest>;

/**
 * Response for order batch modifications.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
 */
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
