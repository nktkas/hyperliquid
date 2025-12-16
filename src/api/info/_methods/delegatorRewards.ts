import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user staking rewards.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards
 */
export const DelegatorRewardsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("delegatorRewards"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user staking rewards."),
  );
})();
export type DelegatorRewardsRequest = v.InferOutput<typeof DelegatorRewardsRequest>;

/**
 * Array of rewards received from staking activities.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards
 */
export const DelegatorRewardsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.object({
        /** Timestamp when the reward was received (in ms since epoch). */
        time: v.pipe(
          UnsignedInteger,
          v.description("Timestamp when the reward was received (in ms since epoch)."),
        ),
        /** Source of the reward. */
        source: v.pipe(
          v.picklist(["delegation", "commission"]),
          v.description("Source of the reward."),
        ),
        /** Total reward amount. */
        totalAmount: v.pipe(
          UnsignedDecimal,
          v.description("Total reward amount."),
        ),
      }),
    ),
    v.description("Array of rewards received from staking activities."),
  );
})();
export type DelegatorRewardsResponse = v.InferOutput<typeof DelegatorRewardsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode delegatorRewards} function. */
export type DelegatorRewardsParameters = Omit<v.InferInput<typeof DelegatorRewardsRequest>, "type">;

/**
 * Request user staking rewards.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of rewards received from staking activities.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { delegatorRewards } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await delegatorRewards(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards
 */
export function delegatorRewards(
  config: InfoConfig,
  params: DelegatorRewardsParameters,
  signal?: AbortSignal,
): Promise<DelegatorRewardsResponse> {
  const request = v.parse(DelegatorRewardsRequest, {
    type: "delegatorRewards",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
