import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user vault deposits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
 */
export const UserVaultEquitiesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userVaultEquities"),
    /** User address. */
    user: Address,
  });
})();
export type UserVaultEquitiesRequest = v.InferOutput<typeof UserVaultEquitiesRequest>;

/**
 * Array of user's vault deposits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
 */
export const UserVaultEquitiesResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.object({
      /** Vault address. */
      vaultAddress: Address,
      /** User deposited equity. */
      equity: UnsignedDecimal,
      /** Timestamp when the user can withdraw their equity. */
      lockedUntilTimestamp: UnsignedInteger,
    }),
  );
})();
export type UserVaultEquitiesResponse = v.InferOutput<typeof UserVaultEquitiesResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userVaultEquities} function. */
export type UserVaultEquitiesParameters = Omit<v.InferInput<typeof UserVaultEquitiesRequest>, "type">;

/**
 * Request user vault deposits.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of user's vault deposits.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userVaultEquities } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userVaultEquities(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
 */
export function userVaultEquities(
  config: InfoConfig,
  params: UserVaultEquitiesParameters,
  signal?: AbortSignal,
): Promise<UserVaultEquitiesResponse> {
  const request = v.parse(UserVaultEquitiesRequest, {
    type: "userVaultEquities",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
