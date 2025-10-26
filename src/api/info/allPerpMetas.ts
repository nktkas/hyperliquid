import * as v from "valibot";
import { parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_types.ts";

import { MetaResponse } from "./meta.ts";

// -------------------- Schemas --------------------

/**
 * Request trading metadata for all DEXes.
 * @see null
 */
export const AllPerpMetasRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("allPerpMetas"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request trading metadata for all DEXes."),
  );
})();
export type AllPerpMetasRequest = v.InferOutput<typeof AllPerpMetasRequest>;

/**
 * Metadata for perpetual assets across all DEXes.
 * @see null
 */
export const AllPerpMetasResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(MetaResponse),
    v.description("Metadata for perpetual assets across all DEXes."),
  );
})();
export type AllPerpMetasResponse = v.InferOutput<typeof AllPerpMetasResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode allPerpMetas} function. */
export type AllPerpMetasParameters = Omit<v.InferInput<typeof AllPerpMetasRequest>, "type">;

/**
 * Request trading metadata for all DEXes.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Metadata for perpetual assets across all DEXes.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { allPerpMetas } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await allPerpMetas({ transport });
 * ```
 */
export function allPerpMetas(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<AllPerpMetasResponse> {
  const request = parser(AllPerpMetasRequest)({
    type: "allPerpMetas",
  });
  return config.transport.request("info", request, signal);
}
