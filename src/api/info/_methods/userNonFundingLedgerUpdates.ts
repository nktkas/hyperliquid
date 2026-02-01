import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user non-funding ledger updates.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export const UserNonFundingLedgerUpdatesRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("userNonFundingLedgerUpdates"),
    /** User address. */
    user: Address,
    /** Start time (in ms since epoch). */
    startTime: v.optional(UnsignedInteger),
    /** End time (in ms since epoch). */
    endTime: v.nullish(UnsignedInteger),
  });
})();
export type UserNonFundingLedgerUpdatesRequest = v.InferOutput<typeof UserNonFundingLedgerUpdatesRequest>;

/**
 * Array of user's non-funding ledger update.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export const UserNonFundingLedgerUpdatesResponse = /* @__PURE__ */ (() => {
  return v.array(
    v.object({
      /** Timestamp of the update (in ms since epoch). */
      time: UnsignedInteger,
      /** L1 transaction hash. */
      hash: v.pipe(Hex, v.length(66)),
      /** Update details. */
      delta: v.variant("type", [
        /** Transfer between spot and perpetual accounts. */
        v.object({
          /** Update type. */
          type: v.literal("accountClassTransfer"),
          /** Amount transferred in USDC. */
          usdc: UnsignedDecimal,
          /** Indicates if the transfer is to the perpetual account. */
          toPerp: v.boolean(),
        }),
        /** Deposit to an account. */
        v.object({
          /** Update type. */
          type: v.literal("deposit"),
          /** Amount deposited in USDC. */
          usdc: UnsignedDecimal,
        }),
        /** Internal transfer between accounts. */
        v.object({
          /** Update type. */
          type: v.literal("internalTransfer"),
          /** Amount transferred in USDC. */
          usdc: UnsignedDecimal,
          /** Initiator address. */
          user: Address,
          /** Destination address. */
          destination: Address,
          /** Transfer fee. */
          fee: UnsignedDecimal,
        }),
        /** Liquidation event. */
        v.object({
          /** Update type. */
          type: v.literal("liquidation"),
          /** Total notional value of liquidated positions. */
          liquidatedNtlPos: UnsignedDecimal,
          /** Account value at liquidation time. */
          accountValue: UnsignedDecimal,
          /** Leverage type for liquidated positions. */
          leverageType: v.picklist(["Cross", "Isolated"]),
          /** Details of each liquidated position. */
          liquidatedPositions: v.array(
            v.object({
              /** Asset symbol of the liquidated position. */
              coin: v.string(),
              /** Signed position size liquidated. */
              szi: Decimal,
            }),
          ),
        }),
        /** Rewards claim event. */
        v.object({
          /** Update type. */
          type: v.literal("rewardsClaim"),
          /** Amount of rewards claimed. */
          amount: UnsignedDecimal,
          /** Token symbol. */
          token: v.string(),
        }),
        /** Spot transfer between accounts. */
        v.object({
          /** Update type. */
          type: v.literal("spotTransfer"),
          /** Token symbol. */
          token: v.string(),
          /** Amount transferred. */
          amount: UnsignedDecimal,
          /** Equivalent USDC value. */
          usdcValue: UnsignedDecimal,
          /** Initiator address. */
          user: Address,
          /** Destination address. */
          destination: Address,
          /** Transfer fee. */
          fee: UnsignedDecimal,
          /** Fee in native token. */
          nativeTokenFee: UnsignedDecimal,
          /** Nonce of the transfer. */
          nonce: v.nullable(UnsignedInteger),
          /** Token in which the fee is denominated (e.g., "USDC"). */
          feeToken: v.string(),
        }),
        /** Transfer between sub-accounts. */
        v.object({
          /** Update type. */
          type: v.literal("subAccountTransfer"),
          /** Amount transferred in USDC. */
          usdc: UnsignedDecimal,
          /** Initiator address. */
          user: Address,
          /** Destination address. */
          destination: Address,
        }),
        /** Vault creation event. */
        v.object({
          /** Update type. */
          type: v.literal("vaultCreate"),
          /** Address of the created vault. */
          vault: Address,
          /** Initial allocated amount in USDC. */
          usdc: UnsignedDecimal,
          /** Vault creation fee. */
          fee: UnsignedDecimal,
        }),
        /** Vault deposit event. */
        v.object({
          /** Update type. */
          type: v.literal("vaultDeposit"),
          /** Address of the target vault. */
          vault: Address,
          /** Amount deposited in USDC. */
          usdc: UnsignedDecimal,
        }),
        /** Vault distribution event. */
        v.object({
          /** Update type. */
          type: v.literal("vaultDistribution"),
          /** Address of the vault distributing funds. */
          vault: Address,
          /** Amount distributed in USDC. */
          usdc: UnsignedDecimal,
        }),
        /** Vault withdrawal event. */
        v.object({
          /** Update type. */
          type: v.literal("vaultWithdraw"),
          /** Vault address. */
          vault: Address,
          /** Address of the user withdrawing funds. */
          user: Address,
          /** Withdrawal request amount in USD. */
          requestedUsd: UnsignedDecimal,
          /** Withdrawal commission fee. */
          commission: UnsignedDecimal,
          /** Closing cost associated with positions. */
          closingCost: UnsignedDecimal,
          /** Basis value for withdrawal calculation. */
          basis: UnsignedDecimal,
          /** Net withdrawn amount in USD after fees and costs. */
          netWithdrawnUsd: UnsignedDecimal,
        }),
        /** Withdrawal from an account. */
        v.object({
          /** Update type. */
          type: v.literal("withdraw"),
          /** Amount withdrawn in USDC. */
          usdc: UnsignedDecimal,
          /** Nonce (timestamp in ms) used to prevent replay attacks. */
          nonce: UnsignedInteger,
          /** Withdrawal fee. */
          fee: UnsignedDecimal,
        }),
        /** Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts. */
        v.object({
          /** Update type. */
          type: v.literal("send"),
          /** Address of the sender. */
          user: Address,
          /** Destination address. */
          destination: Address,
          /** Source DEX ("" for default USDC perp DEX, "spot" for spot). */
          sourceDex: v.string(),
          /** Destination DEX ("" for default USDC perp DEX, "spot" for spot). */
          destinationDex: v.string(),
          /** Token identifier. */
          token: v.string(),
          /** Amount to send (not in wei). */
          amount: UnsignedDecimal,
          /** Equivalent USDC value. */
          usdcValue: UnsignedDecimal,
          /** Transfer fee. */
          fee: UnsignedDecimal,
          /** Fee in native token. */
          nativeTokenFee: UnsignedDecimal,
          /** Nonce of the transfer. */
          nonce: UnsignedInteger,
          /** Token in which the fee is denominated (e.g., "USDC"). */
          feeToken: v.string(),
        }),
        /** Deploy gas auction update. */
        v.object({
          /** Update type. */
          type: v.literal("deployGasAuction"),
          /** Token symbol. */
          token: v.string(),
          /** Amount in the specified token. */
          amount: UnsignedDecimal,
        }),
        /** C-staking transfer update. */
        v.object({
          /** Update type. */
          type: v.literal("cStakingTransfer"),
          /** Token symbol. */
          token: v.string(),
          /** Amount in the specified token. */
          amount: UnsignedDecimal,
          /** `true` for deposit, `false` for withdrawal. */
          isDeposit: v.boolean(),
        }),
        /** Borrow/lend operation update. */
        v.object({
          /** Update type. */
          type: v.literal("borrowLend"),
          /** Token symbol. */
          token: v.string(),
          /** Operation type. */
          operation: v.picklist(["supply", "withdraw", "repay", "borrow"]),
          /** Amount in the specified token. */
          amount: UnsignedDecimal,
          /** Interest amount in the specified token. */
          interestAmount: UnsignedDecimal,
        }),
        /** Spot genesis operation update. */
        v.object({
          /** Update type. */
          type: v.literal("spotGenesis"),
          /** Token symbol. */
          token: v.string(),
          /** Amount in the specified token. */
          amount: UnsignedDecimal,
        }),
        /** Activate DEX abstraction update. */
        v.object({
          /** Update type. */
          type: v.literal("activateDexAbstraction"),
          /** Name of the dex. */
          dex: v.string(),
          /** Token symbol. */
          token: v.string(),
          /** Amount in the specified token. */
          amount: UnsignedDecimal,
        }),
      ]),
    }),
  );
})();
export type UserNonFundingLedgerUpdatesResponse = v.InferOutput<typeof UserNonFundingLedgerUpdatesResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode userNonFundingLedgerUpdates} function. */
export type UserNonFundingLedgerUpdatesParameters = Omit<
  v.InferInput<typeof UserNonFundingLedgerUpdatesRequest>,
  "type"
>;

/**
 * Request user non-funding ledger updates.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Array of user's non-funding ledger update.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userNonFundingLedgerUpdates } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userNonFundingLedgerUpdates(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export function userNonFundingLedgerUpdates(
  config: InfoConfig,
  params: UserNonFundingLedgerUpdatesParameters,
  signal?: AbortSignal,
): Promise<UserNonFundingLedgerUpdatesResponse> {
  const request = v.parse(UserNonFundingLedgerUpdatesRequest, {
    type: "userNonFundingLedgerUpdates",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
