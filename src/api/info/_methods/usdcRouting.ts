import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request USDC transfer routing.
 * @see null
 */
export const UsdcRoutingRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("usdcRouting"),
  });
})();
export type UsdcRoutingRequest = v.InferOutput<typeof UsdcRoutingRequest>;

/**
 * Routes currently used to move USDC in and out of the platform.
 * @see null
 */
export type UsdcRoutingResponse = {
  /**
   * Route used for deposits:
   * - `"bridge"`: Hyperliquid USDC bridge.
   * - `"cctp"`: Circle Cross-Chain Transfer Protocol.
   */
  depositRoute: "bridge" | "cctp";
  /**
   * Route used for withdrawals:
   * - `"bridge"`: Hyperliquid USDC bridge.
   * - `"cctp"`: Circle Cross-Chain Transfer Protocol.
   */
  withdrawalRoute: "bridge" | "cctp";
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/mod.ts";

/**
 * Request USDC transfer routing.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Routes currently used to move USDC in and out of the platform.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { usdcRouting } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await usdcRouting({ transport });
 * ```
 *
 * @see null
 */
export function usdcRouting(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<UsdcRoutingResponse> {
  const request = parse(UsdcRoutingRequest, {
    type: "usdcRouting",
  });
  return config.transport.request("info", request, signal);
}
