import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/** Subscription to user TWAP history events for a specific user. */
export const UserTwapHistoryRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("userTwapHistory"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to user TWAP history events for a specific user."),
  );
})();
export type UserTwapHistoryRequest = v.InferOutput<typeof UserTwapHistoryRequest>;

/** Event of user TWAP history. */
export const UserTwapHistoryEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Array of user's TWAP history. */
      history: v.pipe(
        v.array(
          /** TWAP history record. */
          v.pipe(
            v.object({
              /** Creation time of the history record (in seconds since epoch). */
              time: v.pipe(
                UnsignedInteger,
                v.description("Creation time of the history record (in seconds since epoch)."),
              ),
              /** State of the TWAP order. */
              state: v.pipe(
                v.object({
                  /** Asset symbol. */
                  coin: v.pipe(
                    v.string(),
                    v.description("Asset symbol."),
                  ),
                  /** Executed notional value. */
                  executedNtl: v.pipe(
                    UnsignedDecimal,
                    v.description("Executed notional value."),
                  ),
                  /** Executed size. */
                  executedSz: v.pipe(
                    UnsignedDecimal,
                    v.description("Executed size."),
                  ),
                  /** Duration in minutes. */
                  minutes: v.pipe(
                    UnsignedInteger,
                    v.description("Duration in minutes."),
                  ),
                  /** Indicates if the TWAP randomizes execution. */
                  randomize: v.pipe(
                    v.boolean(),
                    v.description("Indicates if the TWAP randomizes execution."),
                  ),
                  /** Indicates if the order is reduce-only. */
                  reduceOnly: v.pipe(
                    v.boolean(),
                    v.description("Indicates if the order is reduce-only."),
                  ),
                  /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
                  side: v.pipe(
                    v.union([v.literal("B"), v.literal("A")]),
                    v.description('Order side ("B" = Bid/Buy, "A" = Ask/Sell).'),
                  ),
                  /** Order size. */
                  sz: v.pipe(
                    UnsignedDecimal,
                    v.description("Order size."),
                  ),
                  /** Start time of the TWAP order (in ms since epoch). */
                  timestamp: v.pipe(
                    UnsignedInteger,
                    v.description("Start time of the TWAP order (in ms since epoch)."),
                  ),
                  /** User address. */
                  user: v.pipe(
                    Address,
                    v.description("User address."),
                  ),
                }),
                v.description("State of the TWAP order."),
              ),
              /**
               * Current status of the TWAP order.
               * - `"finished"`: Fully executed.
               * - `"activated"`: Active and executing.
               * - `"terminated"`: Terminated.
               * - `"error"`: An error occurred.
               */
              status: v.pipe(
                v.union([
                  v.object({
                    /** Status of the TWAP order. */
                    status: v.pipe(
                      v.union([
                        v.literal("finished"),
                        v.literal("activated"),
                        v.literal("terminated"),
                      ]),
                      v.description("Status of the TWAP order."),
                    ),
                  }),
                  v.object({
                    /** Status of the TWAP order. */
                    status: v.pipe(
                      v.literal("error"),
                      v.description("Status of the TWAP order."),
                    ),
                    /** Error message. */
                    description: v.pipe(
                      v.string(),
                      v.description("Error message."),
                    ),
                  }),
                ]),
                v.description(
                  "Current status of the TWAP order." +
                    '\n- `"finished"`: Fully executed. ' +
                    '\n- `"activated"`: Active and executing. ' +
                    '\n- `"terminated"`: Terminated. ' +
                    '\n- `"error"`: An error occurred.',
                ),
              ),
            }),
            v.description("TWAP history record."),
          ),
        ),
        v.description("Array of user's TWAP history."),
      ),
      /** Whether this is an initial snapshot. */
      isSnapshot: v.pipe(
        v.optional(v.literal(true)),
        v.description("Whether this is an initial snapshot."),
      ),
    }),
    v.description("Event of user TWAP history."),
  );
})();
export type UserTwapHistoryEvent = v.InferOutput<typeof UserTwapHistoryEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userTwapHistory} function. */
export type UserTwapHistoryParameters = Omit<v.InferInput<typeof UserTwapHistoryRequest>, "type">;

/**
 * Subscribe to TWAP order history updates for a specific user.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { userTwapHistory } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await userTwapHistory(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function userTwapHistory(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<UserTwapHistoryParameters>,
  listener: (data: UserTwapHistoryEvent) => void,
): Promise<Subscription> {
  const payload = parser(UserTwapHistoryRequest)({ type: "userTwapHistory", ...params });
  return config.transport.subscribe<UserTwapHistoryEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user.toLowerCase()) {
      listener(e.detail);
    }
  });
}
