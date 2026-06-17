import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Subscription to prediction market outcome metadata updates.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export const OutcomeMetaUpdatesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of subscription. */
    type: v.literal("outcomeMetaUpdates"),
  });
})();
export type OutcomeMetaUpdatesRequest = v.InferOutput<typeof OutcomeMetaUpdatesRequest>;

/**
 * Event of prediction market outcome/question metadata updates.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export type OutcomeMetaUpdatesEvent = {
  /** Array of metadata update events. */
  updates: (
    | {
      /** Outcome created event. */
      outcomeCreated: {
        /** Outcome identifier. */
        outcome: number;
        /** Name of the outcome. */
        name: string;
        /** Description of the outcome. */
        description: string;
        /** Array of side specifications for this outcome. */
        sideSpecs: {
          /** Name of the side. */
          name: string;
          /** Token identifier for this side. */
          token?: number;
        }[];
        /** Quote token for this outcome. */
        quoteToken: string;
      };
    }
    | {
      /** Outcome settled event. */
      outcomeSettled: {
        /** Outcome identifier. */
        outcome: number;
      };
    }
    | {
      /** Question updated event. */
      questionUpdated: {
        /** Question identifier. */
        question: number;
        /** Name of the question. */
        name: string;
        /** Description of the question. */
        description: string;
        /** Fallback outcome identifier. */
        fallbackOutcome: number;
        /** Array of named outcome identifiers. */
        namedOutcomes: number[];
      };
    }
    | {
      /** Question settled event. */
      questionSettled: {
        /** Question identifier. */
        question: number;
      };
    }
  )[];
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ISubscription } from "../../../transport/mod.ts";
import type { SubscriptionConfig, SubscriptionOptions } from "./_base/mod.ts";

/**
 * Subscribe to prediction market outcome/question metadata updates.
 *
 * @param config General configuration for Subscription API subscriptions.
 * @param listener A callback function to be called when the event is received.
 * @param options Options to control the subscription lifecycle.
 * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { outcomeMetaUpdates } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await outcomeMetaUpdates(
 *   { transport },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 */
export function outcomeMetaUpdates(
  config: SubscriptionConfig,
  listener: (data: OutcomeMetaUpdatesEvent) => void,
  options?: SubscriptionOptions,
): Promise<ISubscription> {
  const payload = parse(OutcomeMetaUpdatesRequest, { type: "outcomeMetaUpdates" });
  return config.transport.subscribe<OutcomeMetaUpdatesEvent>(payload.type, payload, (e) => {
    listener(e.detail);
  }, options);
}
