import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request gossip root IPs.
 */
export const GossipRootIpsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("gossipRootIps"),
        v.description("Type of request."),
      ),
    }),
    v.description("Request gossip root IPs."),
  );
})();
export type GossipRootIpsRequest = v.InferOutput<typeof GossipRootIpsRequest>;

/**
 * Array of gossip root IPs.
 */
export const GossipRootIpsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(v.pipe(v.string(), v.ipv4())),
    v.description("Array of gossip root IPs."),
  );
})();
export type GossipRootIpsResponse = v.InferOutput<typeof GossipRootIpsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/**
 * Request gossip root IPs.
 *
 * @param config - General configuration for Info API requests.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
