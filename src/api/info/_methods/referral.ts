import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

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
export type ReferralResponse = {
  /** Referrer details. */
  referredBy: {
    /**
     * Referrer address.
     * @pattern ^0x[a-fA-F0-9]{40}$
     */
    referrer: `0x${string}`;
    /** Referral code used. */
    code: string;
  } | null;
  /**
   * Cumulative traded volume.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  cumVlm: string;
  /**
   * Rewards earned but not yet claimed.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  unclaimedRewards: string;
  /**
   * Rewards that have been claimed.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  claimedRewards: string;
  /**
   * Builder reward amount.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  builderRewards: string;
  /** Current state of the referrer. */
  referrerState: {
    /** Referrer is ready to receive rewards. */
    stage: "ready";
    /** Referral program details. */
    data: {
      /** Assigned referral code. */
      code: string;
      /** Total number of referrals. */
      nReferrals: number;
      /** Summary of each referral state. */
      referralStates: {
        /**
         * Cumulative traded volume.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        cumVlm: string;
        /**
         * Total fees rewarded to the referred user since referral.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        cumRewardedFeesSinceReferred: string;
        /**
         * Total fees rewarded to the referrer from referred trades.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        cumFeesRewardedToReferrer: string;
        /** Timestamp when the referred user joined (in ms since epoch). */
        timeJoined: number;
        /**
         * Address of the referred user.
         * @pattern ^0x[a-fA-F0-9]{40}$
         */
        user: `0x${string}`;
        /** Mapping of token IDs to referral reward states. */
        tokenToState: [
          tokenId: number,
          state: {
            /**
             * Cumulative traded volume.
             * @pattern ^[0-9]+(\.[0-9]+)?$
             */
            cumVlm: string;
            /**
             * Total fees rewarded to the referred user since referral.
             * @pattern ^[0-9]+(\.[0-9]+)?$
             */
            cumRewardedFeesSinceReferred: string;
            /**
             * Total fees rewarded to the referrer from referred trades.
             * @pattern ^[0-9]+(\.[0-9]+)?$
             */
            cumFeesRewardedToReferrer: string;
          },
        ][];
      }[];
    };
  } | {
    /** Referrer needs to create a referral code. */
    stage: "needToCreateCode";
  } | {
    /** Referrer must complete a trade before earning rewards. */
    stage: "needToTrade";
    /** Required trading volume details for activation. */
    data: {
      /**
       * Required trading volume.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      required: string;
    };
  };
  /** History of referral rewards. */
  rewardHistory: {
    /**
     * Amount of earned rewards.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    earned: string;
    /**
     * Traded volume at the time of reward.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    vlm: string;
    /**
     * Traded volume via referrals.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    referralVlm: string;
    /** Timestamp when the reward was earned (in ms since epoch). */
    time: number;
  }[];
  /** Mapping of token IDs to referral reward states. */
  tokenToState: [
    tokenId: number,
    state: {
      /**
       * Cumulative traded volume.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      cumVlm: string;
      /**
       * Rewards earned but not yet claimed.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      unclaimedRewards: string;
      /**
       * Rewards that have been claimed.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      claimedRewards: string;
      /**
       * Builder reward amount.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      builderRewards: string;
    },
  ][];
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode referral} function. */
export type ReferralParameters = Omit<v.InferInput<typeof ReferralRequest>, "type">;

/**
 * Request user referral.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Referral details for a user.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
  const request = parse(ReferralRequest, {
    type: "referral",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
