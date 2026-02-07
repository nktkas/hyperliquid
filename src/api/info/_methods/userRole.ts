import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Request user role.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
 */
export const UserRoleRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userRole"),
    /** User address. */
    user: Address,
  });
})();
export type UserRoleRequest = v.InferOutput<typeof UserRoleRequest>;

/**
 * User role.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
 */
export type UserRoleResponse = {
  /** Role identifier. */
  role: "missing" | "user" | "vault";
} | {
  /** Role identifier. */
  role: "agent";
  /** Details for agent role. */
  data: {
    /**
     * Master account address associated with the agent.
     * @pattern ^0x[a-fA-F0-9]{40}$
     */
    user: `0x${string}`;
  };
} | {
  /** Role identifier. */
  role: "subAccount";
  /** Details for sub-account role. */
  data: {
    /**
     * Master account address associated with the sub-account.
     * @pattern ^0x[a-fA-F0-9]{40}$
     */
    master: `0x${string}`;
  };
};

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userRole} function. */
export type UserRoleParameters = Omit<v.InferInput<typeof UserRoleRequest>, "type">;

/**
 * Request user role.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns User role.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userRole } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userRole(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
 */
export function userRole(
  config: InfoConfig,
  params: UserRoleParameters,
  signal?: AbortSignal,
): Promise<UserRoleResponse> {
  const request = v.parse(UserRoleRequest, {
    type: "userRole",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
