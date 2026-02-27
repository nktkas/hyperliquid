import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";

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
export type UserFeesResponse = {
  /** Daily user volume metrics. */
  dailyUserVlm: {
    /**
     * Date of the volume metrics.
     * @pattern ^\d{4}-\d{2}-\d{2}$
     */
    date: string;
    /**
     * User cross-trade volume.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    userCross: string;
    /**
     * User add-liquidity volume.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    userAdd: string;
    /**
     * Exchange total volume.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    exchange: string;
  }[];
  /** Fee schedule information. */
  feeSchedule: {
    /**
     * Cross-trade fee rate.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    cross: string;
    /**
     * Add-liquidity fee rate.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    add: string;
    /**
     * Spot cross-trade fee rate.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    spotCross: string;
    /**
     * Spot add-liquidity fee rate.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    spotAdd: string;
    /** Fee tiers details. */
    tiers: {
      /** Array of VIP fee tiers. */
      vip: {
        /**
         * Notional volume cutoff.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        ntlCutoff: string;
        /**
         * Cross-trade fee rate.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        cross: string;
        /**
         * Add-liquidity fee rate.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        add: string;
        /**
         * Spot cross-trade fee rate.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        spotCross: string;
        /**
         * Spot add-liquidity fee rate.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        spotAdd: string;
      }[];
      /** Array of market maker fee tiers. */
      mm: {
        /**
         * Maker fraction cutoff.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        makerFractionCutoff: string;
        /**
         * Add-liquidity fee rate.
         * @pattern ^-?[0-9]+(\.[0-9]+)?$
         */
        add: string;
      }[];
    };
    /**
     * Referral discount rate.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    referralDiscount: string;
    /** Array of staking discount tiers. */
    stakingDiscountTiers: {
      /**
       * Basis points of maximum supply.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      bpsOfMaxSupply: string;
      /**
       * Discount rate applied.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      discount: string;
    }[];
  };
  /**
   * User cross-trade rate.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  userCrossRate: string;
  /**
   * User add-liquidity rate.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  userAddRate: string;
  /**
   * User spot cross-trade rate.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  userSpotCrossRate: string;
  /**
   * User spot add-liquidity rate.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  userSpotAddRate: string;
  /**
   * Active referral discount rate.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  activeReferralDiscount: string;
  /** Trial details. */
  trial: unknown | null;
  /**
   * Fee trial escrow amount.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  feeTrialEscrow: string;
  /** Timestamp when next trial becomes available. */
  nextTrialAvailableTimestamp: unknown | null;
  /**
   * Permanent link between staking and trading accounts.
   * Staking user gains full control of trading account funds.
   * Staking user forfeits own fee discounts.
   */
  stakingLink: {
    /**
     * Linked account address:
     * - When queried by staking account: contains trading account address.
     * - When queried by trading account: contains staking account address.
     * @pattern ^0x[a-fA-F0-9]{40}$
     */
    stakingUser: `0x${string}`;
    /**
     * Link status:
     * - `requested` = link initiated by trading user, awaiting staking user confirmation.
     * - `stakingUser` = response queried by staking account.
     * - `tradingUser` = response queried by trading account.
     */
    type: "requested" | "stakingUser" | "tradingUser";
  } | null;
  /** Active staking discount details. */
  activeStakingDiscount: {
    /**
     * Basis points of maximum supply.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    bpsOfMaxSupply: string;
    /**
     * Discount rate applied.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    discount: string;
  };
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userFees} function. */
export type UserFeesParameters = Omit<v.InferInput<typeof UserFeesRequest>, "type">;

/**
 * Request user fees.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return User fees.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
  const request = parse(UserFeesRequest, {
    type: "userFees",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
