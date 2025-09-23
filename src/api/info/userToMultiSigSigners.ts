import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request multi-sig signers for a user.
 * @see null
 */
export const UserToMultiSigSignersRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userToMultiSigSigners"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request multi-sig signers for a user."),
  );
})();
export type UserToMultiSigSignersRequest = v.InferOutput<typeof UserToMultiSigSignersRequest>;

/**
 * Multi-sig signers for a user or null if the user does not have any multi-sig signers.
 * @see null
 */
export const UserToMultiSigSignersResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.nullable(
      v.object({
        /** Authorized users addresses. */
        authorizedUsers: v.pipe(
          v.array(Address),
          v.minLength(1),
          v.description("Authorized users addresses."),
        ),
        /** Threshold number of signatures required. */
        threshold: v.pipe(
          UnsignedInteger,
          v.minValue(1),
          v.description("Threshold number of signatures required."),
        ),
      }),
    ),
    v.description("Multi-sig signers for a user or null if the user does not have any multi-sig signers."),
  );
})();
export type UserToMultiSigSignersResponse = v.InferOutput<typeof UserToMultiSigSignersResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userToMultiSigSigners} function. */
export type UserToMultiSigSignersParameters = Omit<v.InferInput<typeof UserToMultiSigSignersRequest>, "type">;

/**
 * Request multi-sig signers for a user.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Multi-sig signers for a user or null if the user does not have any multi-sig signers.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userToMultiSigSigners } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await userToMultiSigSigners(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function userToMultiSigSigners(
  config: InfoRequestConfig,
  params: DeepImmutable<UserToMultiSigSignersParameters>,
  signal?: AbortSignal,
): Promise<UserToMultiSigSignersResponse | null> {
  const request = parser(UserToMultiSigSignersRequest)({
    type: "userToMultiSigSigners",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
