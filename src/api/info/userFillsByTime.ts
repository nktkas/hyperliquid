import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

import { FillSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/**
 * Request array of user fills by time.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
 */
export const UserFillsByTimeRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userFillsByTime"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Start time (in ms since epoch). */
      startTime: v.pipe(
        UnsignedInteger,
        v.description("Start time (in ms since epoch)."),
      ),
      /** End time (in ms since epoch). */
      endTime: v.pipe(
        v.nullish(UnsignedInteger),
        v.description("End time (in ms since epoch)."),
      ),
      /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
      aggregateByTime: v.pipe(
        v.optional(v.boolean()),
        v.description("If true, partial fills are aggregated when a crossing order fills multiple resting orders."),
      ),
    }),
    v.description("Request array of user fills by time."),
  );
})();
export type UserFillsByTimeRequest = v.InferOutput<typeof UserFillsByTimeRequest>;

/**
 * Array of user trade fills by time.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
 */
export const UserFillsByTimeResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(FillSchema),
    v.description("Array of user trade fills by time."),
  );
})();
export type UserFillsByTimeResponse = v.InferOutput<typeof UserFillsByTimeResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userFillsByTime} function. */
export type UserFillsByTimeParameters = Omit<v.InferInput<typeof UserFillsByTimeRequest>, "type">;

/**
 * Request array of user fills by time.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of user trade fills by time.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userFillsByTime } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await userFillsByTime(
 *   { transport },
 *   { user: "0x...", startTime: Date.now() - 1000 * 60 * 60 * 24 },
 * );
 * ```
 */
export function userFillsByTime(
  config: InfoRequestConfig,
  params: DeepImmutable<UserFillsByTimeParameters>,
  signal?: AbortSignal,
): Promise<UserFillsByTimeResponse> {
  const request = parser(UserFillsByTimeRequest)({
    type: "userFillsByTime",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
