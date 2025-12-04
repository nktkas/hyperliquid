import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request array of user transaction details.
 */
export const UserDetailsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userDetails"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request array of user transaction details."),
  );
})();
export type UserDetailsRequest = v.InferOutput<typeof UserDetailsRequest>;

/**
 * Response array of user transaction details.
 */
export const UserDetailsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of response. */
      type: v.pipe(
        v.literal("userDetails"),
        v.description("Type of response."),
      ),
      /** Array of user transaction details. */
      txs: v.pipe(
        v.array(
          v.pipe(
            v.object({
              /** Action performed in transaction. */
              action: v.pipe(
                v.looseObject({
                  /** Action type. */
                  type: v.pipe(
                    v.string(),
                    v.description("Action type."),
                  ),
                }),
                v.description("Action performed in transaction."),
              ),
              /** Block number where transaction was included. */
              block: v.pipe(
                UnsignedInteger,
                v.description("Block number where transaction was included."),
              ),
              /** Error message if transaction failed. */
              error: v.pipe(
                v.nullable(v.string()),
                v.description("Error message if transaction failed."),
              ),
              /** Transaction hash. */
              hash: v.pipe(
                v.pipe(Hex, v.length(66)),
                v.description("Transaction hash."),
              ),
              /** Transaction creation timestamp. */
              time: v.pipe(
                UnsignedInteger,
                v.description("Transaction creation timestamp."),
              ),
              /** Creator's address. */
              user: v.pipe(
                Address,
                v.description("Creator's address."),
              ),
            }),
            v.description("Transaction details."),
          ),
        ),
        v.description("Array of user transaction details."),
      ),
    }),
    v.description("Response array of user transaction details."),
  );
})();
export type UserDetailsResponse = v.InferOutput<typeof UserDetailsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";
import type { HttpTransport } from "../../../transport/http/mod.ts";

/** Request parameters for the {@linkcode userDetails} function. */
export type UserDetailsParameters = Omit<v.InferInput<typeof UserDetailsRequest>, "type">;

/**
 * Request array of user transaction details.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
  config: InfoConfig<HttpTransport>,
  params: UserDetailsParameters,
  signal?: AbortSignal,
): Promise<UserDetailsResponse> {
  const request = v.parse(UserDetailsRequest, {
    type: "userDetails",
    ...params,
  });
  return config.transport.request("explorer", request, signal);
}
