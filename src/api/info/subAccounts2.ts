import * as v from "valibot";
import { Address, type DeepImmutable, parser } from "../_base.ts";
import type { InfoRequestConfig } from "./_types.ts";

import { ClearinghouseStateResponse } from "./clearinghouseState.ts";
import { SpotClearinghouseStateResponse } from "./spotClearinghouseState.ts";

// -------------------- Schemas --------------------

/**
 * Request user sub-accounts V2.
 * @see null
 */
export const SubAccounts2Request = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("subAccounts2"),
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
export type SubAccounts2Request = v.InferOutput<typeof SubAccounts2Request>;

/**
 * Array of user sub-account or null if the user does not have any sub-accounts.
 * @see null
 */
export const SubAccounts2Response = /* @__PURE__ */ (() => {
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
            /** DEX to clearinghouse state mapping. Always includes the main DEX (empty dex name). */
            dexToClearinghouseState: v.pipe(
              v.array(
                v.tuple([
                  v.string(),
                  ClearinghouseStateResponse,
                ]),
              ),
              v.minLength(1),
              v.description("DEX to clearinghouse state mapping. Always includes the main DEX (empty dex name)."),
            ),
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
export type SubAccounts2Response = v.InferOutput<typeof SubAccounts2Response>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode subAccounts2} function. */
export type SubAccounts2Parameters = Omit<v.InferInput<typeof SubAccounts2Response>, "type">;

/**
 * Request user sub-accounts V2.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of user sub-account or null if the user does not have any sub-accounts.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @seenull
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { subAccounts2 } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await subAccounts2(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function subAccounts2(
  config: InfoRequestConfig,
  params: DeepImmutable<SubAccounts2Parameters>,
  signal?: AbortSignal,
): Promise<SubAccounts2Response> {
  const request = parser(SubAccounts2Request)({
    type: "subAccounts2",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
