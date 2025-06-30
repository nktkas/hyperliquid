import type { Hex } from "../../base.ts";

/** Position for a specific asset. */
export interface AssetPosition {
    /** Position type. */
    type: "oneWay";
    /** Position details. */
    position: {
        /** Asset symbol. */
        coin: string;
        /**
         * Signed position size.
         * @pattern ^-?[0-9]+(\.[0-9]+)?$
         */
        szi: string;
        /** Leverage details. */
        leverage:
            | {
                /** Leverage type. */
                type: "isolated";
                /** Leverage value used. */
                value: number;
                /** Amount of USD used (1 = 1$). */
                rawUsd: string;
            }
            | {
                /** Leverage type. */
                type: "cross";
                /** Leverage value used. */
                value: number;
            };
        /**
         * Average entry price.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        entryPx: string;
        /**
         * Position value.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        positionValue: string;
        /**
         * Unrealized profit and loss.
         * @pattern ^-?[0-9]+(\.[0-9]+)?$
         */
        unrealizedPnl: string;
        /**
         * Return on equity.
         * @pattern ^-?[0-9]+(\.[0-9]+)?$
         */
        returnOnEquity: string;
        /**
         * Liquidation price.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        liquidationPx: string | null;
        /**
         * Margin used.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        marginUsed: string;
        /** Maximum allowed leverage. */
        maxLeverage: number;
        /** Cumulative funding details. */
        cumFunding: {
            /**
             * Total funding paid or received since account opening.
             * @pattern ^-?[0-9]+(\.[0-9]+)?$
             */
            allTime: string;
            /**
             * Funding accumulated since the position was opened.
             * @pattern ^-?[0-9]+(\.[0-9]+)?$
             */
            sinceOpen: string;
            /**
             * Funding accumulated since the last change in position size.
             * @pattern ^-?[0-9]+(\.[0-9]+)?$
             */
            sinceChange: string;
        };
    };
}

/** Escrowed balance for a specific asset. */
export interface EvmEscrowsBalance {
    /** Asset symbol. */
    coin: string;
    /** Unique identifier for the token. */
    token: number;
    /**
     * Total balance.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    total: string;
}

/** Extra agent details for a user. */
export interface ExtraAgent {
    /** Extra agent address. */
    address: Hex;
    /** Extra agent name. */
    name: string;
    /** Validity period as a timestamp (in ms since epoch). */
    validUntil: number;
}

/** Legal verification status for a user. */
export interface LegalCheck {
    /** Whether the user's IP address is allowed. */
    ipAllowed: boolean;
    /** Whether the user has accepted the terms of service. */
    acceptedTerms: boolean;
    /** Whether the user is allowed to use the platform. */
    userAllowed: boolean;
}

/** Multi-sig signers for a user. */
export interface MultiSigSigners {
    /** Authorized users addresses. */
    authorizedUsers: Hex[];
    /** Threshold number of signatures required. */
    threshold: number;
}

/** Account summary for perpetual trading. */
export interface PerpsClearinghouseState {
    /** Margin summary details. */
    marginSummary: {
        /**
         * Total account value.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        accountValue: string;
        /**
         * Total notional position value.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        totalNtlPos: string;
        /**
         * Total raw USD value.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        totalRawUsd: string;
        /**
         * Total margin used.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        totalMarginUsed: string;
    };
    /** Cross-margin summary details. */
    crossMarginSummary: {
        /**
         * Total account value.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        accountValue: string;
        /**
         * Total notional position value.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        totalNtlPos: string;
        /**
         * Total raw USD value.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        totalRawUsd: string;
        /**
         * Total margin used.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        totalMarginUsed: string;
    };
    /**
     * Maintenance margin used for cross-margin positions.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    crossMaintenanceMarginUsed: string;
    /**
     * Amount available for withdrawal.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    withdrawable: string;
    /** List of asset positions. */
    assetPositions: AssetPosition[];
    /** Timestamp when data was retrieved (in ms since epoch). */
    time: number;
}

/** Portfolio metrics snapshot. */
export interface Portfolio {
    /** History entries for account value as [timestamp, value]. */
    accountValueHistory: [number, string][];
    /** History entries for profit and loss as [timestamp, value]. */
    pnlHistory: [number, string][];
    /**
     * Volume metric for the portfolio.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    vlm: string;
}

/** Portfolio metrics grouped by time periods. */
export type PortfolioPeriods = [
    ["day", Portfolio],
    ["week", Portfolio],
    ["month", Portfolio],
    ["allTime", Portfolio],
    ["perpDay", Portfolio],
    ["perpWeek", Portfolio],
    ["perpMonth", Portfolio],
    ["perpAllTime", Portfolio],
];

/** Pre-transfer user existence check result. */
export interface PreTransferCheck {
    /**
     * Activation fee.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    fee: string;
    /** Whether the user is sanctioned. */
    isSanctioned: boolean;
    /** Whether the user exists. */
    userExists: boolean;
    /** Whether the user has sent a transaction. */
    userHasSentTx: boolean;
}

/** Referral details for a user. */
export interface Referral {
    /** Referrer details. */
    referredBy: {
        /** Referrer address. */
        referrer: Hex;
        /** Referral code used. */
        code: string;
    } | null;

    /**
     * Cumulative traded volume.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    cumVlm: string;
    /**
     * Rewards earned but not yet claimed.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    unclaimedRewards: string;
    /**
     * Rewards that have been claimed.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    claimedRewards: string;
    /**
     * Builder reward amount.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    builderRewards: string;
    /** Current state of the referrer. */
    referrerState:
        | {
            /** Referrer is ready to receive rewards. */
            stage: "ready";
            /** Referral program details. */
            data: {
                /** Assigned referral code. */
                code: string;
                /** Summary of each referral state. */
                referralStates: {
                    /**
                     * Cumulative traded volume.
                     * @pattern ^[0-9]+(\.[0-9]+)?$
                     */
                    cumVlm: string;
                    /**
                     * Total fees rewarded to the referred user since referral.
                     * @pattern ^[0-9]+(\.[0-9]+)?$
                     */
                    cumRewardedFeesSinceReferred: string;
                    /**
                     * Total fees rewarded to the referrer from referred trades.
                     * @pattern ^[0-9]+(\.[0-9]+)?$
                     */
                    cumFeesRewardedToReferrer: string;
                    /** Timestamp when the referred user joined (in ms since epoch). */
                    timeJoined: number;
                    /** Address of the referred user. */
                    user: Hex;
                }[];
            };
        }
        | {
            /** Referrer needs to create a referral code. */
            stage: "needToCreateCode";
        }
        | {
            /** Referrer must complete a trade before earning rewards. */
            stage: "needToTrade";
            /** Required trading volume details for activation. */
            data: {
                /**
                 * Required trading volume.
                 * @pattern ^[0-9]+(\.[0-9]+)?$
                 */
                required: string;
            };
        };
    /** History of referral rewards. */
    rewardHistory: {
        /**
         * Amount of earned rewards.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        earned: string;
        /**
         * Traded volume at the time of reward.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        vlm: string;
        /**
         * Traded volume via referrals.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        referralVlm: string;
        /** Timestamp when the reward was earned (in ms since epoch). */
        time: number;
    }[];
}

/** Balance for a specific spot token. */
export interface SpotBalance {
    /** Asset symbol. */
    coin: string;
    /** Unique identifier for the token. */
    token: number;
    /**
     * Total balance.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    total: string;
    /**
     * Amount on hold.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    hold: string;
    /**
     * Entry notional value.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    entryNtl: string;
}

/** Account summary for spot trading. */
export interface SpotClearinghouseState {
    /** Balance for each token. */
    balances: SpotBalance[];
    /** Escrowed balances. */
    evmEscrows?: EvmEscrowsBalance[];
}

/** Sub-account details for a user. */
export interface SubAccount {
    /** Sub-account name. */
    name: string;
    /** Sub-account address. */
    subAccountUser: Hex;
    /** Master account address. */
    master: Hex;
    /** Perpetual trading clearinghouse state summary. */
    clearinghouseState: PerpsClearinghouseState;
    /** Spot tokens clearinghouse state. */
    spotState: SpotClearinghouseState;
}

/** User fees. */
export interface UserFees {
    /** Daily user volume metrics. */
    dailyUserVlm: {
        /** Date in YYYY-M-D format. */
        date: `${number}-${number}-${number}`;
        /**
         * User cross-trade volume.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        userCross: string;
        /**
         * User add-liquidity volume.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        userAdd: string;
        /**
         * Exchange total volume.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        exchange: string;
    }[];
    /** Fee schedule information. */
    feeSchedule: {
        /**
         * Cross-trade fee rate.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        cross: string;
        /**
         * Add-liquidity fee rate.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        add: string;
        /**
         * Spot cross-trade fee rate.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        spotCross: string;
        /**
         * Spot add-liquidity fee rate.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        spotAdd: string;
        /** Fee tiers details. */
        tiers: {
            /** VIP fee tier information. */
            vip: {
                /**
                 * Notional volume cutoff.
                 * @pattern ^[0-9]+(\.[0-9]+)?$
                 */
                ntlCutoff: string;
                /**
                 * Cross-trade fee rate.
                 * @pattern ^[0-9]+(\.[0-9]+)?$
                 */
                cross: string;
                /**
                 * Add-liquidity fee rate.
                 * @pattern ^[0-9]+(\.[0-9]+)?$
                 */
                add: string;
                /**
                 * Spot cross-trade fee rate.
                 * @pattern ^[0-9]+(\.[0-9]+)?$
                 */
                spotCross: string;
                /**
                 * Spot add-liquidity fee rate.
                 * @pattern ^[0-9]+(\.[0-9]+)?$
                 */
                spotAdd: string;
            }[];
            /** Market maker fee tier information. */
            mm: {
                /**
                 * Maker fraction cutoff.
                 * @pattern ^[0-9]+(\.[0-9]+)?$
                 */
                makerFractionCutoff: string;
                /**
                 * Add-liquidity fee rate.
                 * @pattern ^-?[0-9]+(\.[0-9]+)?$
                 */
                add: string;
            }[];
        };
        /**
         * Referral discount rate.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        referralDiscount: string;
        /** Staking discount tiers details. */
        stakingDiscountTiers: {
            /**
             * Basis points of maximum supply.
             * @pattern ^[0-9]+(\.[0-9]+)?$
             */
            bpsOfMaxSupply: string;
            /**
             * Discount rate applied.
             * @pattern ^[0-9]+(\.[0-9]+)?$
             */
            discount: string;
        }[];
    };
    /**
     * User cross-trade rate.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    userCrossRate: string;
    /**
     * User add-liquidity rate.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    userAddRate: string;
    /**
     * User spot cross-trade rate.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    userSpotCrossRate: string;
    /**
     * User spot add-liquidity rate.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    userSpotAddRate: string;
    /**
     * Active referral discount rate.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    activeReferralDiscount: string;
    /** Trial details. */
    trial: unknown | null;
    /**
     * Fee trial reward amount.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    feeTrialReward: string;
    /** Timestamp when next trial becomes available. */
    nextTrialAvailableTimestamp: unknown | null;
    stakingLink: unknown | null;
    /** Active staking discount details. */
    activeStakingDiscount: {
        /**
         * Basis points of maximum supply.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        bpsOfMaxSupply: string;
        /**
         * Discount rate applied.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        discount: string;
    };
}

/** Funding ledger update for a user. */
export interface UserFundingUpdate {
    /** Timestamp of the update (in ms since epoch). */
    time: number;
    /** L1 transaction hash. */
    hash: Hex;
    /** Update details. */
    delta: FundingUpdate;
}
/** Funding update details. */
export interface FundingUpdate {
    /** Update type. */
    type: "funding";
    /** Asset symbol. */
    coin: string;
    /**
     * Amount transferred in USDC.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    usdc: string;
    /**
     * Signed position size.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    szi: string;
    /**
     * Applied funding rate.
     * @pattern ^-?[0-9]+(\.[0-9]+)?$
     */
    fundingRate: string;
    /** Number of samples. */
    nSamples: number | null;
}

/** User's rate limits. */
export interface UserRateLimit {
    /**
     * Cumulative trading volume.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    cumVlm: string;
    /** Number of API requests used. */
    nRequestsUsed: number;
    /** Maximum allowed API requests. */
    nRequestsCap: number;
}

/** User's role */
export type UserRole =
    | {
        /** Role identifier. */
        role: "missing" | "user" | "vault";
    }
    | {
        /** Role identifier. */
        role: "agent";
        /** Details for agent role. */
        data: {
            /** Master account address associated with the agent. */
            user: Hex;
        };
    }
    | {
        /** Role identifier. */
        role: "subAccount";
        /** Details for sub-account role. */
        data: {
            /** Master account address associated with the sub-account. */
            master: Hex;
        };
    };

/** Non-funding ledger update for a user. */
export interface UserNonFundingLedgerUpdate {
    /** Timestamp of the update (in ms since epoch). */
    time: number;
    /** L1 transaction hash. */
    hash: Hex;
    /** Update details. */
    delta:
        | AccountClassTransferUpdate
        | DepositUpdate
        | InternalTransferUpdate
        | LiquidationUpdate
        | RewardsClaimUpdate
        | SpotTransferUpdate
        | SubAccountTransferUpdate
        | VaultCreateUpdate
        | VaultDepositUpdate
        | VaultDistributionUpdate
        | VaultWithdrawUpdate
        | WithdrawUpdate;
}
/** Transfer between spot and perpetual accounts. */
export interface AccountClassTransferUpdate {
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
/** Deposit update to an account. */
export interface DepositUpdate {
    /** Update type. */
    type: "deposit";
    /**
     * Amount deposited in USDC.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    usdc: string;
}
/** Internal transfer between accounts. */
export interface InternalTransferUpdate {
    /** Update type. */
    type: "internalTransfer";
    /**
     * Amount transferred in USDC.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    usdc: string;
    /** Initiator's address. */
    user: Hex;
    /** Destination address. */
    destination: Hex;
    /**
     * Transfer fee.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    fee: string;
}
/** Liquidation event update. */
export interface LiquidationUpdate {
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
/** Rewards claim event update. */
export interface RewardsClaimUpdate {
    /** Update type. */
    type: "rewardsClaim";
    /**
     * Amount of rewards claimed.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    amount: string;
}
/** Spot transfer update between accounts. */
export interface SpotTransferUpdate {
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
    /** Initiator's address. */
    user: Hex;
    /** Destination address. */
    destination: Hex;
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
    nonce: null;
}
/** Transfer update between sub-accounts. */
export interface SubAccountTransferUpdate {
    /** Update type. */
    type: "subAccountTransfer";
    /**
     * Amount transferred in USDC.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    usdc: string;
    /** Initiator's address. */
    user: Hex;
    /** Destination address. */
    destination: Hex;
}
/** Vault creation update. */
export interface VaultCreateUpdate {
    /** Update type. */
    type: "vaultCreate";
    /** Address of the created vault. */
    vault: Hex;
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
/** Vault deposit update. */
export interface VaultDepositUpdate {
    /** Update type. */
    type: "vaultDeposit";
    /** Address of the target vault. */
    vault: Hex;
    /**
     * Amount deposited in USDC.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    usdc: string;
}
/** Vault distribution update. */
export interface VaultDistributionUpdate {
    /** Update type. */
    type: "vaultDistribution";
    /** Address of the vault distributing funds. */
    vault: Hex;
    /**
     * Amount distributed in USDC.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    usdc: string;
}
/** Vault withdrawal event update. */
export interface VaultWithdrawUpdate {
    /** Update type. */
    type: "vaultWithdraw";
    /** Vault address. */
    vault: Hex;
    /** Address of the user withdrawing funds. */
    user: Hex;
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
/** Withdrawal update from an account. */
export interface WithdrawUpdate {
    /** Update type. */
    type: "withdraw";
    /**
     * Amount withdrawn in USDC.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    usdc: string;
    /** Unique nonce for the withdrawal request. */
    nonce: number;
    /**
     * Withdrawal fee.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    fee: string;
}
