import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request liquidatable.
 * @see null
 */
export const LiquidatableRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("liquidatable"),
  });
})();
export type LiquidatableRequest = v.InferOutput<typeof LiquidatableRequest>;

/**
 * Array of liquidatable positions.
 * @see null
 */
export type LiquidatableResponse = {
  /**
   * User address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  user: `0x${string}`;
  /**
   * Position index.
   *
   * FIXME: a `cross` variant may exist (unconfirmed).
   */
  positionIndex: {
    /** Isolated position details. */
    isolated: {
      /** Asset index. */
      asset: number;
    };
  };
  /**
   * Available margin.
   *
   * FIXME: meaning of the two values unconfirmed.
   */
  marginAvailable: [number, number];
}[];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/mod.ts";

/**
 * Request liquidatable.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Unknown array.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
 *
 * @see null
 */
export function liquidatable(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<LiquidatableResponse> {
  const request = parse(LiquidatableRequest, {
    type: "liquidatable",
  });
  return config.transport.request("info", request, signal);
}
