import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import type { ExplorerTransaction } from "../../info/_methods/_base/mod.ts";

/**
 * Subscription to explorer transaction events.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const ExplorerTxsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("explorerTxs"),
  });
})();
export type ExplorerTxsRequest = v.InferOutput<typeof ExplorerTxsRequest>;

/**
 * Event of array of transaction details.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export type ExplorerTxsEvent = ExplorerTransaction[];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ISubscription, WebSocketRequestError } from "../../../transport/mod.ts";
import type { SubscriptionConfig } from "./_base/mod.ts";

/**
 * Subscribe to explorer transaction updates.
 *
 * @param config General configuration for Subscription API subscriptions.
 * @param listener A callback function to be called when the event is received.
 * @param onError An optional callback function to be called when the subscription fails.
 * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { explorerTxs } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" }); // RPC endpoint
 *
 * const sub = await explorerTxs(
 *   { transport },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function explorerTxs(
  config: SubscriptionConfig,
  listener: (data: ExplorerTxsEvent) => void,
  onError?: (error: WebSocketRequestError) => void,
): Promise<ISubscription> {
  const payload = parse(ExplorerTxsRequest, { type: "explorerTxs" });
  return config.transport.subscribe<ExplorerTxsEvent>("explorerTxs_", payload, (e) => { // Internal channel as it does not have its own channel
    listener(e.detail);
  }, onError);
}
