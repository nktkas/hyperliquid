import * as v from "valibot";
import { Decimal, Hex, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import { FrontendOrder, TwapState } from "./orders.ts";
import { PerpsAssetCtx, PerpsMeta, SpotAssetCtx } from "./assets.ts";

/** User active asset data. */
export const ActiveAssetData = v.pipe(
    v.object({
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** Asset symbol (e.g., BTC). */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol (e.g., BTC)."),
        ),
        /** Leverage configuration. */
        leverage: v.pipe(
            v.union([
                v.object({
                    /** Leverage type. */
                    type: v.pipe(
                        v.literal("isolated"),
                        v.description("Leverage type."),
                    ),
                    /** Leverage value used. */
                    value: v.pipe(
                        UnsignedInteger,
                        v.minValue(1),
                        v.description("Leverage value used."),
                    ),
                    /** Amount of USD used (1 = 1$). */
                    rawUsd: v.pipe(
                        UnsignedDecimal,
                        v.description("Amount of USD used (1 = 1$)."),
                    ),
                }),
                v.object({
                    /** Leverage type. */
                    type: v.pipe(
                        v.literal("cross"),
                        v.description("Leverage type."),
                    ),
                    /** Leverage value used. */
                    value: v.pipe(
                        UnsignedInteger,
                        v.minValue(1),
                        v.description("Leverage value used."),
                    ),
                }),
            ]),
            v.description("Leverage configuration."),
        ),
        /** Maximum trade size range [min, max]. */
        maxTradeSzs: v.pipe(
            v.tuple([UnsignedDecimal, UnsignedDecimal]),
            v.description("Maximum trade size range [min, max]."),
        ),
        /** Available to trade range [min, max]. */
        availableToTrade: v.pipe(
            v.tuple([UnsignedDecimal, UnsignedDecimal]),
            v.description("Available to trade range [min, max]."),
        ),
        /** Mark price. */
        markPx: v.pipe(
            UnsignedDecimal,
            v.description("Mark price."),
        ),
    }),
    v.description("User active asset data."),
);
export type ActiveAssetData = v.InferOutput<typeof ActiveAssetData>;

/** Position for a specific asset. */
export const AssetPosition = v.pipe(
    v.object({
        /** Position type. */
        type: v.pipe(
            v.literal("oneWay"),
            v.description("Position type."),
        ),
        /** Position details. */
        position: v.pipe(
            v.object({
                /** Asset symbol. */
                coin: v.pipe(
                    v.string(),
                    v.description("Asset symbol."),
                ),
                /** Signed position size. */
                szi: v.pipe(
                    Decimal,
                    v.description("Signed position size."),
                ),
                /** Leverage details. */
                leverage: v.pipe(
                    v.union([
                        v.object({
                            /** Leverage type. */
                            type: v.pipe(
                                v.literal("isolated"),
                                v.description("Leverage type."),
                            ),
                            /** Leverage value used. */
                            value: v.pipe(
                                UnsignedInteger,
                                v.minValue(1),
                                v.description("Leverage value used."),
                            ),
                            /** Amount of USD used (1 = 1$). */
                            rawUsd: v.pipe(
                                UnsignedDecimal,
                                v.description("Amount of USD used (1 = 1$)."),
                            ),
                        }),
                        v.object({
                            /** Leverage type. */
                            type: v.pipe(
                                v.literal("cross"),
                                v.description("Leverage type."),
                            ),
                            /** Leverage value used. */
                            value: v.pipe(
                                UnsignedInteger,
                                v.minValue(1),
                                v.description("Leverage value used."),
                            ),
                        }),
                    ]),
                    v.description("Leverage details."),
                ),
                /** Average entry price. */
                entryPx: v.pipe(
                    UnsignedDecimal,
                    v.description("Average entry price."),
                ),
                /** Position value. */
                positionValue: v.pipe(
                    UnsignedDecimal,
                    v.description("Position value."),
                ),
                /** Unrealized profit and loss. */
                unrealizedPnl: v.pipe(
                    Decimal,
                    v.description("Unrealized profit and loss."),
                ),
                /** Return on equity. */
                returnOnEquity: v.pipe(
                    Decimal,
                    v.description("Return on equity."),
                ),
                /** Liquidation price. */
                liquidationPx: v.pipe(
                    v.union([UnsignedDecimal, v.null()]),
                    v.description("Liquidation price."),
                ),
                /** Margin used. */
                marginUsed: v.pipe(
                    UnsignedDecimal,
                    v.description("Margin used."),
                ),
                /** Maximum allowed leverage. */
                maxLeverage: v.pipe(
                    UnsignedInteger,
                    v.minValue(1),
                    v.description("Maximum allowed leverage."),
                ),
                /** Cumulative funding details. */
                cumFunding: v.pipe(
                    v.object({
                        /** Total funding paid or received since account opening. */
                        allTime: v.pipe(
                            Decimal,
                            v.description("Total funding paid or received since account opening."),
                        ),
                        /** Funding accumulated since the position was opened. */
                        sinceOpen: v.pipe(
                            Decimal,
                            v.description("Funding accumulated since the position was opened."),
                        ),
                        /** Funding accumulated since the last change in position size. */
                        sinceChange: v.pipe(
                            Decimal,
                            v.description("Funding accumulated since the last change in position size."),
                        ),
                    }),
                    v.description("Cumulative funding details."),
                ),
            }),
            v.description("Position details."),
        ),
    }),
    v.description("Position for a specific asset."),
);
export type AssetPosition = v.InferOutput<typeof AssetPosition>;

/** Escrowed balance for a specific asset. */
export const EvmEscrowsBalance = v.pipe(
    v.object({
        /** Asset symbol. */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
        ),
        /** Unique identifier for the token. */
        token: v.pipe(
            UnsignedInteger,
            v.description("Unique identifier for the token."),
        ),
        /** Total balance. */
        total: v.pipe(
            UnsignedDecimal,
            v.description("Total balance."),
        ),
    }),
    v.description("Escrowed balance for a specific asset."),
);
export type EvmEscrowsBalance = v.InferOutput<typeof EvmEscrowsBalance>;

/** Extra agent details for a user. */
export const ExtraAgent = v.pipe(
    v.object({
        /** Extra agent address. */
        address: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Extra agent address."),
        ),
        /** Extra agent name. */
        name: v.pipe(
            v.string(),
            v.minLength(1),
            v.description("Extra agent name."),
        ),
        /** Validity period as a timestamp (in ms since epoch). */
        validUntil: v.pipe(
            UnsignedInteger,
            v.description("Validity period as a timestamp (in ms since epoch)."),
        ),
    }),
    v.description("Extra agent details for a user."),
);
export type ExtraAgent = v.InferOutput<typeof ExtraAgent>;

/** Legal verification status for a user. */
export const LegalCheck = v.pipe(
    v.object({
        /** Whether the user IP address is allowed. */
        ipAllowed: v.pipe(
            v.boolean(),
            v.description("Whether the user IP address is allowed."),
        ),
        /** Whether the user has accepted the terms of service. */
        acceptedTerms: v.pipe(
            v.boolean(),
            v.description("Whether the user has accepted the terms of service."),
        ),
        /** Whether the user is allowed to use the platform. */
        userAllowed: v.pipe(
            v.boolean(),
            v.description("Whether the user is allowed to use the platform."),
        ),
    }),
    v.description("Legal verification status for a user."),
);
export type LegalCheck = v.InferOutput<typeof LegalCheck>;

/** Multi-sig signers for a user. */
export const MultiSigSigners = v.pipe(
    v.object({
        /** Authorized users addresses. */
        authorizedUsers: v.pipe(
            v.array(v.pipe(Hex, v.length(42))),
            v.minLength(1),
            v.description("Authorized users addresses."),
        ),
        /** Threshold number of signatures required. */
        threshold: v.pipe(
            UnsignedInteger,
            v.minValue(1),
            v.description("Threshold number of signatures required."),
        ),
    }),
    v.description("Multi-sig signers for a user."),
);
export type MultiSigSigners = v.InferOutput<typeof MultiSigSigners>;

/** Account summary for perpetual trading. */
export const PerpsClearinghouseState = v.pipe(
    v.object({
        /** Margin summary details. */
        marginSummary: v.pipe(
            v.object({
                /** Total account value. */
                accountValue: v.pipe(
                    UnsignedDecimal,
                    v.description("Total account value."),
                ),
                /** Total notional position value. */
                totalNtlPos: v.pipe(
                    UnsignedDecimal,
                    v.description("Total notional position value."),
                ),
                /** Total raw USD value. */
                totalRawUsd: v.pipe(
                    UnsignedDecimal,
                    v.description("Total raw USD value."),
                ),
                /** Total margin used. */
                totalMarginUsed: v.pipe(
                    UnsignedDecimal,
                    v.description("Total margin used."),
                ),
            }),
            v.description("Margin summary details."),
        ),
        /** Cross-margin summary details. */
        crossMarginSummary: v.pipe(
            v.object({
                /** Total account value. */
                accountValue: v.pipe(
                    UnsignedDecimal,
                    v.description("Total account value."),
                ),
                /** Total notional position value. */
                totalNtlPos: v.pipe(
                    UnsignedDecimal,
                    v.description("Total notional position value."),
                ),
                /** Total raw USD value. */
                totalRawUsd: v.pipe(
                    UnsignedDecimal,
                    v.description("Total raw USD value."),
                ),
                /** Total margin used. */
                totalMarginUsed: v.pipe(
                    UnsignedDecimal,
                    v.description("Total margin used."),
                ),
            }),
            v.description("Cross-margin summary details."),
        ),
        /** Maintenance margin used for cross-margin positions. */
        crossMaintenanceMarginUsed: v.pipe(
            UnsignedDecimal,
            v.description("Maintenance margin used for cross-margin positions."),
        ),
        /** Amount available for withdrawal. */
        withdrawable: v.pipe(
            UnsignedDecimal,
            v.description("Amount available for withdrawal."),
        ),
        /** List of asset positions. */
        assetPositions: v.pipe(
            v.array(AssetPosition),
            v.description("List of asset positions."),
        ),
        /** Timestamp when data was retrieved (in ms since epoch). */
        time: v.pipe(
            UnsignedInteger,
            v.description("Timestamp when data was retrieved (in ms since epoch)."),
        ),
    }),
    v.description("Account summary for perpetual trading."),
);
export type PerpsClearinghouseState = v.InferOutput<typeof PerpsClearinghouseState>;

/** Portfolio metrics snapshot. */
export const Portfolio = v.pipe(
    v.object({
        /** History entries for account value as [timestamp, value]. */
        accountValueHistory: v.pipe(
            v.array(v.tuple([UnsignedInteger, UnsignedDecimal])),
            v.description("History entries for account value as [timestamp, value]."),
        ),
        /** History entries for profit and loss as [timestamp, value]. */
        pnlHistory: v.pipe(
            v.array(v.tuple([UnsignedInteger, Decimal])),
            v.description("History entries for profit and loss as [timestamp, value]."),
        ),
        /** Volume metric for the portfolio. */
        vlm: v.pipe(
            UnsignedDecimal,
            v.description("Volume metric for the portfolio."),
        ),
    }),
    v.description("Portfolio metrics snapshot."),
);
export type Portfolio = v.InferOutput<typeof Portfolio>;

/** Portfolio metrics grouped by time periods. */
export const PortfolioPeriods = v.pipe(
    v.tuple([
        v.tuple([v.literal("day"), Portfolio]),
        v.tuple([v.literal("week"), Portfolio]),
        v.tuple([v.literal("month"), Portfolio]),
        v.tuple([v.literal("allTime"), Portfolio]),
        v.tuple([v.literal("perpDay"), Portfolio]),
        v.tuple([v.literal("perpWeek"), Portfolio]),
        v.tuple([v.literal("perpMonth"), Portfolio]),
        v.tuple([v.literal("perpAllTime"), Portfolio]),
    ]),
    v.description("Portfolio metrics grouped by time periods."),
);
export type PortfolioPeriods = v.InferOutput<typeof PortfolioPeriods>;

/** Pre-transfer user existence check result. */
export const PreTransferCheck = v.pipe(
    v.object({
        /** Activation fee. */
        fee: v.pipe(
            UnsignedDecimal,
            v.description("Activation fee."),
        ),
        /** Whether the user is sanctioned. */
        isSanctioned: v.pipe(
            v.boolean(),
            v.description("Whether the user is sanctioned."),
        ),
        /** Whether the user exists. */
        userExists: v.pipe(
            v.boolean(),
            v.description("Whether the user exists."),
        ),
        /** Whether the user has sent a transaction. */
        userHasSentTx: v.pipe(
            v.boolean(),
            v.description("Whether the user has sent a transaction."),
        ),
    }),
    v.description("Pre-transfer user existence check result."),
);
export type PreTransferCheck = v.InferOutput<typeof PreTransferCheck>;

/** Referral details for a user. */
export const Referral = v.pipe(
    v.object({
        /** Referrer details. */
        referredBy: v.pipe(
            v.union([
                v.object({
                    /** Referrer address. */
                    referrer: v.pipe(
                        v.pipe(Hex, v.length(42)),
                        v.description("Referrer address."),
                    ),
                    /** Referral code used. */
                    code: v.pipe(
                        v.string(),
                        v.minLength(1),
                        v.description("Referral code used."),
                    ),
                }),
                v.null(),
            ]),
            v.description("Referrer details."),
        ),
        /** Cumulative traded volume. */
        cumVlm: v.pipe(
            UnsignedDecimal,
            v.description("Cumulative traded volume."),
        ),
        /** Rewards earned but not yet claimed. */
        unclaimedRewards: v.pipe(
            UnsignedDecimal,
            v.description("Rewards earned but not yet claimed."),
        ),
        /** Rewards that have been claimed. */
        claimedRewards: v.pipe(
            UnsignedDecimal,
            v.description("Rewards that have been claimed."),
        ),
        /** Builder reward amount. */
        builderRewards: v.pipe(
            UnsignedDecimal,
            v.description("Builder reward amount."),
        ),
        /** Current state of the referrer. */
        referrerState: v.pipe(
            v.union([
                v.object({
                    /** Referrer is ready to receive rewards. */
                    stage: v.pipe(
                        v.literal("ready"),
                        v.description("Referrer is ready to receive rewards."),
                    ),
                    /** Referral program details. */
                    data: v.pipe(
                        v.object({
                            /** Assigned referral code. */
                            code: v.pipe(
                                v.string(),
                                v.minLength(1),
                                v.description("Assigned referral code."),
                            ),
                            /** Total number of referrals. */
                            nReferrals: v.pipe(
                                UnsignedInteger,
                                v.description("Total number of referrals."),
                            ),
                            /** Summary of each referral state. */
                            referralStates: v.pipe(
                                v.array(
                                    v.object({
                                        /** Cumulative traded volume. */
                                        cumVlm: v.pipe(
                                            UnsignedDecimal,
                                            v.description("Cumulative traded volume."),
                                        ),
                                        /** Total fees rewarded to the referred user since referral. */
                                        cumRewardedFeesSinceReferred: v.pipe(
                                            UnsignedDecimal,
                                            v.description("Total fees rewarded to the referred user since referral."),
                                        ),
                                        /** Total fees rewarded to the referrer from referred trades. */
                                        cumFeesRewardedToReferrer: v.pipe(
                                            UnsignedDecimal,
                                            v.description("Total fees rewarded to the referrer from referred trades."),
                                        ),
                                        /** Timestamp when the referred user joined (in ms since epoch). */
                                        timeJoined: v.pipe(
                                            UnsignedInteger,
                                            v.description(
                                                "Timestamp when the referred user joined (in ms since epoch).",
                                            ),
                                        ),
                                        /** Address of the referred user. */
                                        user: v.pipe(
                                            v.pipe(Hex, v.length(42)),
                                            v.description("Address of the referred user."),
                                        ),
                                        /** Mapping of token IDs to referral reward states. */
                                        tokenToState: v.pipe(
                                            v.array(
                                                v.tuple([
                                                    UnsignedInteger,
                                                    v.object({
                                                        /** Cumulative traded volume. */
                                                        cumVlm: v.pipe(
                                                            UnsignedDecimal,
                                                            v.description("Cumulative traded volume."),
                                                        ),
                                                        /** Total fees rewarded to the referred user since referral. */
                                                        cumRewardedFeesSinceReferred: v.pipe(
                                                            UnsignedDecimal,
                                                            v.description(
                                                                "Total fees rewarded to the referred user since referral.",
                                                            ),
                                                        ),
                                                        /** Total fees rewarded to the referrer from referred trades. */
                                                        cumFeesRewardedToReferrer: v.pipe(
                                                            UnsignedDecimal,
                                                            v.description(
                                                                "Total fees rewarded to the referrer from referred trades.",
                                                            ),
                                                        ),
                                                    }),
                                                ]),
                                            ),
                                            v.description("Mapping of token IDs to referral reward states."),
                                        ),
                                    }),
                                ),
                                v.description("Summary of each referral state."),
                            ),
                        }),
                        v.description("Referral program details."),
                    ),
                }),
                v.object({
                    /** Referrer needs to create a referral code. */
                    stage: v.pipe(
                        v.literal("needToCreateCode"),
                        v.description("Referrer needs to create a referral code."),
                    ),
                }),
                v.object({
                    /** Referrer must complete a trade before earning rewards. */
                    stage: v.pipe(
                        v.literal("needToTrade"),
                        v.description("Referrer must complete a trade before earning rewards."),
                    ),
                    /** Required trading volume details for activation. */
                    data: v.pipe(
                        v.object({
                            /** Required trading volume. */
                            required: v.pipe(
                                UnsignedDecimal,
                                v.description("Required trading volume."),
                            ),
                        }),
                        v.description("Required trading volume details for activation."),
                    ),
                }),
            ]),
            v.description("Current state of the referrer."),
        ),
        /** History of referral rewards. */
        rewardHistory: v.pipe(
            v.array(
                v.object({
                    /** Amount of earned rewards. */
                    earned: v.pipe(
                        UnsignedDecimal,
                        v.description("Amount of earned rewards."),
                    ),
                    /** Traded volume at the time of reward. */
                    vlm: v.pipe(
                        UnsignedDecimal,
                        v.description("Traded volume at the time of reward."),
                    ),
                    /** Traded volume via referrals. */
                    referralVlm: v.pipe(
                        UnsignedDecimal,
                        v.description("Traded volume via referrals."),
                    ),
                    /** Timestamp when the reward was earned (in ms since epoch). */
                    time: v.pipe(
                        UnsignedInteger,
                        v.description("Timestamp when the reward was earned (in ms since epoch)."),
                    ),
                }),
            ),
            v.description("History of referral rewards."),
        ),
        /** Mapping of token IDs to referral reward states. */
        tokenToState: v.pipe(
            v.array(
                v.tuple([
                    UnsignedInteger,
                    v.object({
                        /** Cumulative traded volume. */
                        cumVlm: v.pipe(
                            UnsignedDecimal,
                            v.description("Cumulative traded volume."),
                        ),
                        /** Rewards earned but not yet claimed. */
                        unclaimedRewards: v.pipe(
                            UnsignedDecimal,
                            v.description("Rewards earned but not yet claimed."),
                        ),
                        /** Rewards that have been claimed. */
                        claimedRewards: v.pipe(
                            UnsignedDecimal,
                            v.description("Rewards that have been claimed."),
                        ),
                        /** Builder reward amount. */
                        builderRewards: v.pipe(
                            UnsignedDecimal,
                            v.description("Builder reward amount."),
                        ),
                    }),
                ]),
            ),
            v.description("Mapping of token IDs to referral reward states."),
        ),
    }),
    v.description("Referral details for a user."),
);
export type Referral = v.InferOutput<typeof Referral>;

/** Balance for a specific spot token. */
export const SpotBalance = v.pipe(
    v.object({
        /** Asset symbol. */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
        ),
        /** Unique identifier for the token. */
        token: v.pipe(
            UnsignedInteger,
            v.description("Unique identifier for the token."),
        ),
        /** Total balance. */
        total: v.pipe(
            UnsignedDecimal,
            v.description("Total balance."),
        ),
        /** Amount on hold. */
        hold: v.pipe(
            UnsignedDecimal,
            v.description("Amount on hold."),
        ),
        /** Entry notional value. */
        entryNtl: v.pipe(
            UnsignedDecimal,
            v.description("Entry notional value."),
        ),
    }),
    v.description("Balance for a specific spot token."),
);
export type SpotBalance = v.InferOutput<typeof SpotBalance>;

/** Account summary for spot trading. */
export const SpotClearinghouseState = v.pipe(
    v.object({
        /** Balance for each token. */
        balances: v.pipe(
            v.array(SpotBalance),
            v.description("Balance for each token."),
        ),
        /** Escrowed balances. */
        evmEscrows: v.pipe(
            v.optional(v.array(EvmEscrowsBalance)),
            v.description("Escrowed balances."),
        ),
    }),
    v.description("Account summary for spot trading."),
);
export type SpotClearinghouseState = v.InferOutput<typeof SpotClearinghouseState>;

/** Sub-account details for a user. */
export const SubAccount = v.pipe(
    v.object({
        /** Sub-account name. */
        name: v.pipe(
            v.string(),
            v.minLength(1),
            v.description("Sub-account name."),
        ),
        /** Sub-account address. */
        subAccountUser: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Sub-account address."),
        ),
        /** Master account address. */
        master: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Master account address."),
        ),
        /** Perpetual trading clearinghouse state summary. */
        clearinghouseState: v.pipe(
            PerpsClearinghouseState,
            v.description("Perpetual trading clearinghouse state summary."),
        ),
        /** Spot tokens clearinghouse state. */
        spotState: v.pipe(
            SpotClearinghouseState,
            v.description("Spot tokens clearinghouse state."),
        ),
    }),
    v.description("Sub-account details for a user."),
);
export type SubAccount = v.InferOutput<typeof SubAccount>;

/** User fees. */
export const UserFees = v.pipe(
    v.object({
        /** Daily user volume metrics. */
        dailyUserVlm: v.pipe(
            v.array(
                v.object({
                    /** Date in YYYY-M-D format. */
                    date: v.pipe(
                        v.string(),
                        v.isoDate(),
                        v.description("Date in YYYY-M-D format."),
                    ),
                    /** User cross-trade volume. */
                    userCross: v.pipe(
                        UnsignedDecimal,
                        v.description("User cross-trade volume."),
                    ),
                    /** User add-liquidity volume. */
                    userAdd: v.pipe(
                        UnsignedDecimal,
                        v.description("User add-liquidity volume."),
                    ),
                    /** Exchange total volume. */
                    exchange: v.pipe(
                        UnsignedDecimal,
                        v.description("Exchange total volume."),
                    ),
                }),
            ),
            v.description("Daily user volume metrics."),
        ),
        /** Fee schedule information. */
        feeSchedule: v.pipe(
            v.object({
                /** Cross-trade fee rate. */
                cross: v.pipe(
                    UnsignedDecimal,
                    v.description("Cross-trade fee rate."),
                ),
                /** Add-liquidity fee rate. */
                add: v.pipe(
                    UnsignedDecimal,
                    v.description("Add-liquidity fee rate."),
                ),
                /** Spot cross-trade fee rate. */
                spotCross: v.pipe(
                    UnsignedDecimal,
                    v.description("Spot cross-trade fee rate."),
                ),
                /** Spot add-liquidity fee rate. */
                spotAdd: v.pipe(
                    UnsignedDecimal,
                    v.description("Spot add-liquidity fee rate."),
                ),
                /** Fee tiers details. */
                tiers: v.pipe(
                    v.object({
                        /** VIP fee tier information. */
                        vip: v.pipe(
                            v.array(
                                v.object({
                                    /** Notional volume cutoff. */
                                    ntlCutoff: v.pipe(
                                        UnsignedDecimal,
                                        v.description("Notional volume cutoff."),
                                    ),
                                    /** Cross-trade fee rate. */
                                    cross: v.pipe(
                                        UnsignedDecimal,
                                        v.description("Cross-trade fee rate."),
                                    ),
                                    /** Add-liquidity fee rate. */
                                    add: v.pipe(
                                        UnsignedDecimal,
                                        v.description("Add-liquidity fee rate."),
                                    ),
                                    /** Spot cross-trade fee rate. */
                                    spotCross: v.pipe(
                                        UnsignedDecimal,
                                        v.description("Spot cross-trade fee rate."),
                                    ),
                                    /** Spot add-liquidity fee rate. */
                                    spotAdd: v.pipe(
                                        UnsignedDecimal,
                                        v.description("Spot add-liquidity fee rate."),
                                    ),
                                }),
                            ),
                            v.description("VIP fee tier information."),
                        ),
                        /** Market maker fee tier information. */
                        mm: v.pipe(
                            v.array(
                                v.object({
                                    /** Maker fraction cutoff. */
                                    makerFractionCutoff: v.pipe(
                                        UnsignedDecimal,
                                        v.description("Maker fraction cutoff."),
                                    ),
                                    /** Add-liquidity fee rate. */
                                    add: v.pipe(
                                        Decimal,
                                        v.description("Add-liquidity fee rate."),
                                    ),
                                }),
                            ),
                            v.description("Market maker fee tier information."),
                        ),
                    }),
                    v.description("Fee tiers details."),
                ),
                /** Referral discount rate. */
                referralDiscount: v.pipe(
                    UnsignedDecimal,
                    v.description("Referral discount rate."),
                ),
                /** Staking discount tiers details. */
                stakingDiscountTiers: v.pipe(
                    v.array(
                        v.object({
                            /** Basis points of maximum supply. */
                            bpsOfMaxSupply: v.pipe(
                                UnsignedDecimal,
                                v.description("Basis points of maximum supply."),
                            ),
                            /** Discount rate applied. */
                            discount: v.pipe(
                                UnsignedDecimal,
                                v.description("Discount rate applied."),
                            ),
                        }),
                    ),
                    v.description("Staking discount tiers details."),
                ),
            }),
            v.description("Fee schedule information."),
        ),
        /** User cross-trade rate. */
        userCrossRate: v.pipe(
            UnsignedDecimal,
            v.description("User cross-trade rate."),
        ),
        /** User add-liquidity rate. */
        userAddRate: v.pipe(
            UnsignedDecimal,
            v.description("User add-liquidity rate."),
        ),
        /** User spot cross-trade rate. */
        userSpotCrossRate: v.pipe(
            UnsignedDecimal,
            v.description("User spot cross-trade rate."),
        ),
        /** User spot add-liquidity rate. */
        userSpotAddRate: v.pipe(
            UnsignedDecimal,
            v.description("User spot add-liquidity rate."),
        ),
        /** Active referral discount rate. */
        activeReferralDiscount: v.pipe(
            UnsignedDecimal,
            v.description("Active referral discount rate."),
        ),
        /** Trial details. */
        trial: v.pipe(
            v.union([v.unknown(), v.null()]),
            v.description("Trial details."),
        ),
        /** Fee trial reward amount. */
        feeTrialReward: v.pipe(
            UnsignedDecimal,
            v.description("Fee trial reward amount."),
        ),
        /** Timestamp when next trial becomes available. */
        nextTrialAvailableTimestamp: v.pipe(
            v.union([v.unknown(), v.null()]),
            v.description("Timestamp when next trial becomes available."),
        ),
        stakingLink: v.union([v.unknown(), v.null()]),
        /** Active staking discount details. */
        activeStakingDiscount: v.pipe(
            v.object({
                /** Basis points of maximum supply. */
                bpsOfMaxSupply: v.pipe(
                    UnsignedDecimal,
                    v.description("Basis points of maximum supply."),
                ),
                /** Discount rate applied. */
                discount: v.pipe(
                    UnsignedDecimal,
                    v.description("Discount rate applied."),
                ),
            }),
            v.description("Active staking discount details."),
        ),
    }),
    v.description("User fees."),
);
export type UserFees = v.InferOutput<typeof UserFees>;

/** Funding update details. */
export const FundingUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("funding"),
            v.description("Update type."),
        ),
        /** Asset symbol. */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
        ),
        /** Amount transferred in USDC. */
        usdc: v.pipe(
            Decimal,
            v.description("Amount transferred in USDC."),
        ),
        /** Signed position size. */
        szi: v.pipe(
            Decimal,
            v.description("Signed position size."),
        ),
        /** Applied funding rate. */
        fundingRate: v.pipe(
            Decimal,
            v.description("Applied funding rate."),
        ),
        /** Number of samples. */
        nSamples: v.pipe(
            v.union([UnsignedInteger, v.null()]),
            v.description("Number of samples."),
        ),
    }),
    v.description("Funding update details."),
);
export type FundingUpdate = v.InferOutput<typeof FundingUpdate>;

/** Funding ledger update for a user. */
export const UserFundingUpdate = v.pipe(
    v.object({
        /** Timestamp of the update (in ms since epoch). */
        time: v.pipe(
            UnsignedInteger,
            v.description("Timestamp of the update (in ms since epoch)."),
        ),
        /** L1 transaction hash. */
        hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("L1 transaction hash."),
        ),
        /** Update details. */
        delta: v.pipe(
            FundingUpdate,
            v.description("Update details."),
        ),
    }),
    v.description("Funding ledger update for a user."),
);
export type UserFundingUpdate = v.InferOutput<typeof UserFundingUpdate>;

/** User rate limits. */
export const UserRateLimit = v.pipe(
    v.object({
        /** Cumulative trading volume. */
        cumVlm: v.pipe(
            UnsignedDecimal,
            v.description("Cumulative trading volume."),
        ),
        /** Number of API requests used. */
        nRequestsUsed: v.pipe(
            UnsignedInteger,
            v.description("Number of API requests used."),
        ),
        /** Maximum allowed API requests. */
        nRequestsCap: v.pipe(
            UnsignedInteger,
            v.description("Maximum allowed API requests."),
        ),
    }),
    v.description("User rate limits."),
);
export type UserRateLimit = v.InferOutput<typeof UserRateLimit>;

/** User role. */
export const UserRole = v.pipe(
    v.union([
        v.object({
            /** Role identifier. */
            role: v.pipe(
                v.union([v.literal("missing"), v.literal("user"), v.literal("vault")]),
                v.description("Role identifier."),
            ),
        }),
        v.object({
            /** Role identifier. */
            role: v.pipe(
                v.literal("agent"),
                v.description("Role identifier."),
            ),
            /** Details for agent role. */
            data: v.pipe(
                v.object({
                    /** Master account address associated with the agent. */
                    user: v.pipe(
                        v.pipe(Hex, v.length(42)),
                        v.description("Master account address associated with the agent."),
                    ),
                }),
                v.description("Details for agent role."),
            ),
        }),
        v.object({
            /** Role identifier. */
            role: v.pipe(
                v.literal("subAccount"),
                v.description("Role identifier."),
            ),
            /** Details for sub-account role. */
            data: v.pipe(
                v.object({
                    /** Master account address associated with the sub-account. */
                    master: v.pipe(
                        v.pipe(Hex, v.length(42)),
                        v.description("Master account address associated with the sub-account."),
                    ),
                }),
                v.description("Details for sub-account role."),
            ),
        }),
    ]),
    v.description("User role."),
);
export type UserRole = v.InferOutput<typeof UserRole>;

/** Transfer between spot and perpetual accounts. */
export const AccountClassTransferUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("accountClassTransfer"),
            v.description("Update type."),
        ),
        /** Amount transferred in USDC. */
        usdc: v.pipe(
            UnsignedDecimal,
            v.description("Amount transferred in USDC."),
        ),
        /** Indicates if the transfer is to the perpetual account. */
        toPerp: v.pipe(
            v.boolean(),
            v.description("Indicates if the transfer is to the perpetual account."),
        ),
    }),
    v.description("Transfer between spot and perpetual accounts."),
);
export type AccountClassTransferUpdate = v.InferOutput<typeof AccountClassTransferUpdate>;

/** Deposit update to an account. */
export const DepositUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("deposit"),
            v.description("Update type."),
        ),
        /** Amount deposited in USDC. */
        usdc: v.pipe(
            UnsignedDecimal,
            v.description("Amount deposited in USDC."),
        ),
    }),
    v.description("Deposit update to an account."),
);
export type DepositUpdate = v.InferOutput<typeof DepositUpdate>;

/** Internal transfer between accounts. */
export const InternalTransferUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("internalTransfer"),
            v.description("Update type."),
        ),
        /** Amount transferred in USDC. */
        usdc: v.pipe(
            UnsignedDecimal,
            v.description("Amount transferred in USDC."),
        ),
        /** Initiator address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Initiator address."),
        ),
        /** Destination address. */
        destination: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Destination address."),
        ),
        /** Transfer fee. */
        fee: v.pipe(
            UnsignedDecimal,
            v.description("Transfer fee."),
        ),
    }),
    v.description("Internal transfer between accounts."),
);
export type InternalTransferUpdate = v.InferOutput<typeof InternalTransferUpdate>;

/** Liquidation event update. */
export const LiquidationUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("liquidation"),
            v.description("Update type."),
        ),
        /** Total notional value of liquidated positions. */
        liquidatedNtlPos: v.pipe(
            UnsignedDecimal,
            v.description("Total notional value of liquidated positions."),
        ),
        /** Account value at liquidation time. */
        accountValue: v.pipe(
            UnsignedDecimal,
            v.description("Account value at liquidation time."),
        ),
        /** Leverage type for liquidated positions. */
        leverageType: v.pipe(
            v.union([v.literal("Cross"), v.literal("Isolated")]),
            v.description("Leverage type for liquidated positions."),
        ),
        /** Details of each liquidated position. */
        liquidatedPositions: v.pipe(
            v.array(
                v.object({
                    /** Asset symbol of the liquidated position. */
                    coin: v.pipe(
                        v.string(),
                        v.description("Asset symbol of the liquidated position."),
                    ),
                    /** Signed position size liquidated. */
                    szi: v.pipe(
                        Decimal,
                        v.description("Signed position size liquidated."),
                    ),
                }),
            ),
            v.description("Details of each liquidated position."),
        ),
    }),
    v.description("Liquidation event update."),
);
export type LiquidationUpdate = v.InferOutput<typeof LiquidationUpdate>;

/** Rewards claim event update. */
export const RewardsClaimUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("rewardsClaim"),
            v.description("Update type."),
        ),
        /** Amount of rewards claimed. */
        amount: v.pipe(
            UnsignedDecimal,
            v.description("Amount of rewards claimed."),
        ),
        /** Token symbol. */
        token: v.pipe(
            v.string(),
            v.description("Token symbol."),
        ),
    }),
    v.description("Rewards claim event update."),
);
export type RewardsClaimUpdate = v.InferOutput<typeof RewardsClaimUpdate>;

/** Spot transfer update between accounts. */
export const SpotTransferUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("spotTransfer"),
            v.description("Update type."),
        ),
        /** Token symbol. */
        token: v.pipe(
            v.string(),
            v.description("Token symbol."),
        ),
        /** Amount transferred. */
        amount: v.pipe(
            UnsignedDecimal,
            v.description("Amount transferred."),
        ),
        /** Equivalent USDC value. */
        usdcValue: v.pipe(
            UnsignedDecimal,
            v.description("Equivalent USDC value."),
        ),
        /** Initiator address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Initiator address."),
        ),
        /** Destination address. */
        destination: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Destination address."),
        ),
        /** Transfer fee. */
        fee: v.pipe(
            UnsignedDecimal,
            v.description("Transfer fee."),
        ),
        /** Fee in native token. */
        nativeTokenFee: v.pipe(
            UnsignedDecimal,
            v.description("Fee in native token."),
        ),
        nonce: v.null(),
        /** Token in which the fee is denominated (e.g., "USDC"). */
        feeToken: v.pipe(
            v.string(),
            v.description('Token in which the fee is denominated (e.g., "USDC").'),
        ),
    }),
    v.description("Spot transfer update between accounts."),
);
export type SpotTransferUpdate = v.InferOutput<typeof SpotTransferUpdate>;

/** Transfer update between sub-accounts. */
export const SubAccountTransferUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("subAccountTransfer"),
            v.description("Update type."),
        ),
        /** Amount transferred in USDC. */
        usdc: v.pipe(
            UnsignedDecimal,
            v.description("Amount transferred in USDC."),
        ),
        /** Initiator address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Initiator address."),
        ),
        /** Destination address. */
        destination: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Destination address."),
        ),
    }),
    v.description("Transfer update between sub-accounts."),
);
export type SubAccountTransferUpdate = v.InferOutput<typeof SubAccountTransferUpdate>;

/** Vault creation update. */
export const VaultCreateUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("vaultCreate"),
            v.description("Update type."),
        ),
        /** Address of the created vault. */
        vault: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Address of the created vault."),
        ),
        /** Initial allocated amount in USDC. */
        usdc: v.pipe(
            UnsignedDecimal,
            v.description("Initial allocated amount in USDC."),
        ),
        /** Vault creation fee. */
        fee: v.pipe(
            UnsignedDecimal,
            v.description("Vault creation fee."),
        ),
    }),
    v.description("Vault creation update."),
);
export type VaultCreateUpdate = v.InferOutput<typeof VaultCreateUpdate>;

/** Vault deposit update. */
export const VaultDepositUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("vaultDeposit"),
            v.description("Update type."),
        ),
        /** Address of the target vault. */
        vault: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Address of the target vault."),
        ),
        /** Amount deposited in USDC. */
        usdc: v.pipe(
            UnsignedDecimal,
            v.description("Amount deposited in USDC."),
        ),
    }),
    v.description("Vault deposit update."),
);
export type VaultDepositUpdate = v.InferOutput<typeof VaultDepositUpdate>;

/** Vault distribution update. */
export const VaultDistributionUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("vaultDistribution"),
            v.description("Update type."),
        ),
        /** Address of the vault distributing funds. */
        vault: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Address of the vault distributing funds."),
        ),
        /** Amount distributed in USDC. */
        usdc: v.pipe(
            UnsignedDecimal,
            v.description("Amount distributed in USDC."),
        ),
    }),
    v.description("Vault distribution update."),
);
export type VaultDistributionUpdate = v.InferOutput<typeof VaultDistributionUpdate>;

/** Vault withdrawal event update. */
export const VaultWithdrawUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("vaultWithdraw"),
            v.description("Update type."),
        ),
        /** Vault address. */
        vault: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Vault address."),
        ),
        /** Address of the user withdrawing funds. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Address of the user withdrawing funds."),
        ),
        /** Withdrawal request amount in USD. */
        requestedUsd: v.pipe(
            UnsignedDecimal,
            v.description("Withdrawal request amount in USD."),
        ),
        /** Withdrawal commission fee. */
        commission: v.pipe(
            UnsignedDecimal,
            v.description("Withdrawal commission fee."),
        ),
        /** Closing cost associated with positions. */
        closingCost: v.pipe(
            UnsignedDecimal,
            v.description("Closing cost associated with positions."),
        ),
        /** Basis value for withdrawal calculation. */
        basis: v.pipe(
            UnsignedDecimal,
            v.description("Basis value for withdrawal calculation."),
        ),
        /** Net withdrawn amount in USD after fees and costs. */
        netWithdrawnUsd: v.pipe(
            UnsignedDecimal,
            v.description("Net withdrawn amount in USD after fees and costs."),
        ),
    }),
    v.description("Vault withdrawal event update."),
);
export type VaultWithdrawUpdate = v.InferOutput<typeof VaultWithdrawUpdate>;

/** Withdrawal update from an account. */
export const WithdrawUpdate = v.pipe(
    v.object({
        /** Update type. */
        type: v.pipe(
            v.literal("withdraw"),
            v.description("Update type."),
        ),
        /** Amount withdrawn in USDC. */
        usdc: v.pipe(
            UnsignedDecimal,
            v.description("Amount withdrawn in USDC."),
        ),
        /** Unique nonce for the withdrawal request. */
        nonce: v.pipe(
            UnsignedInteger,
            v.description("Unique nonce for the withdrawal request."),
        ),
        /** Withdrawal fee. */
        fee: v.pipe(
            UnsignedDecimal,
            v.description("Withdrawal fee."),
        ),
    }),
    v.description("Withdrawal update from an account."),
);
export type WithdrawUpdate = v.InferOutput<typeof WithdrawUpdate>;

/** Non-funding ledger update for a user. */
export const UserNonFundingLedgerUpdate = v.pipe(
    v.object({
        /** Timestamp of the update (in ms since epoch). */
        time: v.pipe(
            UnsignedInteger,
            v.description("Timestamp of the update (in ms since epoch)."),
        ),
        /** L1 transaction hash. */
        hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("L1 transaction hash."),
        ),
        /** Update details. */
        delta: v.pipe(
            v.union([
                AccountClassTransferUpdate,
                DepositUpdate,
                InternalTransferUpdate,
                LiquidationUpdate,
                RewardsClaimUpdate,
                SpotTransferUpdate,
                SubAccountTransferUpdate,
                VaultCreateUpdate,
                VaultDepositUpdate,
                VaultDistributionUpdate,
                VaultWithdrawUpdate,
                WithdrawUpdate,
            ]),
            v.description("Update details."),
        ),
    }),
    v.description("Non-funding ledger update for a user."),
);
export type UserNonFundingLedgerUpdate = v.InferOutput<typeof UserNonFundingLedgerUpdate>;

/** Comprehensive user and market data. */
export const WebData2 = v.pipe(
    v.object({
        /** Account summary for perpetual trading. */
        clearinghouseState: v.pipe(
            PerpsClearinghouseState,
            v.description("Account summary for perpetual trading."),
        ),
        /** Leading vaults information. */
        leadingVaults: v.pipe(
            v.array(
                v.object({
                    /** Address of the vault. */
                    address: v.pipe(
                        v.pipe(Hex, v.length(42)),
                        v.description("Address of the vault."),
                    ),
                    /** Name of the vault. */
                    name: v.pipe(
                        v.string(),
                        v.description("Name of the vault."),
                    ),
                }),
            ),
            v.description("Leading vaults information."),
        ),
        /** Total equity in vaults. */
        totalVaultEquity: v.pipe(
            UnsignedDecimal,
            v.description("Total equity in vaults."),
        ),
        /** User open orders with frontend information. */
        openOrders: v.pipe(
            v.array(FrontendOrder),
            v.description("User open orders with frontend information."),
        ),
        /** Agent address if one exists. */
        agentAddress: v.pipe(
            v.union([v.pipe(Hex, v.length(42)), v.null()]),
            v.description("Agent address if one exists."),
        ),
        /** Timestamp until which the agent is valid. */
        agentValidUntil: v.pipe(
            v.union([UnsignedInteger, v.null()]),
            v.description("Timestamp until which the agent is valid."),
        ),
        /** Cumulative ledger value. */
        cumLedger: v.pipe(
            UnsignedDecimal,
            v.description("Cumulative ledger value."),
        ),
        /** Metadata for perpetual assets. */
        meta: v.pipe(
            PerpsMeta,
            v.description("Metadata for perpetual assets."),
        ),
        /** Context information for perpetual assets. */
        assetCtxs: v.pipe(
            v.array(PerpsAssetCtx),
            v.description("Context information for perpetual assets."),
        ),
        /** Server timestamp (in ms since epoch). */
        serverTime: v.pipe(
            UnsignedInteger,
            v.description("Server timestamp (in ms since epoch)."),
        ),
        /** Whether this account is a vault. */
        isVault: v.pipe(
            v.boolean(),
            v.description("Whether this account is a vault."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
        /** TWAP states. */
        twapStates: v.pipe(
            v.array(v.tuple([UnsignedInteger, TwapState])),
            v.description("TWAP states."),
        ),
        /** Account summary for spot trading. */
        spotState: v.pipe(
            v.optional(SpotClearinghouseState),
            v.description("Account summary for spot trading."),
        ),
        /** Context information for spot assets. */
        spotAssetCtxs: v.pipe(
            v.array(SpotAssetCtx),
            v.description("Context information for spot assets."),
        ),
        /** Whether the user has opted out of spot dusting. */
        optOutOfSpotDusting: v.pipe(
            v.optional(v.literal(true)),
            v.description("Whether the user has opted out of spot dusting."),
        ),
        /** Assets currently at their open interest cap. */
        perpsAtOpenInterestCap: v.pipe(
            v.optional(v.array(v.string())),
            v.description("Assets currently at their open interest cap."),
        ),
    }),
    v.description("Comprehensive user and market data."),
);
export type WebData2 = v.InferOutput<typeof WebData2>;
