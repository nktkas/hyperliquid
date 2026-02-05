import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

/**
 * Request legal verification status of a user.
 */
export const LegalCheckRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("legalCheck"),
    /** User address. */
    user: Address,
  });
})();
export type LegalCheckRequest = v.InferOutput<typeof LegalCheckRequest>;

/**
 * Legal verification status for a user.
 */
export const LegalCheckResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Whether the user IP address is allowed. */
    ipAllowed: v.boolean(),
    /** Whether the user has accepted the terms of service. */
    acceptedTerms: v.boolean(),
    /** Whether the user is allowed to use the platform. */
    userAllowed: v.boolean(),
  });
})();
export type LegalCheckResponse = v.InferOutput<typeof LegalCheckResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode legalCheck} function. */
export type LegalCheckParameters = Omit<v.InferInput<typeof LegalCheckRequest>, "type">;

/**
 * Request legal verification status of a user.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Legal verification status for a user.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { legalCheck } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await legalCheck(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function legalCheck(
  config: InfoConfig,
  params: LegalCheckParameters,
  signal?: AbortSignal,
): Promise<LegalCheckResponse> {
  const request = v.parse(LegalCheckRequest, {
    type: "legalCheck",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
