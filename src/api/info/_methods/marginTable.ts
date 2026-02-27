import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";

/**
 * Request margin table data.
 * @see null
 */
export const MarginTableRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("marginTable"),
    /** Margin requirements table. */
    id: UnsignedInteger,
  });
})();

export type MarginTableRequest = v.InferOutput<typeof MarginTableRequest>;

/**
 * Margin requirements table with multiple tiers.
 * @see null
 */
export type MarginTableResponse = {
  /** Description of the margin table. */
  description: string;
  /** Array of margin tiers defining leverage limits. */
  marginTiers: {
    /**
     * Lower position size boundary for this tier.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    lowerBound: string;
    /** Maximum allowed leverage for this tier. */
    maxLeverage: number;
  }[];
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode marginTable} function. */
export type MarginTableParameters = Omit<v.InferInput<typeof MarginTableRequest>, "type">;

/**
 * Request margin table data.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Margin requirements table with multiple tiers.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { marginTable } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await marginTable(
 *   { transport },
 *   { id: 1 },
 * );
 * ```
 *
 * @see null
 */
export function marginTable(
  config: InfoConfig,
  params: MarginTableParameters,
  signal?: AbortSignal,
): Promise<MarginTableResponse> {
  const request = parse(MarginTableRequest, {
    type: "marginTable",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
