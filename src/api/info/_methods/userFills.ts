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
    v.array(
      v.intersect([
        UserFillSchema,
        v.object({
          /** Client Order ID. */
          cloid: v.pipe(
            v.optional(Cloid),
            v.description("Client Order ID."),
          ),
          /** Liquidation details. */
          liquidation: v.pipe(
            v.optional(
              v.object({
                /** Address of the liquidated user. */
                liquidatedUser: v.pipe(
                  Address,
                  v.description("Address of the liquidated user."),
                ),
                /** Mark price at the time of liquidation. */
                markPx: v.pipe(
                  UnsignedDecimal,
                  v.description("Mark price at the time of liquidation."),
                ),
                /** Liquidation method. */
                method: v.pipe(
                  v.picklist(["market", "backstop"]),
                  v.description("Liquidation method."),
                ),
              }),
            ),
            v.description("Liquidation details."),
          ),
        }),
      ]),
    ),
    v.description("Array of user trade fills."),
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
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
