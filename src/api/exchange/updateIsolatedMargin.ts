import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_common.ts";
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
 * Add or remove margin from isolated position.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export const UpdateIsolatedMarginRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("updateIsolatedMargin"),
            v.description("Type of action."),
          ),
          /** Asset ID. */
          asset: v.pipe(
            UnsignedInteger,
            v.description("Asset ID."),
          ),
          /** Position side (`true` for long, `false` for short). */
          isBuy: v.pipe(
            v.boolean(),
            v.description("Position side (`true` for long, `false` for short)."),
          ),
          /** Amount to adjust (float * 1e6). */
          ntli: v.pipe(
            UnsignedInteger,
            v.description("Amount to adjust (float * 1e6)."),
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
    v.description("Add or remove margin from isolated position."),
  );
})();
export type UpdateIsolatedMarginRequest = v.InferOutput<typeof UpdateIsolatedMarginRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode updateIsolatedMargin} function. */
export type UpdateIsolatedMarginParameters = ExtractRequestAction<v.InferInput<typeof UpdateIsolatedMarginRequest>>;
/** Request options for the {@linkcode updateIsolatedMargin} function. */
export type UpdateIsolatedMarginOptions = ExtractRequestOptions<v.InferInput<typeof UpdateIsolatedMarginRequest>>;

/**
 * Add or remove margin from isolated position.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { updateIsolatedMargin } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await updateIsolatedMargin(
 *   { transport, wallet },
 *   { asset: 0, isBuy: true, ntli: 1 * 1e6 },
 * );
 * ```
 */
export async function updateIsolatedMargin(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<UpdateIsolatedMarginParameters>,
  opts?: UpdateIsolatedMarginOptions,
): Promise<SuccessResponse> {
  const action = parser(UpdateIsolatedMarginRequest.entries.action)({
    type: "updateIsolatedMargin",
    ...params,
  });
  const vaultAddress = opts?.vaultAddress ?? config.defaultVaultAddress;
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, vaultAddress, expiresAfter }, opts?.signal);
}
