import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex } from "../../_schemas.ts";
import { ExplorerTransactionSchema } from "./_base/commonSchemas.ts";

/**
 * Request transaction details by transaction hash.
 */
export const TxDetailsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("txDetails"),
        v.description("Type of request."),
      ),
      /** Transaction hash. */
      hash: v.pipe(
        Hex,
        v.length(66),
        v.description("Transaction hash."),
      ),
    }),
    v.description("Request transaction details by transaction hash."),
  );
})();
export type TxDetailsRequest = v.InferOutput<typeof TxDetailsRequest>;

/**
 * Response with transaction details.
 */
export const TxDetailsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Response type. */
      type: v.pipe(
        v.literal("txDetails"),
        v.description("Response type."),
      ),
      /** Transaction details. */
      tx: v.pipe(
        ExplorerTransactionSchema,
        v.description("Transaction details."),
      ),
    }),
    v.description("Response with transaction details."),
  );
})();
export type TxDetailsResponse = v.InferOutput<typeof TxDetailsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";
import type { HttpTransport } from "../../../transport/http/mod.ts";

/** Request parameters for the {@linkcode txDetails} function. */
export type TxDetailsParameters = Omit<v.InferInput<typeof TxDetailsRequest>, "type">;

/**
 * Request transaction details by transaction hash.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Transaction details.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { txDetails } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // only `HttpTransport` supports this API
 * const data = await txDetails(
 *   { transport },
 *   { hash: "0x..." },
 * );
 * ```
 */
export function txDetails(
  config: InfoConfig<HttpTransport>,
  params: TxDetailsParameters,
  signal?: AbortSignal,
): Promise<TxDetailsResponse> {
  const request = v.parse(TxDetailsRequest, {
    type: "txDetails",
    ...params,
  });
  return config.transport.request("explorer", request, signal);
}
