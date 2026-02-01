import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";
import { ExplorerTransactionSchema } from "./_base/commonSchemas.ts";

/**
 * Request block details by block height.
 */
export const BlockDetailsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("blockDetails"),
    /** Block height. */
    height: UnsignedInteger,
  });
})();
export type BlockDetailsRequest = v.InferOutput<typeof BlockDetailsRequest>;

/**
 * Response containing block information.
 */
export const BlockDetailsResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of response. */
    type: v.literal("blockDetails"),
    /** The details of a block. */
    blockDetails: v.object({
      /** Block creation timestamp. */
      blockTime: UnsignedInteger,
      /** Block hash. */
      hash: v.pipe(Hex, v.length(66)),
      /** Block height in chain. */
      height: UnsignedInteger,
      /** Total transactions in block. */
      numTxs: UnsignedInteger,
      /** Block proposer address. */
      proposer: Address,
      /** Array of transactions in the block. */
      txs: v.array(ExplorerTransactionSchema),
    }),
  });
})();
export type BlockDetailsResponse = v.InferOutput<typeof BlockDetailsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode blockDetails} function. */
export type BlockDetailsParameters = Omit<v.InferInput<typeof BlockDetailsRequest>, "type">;

/**
 * Request block details by block height.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Response containing block information.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { blockDetails } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // only `HttpTransport` supports this API
 * const data = await blockDetails(
 *   { transport },
 *   { height: 123 },
 * );
 * ```
 */
export function blockDetails(
  config: InfoConfig,
  params: BlockDetailsParameters,
  signal?: AbortSignal,
): Promise<BlockDetailsResponse> {
  const request = v.parse(BlockDetailsRequest, {
    type: "blockDetails",
    ...params,
  });
  return config.transport.request("explorer", request, signal);
}
