import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

import { FillSchema } from "../_common_schemas.ts";

// -------------------- Schemas --------------------

/**
 * Request array of user fills.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 */
export const UserFillsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userFills"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
      aggregateByTime: v.pipe(
        v.optional(v.boolean()),
        v.description("If true, partial fills are aggregated when a crossing order fills multiple resting orders."),
      ),
    }),
    v.description("Request array of user fills."),
  );
})();
export type UserFillsRequest = v.InferOutput<typeof UserFillsRequest>;

/**
 * Array of user trade fills.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 */
export const UserFillsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(FillSchema),
    v.description("Array of user trade fills."),
  );
})();
export type UserFillsResponse = v.InferOutput<typeof UserFillsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userFills} function. */
export type UserFillsParameters = Omit<v.InferInput<typeof UserFillsRequest>, "type">;

/**
 * Request array of user fills.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of user trade fills.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userFills } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await userFills(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function userFills(
  config: InfoRequestConfig,
  params: DeepImmutable<UserFillsParameters>,
  signal?: AbortSignal,
): Promise<UserFillsResponse> {
  const request = parser(UserFillsRequest)({
    type: "userFills",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
