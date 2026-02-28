import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

/**
 * Request prediction market outcome metadata.
 * @see null
 */
export const OutcomeMetaRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("outcomeMeta"),
  });
})();
export type OutcomeMetaRequest = v.InferOutput<typeof OutcomeMetaRequest>;

/**
 * Prediction market outcome metadata including outcomes and questions.
 * @see null
 */
export type OutcomeMetaResponse = {
  /** Array of prediction market outcomes. */
  outcomes: {
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
      token: number;
    }[];
  }[];
  /** Array of prediction market questions. */
  questions: {
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
  }[];
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/**
 * Request prediction market outcome metadata.
 *
 * @param config General configuration for Info API requests.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Prediction market outcome metadata including outcomes and questions.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { outcomeMeta } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await outcomeMeta({ transport });
 * ```
 *
 * @see null
 */
export function outcomeMeta(
  config: InfoConfig,
  signal?: AbortSignal,
): Promise<OutcomeMetaResponse> {
  const request = parse(OutcomeMetaRequest, {
    type: "outcomeMeta",
  });
  return config.transport.request("info", request, signal);
}
