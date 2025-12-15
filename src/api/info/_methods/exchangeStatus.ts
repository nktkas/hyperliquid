import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";

/**
 * Request exchange system status information.
 */
export const ExchangeStatusRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("exchangeStatus"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request exchange system status information."),
  );
})();
export type ExchangeStatusRequest = v.InferOutput<typeof ExchangeStatusRequest>;

/**
 * Exchange system status information.
 */
export const ExchangeStatusResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Server time (in ms since epoch). */
      time: v.pipe(
        UnsignedInteger,
        v.description("Server time (in ms since epoch)."),
      ),
      /** Special statuses of the exchange system. */
      specialStatuses: v.pipe(
        v.nullable(v.unknown()),
        v.description("Special statuses of the exchange system."),
      ),
    }),
    v.description("Exchange system status information."),
  );
})();
export type ExchangeStatusResponse = v.InferOutput<typeof ExchangeStatusResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request exchange system status information.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Exchange system status information.
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
