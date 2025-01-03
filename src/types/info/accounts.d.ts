import type { Hex } from "../common.d.ts";

/** Position in a specific asset. */
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

                /** Amount of raw USD used. */
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

        /** Unrealized PnL. */
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

            /** Funding since the position was opened. */
            sinceOpen: string;

            /** Funding since the last position size change. */
            sinceChange: string;
        };
    };
}

/** Account summary for perpetual trading. */
export interface ClearinghouseState {
    /** Margin details. */
    marginSummary: {
        /** Total account value. */
        accountValue: string;

        /** Total notional value. */
        totalNtlPos: string;

        /** Total raw USD value. */
        totalRawUsd: string;

        /** Total margin used. */
        totalMarginUsed: string;
    };

    /** Cross-margin details. */
    crossMarginSummary: {
        /** Total account value. */
        accountValue: string;

        /** Total notional value. */
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

    /** Positions in various assets. */
    assetPositions: AssetPosition[];

    /** Timestamp when the data was retrieved (in ms since epoch). */
    time: number;
}

/** Balance for a specific spot token. */
export interface SpotBalance {
    /** Asset symbol. */
    coin: string;

    /** Entry notional value. */
    entryNtl: string;

    /** Amount on hold. */
    hold: string;

    /** Unique identifier for the token. */
    token: number;

    /** Total balance. */
    total: string;
}

/** Balances for spot tokens. */
export interface SpotClearinghouseState {
    /** Balance for each token. */
    balances: SpotBalance[];
}

/** User sub-accounts. */
export interface SubAccount {
    /** Name of the sub-account. */
    name: string;

    /** Address of the sub-account. */
    subAccountUser: Hex;

    /** Address of the master account. */
    master: Hex;

    /** Account summary for perpetual trading. */
    clearinghouseState: ClearinghouseState;

    /** Balances for spot tokens. */
    spotState: SpotClearinghouseState;
}

/** User fees. */
export interface UserFees {
    /** User's daily volume. */
    dailyUserVlm: {
        /** Date. */
        date: `${number}-${number}-${number}`;

        /** User's cross-trade volume. */
        userCross: string;

        /** User's add liquidity volume. */
        userAdd: string;

        /** Total exchange volume. */
        exchange: string;
    }[];

    /** Fee schedule. */
    feeSchedule: {
        /** Cross-trade fee rate. */
        cross: string;

        /** Add liquidity fee rate. */
        add: string;

        /** Fee tiers. */
        tiers: {
            /** VIP fee tiers. */
            vip: {
                /** Notional volume cutoff. */
                ntlCutoff: string;

                /** Cross-trade fee rate. */
                cross: string;

                /** Add liquidity fee rate. */
                add: string;
            }[];

            /** MM fee tiers. */
            mm: {
                /** Maker fraction cutoff. */
                makerFractionCutoff: string;

                /** Add liquidity fee rate. */
                add: string;
            }[];
        };

        /** Referral discount. */
        referralDiscount: string;
    };

    /** User's cross-trade rate. */
    userCrossRate: string;

    /** User's add liquidity rate. */
    userAddRate: string;

    /** Active referral discount. */
    activeReferralDiscount: string;

    /** Trial details. */
    trial: unknown | null;

    /** Fee trial reward. */
    feeTrialReward: string;

    /** Next trial available timestamp. */
    nextTrialAvailableTimestamp: unknown | null;
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

/** User's extra agent. */
export interface ExtraAgent {
    /** The address of the extra agent. */
    address: Hex;

    /** The name of the extra agent. */
    name: string;

    /** The validity period of the extra agent. */
    validUntil: number;
}

/** Referral information for a user. */
export interface Referral {
    /** Details about who referred this user, or `null` if no referrer exists. */
    referredBy: {
        /** Referrer's address. */
        referrer: Hex;

        /** Referral code used. */
        code: string;
    } | null;

    /** Cumulative volume traded. */
    cumVlm: string;

    /** Rewards earned but not yet claimed. */
    unclaimedRewards: string;

    /** Rewards claimed. */
    claimedRewards: string;

    /** Rewards builder. */
    builderRewards: string;

    /** Current state of the referrer. */
    referrerState:
        | {
            /** Referrer is ready to receive rewards. */
            stage: "ready";

            /** Data related to the referrer's referral program. */
            data: {
                /** Referral code assigned. */
                code: string;

                /** Summary of each user's activity. */
                referralStates: {
                    /** Cumulative volume traded. */
                    cumVlm: string;

                    /** Total fees rewarded to the referred user since being referred. */
                    cumRewardedFeesSinceReferred: string;

                    /** Total fees rewarded to the referrer from the referred user's trades. */
                    cumFeesRewardedToReferrer: string;

                    /** Timestamp when the referred user joined (in ms since epoch). */
                    timeJoined: number;

                    /** Address of the referred user. */
                    user: string;
                }[];
            };
        }
        | {
            /** Referrer needs to create a referral code to start receiving rewards. */
            stage: "needToCreateCode";
        }
        | {
            /** Referrer must complete a trade before receiving rewards. */
            stage: "needToTrade";

            /** Additional information about the required volume to start earning rewards. */
            data: {
                /** Required trading volume to activate rewards. */
                required: string;
            };
        };

    /** History of rewards. */
    rewardHistory: {
        /** Amount of rewards earned. */
        earned: string;

        /** Volume traded. */
        vlm: string;

        /** Volume traded through referrals. */
        referralVlm: string;

        /** Timestamp when the rewards were earned (in ms since epoch). */
        time: number;
    }[];
}

/** User's funding ledger update. */
export interface UserFunding {
    /** Timestamp of the update (in ms since epoch). */
    time: number;

    /** L1 transaction hash. */
    hash: Hex;

    /** Details of the update. */
    delta: FundingDelta;
}

/** User's non-funding ledger update. */
export interface UserNonFundingLedgerUpdates {
    /** Timestamp of the update (in ms since epoch). */
    time: number;

    /** L1 transaction hash. */
    hash: Hex;

    /** Details of the update. */
    delta:
        | AccountClassTransferDelta
        | DepositDelta
        | InternalTransferDelta
        | LiquidationDelta
        | RewardsClaimDelta
        | SpotTransferDelta
        | SubAccountTransferDelta
        | VaultCreateDelta
        | VaultDistributionDelta
        | WithdrawDelta;
}

/** Transfer between spot and perpetual accounts. */
export interface AccountClassTransferDelta {
    /** Type of update. */
    type: "accountClassTransfer";

    /** Amount. */
    usdc: string;

    /** Whether the transfer is to the perpetual account. */
    toPerp: boolean;
}

/** Deposit to account. */
export interface DepositDelta {
    /** Type of update. */
    type: "deposit";

    /** Amount. */
    usdc: string;
}

/** Internal transfer between accounts. */
export interface InternalTransferDelta {
    /** Type of update. */
    type: "internalTransfer";

    /** Amount. */
    usdc: string;

    /** Address of the user initiating the transfer. */
    user: Hex;

    /** Destination address. */
    destination: Hex;

    /** Fee. */
    fee: string;
}

/** Update representing a liquidation event. */
export interface LiquidationDelta {
    /** Type of update. */
    type: "liquidation";

    /** Total notional value of liquidated positions. */
    liquidatedNtlPos: string;

    /** Account value at the time of liquidation. */
    accountValue: string;

    /** Type of leverage used for the liquidated positions. */
    leverageType: "Isolated";

    /** Details of individual positions that were liquidated. */
    liquidatedPositions: {
        /** Asset symbol of the liquidated position. */
        coin: string;

        /** Signed position size that was liquidated. */
        szi: string;
    }[];
}

/** Funding update. */
export interface FundingDelta {
    /** Type of update. */
    type: "funding";

    /** Asset symbol. */
    coin: string;

    /** Amount. */
    usdc: string;

    /** Signed position size. */
    szi: string;

    /** Funding rate. */
    fundingRate: string;

    /** Number of samples. */
    nSamples: number | null;
}

/** Rewards claim update. */
export interface RewardsClaimDelta {
    /** Type of update. */
    type: "rewardsClaim";

    /** Amount of rewards claimed. */
    amount: string;
}

/** Spot transfer between accounts. */
export interface SpotTransferDelta {
    /** Type of update. */
    type: "spotTransfer";

    /** Token. */
    token: string;

    /** Amount. */
    amount: string;

    /** Equivalent USDC value of the amount. */
    usdcValue: string;

    /** Address of the user initiating the transfer. */
    user: Hex;

    /** Destination address. */
    destination: Hex;

    /** Fee. */
    fee: string;
}

/** Transfer between sub-accounts. */
export interface SubAccountTransferDelta {
    /** Type of update. */
    type: "subAccountTransfer";

    /** Amount. */
    usdc: string;

    /** Address of the user initiating the transfer. */
    user: Hex;

    /** Destination address. */
    destination: Hex;
}

/** Creating a vault. */
export interface VaultCreateDelta {
    /** Type of update. */
    type: "vaultCreate";

    /** Address of the created vault. */
    vault: Hex;

    /** Initial amount allocated. */
    usdc: string;
}

/** Distribution event from a vault. */
export interface VaultDistributionDelta {
    /** Type of update. */
    type: "vaultDistribution";

    /** Address of the vault distributing funds. */
    vault: Hex;

    /** Amount. */
    usdc: string;
}

/** Withdrawal from account. */
export interface WithdrawDelta {
    /** Type of update. */
    type: "withdraw";

    /** Amount. */
    usdc: string;

    /** Unique request identifier. */
    nonce: number;

    /** Fee. */
    fee: string;
}
