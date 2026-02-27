import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Request user extra agents.
 * @see null
 */
export const ExtraAgentsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("extraAgents"),
    /** User address. */
    user: Address,
  });
})();
export type ExtraAgentsRequest = v.InferOutput<typeof ExtraAgentsRequest>;

/**
 * Array of extra agent details for a user.
 * @see null
 */
export type ExtraAgentsResponse = {
  /**
   * Extra agent address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  address: `0x${string}`;
  /** Extra agent name. */
  name: string;
  /** Validity period as a timestamp (in ms since epoch). */
  validUntil: number;
}[];

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode extraAgents} function. */
export type ExtraAgentsParameters = Omit<v.InferInput<typeof ExtraAgentsRequest>, "type">;

/**
 * Request user extra agents.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Array of extra agent details for a user.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { extraAgents } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await extraAgents(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see null
 */
export function extraAgents(
  config: InfoConfig,
  params: ExtraAgentsParameters,
  signal?: AbortSignal,
): Promise<ExtraAgentsResponse> {
  const request = parse(ExtraAgentsRequest, {
    type: "extraAgents",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
