import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

import { ClearinghouseStateResponse } from "./clearinghouseState.ts";
import { SpotClearinghouseStateResponse } from "./spotClearinghouseState.ts";

// -------------------- Schemas --------------------

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

// -------------------- Function --------------------

/** Request parameters for the {@linkcode subAccounts} function. */
export type SubAccountsParameters = Omit<v.InferInput<typeof SubAccountsRequest>, "type">;

/**
 * Request user sub-accounts.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of user sub-account or null if the user does not have any sub-accounts.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { subAccounts } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await subAccounts(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function subAccounts(
  config: InfoRequestConfig,
  params: DeepImmutable<SubAccountsParameters>,
  signal?: AbortSignal,
): Promise<SubAccountsResponse> {
  const request = parser(SubAccountsRequest)({
    type: "subAccounts",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
