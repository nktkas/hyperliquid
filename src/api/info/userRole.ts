import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request user role.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
 */
export const UserRoleRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userRole"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user role."),
  );
})();
export type UserRoleRequest = v.InferOutput<typeof UserRoleRequest>;

/**
 * User role.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
 */
export const UserRoleResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.variant("role", [
      v.object({
        /** Role identifier. */
        role: v.pipe(
          v.union([v.literal("missing"), v.literal("user"), v.literal("vault")]),
          v.description("Role identifier."),
        ),
      }),
      v.object({
        /** Role identifier. */
        role: v.pipe(
          v.literal("agent"),
          v.description("Role identifier."),
        ),
        /** Details for agent role. */
        data: v.pipe(
          v.object({
            /** Master account address associated with the agent. */
            user: v.pipe(
              Address,
              v.description("Master account address associated with the agent."),
            ),
          }),
          v.description("Details for agent role."),
        ),
      }),
      v.object({
        /** Role identifier. */
        role: v.pipe(
          v.literal("subAccount"),
          v.description("Role identifier."),
        ),
        /** Details for sub-account role. */
        data: v.pipe(
          v.object({
            /** Master account address associated with the sub-account. */
            master: v.pipe(
              Address,
              v.description("Master account address associated with the sub-account."),
            ),
          }),
          v.description("Details for sub-account role."),
        ),
      }),
    ]),
    v.description("User role."),
  );
})();
export type UserRoleResponse = v.InferOutput<typeof UserRoleResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userRole} function. */
export type UserRoleParameters = Omit<v.InferInput<typeof UserRoleRequest>, "type">;

/**
 * Request user role.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns User role.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userRole } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await userRole(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function userRole(
  config: InfoRequestConfig,
  params: DeepImmutable<UserRoleParameters>,
  signal?: AbortSignal,
): Promise<UserRoleResponse> {
  const request = parser(UserRoleRequest)({
    type: "userRole",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
