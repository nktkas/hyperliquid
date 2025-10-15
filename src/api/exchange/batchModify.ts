import { Address, type DeepImmutable, Hex, parser, UnsignedInteger } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_base.ts";
import * as v from "valibot";

import { PlaceOrderParamsSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

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
            v.array(v.object({
              /** Order ID or Client Order ID. */
              oid: v.pipe(
                v.union([
                  UnsignedInteger,
                  v.pipe(Hex, v.length(34)),
                ]),
                v.description("Order ID or Client Order ID."),
              ),
              /** New order parameters. */
              order: PlaceOrderParamsSchema,
            })),
            v.description("Order modifications."),
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
    v.description("Modify multiple orders."),
  );
})();
export type BatchModifyRequest = v.InferOutput<typeof BatchModifyRequest>;

import { OrderSuccessResponse } from "./order.ts";
export { OrderSuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode batchModify} function. */
export type BatchModifyParameters = ExtractRequestAction<v.InferInput<typeof BatchModifyRequest>>;
/** Request options for the {@linkcode batchModify} function. */
export type BatchModifyOptions = ExtractRequestOptions<v.InferInput<typeof BatchModifyRequest>>;

/**
 * Modify multiple orders.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful variant of {@link OrderResponse} without error statuses.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
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
 */
export async function batchModify(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<BatchModifyParameters>,
  opts?: BatchModifyOptions,
): Promise<OrderSuccessResponse> {
  const action = parser(BatchModifyRequest.entries.action)({
    type: "batchModify",
    ...params,
  });
  const vaultAddress = opts?.vaultAddress ?? config.defaultVaultAddress;
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, vaultAddress, expiresAfter }, opts?.signal);
}
