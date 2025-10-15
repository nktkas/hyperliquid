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
          order: PlaceOrderParamsSchema,
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

import { SuccessResponse } from "./_base.ts";
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
