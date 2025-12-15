import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Request user HIP-3 DEX abstraction state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-hip-3-dex-abstraction-state
 */
export const UserDexAbstractionRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userDexAbstraction"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user HIP-3 DEX abstraction state."),
  );
})();
export type UserDexAbstractionRequest = v.InferOutput<typeof UserDexAbstractionRequest>;

/**
 * User HIP-3 DEX abstraction state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-hip-3-dex-abstraction-state
 */
export const UserDexAbstractionResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.nullable(v.boolean()),
    v.description("User HIP-3 DEX abstraction state."),
  );
})();
export type UserDexAbstractionResponse = v.InferOutput<typeof UserDexAbstractionResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userDexAbstraction} function. */
export type UserDexAbstractionParameters = Omit<v.InferInput<typeof UserDexAbstractionRequest>, "type">;

/**
 * Request user HIP-3 DEX abstraction state.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns User HIP-3 DEX abstraction state.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userDexAbstraction } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userDexAbstraction(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-hip-3-dex-abstraction-state
 */
export function userDexAbstraction(
  config: InfoConfig,
  params: UserDexAbstractionParameters,
  signal?: AbortSignal,
): Promise<UserDexAbstractionResponse> {
  const request = v.parse(UserDexAbstractionRequest, {
    type: "userDexAbstraction",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
