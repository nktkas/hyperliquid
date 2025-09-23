import * as v from "valibot";
import { parser } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request gossip root IPs.
 * @see null
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
 * @see null
 */
export const GossipRootIpsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(v.pipe(v.string(), v.ipv4())),
    v.description("Array of gossip root IPs."),
  );
})();
export type GossipRootIpsResponse = v.InferOutput<typeof GossipRootIpsResponse>;

// -------------------- Function --------------------

/**
 * Request gossip root IPs.
 * @param config - General configuration for Info API requests.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of gossip root IPs.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { gossipRootIps } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await gossipRootIps({ transport });
 * ```
 */
export function gossipRootIps(
  config: InfoRequestConfig,
  signal?: AbortSignal,
): Promise<GossipRootIpsResponse> {
  const request = parser(GossipRootIpsRequest)({
    type: "gossipRootIps",
  });
  return config.transport.request("info", request, signal);
}
