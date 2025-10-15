import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";
import type { IRequestTransport } from "../../transport/base.ts";

import { TxDetailsResponse } from "./txDetails.ts";

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
        v.array(TxDetailsResponse.entries.tx),
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
