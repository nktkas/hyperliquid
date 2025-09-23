import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request user referral.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
 */
export const ReferralRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("referral"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user referral."),
  );
})();
export type ReferralRequest = v.InferOutput<typeof ReferralRequest>;

/**
 * Referral details for a user.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
 */
export const ReferralResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Referrer details. */
      referredBy: v.pipe(
        v.union([
          v.object({
            /** Referrer address. */
            referrer: v.pipe(
              Address,
              v.description("Referrer address."),
            ),
            /** Referral code used. */
            code: v.pipe(
              v.string(),
              v.minLength(1),
              v.description("Referral code used."),
            ),
          }),
          v.null(),
        ]),
        v.description("Referrer details."),
      ),
      /** Cumulative traded volume. */
      cumVlm: v.pipe(
        UnsignedDecimal,
        v.description("Cumulative traded volume."),
      ),
      /** Rewards earned but not yet claimed. */
      unclaimedRewards: v.pipe(
        UnsignedDecimal,
        v.description("Rewards earned but not yet claimed."),
      ),
      /** Rewards that have been claimed. */
      claimedRewards: v.pipe(
        UnsignedDecimal,
        v.description("Rewards that have been claimed."),
      ),
      /** Builder reward amount. */
      builderRewards: v.pipe(
        UnsignedDecimal,
        v.description("Builder reward amount."),
      ),
      /** Current state of the referrer. */
      referrerState: v.pipe(
        v.union([
          v.object({
            /** Referrer is ready to receive rewards. */
            stage: v.pipe(
              v.literal("ready"),
              v.description("Referrer is ready to receive rewards."),
            ),
            /** Referral program details. */
            data: v.pipe(
              v.object({
                /** Assigned referral code. */
                code: v.pipe(
                  v.string(),
                  v.minLength(1),
                  v.description("Assigned referral code."),
                ),
                /** Total number of referrals. */
                nReferrals: v.pipe(
                  UnsignedInteger,
                  v.description("Total number of referrals."),
                ),
                /** Summary of each referral state. */
                referralStates: v.pipe(
                  v.array(
                    /** Referral state for a referred user. */
                    v.pipe(
                      v.object({
                        /** Cumulative traded volume. */
                        cumVlm: v.pipe(
                          UnsignedDecimal,
                          v.description("Cumulative traded volume."),
                        ),
                        /** Total fees rewarded to the referred user since referral. */
                        cumRewardedFeesSinceReferred: v.pipe(
                          UnsignedDecimal,
                          v.description("Total fees rewarded to the referred user since referral."),
                        ),
                        /** Total fees rewarded to the referrer from referred trades. */
                        cumFeesRewardedToReferrer: v.pipe(
                          UnsignedDecimal,
                          v.description("Total fees rewarded to the referrer from referred trades."),
                        ),
                        /** Timestamp when the referred user joined (in ms since epoch). */
                        timeJoined: v.pipe(
                          UnsignedInteger,
                          v.description(
                            "Timestamp when the referred user joined (in ms since epoch).",
                          ),
                        ),
                        /** Address of the referred user. */
                        user: v.pipe(
                          Address,
                          v.description("Address of the referred user."),
                        ),
                        /** Mapping of token IDs to referral reward states. */
                        tokenToState: v.pipe(
                          v.array(
                            /** Tuple of token ID and its referral reward state. */
                            v.pipe(
                              v.tuple([
                                UnsignedInteger,
                                v.object({
                                  /** Cumulative traded volume. */
                                  cumVlm: v.pipe(
                                    UnsignedDecimal,
                                    v.description("Cumulative traded volume."),
                                  ),
                                  /** Total fees rewarded to the referred user since referral. */
                                  cumRewardedFeesSinceReferred: v.pipe(
                                    UnsignedDecimal,
                                    v.description(
                                      "Total fees rewarded to the referred user since referral.",
                                    ),
                                  ),
                                  /** Total fees rewarded to the referrer from referred trades. */
                                  cumFeesRewardedToReferrer: v.pipe(
                                    UnsignedDecimal,
                                    v.description(
                                      "Total fees rewarded to the referrer from referred trades.",
                                    ),
                                  ),
                                }),
                              ]),
                              v.description("Tuple of token ID and its referral reward state."),
                            ),
                          ),
                          v.description("Mapping of token IDs to referral reward states."),
                        ),
                      }),
                      v.description("Referral state for a referred user."),
                    ),
                  ),
                  v.description("Summary of each referral state."),
                ),
              }),
              v.description("Referral program details."),
            ),
          }),
          v.object({
            /** Referrer needs to create a referral code. */
            stage: v.pipe(
              v.literal("needToCreateCode"),
              v.description("Referrer needs to create a referral code."),
            ),
          }),
          v.object({
            /** Referrer must complete a trade before earning rewards. */
            stage: v.pipe(
              v.literal("needToTrade"),
              v.description("Referrer must complete a trade before earning rewards."),
            ),
            /** Required trading volume details for activation. */
            data: v.pipe(
              v.object({
                /** Required trading volume. */
                required: v.pipe(
                  UnsignedDecimal,
                  v.description("Required trading volume."),
                ),
              }),
              v.description("Required trading volume details for activation."),
            ),
          }),
        ]),
        v.description("Current state of the referrer."),
      ),
      /** History of referral rewards. */
      rewardHistory: v.pipe(
        v.array(
          /** Referral reward entry. */
          v.pipe(
            v.object({
              /** Amount of earned rewards. */
              earned: v.pipe(
                UnsignedDecimal,
                v.description("Amount of earned rewards."),
              ),
              /** Traded volume at the time of reward. */
              vlm: v.pipe(
                UnsignedDecimal,
                v.description("Traded volume at the time of reward."),
              ),
              /** Traded volume via referrals. */
              referralVlm: v.pipe(
                UnsignedDecimal,
                v.description("Traded volume via referrals."),
              ),
              /** Timestamp when the reward was earned (in ms since epoch). */
              time: v.pipe(
                UnsignedInteger,
                v.description("Timestamp when the reward was earned (in ms since epoch)."),
              ),
            }),
            v.description("Referral reward entry."),
          ),
        ),
        v.description("History of referral rewards."),
      ),
      /** Mapping of token IDs to referral reward states. */
      tokenToState: v.pipe(
        v.array(
          /** Tuple of token ID and its referral reward state. */
          v.pipe(
            v.tuple([
              UnsignedInteger,
              v.object({
                /** Cumulative traded volume. */
                cumVlm: v.pipe(
                  UnsignedDecimal,
                  v.description("Cumulative traded volume."),
                ),
                /** Rewards earned but not yet claimed. */
                unclaimedRewards: v.pipe(
                  UnsignedDecimal,
                  v.description("Rewards earned but not yet claimed."),
                ),
                /** Rewards that have been claimed. */
                claimedRewards: v.pipe(
                  UnsignedDecimal,
                  v.description("Rewards that have been claimed."),
                ),
                /** Builder reward amount. */
                builderRewards: v.pipe(
                  UnsignedDecimal,
                  v.description("Builder reward amount."),
                ),
              }),
            ]),
            v.description("Tuple of token ID and its referral reward state."),
          ),
        ),
        v.description("Mapping of token IDs to referral reward states."),
      ),
    }),
    v.description("Referral details for a user."),
  );
})();
export type ReferralResponse = v.InferOutput<typeof ReferralResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode referral} function. */
export type ReferralParameters = Omit<v.InferInput<typeof ReferralRequest>, "type">;

/**
 * Request user referral.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Referral details for a user.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { referral } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await referral(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function referral(
  config: InfoRequestConfig,
  params: DeepImmutable<ReferralParameters>,
  signal?: AbortSignal,
): Promise<ReferralResponse> {
  const request = parser(ReferralRequest)({
    type: "referral",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
