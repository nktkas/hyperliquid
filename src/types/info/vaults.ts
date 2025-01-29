import type { Hex } from "../common.ts";

/** Details about a vault. */
export interface VaultDetails {
    /** The name of the vault. */
    name: string;

    /** The address of the vault. */
    vaultAddress: Hex;

    /** The address of the leader. */
    leader: Hex;

    /** The description of the vault. */
    description: string;

    /** The portfolio of the vault. */
    portfolio: [
        ["day", VaultMetrics],
        ["week", VaultMetrics],
        ["month", VaultMetrics],
        ["allTime", VaultMetrics],
        ["perpDay", VaultMetrics],
        ["perpWeek", VaultMetrics],
        ["perpMonth", VaultMetrics],
        ["perpAllTime", VaultMetrics],
    ];

    /** The annual percentage rate (APR) of the vault. */
    apr: number;

    followerState: unknown | null;

    /** The fraction of the vault owned by the leader. */
    leaderFraction: number;

    /** The commission percentage taken by the leader. */
    leaderCommission: number;

    /** The followers of the vault. */
    followers: {
        /** The address of the follower or "Leader" for the leader. */
        user: Hex | "Leader";

        /** The equity of the follower in the vault. */
        vaultEquity: string;

        /** The current profit and loss (PnL) of the follower. */
        pnl: string;

        /** The all-time profit and loss (PnL) of the follower. */
        allTimePnl: string;

        /** The number of days the follower has been subscribed. */
        daysFollowing: number;

        /** The timestamp when the follower joined the vault. */
        vaultEntryTime: number;

        /** The timestamp until which the funds are locked. */
        lockupUntil: number;
    }[];

    /** The maximum amount that can be distributed from the vault. */
    maxDistributable: number;

    /** The maximum amount that can be withdrawn from the vault. */
    maxWithdrawable: number;

    /** Indicates if the vault is closed. */
    isClosed: boolean;

    /** The type of relationship between vaults. */
    relationship: VaultRelationship;

    /** Indicates whether deposits are allowed. */
    allowDeposits: boolean;

    /** Indicates whether to always close positions on withdrawal. */
    alwaysCloseOnWithdraw: boolean;
}

/** The equity of a user in a vault. */
export interface VaultEquity {
    /** The address of the vault. */
    vaultAddress: Hex;

    /** The user's deposited equity in the vault. */
    equity: string;
}

/** Metrics data for a vault */
export interface VaultMetrics {
    /** The account value history as [timestamp, value]. */
    accountValueHistory: [number, string][];
    /** The profit and loss (PnL) history as [timestamp, value]. */
    pnlHistory: [number, string][];
    /** The volume or related metric of the portfolio. */
    vlm: string;
}

/** The type of relationship between vaults. */
export type VaultRelationship =
    | {
        /** The type of relationship. */
        type: "normal";
    }
    | {
        /** The type of relationship. */
        type: "parent";

        /** Data about child vault addresses. */
        data: {
            /** List of child vault addresses. */
            childAddresses: Hex[];
        };
    }
    | {
        /** The type of relationship. */
        type: "child";
    };

/** Summary of a vault. */
export interface VaultSummary {
    /** The name of the vault. */
    name: string;

    /** The address of the vault. */
    vaultAddress: Hex;

    /** The address of the leader. */
    leader: Hex;

    /** The total value locked (TVL) in the vault. */
    tvl: string;

    /** Indicates if the vault is closed. */
    isClosed: boolean;

    /** The type of relationship between vaults. */
    relationship: VaultRelationship;

    /** The timestamp when the vault was created. */
    createTimeMillis: number;
}
