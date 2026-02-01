import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { VaultRelationshipSchema } from "./_base/commonSchemas.ts";
import { PortfolioResponse } from "./portfolio.ts";

/**
 * Request details of a vault.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
 */
export const VaultDetailsRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("vaultDetails"),
    /** Vault address. */
    vaultAddress: Address,
    /** User address. */
    user: v.nullish(Address),
  });
})();
export type VaultDetailsRequest = v.InferOutput<typeof VaultDetailsRequest>;

/**
 * Details of a vault or null if the vault does not exist.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
 */
export const VaultDetailsResponse = /* @__PURE__ */ (() => {
  return v.object({
    /** Vault name. */
    name: v.string(),
    /** Vault address. */
    vaultAddress: Address,
    /** Leader address. */
    leader: Address,
    /** Vault description. */
    description: v.string(),
    /** Vault portfolio metrics grouped by time periods. */
    portfolio: PortfolioResponse,
    /** Annual percentage rate. */
    apr: v.number(),
    /** Current user follower state. */
    followerState: v.nullable(
      v.object({
        /** Follower address. */
        user: Address,
        /** Follower vault equity. */
        vaultEquity: UnsignedDecimal,
        /** Current profit and loss. */
        pnl: Decimal,
        /** All-time profit and loss. */
        allTimePnl: Decimal,
        /** Subscription duration in days. */
        daysFollowing: UnsignedInteger,
        /** Vault entry timestamp. */
        vaultEntryTime: UnsignedInteger,
        /** Timestamp when funds become unlocked. */
        lockupUntil: UnsignedInteger,
      }),
    ),
    /** Ownership percentage held by leader. */
    leaderFraction: v.number(),
    /** Leader commission percentage. */
    leaderCommission: v.number(),
    /** Array of vault followers. */
    followers: v.array(
      v.object({
        /** Follower address or Leader. */
        user: v.union([Address, v.literal("Leader")]),
        /** Follower vault equity. */
        vaultEquity: UnsignedDecimal,
        /** Current profit and loss. */
        pnl: Decimal,
        /** All-time profit and loss. */
        allTimePnl: Decimal,
        /** Subscription duration in days. */
        daysFollowing: UnsignedInteger,
        /** Vault entry timestamp. */
        vaultEntryTime: UnsignedInteger,
        /** Timestamp when funds become unlocked. */
        lockupUntil: UnsignedInteger,
      }),
    ),
    /** Maximum distributable amount. */
    maxDistributable: v.number(),
    /** Maximum withdrawable amount. */
    maxWithdrawable: v.number(),
    /** Vault closure status. */
    isClosed: v.boolean(),
    /** Vault relationship type. */
    relationship: VaultRelationshipSchema,
    /** Deposit permission status. */
    allowDeposits: v.boolean(),
    /** Position closure policy on withdrawal. */
    alwaysCloseOnWithdraw: v.boolean(),
  });
})();
export type VaultDetailsResponse = v.InferOutput<typeof VaultDetailsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode vaultDetails} function. */
export type VaultDetailsParameters = Omit<v.InferInput<typeof VaultDetailsRequest>, "type">;

/**
 * Request details of a vault.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Details of a vault or null if the vault does not exist.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { vaultDetails } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await vaultDetails(
 *   { transport },
 *   { vaultAddress: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
 */
export function vaultDetails(
  config: InfoConfig,
  params: VaultDetailsParameters,
  signal?: AbortSignal,
): Promise<VaultDetailsResponse> {
  const request = v.parse(VaultDetailsRequest, {
    type: "vaultDetails",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
