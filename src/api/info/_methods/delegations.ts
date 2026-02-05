import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user staking delegations.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
 */
export const DelegationsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("delegations"),
    /** User address. */
    user: Address,
  });
})();
export type DelegationsRequest = v.InferOutput<typeof DelegationsRequest>;

/**
 * Array of user's delegations to validators.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
 */
export const DelegationsResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.object({
      /** Validator address. */
      validator: Address,
      /** Amount of tokens delegated to the validator. */
      amount: UnsignedDecimal,
      /** Locked until timestamp (in ms since epoch). */
      lockedUntilTimestamp: UnsignedInteger,
    }),
  );
})();
export type DelegationsResponse = v.InferOutput<typeof DelegationsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode delegations} function. */
export type DelegationsParameters = Omit<v.InferInput<typeof DelegationsRequest>, "type">;

/**
 * Request user staking delegations.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of user's delegations to validators.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { delegations } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await delegations(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
 */
export function delegations(
  config: InfoConfig,
  params: DelegationsParameters,
  signal?: AbortSignal,
): Promise<DelegationsResponse> {
  const request = v.parse(DelegationsRequest, {
    type: "delegations",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
