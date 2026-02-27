import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import type { UserFillsResponse } from "./userFills.ts";

/**
 * Request array of user fills by time.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
 */
export const UserFillsByTimeRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userFillsByTime"),
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
export type UserFillsByTimeRequest = v.InferOutput<typeof UserFillsByTimeRequest>;

/**
 * Array of user trade fills by time.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
 */
export type UserFillsByTimeResponse = UserFillsResponse;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userFillsByTime} function. */
export type UserFillsByTimeParameters = Omit<v.InferInput<typeof UserFillsByTimeRequest>, "type">;

/**
 * Request array of user fills by time.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of user trade fills by time.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userFillsByTime } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userFillsByTime(
 *   { transport },
 *   {
 *     user: "0x...",
 *     startTime: Date.now() - 1000 * 60 * 60 * 24,
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
 */
export function userFillsByTime(
  config: InfoConfig,
  params: UserFillsByTimeParameters,
  signal?: AbortSignal,
): Promise<UserFillsByTimeResponse> {
  const request = parse(UserFillsByTimeRequest, {
    type: "userFillsByTime",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
