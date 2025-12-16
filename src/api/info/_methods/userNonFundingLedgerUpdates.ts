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
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userNonFundingLedgerUpdates"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Start time (in ms since epoch). */
      startTime: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Start time (in ms since epoch)."),
      ),
      /** End time (in ms since epoch). */
      endTime: v.pipe(
        v.nullish(UnsignedInteger),
        v.description("End time (in ms since epoch)."),
      ),
    }),
    v.description("Request user non-funding ledger updates."),
  );
})();
export type UserNonFundingLedgerUpdatesRequest = v.InferOutput<typeof UserNonFundingLedgerUpdatesRequest>;

/**
 * Array of user's non-funding ledger update.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
 */
export const UserNonFundingLedgerUpdatesResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      v.object({
        /** Timestamp of the update (in ms since epoch). */
        time: v.pipe(
          UnsignedInteger,
          v.description("Timestamp of the update (in ms since epoch)."),
        ),
        /** L1 transaction hash. */
        hash: v.pipe(
          Hex,
          v.length(66),
          v.description("L1 transaction hash."),
        ),
        /** Update details. */
        delta: v.pipe(
          v.variant("type", [
            /** Transfer between spot and perpetual accounts. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("accountClassTransfer"),
                v.description("Update type."),
              ),
              /** Amount transferred in USDC. */
              usdc: v.pipe(
                UnsignedDecimal,
                v.description("Amount transferred in USDC."),
              ),
              /** Indicates if the transfer is to the perpetual account. */
              toPerp: v.pipe(
                v.boolean(),
                v.description("Indicates if the transfer is to the perpetual account."),
              ),
            }),
            /** Deposit to an account. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("deposit"),
                v.description("Update type."),
              ),
              /** Amount deposited in USDC. */
              usdc: v.pipe(
                UnsignedDecimal,
                v.description("Amount deposited in USDC."),
              ),
            }),
            /** Internal transfer between accounts. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("internalTransfer"),
                v.description("Update type."),
              ),
              /** Amount transferred in USDC. */
              usdc: v.pipe(
                UnsignedDecimal,
                v.description("Amount transferred in USDC."),
              ),
              /** Initiator address. */
              user: v.pipe(
                Address,
                v.description("Initiator address."),
              ),
              /** Destination address. */
              destination: v.pipe(
                Address,
                v.description("Destination address."),
              ),
              /** Transfer fee. */
              fee: v.pipe(
                UnsignedDecimal,
                v.description("Transfer fee."),
              ),
            }),
            /** Liquidation event. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("liquidation"),
                v.description("Update type."),
              ),
              /** Total notional value of liquidated positions. */
              liquidatedNtlPos: v.pipe(
                UnsignedDecimal,
                v.description("Total notional value of liquidated positions."),
              ),
              /** Account value at liquidation time. */
              accountValue: v.pipe(
                UnsignedDecimal,
                v.description("Account value at liquidation time."),
              ),
              /** Leverage type for liquidated positions. */
              leverageType: v.pipe(
                v.picklist(["Cross", "Isolated"]),
                v.description("Leverage type for liquidated positions."),
              ),
              /** Details of each liquidated position. */
              liquidatedPositions: v.pipe(
                v.array(
                  v.object({
                    /** Asset symbol of the liquidated position. */
                    coin: v.pipe(
                      v.string(),
                      v.description("Asset symbol of the liquidated position."),
                    ),
                    /** Signed position size liquidated. */
                    szi: v.pipe(
                      Decimal,
                      v.description("Signed position size liquidated."),
                    ),
                  }),
                ),
                v.description("Details of each liquidated position."),
              ),
            }),
            /** Rewards claim event. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("rewardsClaim"),
                v.description("Update type."),
              ),
              /** Amount of rewards claimed. */
              amount: v.pipe(
                UnsignedDecimal,
                v.description("Amount of rewards claimed."),
              ),
              /** Token symbol. */
              token: v.pipe(
                v.string(),
                v.description("Token symbol."),
              ),
            }),
            /** Spot transfer between accounts. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("spotTransfer"),
                v.description("Update type."),
              ),
              /** Token symbol. */
              token: v.pipe(
                v.string(),
                v.description("Token symbol."),
              ),
              /** Amount transferred. */
              amount: v.pipe(
                UnsignedDecimal,
                v.description("Amount transferred."),
              ),
              /** Equivalent USDC value. */
              usdcValue: v.pipe(
                UnsignedDecimal,
                v.description("Equivalent USDC value."),
              ),
              /** Initiator address. */
              user: v.pipe(
                Address,
                v.description("Initiator address."),
              ),
              /** Destination address. */
              destination: v.pipe(
                Address,
                v.description("Destination address."),
              ),
              /** Transfer fee. */
              fee: v.pipe(
                UnsignedDecimal,
                v.description("Transfer fee."),
              ),
              /** Fee in native token. */
              nativeTokenFee: v.pipe(
                UnsignedDecimal,
                v.description("Fee in native token."),
              ),
              /** Nonce of the transfer. */
              nonce: v.pipe(
                v.nullable(UnsignedInteger),
                v.description("Nonce of the transfer."),
              ),
              /** Token in which the fee is denominated (e.g., "USDC"). */
              feeToken: v.pipe(
                v.string(),
                v.description('Token in which the fee is denominated (e.g., "USDC").'),
              ),
            }),
            /** Transfer between sub-accounts. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("subAccountTransfer"),
                v.description("Update type."),
              ),
              /** Amount transferred in USDC. */
              usdc: v.pipe(
                UnsignedDecimal,
                v.description("Amount transferred in USDC."),
              ),
              /** Initiator address. */
              user: v.pipe(
                Address,
                v.description("Initiator address."),
              ),
              /** Destination address. */
              destination: v.pipe(
                Address,
                v.description("Destination address."),
              ),
            }),
            /** Vault creation event. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("vaultCreate"),
                v.description("Update type."),
              ),
              /** Address of the created vault. */
              vault: v.pipe(
                Address,
                v.description("Address of the created vault."),
              ),
              /** Initial allocated amount in USDC. */
              usdc: v.pipe(
                UnsignedDecimal,
                v.description("Initial allocated amount in USDC."),
              ),
              /** Vault creation fee. */
              fee: v.pipe(
                UnsignedDecimal,
                v.description("Vault creation fee."),
              ),
            }),
            /** Vault deposit event. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("vaultDeposit"),
                v.description("Update type."),
              ),
              /** Address of the target vault. */
              vault: v.pipe(
                Address,
                v.description("Address of the target vault."),
              ),
              /** Amount deposited in USDC. */
              usdc: v.pipe(
                UnsignedDecimal,
                v.description("Amount deposited in USDC."),
              ),
            }),
            /** Vault distribution event. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("vaultDistribution"),
                v.description("Update type."),
              ),
              /** Address of the vault distributing funds. */
              vault: v.pipe(
                Address,
                v.description("Address of the vault distributing funds."),
              ),
              /** Amount distributed in USDC. */
              usdc: v.pipe(
                UnsignedDecimal,
                v.description("Amount distributed in USDC."),
              ),
            }),
            /** Vault withdrawal event. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("vaultWithdraw"),
                v.description("Update type."),
              ),
              /** Vault address. */
              vault: v.pipe(
                Address,
                v.description("Vault address."),
              ),
              /** Address of the user withdrawing funds. */
              user: v.pipe(
                Address,
                v.description("Address of the user withdrawing funds."),
              ),
              /** Withdrawal request amount in USD. */
              requestedUsd: v.pipe(
                UnsignedDecimal,
                v.description("Withdrawal request amount in USD."),
              ),
              /** Withdrawal commission fee. */
              commission: v.pipe(
                UnsignedDecimal,
                v.description("Withdrawal commission fee."),
              ),
              /** Closing cost associated with positions. */
              closingCost: v.pipe(
                UnsignedDecimal,
                v.description("Closing cost associated with positions."),
              ),
              /** Basis value for withdrawal calculation. */
              basis: v.pipe(
                UnsignedDecimal,
                v.description("Basis value for withdrawal calculation."),
              ),
              /** Net withdrawn amount in USD after fees and costs. */
              netWithdrawnUsd: v.pipe(
                UnsignedDecimal,
                v.description("Net withdrawn amount in USD after fees and costs."),
              ),
            }),
            /** Withdrawal from an account. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("withdraw"),
                v.description("Update type."),
              ),
              /** Amount withdrawn in USDC. */
              usdc: v.pipe(
                UnsignedDecimal,
                v.description("Amount withdrawn in USDC."),
              ),
              /** Nonce (timestamp in ms) used to prevent replay attacks. */
              nonce: v.pipe(
                UnsignedInteger,
                v.description("Nonce (timestamp in ms) used to prevent replay attacks."),
              ),
              /** Withdrawal fee. */
              fee: v.pipe(
                UnsignedDecimal,
                v.description("Withdrawal fee."),
              ),
            }),
            /** Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("send"),
                v.description("Update type."),
              ),
              /** Address of the sender. */
              user: v.pipe(
                Address,
                v.description("Address of the sender."),
              ),
              /** Destination address. */
              destination: v.pipe(
                Address,
                v.description("Destination address."),
              ),
              /** Source DEX ("" for default USDC perp DEX, "spot" for spot). */
              sourceDex: v.pipe(
                v.string(),
                v.description('Source DEX ("" for default USDC perp DEX, "spot" for spot).'),
              ),
              /** Destination DEX ("" for default USDC perp DEX, "spot" for spot). */
              destinationDex: v.pipe(
                v.string(),
                v.description('Destination DEX ("" for default USDC perp DEX, "spot" for spot).'),
              ),
              /** Token identifier. */
              token: v.pipe(
                v.string(),
                v.description("Token identifier."),
              ),
              /** Amount to send (not in wei). */
              amount: v.pipe(
                UnsignedDecimal,
                v.description("Amount to send (not in wei)."),
              ),
              /** Equivalent USDC value. */
              usdcValue: v.pipe(
                UnsignedDecimal,
                v.description("Equivalent USDC value."),
              ),
              /** Transfer fee. */
              fee: v.pipe(
                UnsignedDecimal,
                v.description("Transfer fee."),
              ),
              /** Fee in native token. */
              nativeTokenFee: v.pipe(
                UnsignedDecimal,
                v.description("Fee in native token."),
              ),
              /** Nonce of the transfer. */
              nonce: v.pipe(
                UnsignedInteger,
                v.description("Nonce of the transfer."),
              ),
              /** Token in which the fee is denominated (e.g., "USDC"). */
              feeToken: v.pipe(
                v.string(),
                v.description('Token in which the fee is denominated (e.g., "USDC").'),
              ),
            }),
            /** Deploy gas auction update. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("deployGasAuction"),
                v.description("Update type."),
              ),
              /** Token symbol. */
              token: v.pipe(
                v.string(),
                v.description("Token symbol."),
              ),
              /** Amount in the specified token. */
              amount: v.pipe(
                UnsignedDecimal,
                v.description("Amount in the specified token."),
              ),
            }),
            /** C-staking transfer update. */
            v.object({
              /** Update type. */
              type: v.pipe(
                v.literal("cStakingTransfer"),
                v.description("Update type."),
              ),
              /** Token symbol. */
              token: v.pipe(
                v.string(),
                v.description("Token symbol."),
              ),
              /** Amount in the specified token. */
              amount: v.pipe(
                UnsignedDecimal,
                v.description("Amount in the specified token."),
              ),
              /** `true` for deposit, `false` for withdrawal. */
              isDeposit: v.pipe(
                v.boolean(),
                v.description("`true` for deposit, `false` for withdrawal."),
              ),
            }),
          ]),
          v.description("Update details."),
        ),
      }),
    ),
    v.description("Array of user's non-funding ledger update."),
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
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
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
