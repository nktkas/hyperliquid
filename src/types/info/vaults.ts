import type { Hex } from "../../base.ts";
import type { PortfolioPeriods } from "./accounts.ts";

/** Details about a vault. */
export interface VaultDetails {
    /** Vault name. */
    name: string;
    /** Vault address. */
    vaultAddress: Hex;
    /** Leader address. */
    leader: Hex;
    /** Vault description. */
    description: string;
    /** Vault portfolio metrics grouped by time periods. */
    portfolio: PortfolioPeriods;
    /** Annual percentage rate. */
    apr: number;
    /** Current user's follower state */
    followerState: VaultFollowerState | null;
    /** Ownership percentage held by leader. */
    leaderFraction: number;
    /** Leader's commission percentage. */
    leaderCommission: number;
    /** Vault followers list. */
    followers: (Omit<VaultFollowerState, "user"> & {
        /** Follower's address or Leader. */
        user: Hex | "Leader";
    })[];
    /** Maximum distributable amount. */
    maxDistributable: number;
    /** Maximum withdrawable amount. */
    maxWithdrawable: number;
    /** Vault closure status. */
    isClosed: boolean;
    /** Vault relationship type. */
    relationship: VaultRelationship;
    /** Deposit permission status. */
    allowDeposits: boolean;
    /** Position closure policy on withdrawal. */
    alwaysCloseOnWithdraw: boolean;
}

/** User's vault equity details. */
export interface VaultEquity {
    /** Vault address. */
    vaultAddress: Hex;
    /**
     * User's deposited equity.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    equity: string;
    /** Timestamp when the user can withdraw their equity. */
    lockedUntilTimestamp: number;
}

/** Vault follower state. */
export interface VaultFollowerState {
    /** Follower address. */
    user: Hex;
    /**
     * Follower's vault equity.
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
}

/** Vault relationship configuration. */
export type VaultRelationship =
    | {
        /** Relationship type. */
        type: "normal" | "child";
    }
    | {
        /** Relationship type. */
        type: "parent";
        /** Child vault information. */
        data: {
            /** Child vault addresses. */
            childAddresses: Hex[];
        };
    };

/** Summary of a vault. */
export interface VaultSummary {
    /** Vault name. */
    name: string;
    /** Vault address. */
    vaultAddress: Hex;
    /** Leader address. */
    leader: Hex;
    /**
     * Total value locked.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    tvl: string;
    /** Vault closure status. */
    isClosed: boolean;
    /** Vault relationship type. */
    relationship: VaultRelationship;
    /** Creation timestamp. */
    createTimeMillis: number;
}

/** Vault that a user is leading. */
export interface VaultLeading {
    /** Vault address. */
    address: Hex;
    /** Vault name. */
    name: string;
}
