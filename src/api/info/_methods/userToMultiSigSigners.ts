import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request multi-sig signers for a user.
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

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/** Request parameters for the {@linkcode userToMultiSigSigners} function. */
export type UserToMultiSigSignersParameters = Omit<v.InferInput<typeof UserToMultiSigSignersRequest>, "type">;

/**
 * Request multi-sig signers for a user.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Multi-sig signers for a user or null if the user does not have any multi-sig signers.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userToMultiSigSigners } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userToMultiSigSigners(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function userToMultiSigSigners(
  config: InfoConfig,
  params: UserToMultiSigSignersParameters,
  signal?: AbortSignal,
): Promise<UserToMultiSigSignersResponse> {
  const request = v.parse(UserToMultiSigSignersRequest, {
    type: "userToMultiSigSigners",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
