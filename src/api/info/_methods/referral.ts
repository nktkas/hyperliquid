import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user referral.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
 */
export const ReferralRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("referral"),
    /** User address. */
    user: Address,
  });
})();
export type ReferralRequest = v.InferOutput<typeof ReferralRequest>;

/**
 * Referral details for a user.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
 */
export const ReferralResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Referrer details. */
    referredBy: v.nullable(
      v.object({
        /** Referrer address. */
        referrer: Address,
        /** Referral code used. */
        code: v.pipe(v.string(), v.nonEmpty()),
      }),
    ),
    /** Cumulative traded volume. */
    cumVlm: UnsignedDecimal,
    /** Rewards earned but not yet claimed. */
    unclaimedRewards: UnsignedDecimal,
    /** Rewards that have been claimed. */
    claimedRewards: UnsignedDecimal,
    /** Builder reward amount. */
    builderRewards: UnsignedDecimal,
    /** Current state of the referrer. */
    referrerState: v.variant("stage", [
      v.object({
        /** Referrer is ready to receive rewards. */
        stage: v.literal("ready"),
        /** Referral program details. */
        data: v.object({
          /** Assigned referral code. */
          code: v.pipe(v.string(), v.nonEmpty()),
          /** Total number of referrals. */
          nReferrals: UnsignedInteger,
          /** Summary of each referral state. */
          referralStates: v.array(
            v.object({
              /** Cumulative traded volume. */
              cumVlm: UnsignedDecimal,
              /** Total fees rewarded to the referred user since referral. */
              cumRewardedFeesSinceReferred: UnsignedDecimal,
              /** Total fees rewarded to the referrer from referred trades. */
              cumFeesRewardedToReferrer: UnsignedDecimal,
              /** Timestamp when the referred user joined (in ms since epoch). */
              timeJoined: UnsignedInteger,
              /** Address of the referred user. */
              user: Address,
              /** Mapping of token IDs to referral reward states. */
              tokenToState: v.array(
                v.tuple([
                  UnsignedInteger,
                  v.object({
                    /** Cumulative traded volume. */
                    cumVlm: UnsignedDecimal,
                    /** Total fees rewarded to the referred user since referral. */
                    cumRewardedFeesSinceReferred: UnsignedDecimal,
                    /** Total fees rewarded to the referrer from referred trades. */
                    cumFeesRewardedToReferrer: UnsignedDecimal,
                  }),
                ]),
              ),
            }),
          ),
        }),
      }),
      v.object({
        /** Referrer needs to create a referral code. */
        stage: v.literal("needToCreateCode"),
      }),
      v.object({
        /** Referrer must complete a trade before earning rewards. */
        stage: v.literal("needToTrade"),
        /** Required trading volume details for activation. */
        data: v.object({
          /** Required trading volume. */
          required: UnsignedDecimal,
        }),
      }),
    ]),
    /** History of referral rewards. */
    rewardHistory: v.array(
      v.object({
        /** Amount of earned rewards. */
        earned: UnsignedDecimal,
        /** Traded volume at the time of reward. */
        vlm: UnsignedDecimal,
        /** Traded volume via referrals. */
        referralVlm: UnsignedDecimal,
        /** Timestamp when the reward was earned (in ms since epoch). */
        time: UnsignedInteger,
      }),
    ),
    /** Mapping of token IDs to referral reward states. */
    tokenToState: v.array(
      v.tuple([
        UnsignedInteger,
        v.object({
          /** Cumulative traded volume. */
          cumVlm: UnsignedDecimal,
          /** Rewards earned but not yet claimed. */
          unclaimedRewards: UnsignedDecimal,
          /** Rewards that have been claimed. */
          claimedRewards: UnsignedDecimal,
          /** Builder reward amount. */
          builderRewards: UnsignedDecimal,
        }),
      ]),
    ),
  });
})();
export type ReferralResponse = v.InferOutput<typeof ReferralResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode referral} function. */
export type ReferralParameters = Omit<v.InferInput<typeof ReferralRequest>, "type">;

/**
 * Request user referral.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Referral details for a user.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { referral } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await referral(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
 */
export function referral(
  config: InfoConfig,
  params: ReferralParameters,
  signal?: AbortSignal,
): Promise<ReferralResponse> {
  const request = v.parse(ReferralRequest, {
    type: "referral",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
