import * as v from "valibot";
import { Address, type DeepImmutable, Hex, parser, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";
import type { IRequestTransport } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/**
 * Request array of user transaction details.
 * @see null
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
 * @see null
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
          /** Transaction details. */
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

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userDetails} function. */
export type UserDetailsParameters = Omit<v.InferInput<typeof UserDetailsRequest>, "type">;

/**
 * Request array of user transaction details.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of user transaction details.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
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
export function userDetails<T extends IRequestTransport>(
  config: T extends { request(endpoint: "explorer", ...args: unknown[]): unknown } ? InfoRequestConfig<T> : never,
  params: DeepImmutable<UserDetailsParameters>,
  signal?: AbortSignal,
): Promise<UserDetailsResponse> {
  const request = parser(UserDetailsRequest)({
    type: "userDetails",
    ...params,
  });
  return config.transport.request("explorer", request, signal);
}
