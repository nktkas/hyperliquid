import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Cloid, UnsignedDecimal } from "../../_schemas.ts";
import { UserFillSchema } from "./_base/commonSchemas.ts";

/**
 * Request array of user fills.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 */
export const UserFillsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userFills"),
    /** User address. */
    user: Address,
    /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
    aggregateByTime: v.optional(v.boolean()),
  });
})();
export type UserFillsRequest = v.InferOutput<typeof UserFillsRequest>;

/**
 * Array of user trade fills.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 */
export const UserFillsResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.intersect([
      UserFillSchema,
      v.object({
        /** Client Order ID. */
        cloid: v.optional(Cloid),
        /** Liquidation details. */
        liquidation: v.optional(
          v.object({
            /** Address of the liquidated user. */
            liquidatedUser: Address,
            /** Mark price at the time of liquidation. */
            markPx: UnsignedDecimal,
            /** Liquidation method. */
            method: v.picklist(["market", "backstop"]),
          }),
        ),
      }),
    ]),
  );
})();
export type UserFillsResponse = v.InferOutput<typeof UserFillsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userFills} function. */
export type UserFillsParameters = Omit<v.InferInput<typeof UserFillsRequest>, "type">;

/**
 * Request array of user fills.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of user trade fills.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userFills } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userFills(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 */
export function userFills(
  config: InfoConfig,
  params: UserFillsParameters,
  signal?: AbortSignal,
): Promise<UserFillsResponse> {
  const request = v.parse(UserFillsRequest, {
    type: "userFills",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
