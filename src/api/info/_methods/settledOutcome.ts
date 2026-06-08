import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";

/**
 * Request information about a settled outcome.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-settled-outcome
 */
export const SettledOutcomeRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("settledOutcome"),
    /** Outcome identifier. */
    outcome: UnsignedInteger,
  });
})();
export type SettledOutcomeRequest = v.InferOutput<typeof SettledOutcomeRequest>;

/**
 * Information about a settled outcome (null if the outcome is not settled).
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-settled-outcome
 */
export type SettledOutcomeResponse = {
  /** Outcome specification. */
  spec: {
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
  /**
   * Settlement fraction.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  settleFraction: string;
  /** Settlement details. */
  details: string;
} | null;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/mod.ts";

/** Request parameters for the {@linkcode settledOutcome} function. */
export type SettledOutcomeParameters = Omit<v.InferInput<typeof SettledOutcomeRequest>, "type">;

/**
 * Request information about a settled outcome.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Information about a settled outcome.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { settledOutcome } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await settledOutcome({ transport }, {
 *   outcome: 0,
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-settled-outcome
 */
export function settledOutcome(
  config: InfoConfig,
  params: SettledOutcomeParameters,
  signal?: AbortSignal,
): Promise<SettledOutcomeResponse> {
  const request = parse(SettledOutcomeRequest, {
    type: "settledOutcome",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
