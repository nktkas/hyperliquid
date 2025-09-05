import * as v from "valibot";
import { Hex, Integer, UnsignedDecimal, UnsignedInteger } from "../_base.ts";

/** User delegation to a validator. */
export const Delegation = v.pipe(
    v.object({
        /** Validator address. */
        validator: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Validator address."),
        ),
        /** Amount of tokens delegated to the validator. */
        amount: v.pipe(
            UnsignedDecimal,
            v.description("Amount of tokens delegated to the validator."),
        ),
        /** Locked until timestamp (in ms since epoch). */
        lockedUntilTimestamp: v.pipe(
            UnsignedInteger,
            v.description("Locked until timestamp (in ms since epoch)."),
        ),
    }),
    v.description("User delegation to a validator."),
);
export type Delegation = v.InferOutput<typeof Delegation>;

/** Reward received from staking activities. */
export const DelegatorReward = v.pipe(
    v.object({
        /** Timestamp when the reward was received (in ms since epoch). */
        time: v.pipe(
            UnsignedInteger,
            v.description("Timestamp when the reward was received (in ms since epoch)."),
        ),
        /** Source of the reward. */
        source: v.pipe(
            v.union([v.literal("delegation"), v.literal("commission")]),
            v.description("Source of the reward."),
        ),
        /** Total reward amount. */
        totalAmount: v.pipe(
            UnsignedDecimal,
            v.description("Total reward amount."),
        ),
    }),
    v.description("Reward received from staking activities."),
);
export type DelegatorReward = v.InferOutput<typeof DelegatorReward>;

/** Summary of a user staking delegations. */
export const DelegatorSummary = v.pipe(
    v.object({
        /** Total amount of delegated tokens. */
        delegated: v.pipe(
            UnsignedDecimal,
            v.description("Total amount of delegated tokens."),
        ),
        /** Total amount of undelegated tokens. */
        undelegated: v.pipe(
            UnsignedDecimal,
            v.description("Total amount of undelegated tokens."),
        ),
        /** Total amount of tokens pending withdrawal. */
        totalPendingWithdrawal: v.pipe(
            UnsignedDecimal,
            v.description("Total amount of tokens pending withdrawal."),
        ),
        /** Number of pending withdrawals. */
        nPendingWithdrawals: v.pipe(
            UnsignedInteger,
            v.description("Number of pending withdrawals."),
        ),
    }),
    v.description("Summary of a user staking delegations."),
);
export type DelegatorSummary = v.InferOutput<typeof DelegatorSummary>;

/** Delegation operation in a delegator update. */
export const DelegatorUpdateDelegate = v.pipe(
    v.object({
        /** Delegation operation details. */
        delegate: v.pipe(
            v.object({
                /** Address of the validator receiving or losing delegation. */
                validator: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Address of the validator receiving or losing delegation."),
                ),
                /** Amount of tokens being delegated or undelegated. */
                amount: v.pipe(
                    UnsignedDecimal,
                    v.description("Amount of tokens being delegated or undelegated."),
                ),
                /** Whether this is an undelegation operation. */
                isUndelegate: v.pipe(
                    v.boolean(),
                    v.description("Whether this is an undelegation operation."),
                ),
            }),
            v.description("Delegation operation details."),
        ),
    }),
    v.description("Delegation operation in a delegator update."),
);
export type DelegatorUpdateDelegate = v.InferOutput<typeof DelegatorUpdateDelegate>;

/** Deposit operation in a delegator update. */
export const DelegatorUpdateDeposit = v.pipe(
    v.object({
        /** Deposit details. */
        cDeposit: v.pipe(
            v.object({
                /** Amount of tokens being deposited. */
                amount: v.pipe(
                    UnsignedDecimal,
                    v.description("Amount of tokens being deposited."),
                ),
            }),
            v.description("Deposit details."),
        ),
    }),
    v.description("Deposit operation in a delegator update."),
);
export type DelegatorUpdateDeposit = v.InferOutput<typeof DelegatorUpdateDeposit>;

/** Withdrawal operation in a delegator update. */
export const DelegatorUpdateWithdrawal = v.pipe(
    v.object({
        /** Withdrawal details. */
        withdrawal: v.pipe(
            v.object({
                /** Amount of tokens being withdrawn. */
                amount: v.pipe(
                    UnsignedDecimal,
                    v.description("Amount of tokens being withdrawn."),
                ),
                /** Phase of the withdrawal process. */
                phase: v.pipe(
                    v.union([v.literal("initiated"), v.literal("finalized")]),
                    v.description("Phase of the withdrawal process."),
                ),
            }),
            v.description("Withdrawal details."),
        ),
    }),
    v.description("Withdrawal operation in a delegator update."),
);
export type DelegatorUpdateWithdrawal = v.InferOutput<typeof DelegatorUpdateWithdrawal>;

/** Record of a staking event by a delegator. */
export const DelegatorUpdate = v.pipe(
    v.object({
        /** Timestamp of the delegation event (in ms since epoch). */
        time: v.pipe(
            UnsignedInteger,
            v.description("Timestamp of the delegation event (in ms since epoch)."),
        ),
        /** Transaction hash of the delegation event. */
        hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("Transaction hash of the delegation event."),
        ),
        /** Details of the update. */
        delta: v.pipe(
            v.union([
                DelegatorUpdateDelegate,
                DelegatorUpdateDeposit,
                DelegatorUpdateWithdrawal,
            ]),
            v.description("Details of the update."),
        ),
    }),
    v.description("Record of a staking event by a delegator."),
);
export type DelegatorUpdate = v.InferOutput<typeof DelegatorUpdate>;

/** Statistics for validator performance over a time period. */
export const ValidatorStats = v.pipe(
    v.object({
        /** Fraction of time the validator was online. */
        uptimeFraction: v.pipe(
            v.string(),
            v.description("Fraction of time the validator was online."),
        ),
        /** Predicted annual percentage rate of returns. */
        predictedApr: v.pipe(
            UnsignedDecimal,
            v.description("Predicted annual percentage rate of returns."),
        ),
        /** Number of samples used for statistics calculation. */
        nSamples: v.pipe(
            UnsignedInteger,
            v.description("Number of samples used for statistics calculation."),
        ),
    }),
    v.description("Statistics for validator performance over a time period."),
);
export type ValidatorStats = v.InferOutput<typeof ValidatorStats>;

/** Summary of a validator status and performance. */
export const ValidatorSummary = v.pipe(
    v.object({
        /** Address of the validator. */
        validator: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Address of the validator."),
        ),
        /** Address of the validator signer. */
        signer: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Address of the validator signer."),
        ),
        /** Name of the validator. */
        name: v.pipe(
            v.string(),
            v.description("Name of the validator."),
        ),
        /** Description of the validator. */
        description: v.pipe(
            v.string(),
            v.description("Description of the validator."),
        ),
        /** Number of blocks produced recently. */
        nRecentBlocks: v.pipe(
            UnsignedInteger,
            v.description("Number of blocks produced recently."),
        ),
        /** Total amount of tokens staked. */
        stake: v.pipe(
            UnsignedInteger,
            v.description("Total amount of tokens staked."),
        ),
        /** Whether the validator is currently jailed. */
        isJailed: v.pipe(
            v.boolean(),
            v.description("Whether the validator is currently jailed."),
        ),
        /** Timestamp when the validator can be unjailed (in ms since epoch). */
        unjailableAfter: v.pipe(
            v.union([UnsignedInteger, v.null()]),
            v.description("Timestamp when the validator can be unjailed (in ms since epoch)."),
        ),
        /** Whether the validator is currently active. */
        isActive: v.pipe(
            v.boolean(),
            v.description("Whether the validator is currently active."),
        ),
        /** Commission rate charged by the validator. */
        commission: v.pipe(
            UnsignedDecimal,
            v.description("Commission rate charged by the validator."),
        ),
        /** Performance statistics over different time periods. */
        stats: v.pipe(
            v.tuple([
                v.tuple([v.literal("day"), ValidatorStats]),
                v.tuple([v.literal("week"), ValidatorStats]),
                v.tuple([v.literal("month"), ValidatorStats]),
            ]),
            v.description("Performance statistics over different time periods."),
        ),
    }),
    v.description("Summary of a validator status and performance."),
);
export type ValidatorSummary = v.InferOutput<typeof ValidatorSummary>;

/** L1 governance vote cast by a validator. */
export const ValidatorL1Vote = v.pipe(
    v.array(
        v.object({
            /** Timestamp when the vote expires (in ms since epoch). */
            expireTime: v.pipe(
                v.pipe(Integer),
                v.description("Timestamp when the vote expires (in ms since epoch)."),
            ),
            /** Vote decision or action identifier. */
            action: v.object({
                D: v.pipe(
                    v.string(),
                    v.description("Vote decision or action identifier."),
                ),
            }),
            /** List of validator addresses that cast this vote. */
            votes: v.pipe(
                v.array(v.pipe(Hex, v.length(42))),
                v.description("List of validator addresses that cast this vote."),
            ),
        }),
    ),
    v.description("L1 governance vote cast by a validator."),
);
export type ValidatorL1Vote = v.InferOutput<typeof ValidatorL1Vote>;
