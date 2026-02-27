import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Request user abstraction state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-abstraction-state
 */
export const UserAbstractionRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userAbstraction"),
    /** User address. */
    user: Address,
  });
})();
export type UserAbstractionRequest = v.InferOutput<typeof UserAbstractionRequest>;

/**
 * User abstraction state.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-abstraction-state
 */
export type UserAbstractionResponse =
  | "unifiedAccount"
  | "portfolioMargin"
  | "disabled"
  | "default"
  | "dexAbstraction";

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userAbstraction} function. */
export type UserAbstractionParameters = Omit<v.InferInput<typeof UserAbstractionRequest>, "type">;

/**
 * Request user abstraction state.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return User abstraction state.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userAbstraction } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userAbstraction(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-abstraction-state
 */
export function userAbstraction(
  config: InfoConfig,
  params: UserAbstractionParameters,
  signal?: AbortSignal,
): Promise<UserAbstractionResponse> {
  const request = parse(UserAbstractionRequest, {
    type: "userAbstraction",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
