import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, parser, UnsignedDecimal } from "../_base.ts";
import type { InfoRequestConfig } from "./_types.ts";

// -------------------- Schemas --------------------

/**
 * Request user fees.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
 */
export const UserFeesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userFees"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user fees."),
  );
})();
export type UserFeesRequest = v.InferOutput<typeof UserFeesRequest>;

/**
 * User fees.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
 */
export const UserFeesResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Daily user volume metrics. */
      dailyUserVlm: v.pipe(
        v.array(
          /** Daily user volume metrics record. */
          v.pipe(
            v.object({
              /** Date in YYYY-M-D format. */
              date: v.pipe(
                v.string(),
                v.isoDate(),
                v.description("Date in YYYY-M-D format."),
              ),
              /** User cross-trade volume. */
              userCross: v.pipe(
                UnsignedDecimal,
                v.description("User cross-trade volume."),
              ),
              /** User add-liquidity volume. */
              userAdd: v.pipe(
                UnsignedDecimal,
                v.description("User add-liquidity volume."),
              ),
              /** Exchange total volume. */
              exchange: v.pipe(
                UnsignedDecimal,
                v.description("Exchange total volume."),
              ),
            }),
            v.description("Daily user volume metrics record."),
          ),
        ),
        v.description("Daily user volume metrics."),
      ),
      /** Fee schedule information. */
      feeSchedule: v.pipe(
        v.object({
          /** Cross-trade fee rate. */
          cross: v.pipe(
            UnsignedDecimal,
            v.description("Cross-trade fee rate."),
          ),
          /** Add-liquidity fee rate. */
          add: v.pipe(
            UnsignedDecimal,
            v.description("Add-liquidity fee rate."),
          ),
          /** Spot cross-trade fee rate. */
          spotCross: v.pipe(
            UnsignedDecimal,
            v.description("Spot cross-trade fee rate."),
          ),
          /** Spot add-liquidity fee rate. */
          spotAdd: v.pipe(
            UnsignedDecimal,
            v.description("Spot add-liquidity fee rate."),
          ),
          /** Fee tiers details. */
          tiers: v.pipe(
            v.object({
              /** Array of VIP fee tiers. */
              vip: v.pipe(
                v.array(
                  /** VIP fee tier. */
                  v.pipe(
                    v.object({
                      /** Notional volume cutoff. */
                      ntlCutoff: v.pipe(
                        UnsignedDecimal,
                        v.description("Notional volume cutoff."),
                      ),
                      /** Cross-trade fee rate. */
                      cross: v.pipe(
                        UnsignedDecimal,
                        v.description("Cross-trade fee rate."),
                      ),
                      /** Add-liquidity fee rate. */
                      add: v.pipe(
                        UnsignedDecimal,
                        v.description("Add-liquidity fee rate."),
                      ),
                      /** Spot cross-trade fee rate. */
                      spotCross: v.pipe(
                        UnsignedDecimal,
                        v.description("Spot cross-trade fee rate."),
                      ),
                      /** Spot add-liquidity fee rate. */
                      spotAdd: v.pipe(
                        UnsignedDecimal,
                        v.description("Spot add-liquidity fee rate."),
                      ),
                    }),
                    v.description("VIP fee tier."),
                  ),
                ),
                v.description("Array of VIP fee tiers."),
              ),
              /** Array of market maker fee tiers. */
              mm: v.pipe(
                v.array(
                  /** Market maker fee tier. */
                  v.pipe(
                    v.object({
                      /** Maker fraction cutoff. */
                      makerFractionCutoff: v.pipe(
                        UnsignedDecimal,
                        v.description("Maker fraction cutoff."),
                      ),
                      /** Add-liquidity fee rate. */
                      add: v.pipe(
                        Decimal,
                        v.description("Add-liquidity fee rate."),
                      ),
                    }),
                    v.description("Market maker fee tier."),
                  ),
                ),
                v.description("Array of market maker fee tiers."),
              ),
            }),
            v.description("Fee tiers details."),
          ),
          /** Referral discount rate. */
          referralDiscount: v.pipe(
            UnsignedDecimal,
            v.description("Referral discount rate."),
          ),
          /** Array of staking discount tiers. */
          stakingDiscountTiers: v.pipe(
            v.array(
              /** Staking discount tier. */
              v.pipe(
                v.object({
                  /** Basis points of maximum supply. */
                  bpsOfMaxSupply: v.pipe(
                    UnsignedDecimal,
                    v.description("Basis points of maximum supply."),
                  ),
                  /** Discount rate applied. */
                  discount: v.pipe(
                    UnsignedDecimal,
                    v.description("Discount rate applied."),
                  ),
                }),
                v.description("Staking discount tier."),
              ),
            ),
            v.description("Staking discount tiers details."),
          ),
        }),
        v.description("Array of staking discount tiers."),
      ),
      /** User cross-trade rate. */
      userCrossRate: v.pipe(
        UnsignedDecimal,
        v.description("User cross-trade rate."),
      ),
      /** User add-liquidity rate. */
      userAddRate: v.pipe(
        UnsignedDecimal,
        v.description("User add-liquidity rate."),
      ),
      /** User spot cross-trade rate. */
      userSpotCrossRate: v.pipe(
        UnsignedDecimal,
        v.description("User spot cross-trade rate."),
      ),
      /** User spot add-liquidity rate. */
      userSpotAddRate: v.pipe(
        UnsignedDecimal,
        v.description("User spot add-liquidity rate."),
      ),
      /** Active referral discount rate. */
      activeReferralDiscount: v.pipe(
        UnsignedDecimal,
        v.description("Active referral discount rate."),
      ),
      /** Trial details. */
      trial: v.pipe(
        v.nullable(v.unknown()),
        v.description("Trial details."),
      ),
      /** Fee trial escrow amount. */
      feeTrialEscrow: v.pipe(
        UnsignedDecimal,
        v.description("Fee trial escrow amount."),
      ),
      /** Timestamp when next trial becomes available. */
      nextTrialAvailableTimestamp: v.pipe(
        v.nullable(v.unknown()),
        v.description("Timestamp when next trial becomes available."),
      ),
      /**
       * Permanent link between staking and trading accounts.
       * Staking user gains full control of trading account funds.
       * Staking user forfeits own fee discounts.
       */
      stakingLink: v.pipe(
        v.nullable(
          v.object({
            /**
             * Linked account address:
             * - When queried by staking account: contains trading account address.
             * - When queried by trading account: contains staking account address.
             */
            stakingUser: v.pipe(
              Address,
              v.description(
                "Linked account address:" +
                  "\n- When queried by staking account: contains trading account address." +
                  "\n- When queried by trading account: contains staking account address.",
              ),
            ),
            /**
             * Link status:
             * - `requested` = link initiated by trading user, awaiting staking user confirmation.
             * - `stakingUser` = response queried by staking account.
             * - `tradingUser` = response queried by trading account.
             */
            type: v.pipe(
              v.union([
                v.literal("requested"),
                v.literal("stakingUser"),
                v.literal("tradingUser"),
              ]),
              v.description(
                "Link status:" +
                  "\n- `requested` = link initiated by trading user, awaiting staking user confirmation" +
                  "\n- `stakingUser` = response queried by staking account" +
                  "\n- `tradingUser` = response queried by trading account",
              ),
            ),
          }),
        ),
        v.description(
          "Permanent link between staking and trading accounts. Staking user gains full control of trading account funds. Staking user forfeits own fee discounts.",
        ),
      ),
      /** Active staking discount details. */
      activeStakingDiscount: v.pipe(
        v.object({
          /** Basis points of maximum supply. */
          bpsOfMaxSupply: v.pipe(
            UnsignedDecimal,
            v.description("Basis points of maximum supply."),
          ),
          /** Discount rate applied. */
          discount: v.pipe(
            UnsignedDecimal,
            v.description("Discount rate applied."),
          ),
        }),
        v.description("Active staking discount details."),
      ),
    }),
    v.description("User fees."),
  );
})();
export type UserFeesResponse = v.InferOutput<typeof UserFeesResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userFees} function. */
export type UserFeesParameters = Omit<v.InferInput<typeof UserFeesRequest>, "type">;

/**
 * Request user fees.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns User fees.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userFees } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await userFees(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function userFees(
  config: InfoRequestConfig,
  params: DeepImmutable<UserFeesParameters>,
  signal?: AbortSignal,
): Promise<UserFeesResponse> {
  const request = parser(UserFeesRequest)({
    type: "userFees",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
