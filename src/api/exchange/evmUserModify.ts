import { type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
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
 * Configure block type for EVM transactions.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture
 */
export const EvmUserModifyRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("evmUserModify"),
            v.description("Type of action."),
          ),
          /** `true` for large blocks, `false` for small blocks. */
          usingBigBlocks: v.pipe(
            v.boolean(),
            v.description("`true` for large blocks, `false` for small blocks."),
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
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Configure block type for EVM transactions."),
  );
})();
export type EvmUserModifyRequest = v.InferOutput<typeof EvmUserModifyRequest>;

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode evmUserModify} function. */
export type EvmUserModifyParameters = ExtractRequestAction<v.InferInput<typeof EvmUserModifyRequest>>;
/** Request options for the {@linkcode evmUserModify} function. */
export type EvmUserModifyOptions = ExtractRequestOptions<v.InferInput<typeof EvmUserModifyRequest>>;

/**
 * Configure block type for EVM transactions.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Response for creating a sub-account.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { evmUserModify } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await evmUserModify(
 *   { transport, wallet },
 *   { usingBigBlocks: true },
 * );
 * ```
 */
export async function evmUserModify(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<EvmUserModifyParameters>,
  opts?: EvmUserModifyOptions,
): Promise<SuccessResponse> {
  const action = parser(EvmUserModifyRequest.entries.action)({
    type: "evmUserModify",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
