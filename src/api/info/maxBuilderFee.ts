import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request builder fee approval.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval
 */
export const MaxBuilderFeeRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("maxBuilderFee"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Builder address. */
      builder: v.pipe(
        Address,
        v.description("Builder address."),
      ),
    }),
    v.description("Request builder fee approval."),
  );
})();

export type MaxBuilderFeeRequest = v.InferOutput<typeof MaxBuilderFeeRequest>;

/**
 * Maximum builder fee approval.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval
 */
export const MaxBuilderFeeResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.number(),
    v.description("Maximum builder fee approval."),
  );
})();

export type MaxBuilderFeeResponse = v.InferOutput<typeof MaxBuilderFeeResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode maxBuilderFee} function. */
export type MaxBuilderFeeParameters = Omit<v.InferInput<typeof MaxBuilderFeeRequest>, "type">;

/**
 * Request builder fee approval.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Maximum builder fee approval.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { maxBuilderFee } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await maxBuilderFee(
 *   { transport },
 *   { user: "0x...", builder: "0x..." },
 * );
 * ```
 */
export function maxBuilderFee(
  config: InfoRequestConfig,
  params: DeepImmutable<MaxBuilderFeeParameters>,
  signal?: AbortSignal,
): Promise<number> {
  const request = parser(MaxBuilderFeeRequest)({
    type: "maxBuilderFee",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
