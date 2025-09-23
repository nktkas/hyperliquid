import * as v from "valibot";
import { type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request margin table data.
 * @see null
 */
export const MarginTableRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("marginTable"),
        v.description("Type of request."),
      ),
      /** Margin requirements table. */
      id: v.pipe(
        UnsignedInteger,
        v.description("Margin requirements table."),
      ),
    }),
    v.description("Request margin table data."),
  );
})();

export type MarginTableRequest = v.InferOutput<typeof MarginTableRequest>;

/**
 * Margin requirements table with multiple tiers.
 * @see null
 */
export const MarginTableResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Description of the margin table. */
      description: v.pipe(
        v.string(),
        v.description("Description of the margin table."),
      ),
      /** Array of margin tiers defining leverage limits. */
      marginTiers: v.pipe(
        v.array(
          /** Individual tier in a margin requirements table. */
          v.pipe(
            v.object({
              /** Lower position size boundary for this tier. */
              lowerBound: v.pipe(
                UnsignedDecimal,
                v.description("Lower position size boundary for this tier."),
              ),
              /** Maximum allowed leverage for this tier. */
              maxLeverage: v.pipe(
                UnsignedInteger,
                v.minValue(1),
                v.description("Maximum allowed leverage for this tier."),
              ),
            }),
            v.description("Individual tier in a margin requirements table."),
          ),
        ),
        v.description("Array of margin tiers defining leverage limits."),
      ),
    }),
    v.description("Margin requirements table with multiple tiers."),
  );
})();

export type MarginTableResponse = v.InferOutput<typeof MarginTableResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode marginTable} function. */
export type MarginTableParameters = Omit<v.InferInput<typeof MarginTableRequest>, "type">;

/**
 * Request margin table data.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Margin requirements table with multiple tiers.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { marginTable } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await marginTable(
 *   { transport },
 *   { id: 1 },
 * );
 * ```
 */
export function marginTable(
  config: InfoRequestConfig,
  params: DeepImmutable<MarginTableParameters>,
  signal?: AbortSignal,
): Promise<MarginTableResponse> {
  const request = parser(MarginTableRequest)({
    type: "marginTable",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
