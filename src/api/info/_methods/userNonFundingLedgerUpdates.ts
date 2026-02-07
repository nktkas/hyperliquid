import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";

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
export type UserNonFundingLedgerUpdatesResponse = {
  /** Timestamp of the update (in ms since epoch). */
  time: number;
  /**
   * L1 transaction hash.
   * @pattern ^0x[a-fA-F0-9]{64}$
   */
  hash: `0x${string}`;
  /** Update details. */
  delta:
    | {
      /** Update type. */
      type: "accountClassTransfer";
      /**
       * Amount transferred in USDC.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      usdc: string;
      /** Indicates if the transfer is to the perpetual account. */
      toPerp: boolean;
    }
    | {
      /** Update type. */
      type: "deposit";
      /**
       * Amount deposited in USDC.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      usdc: string;
    }
    | {
      /** Update type. */
      type: "internalTransfer";
      /**
       * Amount transferred in USDC.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      usdc: string;
      /**
       * Initiator address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      user: `0x${string}`;
      /**
       * Destination address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      destination: `0x${string}`;
      /**
       * Transfer fee.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      fee: string;
    }
    | {
      /** Update type. */
      type: "liquidation";
      /**
       * Total notional value of liquidated positions.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      liquidatedNtlPos: string;
      /**
       * Account value at liquidation time.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      accountValue: string;
      /** Leverage type for liquidated positions. */
      leverageType: "Cross" | "Isolated";
      /** Details of each liquidated position. */
      liquidatedPositions: {
        /** Asset symbol of the liquidated position. */
        coin: string;
        /**
         * Signed position size liquidated.
         * @pattern ^-?[0-9]+(\.[0-9]+)?$
         */
        szi: string;
      }[];
    }
    | {
      /** Update type. */
      type: "rewardsClaim";
      /**
       * Amount of rewards claimed.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      amount: string;
      /** Token symbol. */
      token: string;
    }
    | {
      /** Update type. */
      type: "spotTransfer";
      /** Token symbol. */
      token: string;
      /**
       * Amount transferred.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      amount: string;
      /**
       * Equivalent USDC value.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      usdcValue: string;
      /**
       * Initiator address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      user: `0x${string}`;
      /**
       * Destination address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      destination: `0x${string}`;
      /**
       * Transfer fee.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      fee: string;
      /**
       * Fee in native token.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      nativeTokenFee: string;
      /** Nonce of the transfer. */
      nonce: number | null;
      /** Token in which the fee is denominated (e.g., "USDC"). */
      feeToken: string;
    }
    | {
      /** Update type. */
      type: "subAccountTransfer";
      /**
       * Amount transferred in USDC.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      usdc: string;
      /**
       * Initiator address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      user: `0x${string}`;
      /**
       * Destination address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      destination: `0x${string}`;
    }
    | {
      /** Update type. */
      type: "vaultCreate";
      /**
       * Address of the created vault.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      vault: `0x${string}`;
      /**
       * Initial allocated amount in USDC.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      usdc: string;
      /**
       * Vault creation fee.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      fee: string;
    }
    | {
      /** Update type. */
      type: "vaultDeposit";
      /**
       * Address of the target vault.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      vault: `0x${string}`;
      /**
       * Amount deposited in USDC.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      usdc: string;
    }
    | {
      /** Update type. */
      type: "vaultDistribution";
      /**
       * Address of the vault distributing funds.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      vault: `0x${string}`;
      /**
       * Amount distributed in USDC.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      usdc: string;
    }
    | {
      /** Update type. */
      type: "vaultWithdraw";
      /**
       * Vault address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      vault: `0x${string}`;
      /**
       * Address of the user withdrawing funds.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      user: `0x${string}`;
      /**
       * Withdrawal request amount in USD.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      requestedUsd: string;
      /**
       * Withdrawal commission fee.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      commission: string;
      /**
       * Closing cost associated with positions.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      closingCost: string;
      /**
       * Basis value for withdrawal calculation.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      basis: string;
      /**
       * Net withdrawn amount in USD after fees and costs.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      netWithdrawnUsd: string;
    }
    | {
      /** Update type. */
      type: "withdraw";
      /**
       * Amount withdrawn in USDC.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      usdc: string;
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: number;
      /**
       * Withdrawal fee.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      fee: string;
    }
    | {
      /** Update type. */
      type: "send";
      /**
       * Address of the sender.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      user: `0x${string}`;
      /**
       * Destination address.
       * @pattern ^0x[a-fA-F0-9]{40}$
       */
      destination: `0x${string}`;
      /** Source DEX ("" for default USDC perp DEX, "spot" for spot). */
      sourceDex: string;
      /** Destination DEX ("" for default USDC perp DEX, "spot" for spot). */
      destinationDex: string;
      /** Token identifier. */
      token: string;
      /**
       * Amount to send (not in wei).
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      amount: string;
      /**
       * Equivalent USDC value.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      usdcValue: string;
      /**
       * Transfer fee.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      fee: string;
      /**
       * Fee in native token.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      nativeTokenFee: string;
      /** Nonce of the transfer. */
      nonce: number;
      /** Token in which the fee is denominated (e.g., "USDC"). */
      feeToken: string;
    }
    | {
      /** Update type. */
      type: "deployGasAuction";
      /** Token symbol. */
      token: string;
      /**
       * Amount in the specified token.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      amount: string;
    }
    | {
      /** Update type. */
      type: "cStakingTransfer";
      /** Token symbol. */
      token: string;
      /**
       * Amount in the specified token.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      amount: string;
      /** `true` for deposit, `false` for withdrawal. */
      isDeposit: boolean;
    }
    | {
      /** Update type. */
      type: "borrowLend";
      /** Token symbol. */
      token: string;
      /** Operation type. */
      operation: "supply" | "withdraw" | "repay" | "borrow";
      /**
       * Amount in the specified token.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      amount: string;
      /**
       * Interest amount in the specified token.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      interestAmount: string;
    }
    | {
      /** Update type. */
      type: "spotGenesis";
      /** Token symbol. */
      token: string;
      /**
       * Amount in the specified token.
       * @pattern ^-?[0-9]+(\.[0-9]+)?$
       */
      amount: string;
    }
    | {
      /** Update type. */
      type: "activateDexAbstraction";
      /** Name of the dex. */
      dex: string;
      /** Token symbol. */
      token: string;
      /**
       * Amount in the specified token.
       * @pattern ^[0-9]+(\.[0-9]+)?$
       */
      amount: string;
    };
}[];

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
