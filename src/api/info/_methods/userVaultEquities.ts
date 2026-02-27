import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

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
export type UserVaultEquitiesResponse = {
  /**
   * Vault address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  vaultAddress: `0x${string}`;
  /**
   * User deposited equity.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  equity: string;
  /** Timestamp when the user can withdraw their equity. */
  lockedUntilTimestamp: number;
}[];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userVaultEquities} function. */
export type UserVaultEquitiesParameters = Omit<v.InferInput<typeof UserVaultEquitiesRequest>, "type">;

/**
 * Request user vault deposits.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of user's vault deposits.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
  const request = parse(UserVaultEquitiesRequest, {
    type: "userVaultEquities",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
