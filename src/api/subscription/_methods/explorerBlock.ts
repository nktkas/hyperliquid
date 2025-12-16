import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";

/** Subscription to explorer block events. */
export const ExplorerBlockRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("explorerBlock"),
        v.description("Type of subscription."),
      ),
    }),
    v.description("Subscription to explorer block events."),
  );
})();
export type ExplorerBlockRequest = v.InferOutput<typeof ExplorerBlockRequest>;

/** Event of array of block details. */
export const ExplorerBlockEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.object({
        /** Block creation timestamp. */
        blockTime: v.pipe(
          UnsignedInteger,
          v.description("Block creation timestamp."),
        ),
        /** Block hash. */
        hash: v.pipe(
          Hex,
          v.length(66),
          v.description("Block hash."),
        ),
        /** Block height in chain. */
        height: v.pipe(
          UnsignedInteger,
          v.description("Block height in chain."),
        ),
        /** Total transactions in block. */
        numTxs: v.pipe(
          UnsignedInteger,
          v.description("Total transactions in block."),
        ),
        /** Block proposer address. */
        proposer: v.pipe(
          Address,
          v.description("Block proposer address."),
        ),
      }),
    ),
    v.description("Event of array of block details."),
  );
})();
export type ExplorerBlockEvent = v.InferOutput<typeof ExplorerBlockEvent>;

// ============================================================
// Execution Logic
// ============================================================

import type { SubscriptionConfig } from "./_types.ts";
import type { ISubscription } from "../../../transport/mod.ts";

/**
 * Subscribe to explorer block updates.
 *
 * @param config - General configuration for Subscription API subscriptions.
 * @param listener - A callback function to be called when the event is received.
 *
 * @returns A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { explorerBlock } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" });  // only `WebSocketTransport`; RPC endpoint
 *
 * const sub = await explorerBlock(
 *   { transport },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function explorerBlock(
  config: SubscriptionConfig,
  listener: (data: ExplorerBlockEvent) => void,
): Promise<ISubscription> {
  const payload = v.parse(ExplorerBlockRequest, { type: "explorerBlock" });
  return config.transport.subscribe<ExplorerBlockEvent>("_explorerBlock", payload, (e) => { // Internal channel as it does not have its own channel
    listener(e.detail);
  });
}
