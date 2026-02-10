import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import type { UserTwapSliceFillsResponse } from "./userTwapSliceFills.ts";

/**
 * Request user TWAP slice fills by time.
 */
export const UserTwapSliceFillsByTimeRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userTwapSliceFillsByTime"),
    /** User address. */
    user: Address,
    /** Start time (in ms since epoch). */
    startTime: UnsignedInteger,
    /** End time (in ms since epoch). */
    endTime: v.nullish(UnsignedInteger),
    /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
    aggregateByTime: v.optional(v.boolean()),
  });
})();
export type UserTwapSliceFillsByTimeRequest = v.InferOutput<typeof UserTwapSliceFillsByTimeRequest>;

/**
 * Array of user's twap slice fill by time.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export type UserTwapSliceFillsByTimeResponse = UserTwapSliceFillsResponse;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userTwapSliceFillsByTime} function. */
export type UserTwapSliceFillsByTimeParameters = Omit<v.InferInput<typeof UserTwapSliceFillsByTimeRequest>, "type">;

/**
 * Request user TWAP slice fills by time.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of user's twap slice fill by time.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userTwapSliceFillsByTime } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userTwapSliceFillsByTime(
 *   { transport },
 *   {
 *     user: "0x...",
 *     startTime: Date.now() - 1000 * 60 * 60 * 24,
 *   },
 * );
 * ```
 */
export function userTwapSliceFillsByTime(
  config: InfoConfig,
  params: UserTwapSliceFillsByTimeParameters,
  signal?: AbortSignal,
): Promise<UserTwapSliceFillsByTimeResponse> {
  const request = v.parse(UserTwapSliceFillsByTimeRequest, {
    type: "userTwapSliceFillsByTime",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
