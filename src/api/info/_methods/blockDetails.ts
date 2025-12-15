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
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("blockDetails"),
        v.description("Type of request."),
      ),
      /** Block height. */
      height: v.pipe(
        UnsignedInteger,
        v.description("Block height."),
      ),
    }),
    v.description("Request block details by block height."),
  );
})();
export type BlockDetailsRequest = v.InferOutput<typeof BlockDetailsRequest>;

/**
 * Response containing block information.
 */
export const BlockDetailsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of response. */
      type: v.pipe(
        v.literal("blockDetails"),
        v.description("Type of response."),
      ),
      /** The details of a block. */
      blockDetails: v.pipe(
        v.object({
          /** Block creation timestamp. */
          blockTime: v.pipe(
            UnsignedInteger,
            v.description("Block creation timestamp."),
          ),
          /** Block hash. */
          hash: v.pipe(
            Hex,
            v.length(66),
            v.description("Block hash."),
          ),
          /** Block height in chain. */
          height: v.pipe(
            UnsignedInteger,
            v.description("Block height in chain."),
          ),
          /** Total transactions in block. */
          numTxs: v.pipe(
            UnsignedInteger,
            v.description("Total transactions in block."),
          ),
          /** Block proposer address. */
          proposer: v.pipe(
            Address,
            v.description("Block proposer address."),
          ),
          /** Array of transactions in the block. */
          txs: v.pipe(
            v.array(ExplorerTransactionSchema),
            v.description("Array of transactions in the block."),
          ),
        }),
        v.description("The details of a block."),
      ),
    }),
    v.description("Response containing block information."),
  );
})();
export type BlockDetailsResponse = v.InferOutput<typeof BlockDetailsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";
import type { HttpTransport } from "../../../transport/http/mod.ts";

/** Request parameters for the {@linkcode blockDetails} function. */
export type BlockDetailsParameters = Omit<v.InferInput<typeof BlockDetailsRequest>, "type">;

/**
 * Request block details by block height.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
  config: InfoConfig<HttpTransport>,
  params: BlockDetailsParameters,
  signal?: AbortSignal,
): Promise<BlockDetailsResponse> {
  const request = v.parse(BlockDetailsRequest, {
    type: "blockDetails",
    ...params,
  });
  return config.transport.request("explorer", request, signal);
}
