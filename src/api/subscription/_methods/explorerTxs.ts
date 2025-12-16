import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { ExplorerTransactionSchema } from "../../info/_methods/_base/commonSchemas.ts";

/** Subscription to explorer transaction events. */
export const ExplorerTxsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("explorerTxs"),
        v.description("Type of subscription."),
      ),
    }),
    v.description("Subscription to explorer transaction events."),
  );
})();
export type ExplorerTxsRequest = v.InferOutput<typeof ExplorerTxsRequest>;

/** Event of array of transaction details. */
export const ExplorerTxsEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(ExplorerTransactionSchema),
    v.description("Event of array of transaction details."),
  );
})();
export type ExplorerTxsEvent = v.InferOutput<typeof ExplorerTxsEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/**
 * Subscribe to explorer transaction updates.
 *
 * @param config - General configuration for Subscription API subscriptions.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { explorerTxs } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" });  // only `WebSocketTransport`; RPC endpoint
 *
 * const sub = await explorerTxs(
 *   { transport },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function explorerTxs(
  config: SubscriptionConfig,
  listener: (data: ExplorerTxsEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(ExplorerTxsRequest, { type: "explorerTxs" });
  return config.transport.subscribe<ExplorerTxsEvent>("_explorerTxs", payload, (e) => { // Internal channel as it does not have its own channel
    listener(e.detail);
  });
}
