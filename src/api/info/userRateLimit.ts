import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request user rate limits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
 */
export const UserRateLimitRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userRateLimit"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user rate limits."),
  );
})();
export type UserRateLimitRequest = v.InferOutput<typeof UserRateLimitRequest>;

/**
 * User rate limits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
 */
export const UserRateLimitResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Cumulative trading volume. */
      cumVlm: v.pipe(
        UnsignedDecimal,
        v.description("Cumulative trading volume."),
      ),
      /** Number of API requests used. */
      nRequestsUsed: v.pipe(
        UnsignedInteger,
        v.description("Number of API requests used."),
      ),
      /** Maximum allowed API requests. */
      nRequestsCap: v.pipe(
        UnsignedInteger,
        v.description("Maximum allowed API requests."),
      ),
    }),
    v.description("User rate limits."),
  );
})();
export type UserRateLimitResponse = v.InferOutput<typeof UserRateLimitResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userRateLimit} function. */
export type UserRateLimitParameters = Omit<v.InferInput<typeof UserRateLimitRequest>, "type">;

/**
 * Request user rate limits.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns User rate limits.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userRateLimit } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await userRateLimit(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function userRateLimit(
  config: InfoRequestConfig,
  params: DeepImmutable<UserRateLimitParameters>,
  signal?: AbortSignal,
): Promise<UserRateLimitResponse> {
  const request = parser(UserRateLimitRequest)({
    type: "userRateLimit",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
