import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import { ClearinghouseStateResponse } from "./clearinghouseState.ts";
import { SpotClearinghouseStateResponse } from "./spotClearinghouseState.ts";

/**
 * Request user sub-accounts (V2).
 */
export const SubAccounts2Request = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("subAccounts2"),
    /** User address. */
    user: Address,
  });
})();
export type SubAccounts2Request = v.InferOutput<typeof SubAccounts2Request>;

/**
 * Array of user sub-account or null if the user does not have any sub-accounts.
 */
export const SubAccounts2Response = /* @__PURE__ */ (() => {
  return v.nullable(
    v.array(
      v.object({
        /** Sub-account name. */
        name: v.pipe(v.string(), v.nonEmpty()),
        /** Sub-account address. */
        subAccountUser: Address,
        /** Master account address. */
        master: Address,
        /** DEX to clearinghouse state mapping. Always includes the main DEX (empty dex name). */
        dexToClearinghouseState: v.pipe(
          v.array(v.tuple([v.string(), ClearinghouseStateResponse])),
          v.nonEmpty(),
        ),
        /** Spot tokens clearinghouse state. */
        spotState: SpotClearinghouseStateResponse,
      }),
    ),
  );
})();
export type SubAccounts2Response = v.InferOutput<typeof SubAccounts2Response>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode subAccounts2} function. */
export type SubAccounts2Parameters = Omit<v.InferInput<typeof SubAccounts2Response>, "type">;

/**
 * Request user sub-accounts V2.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of user sub-account or null if the user does not have any sub-accounts.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @seenull
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { subAccounts2 } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await subAccounts2(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function subAccounts2(
  config: InfoConfig,
  params: SubAccounts2Parameters,
  signal?: AbortSignal,
): Promise<SubAccounts2Response> {
  const request = v.parse(SubAccounts2Request, {
    type: "subAccounts2",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
