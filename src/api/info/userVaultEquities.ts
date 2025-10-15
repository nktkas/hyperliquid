import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request user vault deposits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
 */
export const UserVaultEquitiesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userVaultEquities"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user vault deposits."),
  );
})();
export type UserVaultEquitiesRequest = v.InferOutput<typeof UserVaultEquitiesRequest>;

/**
 * Array of user's vault deposits.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
 */
export const UserVaultEquitiesResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** User's vault deposit. */
      v.pipe(
        v.object({
          /** Vault address. */
          vaultAddress: v.pipe(
            Address,
            v.description("Vault address."),
          ),
          /** User deposited equity. */
          equity: v.pipe(
            UnsignedDecimal,
            v.description("User deposited equity."),
          ),
          /** Timestamp when the user can withdraw their equity. */
          lockedUntilTimestamp: v.pipe(
            UnsignedInteger,
            v.description("Timestamp when the user can withdraw their equity."),
          ),
        }),
        v.description("User's vault deposit."),
      ),
    ),
    v.description("Array of user's vault deposits."),
  );
})();
export type UserVaultEquitiesResponse = v.InferOutput<typeof UserVaultEquitiesResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userVaultEquities} function. */
export type UserVaultEquitiesParameters = Omit<v.InferInput<typeof UserVaultEquitiesRequest>, "type">;

/**
 * Request user vault deposits.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of user's vault deposits.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userVaultEquities } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await userVaultEquities(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function userVaultEquities(
  config: InfoRequestConfig,
  params: DeepImmutable<UserVaultEquitiesParameters>,
  signal?: AbortSignal,
): Promise<UserVaultEquitiesResponse> {
  const request = parser(UserVaultEquitiesRequest)({
    type: "userVaultEquities",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
