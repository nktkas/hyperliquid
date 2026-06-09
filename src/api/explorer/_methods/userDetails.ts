import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { ExplorerTransaction } from "./_base/mod.ts";

/**
 * Request array of user transaction details.
 * @see null
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
 * @see null
 */
export type UserDetailsResponse = {
  /** Type of response. */
  type: "userDetails";
  /** Array of user transaction details. */
  txs: ExplorerTransaction[];
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { IRequestTransport } from "../../../transport/mod.ts";
import { assertSuccessResponse, type ExplorerConfig } from "./_base/mod.ts";

/** Request parameters for the {@linkcode userDetails} function. */
export type UserDetailsParameters = Omit<v.InferInput<typeof UserDetailsRequest>, "type">;

/**
 * Request array of user transaction details.
 *
 * @param config General configuration for Explorer API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of user transaction details.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userDetails } from "@nktkas/hyperliquid/api/explorer";
 *
 * const transport = new HttpTransport(); // only `HttpTransport` supports this API
 *
 * const data = await userDetails({ transport }, {
 *   user: "0x...",
 * });
 * ```
 *
 * @see null
 */
export async function userDetails(
  config: ExplorerConfig<IRequestTransport<"explorer">>,
  params: UserDetailsParameters,
  signal?: AbortSignal,
): Promise<UserDetailsResponse> {
  const request = parse(UserDetailsRequest, {
    type: "userDetails",
    ...params,
  });
  const response = await config.transport.request<UserDetailsResponse>("explorer", request, signal);
  assertSuccessResponse(response);
  return response;
}
