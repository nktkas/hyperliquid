import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { UserFillSchema } from "./_base/commonSchemas.ts";

/**
 * Request user TWAP slice fills.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export const UserTwapSliceFillsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userTwapSliceFills"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user TWAP slice fills."),
  );
})();
export type UserTwapSliceFillsRequest = v.InferOutput<typeof UserTwapSliceFillsRequest>;

/**
 * Array of user's twap slice fills.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export const UserTwapSliceFillsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.object({
        /** TWAP fill record. */
        fill: v.pipe(
          UserFillSchema,
          v.description("TWAP fill record."),
        ),
        /** ID of the TWAP. */
        twapId: v.pipe(
          UnsignedInteger,
          v.description("ID of the TWAP."),
        ),
      }),
    ),
    v.description("Array of user's twap slice fills."),
  );
})();
export type UserTwapSliceFillsResponse = v.InferOutput<typeof UserTwapSliceFillsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userTwapSliceFills} function. */
export type UserTwapSliceFillsParameters = Omit<v.InferInput<typeof UserTwapSliceFillsRequest>, "type">;

/**
 * Request user TWAP slice fills.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Array of user's twap slice fills.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userTwapSliceFills } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userTwapSliceFills(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export function userTwapSliceFills(
  config: InfoConfig,
  params: UserTwapSliceFillsParameters,
  signal?: AbortSignal,
): Promise<UserTwapSliceFillsResponse> {
  const request = v.parse(UserTwapSliceFillsRequest, {
    type: "userTwapSliceFills",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
