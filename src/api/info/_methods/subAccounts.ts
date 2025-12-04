import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { ClearinghouseStateResponse } from "./clearinghouseState.ts";
import { SpotClearinghouseStateResponse } from "./spotClearinghouseState.ts";

/**
 * Request user sub-accounts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 */
export const SubAccountsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("subAccounts"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user sub-accounts."),
  );
})();
export type SubAccountsRequest = v.InferOutput<typeof SubAccountsRequest>;

/**
 * Array of user sub-account or null if the user does not have any sub-accounts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 */
export const SubAccountsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.nullable(
      v.array(
        /** Sub-account details for a user. */
        v.pipe(
          v.object({
            /** Sub-account name. */
            name: v.pipe(
              v.string(),
              v.minLength(1),
              v.description("Sub-account name."),
            ),
            /** Sub-account address. */
            subAccountUser: v.pipe(
              Address,
              v.description("Sub-account address."),
            ),
            /** Master account address. */
            master: v.pipe(
              Address,
              v.description("Master account address."),
            ),
            /** Perpetual trading clearinghouse state summary. */
            clearinghouseState: ClearinghouseStateResponse,
            /** Spot tokens clearinghouse state. */
            spotState: SpotClearinghouseStateResponse,
          }),
          v.description("Sub-account details for a user."),
        ),
      ),
    ),
    v.description("Array of user sub-account or null if the user does not have any sub-accounts."),
  );
})();
export type SubAccountsResponse = v.InferOutput<typeof SubAccountsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/** Request parameters for the {@linkcode subAccounts} function. */
export type SubAccountsParameters = Omit<v.InferInput<typeof SubAccountsRequest>, "type">;

/**
 * Request user sub-accounts.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Array of user sub-account or null if the user does not have any sub-accounts.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { subAccounts } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await subAccounts(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 */
export function subAccounts(
  config: InfoConfig,
  params: SubAccountsParameters,
  signal?: AbortSignal,
): Promise<SubAccountsResponse> {
  const request = v.parse(SubAccountsRequest, {
    type: "subAccounts",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
