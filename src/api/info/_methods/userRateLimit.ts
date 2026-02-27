import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Request user rate limits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
 */
export const UserRateLimitRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userRateLimit"),
    /** User address. */
    user: Address,
  });
})();
export type UserRateLimitRequest = v.InferOutput<typeof UserRateLimitRequest>;

/**
 * User rate limits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
 */
export type UserRateLimitResponse = {
  /**
   * Cumulative trading volume.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  cumVlm: string;
  /** Number of API requests used. */
  nRequestsUsed: number;
  /** Maximum allowed API requests. */
  nRequestsCap: number;
  /** Number of surplus API requests. */
  nRequestsSurplus: number;
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userRateLimit} function. */
export type UserRateLimitParameters = Omit<v.InferInput<typeof UserRateLimitRequest>, "type">;

/**
 * Request user rate limits.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return User rate limits.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userRateLimit } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userRateLimit(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
 */
export function userRateLimit(
  config: InfoConfig,
  params: UserRateLimitParameters,
  signal?: AbortSignal,
): Promise<UserRateLimitResponse> {
  const request = parse(UserRateLimitRequest, {
    type: "userRateLimit",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
