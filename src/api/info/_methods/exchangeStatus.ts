import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request exchange system status information.
 * @see null
 */
export const ExchangeStatusRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("exchangeStatus"),
  });
})();
export type ExchangeStatusRequest = v.InferOutput<typeof ExchangeStatusRequest>;

/**
 * Exchange system status information.
 * @see null
 */
export type ExchangeStatusResponse = {
  /** Server time (in ms since epoch). */
  time: number;
  /** Special statuses of the exchange system. */
  specialStatuses: unknown | null;
};

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request exchange system status information.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Exchange system status information.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { exchangeStatus } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await exchangeStatus({ transport });
 * ```
 *
 * @see null
 */
export function exchangeStatus(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<ExchangeStatusResponse> {
  const request = v.parse(ExchangeStatusRequest, {
    type: "exchangeStatus",
  });
  return config.transport.request("info", request, signal);
}
