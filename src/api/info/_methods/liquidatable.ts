import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request liquidatable.
 */
export const LiquidatableRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("liquidatable"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request liquidatable."),
  );
})();
export type LiquidatableRequest = v.InferOutput<typeof LiquidatableRequest>;

/**
 * Response for liquidatable request.
 */
export const LiquidatableResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(v.unknown()),
    v.description("Response for liquidatable request."),
  );
})();
export type LiquidatableResponse = v.InferOutput<typeof LiquidatableResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request liquidatable.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns unknown
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { liquidatable } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await liquidatable({ transport });
 * ```
 */
export function liquidatable(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<LiquidatableResponse> {
  const request = v.parse(LiquidatableRequest, {
    type: "liquidatable",
  });
  return config.transport.request("info", request, signal);
}
