import type { Hex } from "../../base.ts";

/** User delegation to a validator. */
export interface Delegation {
    /** Validator address. */
    validator: Hex;
    /**
     * Amount of tokens delegated to the validator.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    amount: string;
    /** Locked until timestamp (in ms since epoch). */
    lockedUntilTimestamp: number;
}

/** Reward received from staking activities. */
export interface DelegatorReward {
    /** Timestamp when the reward was received (in ms since epoch). */
    time: number;
    /** Source of the reward. */
    source: "delegation" | "commission";
    /**
     * Total reward amount.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    totalAmount: string;
}

/** Summary of a user's staking delegations. */
export interface DelegatorSummary {
    /**
     * Total amount of delegated tokens.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    delegated: string;
    /**
     * Total amount of undelegated tokens.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    undelegated: string;
    /**
     * Total amount of tokens pending withdrawal.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    totalPendingWithdrawal: string;
    /** Number of pending withdrawals. */
    nPendingWithdrawals: number;
}

/** Record of a staking event by a delegator. */
export interface DelegatorUpdate {
    /** Timestamp of the delegation event (in ms since epoch). */
    time: number;
    /** Transaction hash of the delegation event. */
    hash: Hex;
    /** Details of the update. */
    delta: DelegatorUpdateDelegate | DelegatorUpdateDeposit | DelegatorUpdateWithdrawal;
}

/** Delegation operation in a delegator update. */
export interface DelegatorUpdateDelegate {
    /** Delegation operation details. */
    delegate: {
        /** Address of the validator receiving or losing delegation. */
        validator: Hex;
        /**
         * Amount of tokens being delegated or undelegated.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        amount: string;
        /** Whether this is an undelegation operation. */
        isUndelegate: boolean;
    };
}

/** Deposit operation in a delegator update. */
export interface DelegatorUpdateDeposit {
    /** Deposit details. */
    cDeposit: {
        /**
         * Amount of tokens being deposited.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        amount: string;
    };
}

/** Withdrawal operation in a delegator update. */
export interface DelegatorUpdateWithdrawal {
    /** Withdrawal details. */
    withdrawal: {
        /**
         * Amount of tokens being withdrawn.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        amount: string;
        /** Phase of the withdrawal process. */
        phase: "initiated" | "finalized";
    };
}

/** Statistics for validator performance over a time period. */
export interface ValidatorStats {
    /** Fraction of time the validator was online. */
    uptimeFraction: string;
    /**
     * Predicted annual percentage rate of returns.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    predictedApr: string;
    /** Number of samples used for statistics calculation. */
    nSamples: number;
}

/** Summary of a validator's status and performance. */
export interface ValidatorSummary {
    /** Address of the validator. */
    validator: Hex;
    /** Address of the validator's signer. */
    signer: Hex;
    /** Name of the validator. */
    name: string;
    /** Description of the validator. */
    description: string;
    /** Number of blocks produced recently. */
    nRecentBlocks: number;
    /** Total amount of tokens staked. */
    stake: number;
    /** Whether the validator is currently jailed. */
    isJailed: boolean;
    /** Timestamp when the validator can be unjailed (in ms since epoch). */
    unjailableAfter: number | null;
    /** Whether the validator is currently active. */
    isActive: boolean;
    /**
     * Commission rate charged by the validator.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    commission: string;
    /** Performance statistics over different time periods. */
    stats: [
        ["day", ValidatorStats],
        ["week", ValidatorStats],
        ["month", ValidatorStats],
    ];
}
