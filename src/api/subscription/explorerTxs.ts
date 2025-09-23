import * as v from "valibot";
import { Address, Hex, parser, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/** Subscription to explorer transaction events (RPC endpoint). */
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
    v.array(
      /** Transaction details. */
      v.pipe(
        v.object({
          /** Action performed in transaction. */
          action: v.pipe(
            v.looseObject({
              /** Action type. */
              type: v.pipe(
                v.string(),
                v.description("Action type."),
              ),
            }),
            v.description("Action performed in transaction."),
          ),
          /** Block number where transaction was included. */
          block: v.pipe(
            UnsignedInteger,
            v.description("Block number where transaction was included."),
          ),
          /** Error message if transaction failed. */
          error: v.pipe(
            v.nullable(v.string()),
            v.description("Error message if transaction failed."),
          ),
          /** Transaction hash. */
          hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("Transaction hash."),
          ),
          /** Transaction creation timestamp. */
          time: v.pipe(
            UnsignedInteger,
            v.description("Transaction creation timestamp."),
          ),
          /** Creator's address. */
          user: v.pipe(
            Address,
            v.description("Creator's address."),
          ),
        }),
        v.description("Transaction details."),
      ),
    ),
    v.description("Event of array of transaction details."),
  );
})();
export type ExplorerTxsEvent = v.InferOutput<typeof ExplorerTxsEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode explorerTxs} function. */
export type ExplorerTxsParameters = Omit<v.InferInput<typeof ExplorerTxsRequest>, "type">;

/**
 * Subscribe to explorer transaction updates.
 * @param config - General configuration for Subscription API subscriptions.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 * @note Make sure the endpoint in the {@link transport} supports this method.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
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
 */
export function explorerTxs(
  config: SubscriptionRequestConfig,
  listener: (data: ExplorerTxsEvent) => void,
): Promise<Subscription> {
  const payload = parser(ExplorerTxsRequest)({ type: "explorerTxs" });
  return config.transport.subscribe<ExplorerTxsEvent>("_explorerTxs", payload, (e) => { // Internal channel as it does not have its own channel
    listener(e.detail);
  });
}
