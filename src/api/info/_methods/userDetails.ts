import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { ExplorerTransactionSchema } from "./_base/commonSchemas.ts";

/**
 * Request array of user transaction details.
 */
export const UserDetailsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userDetails"),
    /** User address. */
    user: Address,
  });
})();
export type UserDetailsRequest = v.InferOutput<typeof UserDetailsRequest>;

/**
 * Response array of user transaction details.
 */
export const UserDetailsResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of response. */
    type: v.literal("userDetails"),
    /** Array of user transaction details. */
    txs: v.array(ExplorerTransactionSchema),
  });
})();
export type UserDetailsResponse = v.InferOutput<typeof UserDetailsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userDetails} function. */
export type UserDetailsParameters = Omit<v.InferInput<typeof UserDetailsRequest>, "type">;

/**
 * Request array of user transaction details.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of user transaction details.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userDetails } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // only `HttpTransport` supports this API
 * const data = await userDetails(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function userDetails(
  config: InfoConfig,
  params: UserDetailsParameters,
  signal?: AbortSignal,
): Promise<UserDetailsResponse> {
  const request = v.parse(UserDetailsRequest, {
    type: "userDetails",
    ...params,
  });
  return config.transport.request("explorer", request, signal);
}
