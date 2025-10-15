import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
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
 * Update cross or isolated leverage on a coin.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
 */
export const UpdateLeverageRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("updateLeverage"),
            v.description("Type of action."),
          ),
          /** Asset ID. */
          asset: v.pipe(
            UnsignedInteger,
            v.description("Asset ID."),
          ),
          /** `true` for cross leverage, `false` for isolated leverage. */
          isCross: v.pipe(
            v.boolean(),
            v.description("`true` for cross leverage, `false` for isolated leverage."),
          ),
          /** New leverage value. */
          leverage: v.pipe(
            v.pipe(UnsignedInteger, v.minValue(1)),
            v.description("New leverage value."),
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
    v.description("Update cross or isolated leverage on a coin."),
  );
})();
export type UpdateLeverageRequest = v.InferOutput<typeof UpdateLeverageRequest>;

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode updateLeverage} function. */
export type UpdateLeverageParameters = ExtractRequestAction<v.InferInput<typeof UpdateLeverageRequest>>;
/** Request options for the {@linkcode updateLeverage} function. */
export type UpdateLeverageOptions = ExtractRequestOptions<v.InferInput<typeof UpdateLeverageRequest>>;

/**
 * Update cross or isolated leverage on a coin.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { updateLeverage } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await updateLeverage(
 *   { transport, wallet },
 *   { asset: 0, isCross: true, leverage: 5 },
 * );
 * ```
 */
export async function updateLeverage(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<UpdateLeverageParameters>,
  opts?: UpdateLeverageOptions,
): Promise<SuccessResponse> {
  const action = parser(UpdateLeverageRequest.entries.action)({
    type: "updateLeverage",
    ...params,
  });
  const vaultAddress = opts?.vaultAddress ?? config.defaultVaultAddress;
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, vaultAddress, expiresAfter }, opts?.signal);
}
