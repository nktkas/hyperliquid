import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, UnsignedDecimal } from "../../_schemas.ts";

/**
 * Request user fees.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
 */
export const UserFeesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userFees"),
    /** User address. */
    user: Address,
  });
})();
export type UserFeesRequest = v.InferOutput<typeof UserFeesRequest>;

/**
 * User fees.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
 */
export const UserFeesResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Daily user volume metrics. */
    dailyUserVlm: v.array(
      v.object({
        /** Date in YYYY-M-D format. */
        date: v.pipe(v.string(), v.isoDate()),
        /** User cross-trade volume. */
        userCross: UnsignedDecimal,
        /** User add-liquidity volume. */
        userAdd: UnsignedDecimal,
        /** Exchange total volume. */
        exchange: UnsignedDecimal,
      }),
    ),
    /** Fee schedule information. */
    feeSchedule: v.object({
      /** Cross-trade fee rate. */
      cross: UnsignedDecimal,
      /** Add-liquidity fee rate. */
      add: UnsignedDecimal,
      /** Spot cross-trade fee rate. */
      spotCross: UnsignedDecimal,
      /** Spot add-liquidity fee rate. */
      spotAdd: UnsignedDecimal,
      /** Fee tiers details. */
      tiers: v.object({
        /** Array of VIP fee tiers. */
        vip: v.array(
          v.object({
            /** Notional volume cutoff. */
            ntlCutoff: UnsignedDecimal,
            /** Cross-trade fee rate. */
            cross: UnsignedDecimal,
            /** Add-liquidity fee rate. */
            add: UnsignedDecimal,
            /** Spot cross-trade fee rate. */
            spotCross: UnsignedDecimal,
            /** Spot add-liquidity fee rate. */
            spotAdd: UnsignedDecimal,
          }),
        ),
        /** Array of market maker fee tiers. */
        mm: v.array(
          v.object({
            /** Maker fraction cutoff. */
            makerFractionCutoff: UnsignedDecimal,
            /** Add-liquidity fee rate. */
            add: Decimal,
          }),
        ),
      }),
      /** Referral discount rate. */
      referralDiscount: UnsignedDecimal,
      /** Array of staking discount tiers. */
      stakingDiscountTiers: v.array(
        v.object({
          /** Basis points of maximum supply. */
          bpsOfMaxSupply: UnsignedDecimal,
          /** Discount rate applied. */
          discount: UnsignedDecimal,
        }),
      ),
    }),
    /** User cross-trade rate. */
    userCrossRate: UnsignedDecimal,
    /** User add-liquidity rate. */
    userAddRate: UnsignedDecimal,
    /** User spot cross-trade rate. */
    userSpotCrossRate: UnsignedDecimal,
    /** User spot add-liquidity rate. */
    userSpotAddRate: UnsignedDecimal,
    /** Active referral discount rate. */
    activeReferralDiscount: UnsignedDecimal,
    /** Trial details. */
    trial: v.nullable(v.unknown()),
    /** Fee trial escrow amount. */
    feeTrialEscrow: UnsignedDecimal,
    /** Timestamp when next trial becomes available. */
    nextTrialAvailableTimestamp: v.nullable(v.unknown()),
    /**
     * Permanent link between staking and trading accounts.
     * Staking user gains full control of trading account funds.
     * Staking user forfeits own fee discounts.
     */
    stakingLink: v.nullable(
      v.object({
        /**
         * Linked account address:
         * - When queried by staking account: contains trading account address.
         * - When queried by trading account: contains staking account address.
         */
        stakingUser: Address,
        /**
         * Link status:
         * - `requested` = link initiated by trading user, awaiting staking user confirmation.
         * - `stakingUser` = response queried by staking account.
         * - `tradingUser` = response queried by trading account.
         */
        type: v.picklist(["requested", "stakingUser", "tradingUser"]),
      }),
    ),
    /** Active staking discount details. */
    activeStakingDiscount: v.object({
      /** Basis points of maximum supply. */
      bpsOfMaxSupply: UnsignedDecimal,
      /** Discount rate applied. */
      discount: UnsignedDecimal,
    }),
  });
})();
export type UserFeesResponse = v.InferOutput<typeof UserFeesResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userFees} function. */
export type UserFeesParameters = Omit<v.InferInput<typeof UserFeesRequest>, "type">;

/**
 * Request user fees.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns User fees.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userFees } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userFees(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
 */
export function userFees(
  config: InfoConfig,
  params: UserFeesParameters,
  signal?: AbortSignal,
): Promise<UserFeesResponse> {
  const request = v.parse(UserFeesRequest, {
    type: "userFees",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
