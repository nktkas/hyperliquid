import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";
import type { Subscription } from "../../transport/base.ts";

// -------------------- Schemas --------------------

/** Subscription to user non-funding ledger updates for a specific user. */
export const UserNonFundingLedgerUpdatesRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of subscription. */
      type: v.pipe(
        v.literal("userNonFundingLedgerUpdates"),
        v.description("Type of subscription."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Subscription to user non-funding ledger updates for a specific user."),
  );
})();
export type UserNonFundingLedgerUpdatesRequest = v.InferOutput<typeof UserNonFundingLedgerUpdatesRequest>;

/** Transfer between spot and perpetual accounts. */
export const AccountClassTransferUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
    v.description("Transfer between spot and perpetual accounts."),
  );
})();
export type AccountClassTransferUpdate = v.InferOutput<typeof AccountClassTransferUpdate>;

/** Deposit update to an account. */
export const DepositUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
    v.description("Deposit update to an account."),
  );
})();
export type DepositUpdate = v.InferOutput<typeof DepositUpdate>;

/** Internal transfer between accounts. */
export const InternalTransferUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
    v.description("Internal transfer between accounts."),
  );
})();
export type InternalTransferUpdate = v.InferOutput<typeof InternalTransferUpdate>;

/** Liquidation event update. */
export const LiquidationUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
        v.union([v.literal("Cross"), v.literal("Isolated")]),
        v.description("Leverage type for liquidated positions."),
      ),
      /** Details of each liquidated position. */
      liquidatedPositions: v.pipe(
        v.array(
          /** Liquidated position. */
          v.pipe(
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
            v.description("Liquidated position."),
          ),
        ),
        v.description("Details of each liquidated position."),
      ),
    }),
    v.description("Liquidation event update."),
  );
})();
export type LiquidationUpdate = v.InferOutput<typeof LiquidationUpdate>;

/** Rewards claim event update. */
export const RewardsClaimUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
    v.description("Rewards claim event update."),
  );
})();
export type RewardsClaimUpdate = v.InferOutput<typeof RewardsClaimUpdate>;

/** Spot transfer update between accounts. */
export const SpotTransferUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
      nonce: v.null(),
      /** Token in which the fee is denominated (e.g., "USDC"). */
      feeToken: v.pipe(
        v.string(),
        v.description('Token in which the fee is denominated (e.g., "USDC").'),
      ),
    }),
    v.description("Spot transfer update between accounts."),
  );
})();
export type SpotTransferUpdate = v.InferOutput<typeof SpotTransferUpdate>;

/** Transfer update between sub-accounts. */
export const SubAccountTransferUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
    v.description("Transfer update between sub-accounts."),
  );
})();
export type SubAccountTransferUpdate = v.InferOutput<typeof SubAccountTransferUpdate>;

/** Vault creation update. */
export const VaultCreateUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
    v.description("Vault creation update."),
  );
})();
export type VaultCreateUpdate = v.InferOutput<typeof VaultCreateUpdate>;

/** Vault deposit update. */
export const VaultDepositUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
    v.description("Vault deposit update."),
  );
})();
export type VaultDepositUpdate = v.InferOutput<typeof VaultDepositUpdate>;

/** Vault distribution update. */
export const VaultDistributionUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
    v.description("Vault distribution update."),
  );
})();
export type VaultDistributionUpdate = v.InferOutput<typeof VaultDistributionUpdate>;

/** Vault withdrawal event update. */
export const VaultWithdrawUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
    v.description("Vault withdrawal event update."),
  );
})();
export type VaultWithdrawUpdate = v.InferOutput<typeof VaultWithdrawUpdate>;

/** Withdrawal update from an account. */
export const WithdrawUpdate = /* @__PURE__ */ (() => {
  return v.pipe(
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
      /** Unique nonce for the withdrawal request. */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Unique nonce for the withdrawal request."),
      ),
      /** Withdrawal fee. */
      fee: v.pipe(
        UnsignedDecimal,
        v.description("Withdrawal fee."),
      ),
    }),
    v.description("Withdrawal update from an account."),
  );
})();
export type WithdrawUpdate = v.InferOutput<typeof WithdrawUpdate>;

/** Event of user non-funding ledger updates. */
export const UserNonFundingLedgerUpdatesEvent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Array of user's non-funding ledger update. */
      nonFundingLedgerUpdates: v.pipe(
        v.array(
          /** User's non-funding ledger update. */
          v.pipe(
            v.object({
              /** Timestamp of the update (in ms since epoch). */
              time: v.pipe(
                UnsignedInteger,
                v.description("Timestamp of the update (in ms since epoch)."),
              ),
              /** L1 transaction hash. */
              hash: v.pipe(
                v.pipe(Hex, v.length(66)),
                v.description("L1 transaction hash."),
              ),
              /** Update details. */
              delta: v.pipe(
                v.union([
                  AccountClassTransferUpdate,
                  DepositUpdate,
                  InternalTransferUpdate,
                  LiquidationUpdate,
                  RewardsClaimUpdate,
                  SpotTransferUpdate,
                  SubAccountTransferUpdate,
                  VaultCreateUpdate,
                  VaultDepositUpdate,
                  VaultDistributionUpdate,
                  VaultWithdrawUpdate,
                  WithdrawUpdate,
                ]),
                v.description("Update details."),
              ),
            }),
            v.description("User's non-funding ledger update."),
          ),
        ),
        v.description("Array of user's non-funding ledger update."),
      ),
      /** Whether this is an initial snapshot. */
      isSnapshot: v.pipe(
        v.optional(v.literal(true)),
        v.description("Whether this is an initial snapshot."),
      ),
    }),
    v.description("Event of user non-funding ledger updates."),
  );
})();
export type UserNonFundingLedgerUpdatesEvent = v.InferOutput<typeof UserNonFundingLedgerUpdatesEvent>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userNonFundingLedgerUpdates} function. */
export type UserNonFundingLedgerUpdatesParameters = Omit<
  v.InferInput<typeof UserNonFundingLedgerUpdatesRequest>,
  "type"
>;

/**
 * Subscribe to non-funding ledger updates for a specific user.
 * @param config - General configuration for Subscription API subscriptions.
 * @param params - Parameters specific to the API subscription.
 * @param listener - A callback function to be called when the event is received.
 * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { userNonFundingLedgerUpdates } from "@nktkas/hyperliquid/api/subscription";
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await userNonFundingLedgerUpdates(
 *   { transport },
 *   { user: "0x..." },
 *   (data) => console.log(data),
 * );
 * ```
 */
export function userNonFundingLedgerUpdates(
  config: SubscriptionRequestConfig,
  params: DeepImmutable<UserNonFundingLedgerUpdatesParameters>,
  listener: (data: UserNonFundingLedgerUpdatesEvent) => void,
): Promise<Subscription> {
  const payload = parser(UserNonFundingLedgerUpdatesRequest)({ type: "userNonFundingLedgerUpdates", ...params });
  return config.transport.subscribe<UserNonFundingLedgerUpdatesEvent>(payload.type, payload, (e) => {
    if (e.detail.user === payload.user.toLowerCase()) {
      listener(e.detail);
    }
  });
}
