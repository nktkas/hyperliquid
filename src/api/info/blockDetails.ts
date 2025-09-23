import * as v from "valibot";
import { Address, type DeepImmutable, Hex, parser, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";
import type { IRequestTransport } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/**
 * Request block details by block height.
 * @see null
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
 * @see null
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
            v.pipe(Hex, v.length(66)),
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
            v.array(
              /** Transaction details. */
              v.pipe(
                v.object({
                  /** Action performed in transaction. */
                  action: v.pipe(
                    v.looseObject({
                      /** Action type. */
                      type: v.pipe(
                        v.string(),
                        v.description("Action type."),
                      ),
                    }),
                    v.description("Action performed in transaction."),
                  ),
                  /** Block number where transaction was included. */
                  block: v.pipe(
                    UnsignedInteger,
                    v.description("Block number where transaction was included."),
                  ),
                  /** Error message if transaction failed. */
                  error: v.pipe(
                    v.nullable(v.string()),
                    v.description("Error message if transaction failed."),
                  ),
                  /** Transaction hash. */
                  hash: v.pipe(
                    v.pipe(Hex, v.length(66)),
                    v.description("Transaction hash."),
                  ),
                  /** Transaction creation timestamp. */
                  time: v.pipe(
                    UnsignedInteger,
                    v.description("Transaction creation timestamp."),
                  ),
                  /** Creator's address. */
                  user: v.pipe(
                    Address,
                    v.description("Creator's address."),
                  ),
                }),
                v.description("Transaction details."),
              ),
            ),
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

// -------------------- Function --------------------

/** Request parameters for the {@linkcode blockDetails} function. */
export type BlockDetailsParameters = Omit<v.InferInput<typeof BlockDetailsRequest>, "type">;

/**
 * Request block details by block height.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Response containing block information.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
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
export function blockDetails<T extends IRequestTransport>(
  config: T extends { request(endpoint: "explorer", ...args: unknown[]): unknown } ? InfoRequestConfig<T> : never,
  params: DeepImmutable<BlockDetailsParameters>,
  signal?: AbortSignal,
): Promise<BlockDetailsResponse> {
  const request = parser(BlockDetailsRequest)({
    type: "blockDetails",
    ...params,
  });
  return config.transport.request("explorer", request, signal);
}
