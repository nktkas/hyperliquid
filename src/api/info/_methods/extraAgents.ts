import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user extra agents.
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
 */
export const ExtraAgentsResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.object({
      /** Extra agent address. */
      address: Address,
      /** Extra agent name. */
      name: v.pipe(v.string(), v.nonEmpty()),
      /** Validity period as a timestamp (in ms since epoch). */
      validUntil: UnsignedInteger,
    }),
  );
})();
export type ExtraAgentsResponse = v.InferOutput<typeof ExtraAgentsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode extraAgents} function. */
export type ExtraAgentsParameters = Omit<v.InferInput<typeof ExtraAgentsRequest>, "type">;

/**
 * Request user extra agents.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of extra agent details for a user.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
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
 */
export function extraAgents(
  config: InfoConfig,
  params: ExtraAgentsParameters,
  signal?: AbortSignal,
): Promise<ExtraAgentsResponse> {
  const request = v.parse(ExtraAgentsRequest, {
    type: "extraAgents",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
