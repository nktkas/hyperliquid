import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request gossip root IPs.
 */
export const GossipRootIpsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("gossipRootIps"),
  });
})();
export type GossipRootIpsRequest = v.InferOutput<typeof GossipRootIpsRequest>;

/**
 * Array of gossip root IPs.
 */
export type GossipRootIpsResponse = `${number}.${number}.${number}.${number}`[];

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request gossip root IPs.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of gossip root IPs.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { gossipRootIps } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await gossipRootIps({ transport });
 * ```
 */
export function gossipRootIps(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<GossipRootIpsResponse> {
  const request = v.parse(GossipRootIpsRequest, {
    type: "gossipRootIps",
  });
  return config.transport.request("info", request, signal);
}
