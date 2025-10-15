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

// -------------------- Schemas --------------------

/**
 * Cancel order(s) by cloid.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
 */
export const CancelByCloidRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("cancelByCloid"),
            v.description("Type of action."),
          ),
          /** Orders to cancel. */
          cancels: v.pipe(
            v.array(v.object({
              /** Asset ID. */
              asset: v.pipe(
                UnsignedInteger,
                v.description("Asset ID."),
              ),
              /** Client Order ID. */
              cloid: v.pipe(
                v.pipe(Hex, v.length(34)),
                v.description("Client Order ID."),
              ),
            })),
            v.description("Orders to cancel."),
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
    v.description("Cancel order(s) by cloid."),
  );
})();
export type CancelByCloidRequest = v.InferOutput<typeof CancelByCloidRequest>;

import { CancelSuccessResponse } from "./cancel.ts";
export { CancelSuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode cancelByCloid} function. */
export type CancelByCloidParameters = ExtractRequestAction<v.InferInput<typeof CancelByCloidRequest>>;
/** Request options for the {@linkcode cancelByCloid} function. */
export type CancelByCloidOptions = ExtractRequestOptions<v.InferInput<typeof CancelByCloidRequest>>;

/**
 * Cancel order(s) by cloid.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful variant of {@link CancelResponse} without error statuses.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cancelByCloid } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await cancelByCloid(
 *   { transport, wallet },
 *   {
 *     cancels: [
 *       { asset: 0, cloid: "0x..." },
 *     ],
 *   },
 * );
 * ```
 */
export async function cancelByCloid(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<CancelByCloidParameters>,
  opts?: CancelByCloidOptions,
): Promise<CancelSuccessResponse> {
  const action = parser(CancelByCloidRequest.entries.action)({
    type: "cancelByCloid",
    ...params,
  });
  const vaultAddress = opts?.vaultAddress ?? config.defaultVaultAddress;
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, vaultAddress, expiresAfter }, opts?.signal);
}
