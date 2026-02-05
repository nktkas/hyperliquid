import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request multi-sig signers for a user.
 */
export const UserToMultiSigSignersRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userToMultiSigSigners"),
    /** User address. */
    user: Address,
  });
})();
export type UserToMultiSigSignersRequest = v.InferOutput<typeof UserToMultiSigSignersRequest>;

/**
 * Multi-sig signers for a user or null if the user does not have any multi-sig signers.
 */
export const UserToMultiSigSignersResponse = /* @__PURE__ */ (() => {
  return v.nullable(
    v.object({
      /** Authorized users addresses. */
      authorizedUsers: v.pipe(v.array(Address), v.nonEmpty()),
      /** Threshold number of signatures required. */
      threshold: v.pipe(UnsignedInteger, v.minValue(1)),
    }),
  );
})();
export type UserToMultiSigSignersResponse = v.InferOutput<typeof UserToMultiSigSignersResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userToMultiSigSigners} function. */
export type UserToMultiSigSignersParameters = Omit<v.InferInput<typeof UserToMultiSigSignersRequest>, "type">;

/**
 * Request multi-sig signers for a user.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
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
