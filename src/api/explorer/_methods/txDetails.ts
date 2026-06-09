import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex } from "../../_schemas.ts";
import type { ExplorerTransaction } from "./_base/mod.ts";

/**
 * Request transaction details by transaction hash.
 * @see null
 */
export const TxDetailsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("txDetails"),
    /** Transaction hash. */
    hash: v.pipe(Hex, v.length(66)),
  });
})();
export type TxDetailsRequest = v.InferOutput<typeof TxDetailsRequest>;

/**
 * Response with transaction details.
 * @see null
 */
export type TxDetailsResponse = {
  /** Response type. */
  type: "txDetails";
  /** Transaction details. */
  tx: ExplorerTransaction;
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { IRequestTransport } from "../../../transport/mod.ts";
import type { ExplorerConfig } from "./_base/mod.ts";

/** Request parameters for the {@linkcode txDetails} function. */
export type TxDetailsParameters = Omit<v.InferInput<typeof TxDetailsRequest>, "type">;

/**
 * Request transaction details by transaction hash.
 *
 * @param config General configuration for Explorer API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Transaction details.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { txDetails } from "@nktkas/hyperliquid/api/explorer";
 *
 * const transport = new HttpTransport(); // only `HttpTransport` supports this API
 *
 * const data = await txDetails({ transport }, {
 *   hash: "0x...",
 * });
 * ```
 *
 * @see null
 */
export function txDetails(
  config: ExplorerConfig<IRequestTransport<"explorer">>,
  params: TxDetailsParameters,
  signal?: AbortSignal,
): Promise<TxDetailsResponse> {
  const request = parse(TxDetailsRequest, {
    type: "txDetails",
    ...params,
  });
  return config.transport.request("explorer", request, signal);
}
