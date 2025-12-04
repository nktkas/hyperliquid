import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, Nonce, Signature, SuccessResponse } from "./_base/schemas.ts";

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
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
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

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture
 */
export const EvmUserModifyResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type EvmUserModifyResponse = v.InferOutput<typeof EvmUserModifyResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const EvmUserModifyParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(EvmUserModifyRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode evmUserModify} function. */
export type EvmUserModifyParameters = v.InferInput<typeof EvmUserModifyParameters>;

/** Request options for the {@linkcode evmUserModify} function. */
export type EvmUserModifyOptions = ExtractRequestOptions<v.InferInput<typeof EvmUserModifyRequest>>;

/** Successful variant of {@linkcode EvmUserModifyResponse} without errors. */
export type EvmUserModifySuccessResponse = ExcludeErrorResponse<EvmUserModifyResponse>;

/**
 * Configure block type for EVM transactions.
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Successful response without specific data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
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
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture
 */
export function evmUserModify(
  config: ExchangeConfig,
  params: EvmUserModifyParameters,
  opts?: EvmUserModifyOptions,
): Promise<EvmUserModifySuccessResponse> {
  const action = v.parse(EvmUserModifyParameters, params);
  return executeL1Action(config, { type: "evmUserModify", ...action }, opts);
}
