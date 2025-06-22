import type { Hex } from "../../base.ts";

/** Position for a specific asset. */
export interface AssetPosition {
    /** Position type. */
    type: "oneWay";
    /** Position details. */
    position: {
        /** Asset symbol. */
        coin: string;
        /** Signed position size. */
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
        /** Average entry price. */
        entryPx: string;
        /** Position value. */
        positionValue: string;
        /** Unrealized profit and loss. */
        unrealizedPnl: string;
        /** Return on equity. */
        returnOnEquity: string;
        /** Liquidation price. */
        liquidationPx: string | null;
        /** Margin used. */
        marginUsed: string;
        /** Maximum allowed leverage. */
        maxLeverage: number;
        /** Cumulative funding details. */
        cumFunding: {
            /** Total funding paid or received since account opening. */
            allTime: string;
            /** Funding accumulated since the position was opened. */
            sinceOpen: string;
            /** Funding accumulated since the last change in position size. */
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
    /** Total balance. */
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
        /** Total account value. */
        accountValue: string;
        /** Total notional position value. */
        totalNtlPos: string;
        /** Total raw USD value. */
        totalRawUsd: string;
        /** Total margin used. */
        totalMarginUsed: string;
    };
    /** Cross-margin summary details. */
    crossMarginSummary: {
        /** Total account value. */
        accountValue: string;
        /** Total notional position value. */
        totalNtlPos: string;
        /** Total raw USD value. */
        totalRawUsd: string;
        /** Total margin used. */
        totalMarginUsed: string;
    };
    /** Maintenance margin used for cross-margin positions. */
    crossMaintenanceMarginUsed: string;
    /** Amount available for withdrawal. */
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
    /** Volume metric for the portfolio. */
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
    /** Activation fee. */
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

    /** Cumulative traded volume. */
    cumVlm: string;
    /** Rewards earned but not yet claimed. */
    unclaimedRewards: string;
    /** Rewards that have been claimed. */
    claimedRewards: string;
    /** Builder reward amount. */
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
                    /** Cumulative traded volume. */
                    cumVlm: string;
                    /** Total fees rewarded to the referred user since referral. */
                    cumRewardedFeesSinceReferred: string;
                    /** Total fees rewarded to the referrer from referred trades. */
                    cumFeesRewardedToReferrer: string;
                    /** Timestamp when the referred user joined (in ms since epoch). */
                    timeJoined: number;
                    /** Address of the referred user. */
                    user: string;
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
                /** Required trading volume. */
                required: string;
            };
        };
    /** History of referral rewards. */
    rewardHistory: {
        /** Amount of earned rewards. */
        earned: string;
        /** Traded volume at the time of reward. */
        vlm: string;
        /** Traded volume via referrals. */
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
    /** Total balance. */
    total: string;
    /** Amount on hold. */
    hold: string;
    /** Entry notional value. */
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
        /** User cross-trade volume. */
        userCross: string;
        /** User add-liquidity volume. */
        userAdd: string;
        /** Exchange total volume. */
        exchange: string;
    }[];
    /** Fee schedule information. */
    feeSchedule: {
        /** Cross-trade fee rate. */
        cross: string;
        /** Add-liquidity fee rate. */
        add: string;
        /** Spot cross-trade fee rate. */
        spotCross: string;
        /** Spot add-liquidity fee rate. */
        spotAdd: string;
        /** Fee tiers details. */
        tiers: {
            /** VIP fee tier information. */
            vip: {
                /** Notional volume cutoff. */
                ntlCutoff: string;
                /** Cross-trade fee rate. */
                cross: string;
                /** Add-liquidity fee rate. */
                add: string;
                /** Spot cross-trade fee rate. */
                spotCross: string;
                /** Spot add-liquidity fee rate. */
                spotAdd: string;
            }[];
            /** Market maker fee tier information. */
            mm: {
                /** Maker fraction cutoff. */
                makerFractionCutoff: string;
                /** Add-liquidity fee rate. */
                add: string;
            }[];
        };
        /** Referral discount rate. */
        referralDiscount: string;
        /** Staking discount tiers details. */
        stakingDiscountTiers: {
            /** Basis points of maximum supply. */
            bpsOfMaxSupply: string;
            /** Discount rate applied. */
            discount: string;
        }[];
    };
    /** User cross-trade rate. */
    userCrossRate: string;
    /** User add-liquidity rate. */
    userAddRate: string;
    /** User spot cross-trade rate. */
    userSpotCrossRate: string;
    /** User spot add-liquidity rate. */
    userSpotAddRate: string;
    /** Active referral discount rate. */
    activeReferralDiscount: string;
    /** Trial details. */
    trial: unknown | null;
    /** Fee trial reward amount. */
    feeTrialReward: string;
    /** Timestamp when next trial becomes available. */
    nextTrialAvailableTimestamp: unknown | null;
    stakingLink: unknown | null;
    /** Active staking discount details. */
    activeStakingDiscount: {
        /** Basis points of maximum supply. */
        bpsOfMaxSupply: string;
        /** Discount rate applied. */
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
    /** Amount transferred in USDC. */
    usdc: string;
    /** Signed position size. */
    szi: string;
    /** Applied funding rate. */
    fundingRate: string;
    /** Number of samples. */
    nSamples: number | null;
}

/** User's rate limits. */
export interface UserRateLimit {
    /** Cumulative trading volume. */
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
    /** Amount transferred in USDC. */
    usdc: string;
    /** Indicates if the transfer is to the perpetual account. */
    toPerp: boolean;
}
/** Deposit update to an account. */
export interface DepositUpdate {
    /** Update type. */
    type: "deposit";
    /** Amount deposited in USDC. */
    usdc: string;
}
/** Internal transfer between accounts. */
export interface InternalTransferUpdate {
    /** Update type. */
    type: "internalTransfer";
    /** Amount transferred in USDC. */
    usdc: string;
    /** Initiator's address. */
    user: Hex;
    /** Destination address. */
    destination: Hex;
    /** Transfer fee. */
    fee: string;
}
/** Liquidation event update. */
export interface LiquidationUpdate {
    /** Update type. */
    type: "liquidation";
    /** Total notional value of liquidated positions. */
    liquidatedNtlPos: string;
    /** Account value at liquidation time. */
    accountValue: string;
    /** Leverage type for liquidated positions. */
    leverageType: "Cross" | "Isolated";
    /** Details of each liquidated position. */
    liquidatedPositions: {
        /** Asset symbol of the liquidated position. */
        coin: string;
        /** Signed position size liquidated. */
        szi: string;
    }[];
}
/** Rewards claim event update. */
export interface RewardsClaimUpdate {
    /** Update type. */
    type: "rewardsClaim";
    /** Amount of rewards claimed. */
    amount: string;
}
/** Spot transfer update between accounts. */
export interface SpotTransferUpdate {
    /** Update type. */
    type: "spotTransfer";
    /** Token symbol. */
    token: string;
    /** Amount transferred. */
    amount: string;
    /** Equivalent USDC value. */
    usdcValue: string;
    /** Initiator's address. */
    user: Hex;
    /** Destination address. */
    destination: Hex;
    /** Transfer fee. */
    fee: string;
    /** Fee in native token. */
    nativeTokenFee: string;
    nonce: null;
}
/** Transfer update between sub-accounts. */
export interface SubAccountTransferUpdate {
    /** Update type. */
    type: "subAccountTransfer";
    /** Amount transferred in USDC. */
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
    /** Initial allocated amount in USDC. */
    usdc: string;
    /** Vault creation fee. */
    fee: string;
}
/** Vault deposit update. */
export interface VaultDepositUpdate {
    /** Update type. */
    type: "vaultDeposit";
    /** Address of the target vault. */
    vault: Hex;
    /** Amount deposited in USDC. */
    usdc: string;
}
/** Vault distribution update. */
export interface VaultDistributionUpdate {
    /** Update type. */
    type: "vaultDistribution";
    /** Address of the vault distributing funds. */
    vault: Hex;
    /** Amount distributed in USDC. */
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
    /** Withdrawal request amount in USD. */
    requestedUsd: string;
    /** Withdrawal commission fee. */
    commission: string;
    /** Closing cost associated with positions. */
    closingCost: string;
    /** Basis value for withdrawal calculation. */
    basis: string;
    /** Net withdrawn amount in USD after fees and costs. */
    netWithdrawnUsd: string;
}
/** Withdrawal update from an account. */
export interface WithdrawUpdate {
    /** Update type. */
    type: "withdraw";
    /** Amount withdrawn in USDC. */
    usdc: string;
    /** Unique nonce for the withdrawal request. */
    nonce: number;
    /** Withdrawal fee. */
    fee: string;
}
