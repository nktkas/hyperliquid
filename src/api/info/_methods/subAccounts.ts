import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { ClearinghouseStateResponse } from "./clearinghouseState.ts";
import type { SpotClearinghouseStateResponse } from "./spotClearinghouseState.ts";

/**
 * Request user sub-accounts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 */
export const SubAccountsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("subAccounts"),
    /** User address. */
    user: Address,
  });
})();
export type SubAccountsRequest = v.InferOutput<typeof SubAccountsRequest>;

/**
 * Array of user sub-account or null if the user does not have any sub-accounts.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
 */
export type SubAccountsResponse = {
  /** Sub-account name. */
  name: string;
  /**
   * Sub-account address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  subAccountUser: `0x${string}`;
  /**
   * Master account address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  master: `0x${string}`;
  /** Perpetual trading clearinghouse state summary. */
  clearinghouseState: ClearinghouseStateResponse;
  /** Spot tokens clearinghouse state. */
  spotState: SpotClearinghouseStateResponse;
}[] | null;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode subAccounts} function. */
export type SubAccountsParameters = Omit<v.InferInput<typeof SubAccountsRequest>, "type">;

/**
 * Request user sub-accounts.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of user sub-account or null if the user does not have any sub-accounts.
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
