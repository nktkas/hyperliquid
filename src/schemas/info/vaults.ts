import * as v from "valibot";
import { Hex, SignedDecimal, UnsignedDecimal } from "../_base.ts";
import { PortfolioPeriods } from "./accounts.ts";

/** Vault relationship configuration. */
export const VaultRelationship = v.pipe(
    v.union([
        v.strictObject({
            /** Relationship type. */
            type: v.pipe(
                v.union([v.literal("normal"), v.literal("child")]),
                v.description("Relationship type."),
            ),
        }),
        v.strictObject({
            /** Relationship type. */
            type: v.pipe(
                v.literal("parent"),
                v.description("Relationship type."),
            ),
            /** Child vault information. */
            data: v.pipe(
                v.strictObject({
                    /** Child vault addresses. */
                    childAddresses: v.pipe(
                        v.array(v.pipe(Hex, v.length(42))),
                        v.description("Child vault addresses."),
                    ),
                }),
                v.description("Child vault information."),
            ),
        }),
    ]),
    v.description("Vault relationship configuration."),
);
export type VaultRelationship = v.InferOutput<typeof VaultRelationship>;

/** Vault follower state. */
export const VaultFollowerState = v.pipe(
    v.strictObject({
        /** Follower address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Follower address."),
        ),
        /** Follower vault equity. */
        vaultEquity: v.pipe(
            UnsignedDecimal,
            v.description("Follower vault equity."),
        ),
        /** Current profit and loss. */
        pnl: v.pipe(
            SignedDecimal,
            v.description("Current profit and loss."),
        ),
        /** All-time profit and loss. */
        allTimePnl: v.pipe(
            SignedDecimal,
            v.description("All-time profit and loss."),
        ),
        /** Subscription duration in days. */
        daysFollowing: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Subscription duration in days."),
        ),
        /** Vault entry timestamp. */
        vaultEntryTime: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Vault entry timestamp."),
        ),
        /** Timestamp when funds become unlocked. */
        lockupUntil: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Timestamp when funds become unlocked."),
        ),
    }),
    v.description("Vault follower state."),
);
export type VaultFollowerState = v.InferOutput<typeof VaultFollowerState>;

/** Details about a vault. */
export const VaultDetails = v.pipe(
    v.strictObject({
        /** Vault name. */
        name: v.pipe(
            v.string(),
            v.description("Vault name."),
        ),
        /** Vault address. */
        vaultAddress: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Vault address."),
        ),
        /** Leader address. */
        leader: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Leader address."),
        ),
        /** Vault description. */
        description: v.pipe(
            v.string(),
            v.description("Vault description."),
        ),
        /** Vault portfolio metrics grouped by time periods. */
        portfolio: v.pipe(
            PortfolioPeriods,
            v.description("Vault portfolio metrics grouped by time periods."),
        ),
        /** Annual percentage rate. */
        apr: v.pipe(
            v.number(),
            v.description("Annual percentage rate."),
        ),
        /** Current user follower state */
        followerState: v.pipe(
            v.nullable(VaultFollowerState),
            v.description("Current user follower state"),
        ),
        /** Ownership percentage held by leader. */
        leaderFraction: v.pipe(
            v.number(),
            v.description("Ownership percentage held by leader."),
        ),
        /** Leader commission percentage. */
        leaderCommission: v.pipe(
            v.number(),
            v.description("Leader commission percentage."),
        ),
        /** Vault followers list. */
        followers: v.pipe(
            v.array(
                v.strictObject({
                    ...v.omit(v.strictObject(VaultFollowerState.entries), ["user"]).entries,
                    ...v.strictObject({
                        /** Follower address or Leader. */
                        user: v.pipe(
                            v.union([v.pipe(Hex, v.length(42)), v.literal("Leader")]),
                            v.description("Follower address or Leader."),
                        ),
                    }).entries,
                }),
            ),
            v.description("Vault followers list."),
        ),
        /** Maximum distributable amount. */
        maxDistributable: v.pipe(
            v.number(),
            v.description("Maximum distributable amount."),
        ),
        /** Maximum withdrawable amount. */
        maxWithdrawable: v.pipe(
            v.number(),
            v.description("Maximum withdrawable amount."),
        ),
        /** Vault closure status. */
        isClosed: v.pipe(
            v.boolean(),
            v.description("Vault closure status."),
        ),
        /** Vault relationship type. */
        relationship: v.pipe(
            VaultRelationship,
            v.description("Vault relationship type."),
        ),
        /** Deposit permission status. */
        allowDeposits: v.pipe(
            v.boolean(),
            v.description("Deposit permission status."),
        ),
        /** Position closure policy on withdrawal. */
        alwaysCloseOnWithdraw: v.pipe(
            v.boolean(),
            v.description("Position closure policy on withdrawal."),
        ),
    }),
    v.description("Details about a vault."),
);
export type VaultDetails = v.InferOutput<typeof VaultDetails>;

/** User vault equity details. */
export const VaultEquity = v.pipe(
    v.strictObject({
        /** Vault address. */
        vaultAddress: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Vault address."),
        ),
        /** User deposited equity. */
        equity: v.pipe(
            UnsignedDecimal,
            v.description("User deposited equity."),
        ),
        /** Timestamp when the user can withdraw their equity. */
        lockedUntilTimestamp: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Timestamp when the user can withdraw their equity."),
        ),
    }),
    v.description("User vault equity details."),
);
export type VaultEquity = v.InferOutput<typeof VaultEquity>;

/** Summary of a vault. */
export const VaultSummary = v.pipe(
    v.strictObject({
        /** Vault name. */
        name: v.pipe(
            v.string(),
            v.description("Vault name."),
        ),
        /** Vault address. */
        vaultAddress: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Vault address."),
        ),
        /** Leader address. */
        leader: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Leader address."),
        ),
        /** Total value locked. */
        tvl: v.pipe(
            UnsignedDecimal,
            v.description("Total value locked."),
        ),
        /** Vault closure status. */
        isClosed: v.pipe(
            v.boolean(),
            v.description("Vault closure status."),
        ),
        /** Vault relationship type. */
        relationship: v.pipe(
            VaultRelationship,
            v.description("Vault relationship type."),
        ),
        /** Creation timestamp. */
        createTimeMillis: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Creation timestamp."),
        ),
    }),
    v.description("Summary of a vault."),
);
export type VaultSummary = v.InferOutput<typeof VaultSummary>;

/** Vault that a user is leading. */
export const VaultLeading = v.pipe(
    v.strictObject({
        /** Vault address. */
        address: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Vault address."),
        ),
        /** Vault name. */
        name: v.pipe(
            v.string(),
            v.description("Vault name."),
        ),
    }),
    v.description("Vault that a user is leading."),
);
export type VaultLeading = v.InferOutput<typeof VaultLeading>;
