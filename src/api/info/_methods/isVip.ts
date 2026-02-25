import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Request to check if a user is a VIP.
 * @see null
 */
export const IsVipRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("isVip"),
    /** User address. */
    user: Address,
  });
})();
export type IsVipRequest = v.InferOutput<typeof IsVipRequest>;

/**
 * Boolean indicating user's VIP status.
 * @see null
 */
export type IsVipResponse = boolean | null;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode isVip} function. */
export type IsVipParameters = Omit<v.InferInput<typeof IsVipRequest>, "type">;

/**
 * Request to check if a user is a VIP.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Boolean indicating user's VIP status.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { isVip } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await isVip(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see null
 */
export function isVip(
  config: InfoConfig,
  params: IsVipParameters,
  signal?: AbortSignal,
): Promise<IsVipResponse> {
  const request = v.parse(IsVipRequest, {
    type: "isVip",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
