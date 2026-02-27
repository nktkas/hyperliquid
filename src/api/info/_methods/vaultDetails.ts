import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address } from "../../_schemas.ts";
import type { VaultRelationshipSchema } from "./_base/commonSchemas.ts";
import type { PortfolioResponse } from "./portfolio.ts";

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
export type VaultDetailsResponse = {
  /** Vault name. */
  name: string;
  /**
   * Vault address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  vaultAddress: `0x${string}`;
  /**
   * Leader address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  leader: `0x${string}`;
  /** Vault description. */
  description: string;
  /** Vault portfolio metrics grouped by time periods. */
  portfolio: PortfolioResponse;
  /** Annual percentage rate. */
  apr: number;
  /** Current user follower state. */
  followerState: {
    /**
     * Follower address.
     * @pattern ^0x[a-fA-F0-9]{40}$
     */
    user: `0x${string}`;
    /**
     * Follower vault equity.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    vaultEquity: string;
    /**
     * Current profit and loss.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    pnl: string;
    /**
     * All-time profit and loss.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    allTimePnl: string;
    /** Subscription duration in days. */
    daysFollowing: number;
    /** Vault entry timestamp. */
    vaultEntryTime: number;
    /** Timestamp when funds become unlocked. */
    lockupUntil: number;
  } | null;
  /** Ownership percentage held by leader. */
  leaderFraction: number;
  /** Leader commission percentage. */
  leaderCommission: number;
  /** Array of vault followers. */
  followers: {
    /**
     * Follower address or Leader.
     * @pattern ^0x[a-fA-F0-9]{40}$|^Leader$
     */
    user: `0x${string}` | "Leader";
    /**
     * Follower vault equity.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    vaultEquity: string;
    /**
     * Current profit and loss.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    pnl: string;
    /**
     * All-time profit and loss.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    allTimePnl: string;
    /** Subscription duration in days. */
    daysFollowing: number;
    /** Vault entry timestamp. */
    vaultEntryTime: number;
    /** Timestamp when funds become unlocked. */
    lockupUntil: number;
  }[];
  /** Maximum distributable amount. */
  maxDistributable: number;
  /** Maximum withdrawable amount. */
  maxWithdrawable: number;
  /** Vault closure status. */
  isClosed: boolean;
  /** Vault relationship type. */
  relationship: VaultRelationshipSchema;
  /** Deposit permission status. */
  allowDeposits: boolean;
  /** Position closure policy on withdrawal. */
  alwaysCloseOnWithdraw: boolean;
};

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode vaultDetails} function. */
export type VaultDetailsParameters = Omit<v.InferInput<typeof VaultDetailsRequest>, "type">;

/**
 * Request details of a vault.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Details of a vault or null if the vault does not exist.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
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
  const request = parse(VaultDetailsRequest, {
    type: "vaultDetails",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
