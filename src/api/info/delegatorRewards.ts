import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

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
      /** Reward received from staking activities. */
      v.pipe(
        v.object({
          /** Timestamp when the reward was received (in ms since epoch). */
          time: v.pipe(
            UnsignedInteger,
            v.description("Timestamp when the reward was received (in ms since epoch)."),
          ),
          /** Source of the reward. */
          source: v.pipe(
            v.union([v.literal("delegation"), v.literal("commission")]),
            v.description("Source of the reward."),
          ),
          /** Total reward amount. */
          totalAmount: v.pipe(
            UnsignedDecimal,
            v.description("Total reward amount."),
          ),
        }),
        v.description("Reward received from staking activities."),
      ),
    ),
    v.description("Array of rewards received from staking activities."),
  );
})();
export type DelegatorRewardsResponse = v.InferOutput<typeof DelegatorRewardsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode delegatorRewards} function. */
export type DelegatorRewardsParameters = Omit<v.InferInput<typeof DelegatorRewardsRequest>, "type">;

/**
 * Request user staking rewards.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of rewards received from staking activities.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { delegatorRewards } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await delegatorRewards(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function delegatorRewards(
  config: InfoRequestConfig,
  params: DeepImmutable<DelegatorRewardsParameters>,
  signal?: AbortSignal,
): Promise<DelegatorRewardsResponse> {
  const request = parser(DelegatorRewardsRequest)({
    type: "delegatorRewards",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
