import * as v from "valibot";
import { Decimal, Hex, Integer, UnsignedDecimal, UnsignedInteger } from "../_base.ts";

/** Mapping of coin symbols to mid prices. */
export const AllMids = v.pipe(
    v.record(v.string(), UnsignedDecimal),
    v.description("Mapping of coin symbols to mid prices."),
);
export type AllMids = v.InferOutput<typeof AllMids>;

/** Candlestick data point. */
export const Candle = v.pipe(
    v.object({
        /** Opening timestamp (ms since epoch). */
        t: v.pipe(
            UnsignedInteger,
            v.description("Opening timestamp (ms since epoch)."),
        ),
        /** Closing timestamp (ms since epoch). */
        T: v.pipe(
            UnsignedInteger,
            v.description("Closing timestamp (ms since epoch)."),
        ),
        /** Asset symbol. */
        s: v.pipe(
            v.string(),
            v.description("Asset symbol."),
        ),
        /** Candle interval. */
        i: v.pipe(
            v.union([
                v.literal("1m"),
                v.literal("3m"),
                v.literal("5m"),
                v.literal("15m"),
                v.literal("30m"),
                v.literal("1h"),
                v.literal("2h"),
                v.literal("4h"),
                v.literal("8h"),
                v.literal("12h"),
                v.literal("1d"),
                v.literal("3d"),
                v.literal("1w"),
                v.literal("1M"),
            ]),
            v.description("Candle interval."),
        ),
        /** Opening price. */
        o: v.pipe(
            UnsignedDecimal,
            v.description("Opening price."),
        ),
        /** Closing price. */
        c: v.pipe(
            UnsignedDecimal,
            v.description("Closing price."),
        ),
        /** Highest price. */
        h: v.pipe(
            UnsignedDecimal,
            v.description("Highest price."),
        ),
        /** Lowest price. */
        l: v.pipe(
            UnsignedDecimal,
            v.description("Lowest price."),
        ),
        /** Total volume traded in base currency. */
        v: v.pipe(
            UnsignedDecimal,
            v.description("Total volume traded in base currency."),
        ),
        /** Number of trades executed. */
        n: v.pipe(
            UnsignedInteger,
            v.description("Number of trades executed."),
        ),
    }),
    v.description("Candlestick data point."),
);
export type Candle = v.InferOutput<typeof Candle>;

/** Historical funding rate record for an asset. */
export const FundingHistory = v.pipe(
    v.object({
        /** Asset symbol. */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
        ),
        /** Funding rate. */
        fundingRate: v.pipe(
            Decimal,
            v.description("Funding rate."),
        ),
        /** Premium price. */
        premium: v.pipe(
            Decimal,
            v.description("Premium price."),
        ),
        /** Funding record timestamp (ms since epoch). */
        time: v.pipe(
            UnsignedInteger,
            v.description("Funding record timestamp (ms since epoch)."),
        ),
    }),
    v.description("Historical funding rate record for an asset."),
);
export type FundingHistory = v.InferOutput<typeof FundingHistory>;

/** Perpetual dex metadata. */
export const PerpDex = v.pipe(
    v.object({
        /** Short name of the perpetual dex. */
        name: v.pipe(
            v.string(),
            v.description("Short name of the perpetual dex."),
        ),
        /** Complete name of the perpetual dex. */
        full_name: v.pipe(
            v.string(),
            v.description("Complete name of the perpetual dex."),
        ),
        /** Hex address of the dex deployer. */
        deployer: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Hex address of the dex deployer."),
        ),
        /** Hex address of the oracle updater, or null if not available. */
        oracle_updater: v.pipe(
            v.nullable(v.pipe(Hex, v.length(42))),
            v.description("Hex address of the oracle updater, or null if not available."),
        ),
    }),
    v.description("Perpetual dex metadata."),
);
export type PerpDex = v.InferOutput<typeof PerpDex>;

/** Individual tier in a margin requirements table. */
export const MarginTier = v.pipe(
    v.object({
        /** Lower position size boundary for this tier. */
        lowerBound: v.pipe(
            UnsignedDecimal,
            v.description("Lower position size boundary for this tier."),
        ),
        /** Maximum allowed leverage for this tier. */
        maxLeverage: v.pipe(
            UnsignedInteger,
            v.minValue(1),
            v.description("Maximum allowed leverage for this tier."),
        ),
    }),
    v.description("Individual tier in a margin requirements table."),
);
export type MarginTier = v.InferOutput<typeof MarginTier>;

/** Margin requirements table with multiple tiers. */
export const MarginTable = v.pipe(
    v.object({
        /** Description of the margin table. */
        description: v.pipe(
            v.string(),
            v.description("Description of the margin table."),
        ),
        /** Array of margin tiers defining leverage limits. */
        marginTiers: v.pipe(
            v.array(MarginTier),
            v.description("Array of margin tiers defining leverage limits."),
        ),
    }),
    v.description("Margin requirements table with multiple tiers."),
);
export type MarginTable = v.InferOutput<typeof MarginTable>;

/** Collection of margin tables indexed by ID. */
export const MarginTables = v.pipe(
    v.array(v.tuple([UnsignedInteger, MarginTable])),
    v.description("Collection of margin tables indexed by ID."),
);
export type MarginTables = v.InferOutput<typeof MarginTables>;

/** Shared context for assets. */
export const SharedAssetCtx = v.pipe(
    v.object({
        /** Previous day's closing price. */
        prevDayPx: v.pipe(
            UnsignedDecimal,
            v.description("Previous day's closing price."),
        ),
        /** Daily notional volume. */
        dayNtlVlm: v.pipe(
            UnsignedDecimal,
            v.description("Daily notional volume."),
        ),
        /** Mark price. */
        markPx: v.pipe(
            UnsignedDecimal,
            v.description("Mark price."),
        ),
        /** Mid price. */
        midPx: v.pipe(
            v.nullable(UnsignedDecimal),
            v.description("Mid price."),
        ),
    }),
    v.description("Shared context for assets."),
);
export type SharedAssetCtx = v.InferOutput<typeof SharedAssetCtx>;

/** Context for a perpetual asset. */
export const PerpsAssetCtx = v.pipe(
    v.object({
        ...SharedAssetCtx.entries,
        /** Funding rate. */
        funding: v.pipe(
            Decimal,
            v.description("Funding rate."),
        ),
        /** Total open interest. */
        openInterest: v.pipe(
            UnsignedDecimal,
            v.description("Total open interest."),
        ),
        /** Premium price. */
        premium: v.pipe(
            v.nullable(Decimal),
            v.description("Premium price."),
        ),
        /** Oracle price. */
        oraclePx: v.pipe(
            UnsignedDecimal,
            v.description("Oracle price."),
        ),
        /** Array of impact prices. */
        impactPxs: v.pipe(
            v.nullable(v.array(v.string())),
            v.description("Array of impact prices."),
        ),
        /** Daily volume in base currency. */
        dayBaseVlm: v.pipe(
            UnsignedDecimal,
            v.description("Daily volume in base currency."),
        ),
    }),
    v.description("Context for a perpetual asset."),
);
export type PerpsAssetCtx = v.InferOutput<typeof PerpsAssetCtx>;

/** Trading universe parameters for perpetual assets. */
export const PerpsUniverse = v.pipe(
    v.object({
        /** Minimum decimal places for order sizes. */
        szDecimals: v.pipe(
            UnsignedInteger,
            v.description("Minimum decimal places for order sizes."),
        ),
        /** Name of the universe. */
        name: v.pipe(
            v.string(),
            v.description("Name of the universe."),
        ),
        /** Maximum allowed leverage. */
        maxLeverage: v.pipe(
            UnsignedInteger,
            v.minValue(1),
            v.description("Maximum allowed leverage."),
        ),
        /** Unique identifier for the margin requirements table. */
        marginTableId: v.pipe(
            UnsignedInteger,
            v.description("Unique identifier for the margin requirements table."),
        ),
        /** Indicates if only isolated margin trading is allowed. */
        onlyIsolated: v.pipe(
            v.optional(v.literal(true)),
            v.description("Indicates if only isolated margin trading is allowed."),
        ),
        /** Indicates if the universe is delisted. */
        isDelisted: v.pipe(
            v.optional(v.literal(true)),
            v.description("Indicates if the universe is delisted."),
        ),
    }),
    v.description("Trading universe parameters for perpetual assets."),
);
export type PerpsUniverse = v.InferOutput<typeof PerpsUniverse>;

/** Metadata for perpetual assets. */
export const PerpsMeta = v.pipe(
    v.object({
        /** Trading universes available for perpetual trading. */
        universe: v.pipe(
            v.array(PerpsUniverse),
            v.description("Trading universes available for perpetual trading."),
        ),
        /** Margin requirement tables for different leverage tiers. */
        marginTables: v.pipe(
            MarginTables,
            v.description("Margin requirement tables for different leverage tiers."),
        ),
    }),
    v.description("Metadata for perpetual assets."),
);
export type PerpsMeta = v.InferOutput<typeof PerpsMeta>;

/** Metadata and context for perpetual assets. */
export const PerpsMetaAndAssetCtxs = v.pipe(
    v.tuple([
        /** Metadata for assets. */
        v.pipe(
            PerpsMeta,
            v.description("Metadata for assets."),
        ),
        /** Context for each perpetual asset. */
        v.pipe(
            v.array(PerpsAssetCtx),
            v.description("Context for each perpetual asset."),
        ),
    ]),
    v.description("Metadata and context for perpetual assets."),
);
export type PerpsMetaAndAssetCtxs = v.InferOutput<typeof PerpsMetaAndAssetCtxs>;

/**
 * Predicted funding data.
 *
 * The first element is the asset symbol and the second element is an array of predicted funding data for each exchange.
 */
export const PredictedFunding = v.pipe(
    v.tuple([
        /** Asset symbol. */
        v.pipe(
            v.string(),
            v.description("Asset symbol."),
        ),
        /** Array of predicted funding data for each exchange. */
        v.pipe(
            v.array(
                v.tuple([
                    /** Exchange symbol. */
                    v.pipe(
                        v.string(),
                        v.description("Exchange symbol."),
                    ),
                    /** Predicted funding data. */
                    v.pipe(
                        v.nullable(
                            v.object({
                                /** Predicted funding rate. */
                                fundingRate: v.pipe(
                                    Decimal,
                                    v.description("Predicted funding rate."),
                                ),
                                /** Next funding time (ms since epoch). */
                                nextFundingTime: v.pipe(
                                    UnsignedInteger,
                                    v.description("Next funding time (ms since epoch)."),
                                ),
                                /** Funding interval in hours. */
                                fundingIntervalHours: v.pipe(
                                    v.optional(UnsignedInteger),
                                    v.description("Funding interval in hours."),
                                ),
                            }),
                        ),
                        v.description("Predicted funding data."),
                    ),
                ]),
            ),
            v.description("Array of predicted funding data for each exchange."),
        ),
    ]),
    v.description(
        "Predicted funding data." +
            "\n\nThe first element is the asset symbol and the second element is an array of predicted funding data for each exchange.",
    ),
);
export type PredictedFunding = v.InferOutput<typeof PredictedFunding>;

/** Context for a spot asset. */
export const SpotAssetCtx = v.pipe(
    v.object({
        ...SharedAssetCtx.entries,
        /** Circulating supply. */
        circulatingSupply: v.pipe(
            UnsignedDecimal,
            v.description("Circulating supply."),
        ),
        /** Asset symbol. */
        coin: v.pipe(
            v.string(),
            v.description("Asset symbol."),
        ),
        /** Total supply. */
        totalSupply: v.pipe(
            UnsignedDecimal,
            v.description("Total supply."),
        ),
        /** Daily volume in base currency. */
        dayBaseVlm: v.pipe(
            UnsignedDecimal,
            v.description("Daily volume in base currency."),
        ),
    }),
    v.description("Context for a spot asset."),
);
export type SpotAssetCtx = v.InferOutput<typeof SpotAssetCtx>;

/** Details for a trading token in spot markets. */
export const SpotToken = v.pipe(
    v.object({
        /** Name of the token. */
        name: v.pipe(
            v.string(),
            v.description("Name of the token."),
        ),
        /** Minimum decimal places for order sizes. */
        szDecimals: v.pipe(
            UnsignedInteger,
            v.description("Minimum decimal places for order sizes."),
        ),
        /** Number of decimals for the token's smallest unit. */
        weiDecimals: v.pipe(
            UnsignedInteger,
            v.description("Number of decimals for the token's smallest unit."),
        ),
        /** Unique identifier for the token. */
        index: v.pipe(
            UnsignedInteger,
            v.description("Unique identifier for the token."),
        ),
        /** Token ID. */
        tokenId: v.pipe(
            Hex,
            v.description("Token ID."),
        ),
        /** Indicates if the token is the primary representation in the system. */
        isCanonical: v.pipe(
            v.boolean(),
            v.description("Indicates if the token is the primary representation in the system."),
        ),
        /** EVM contract details. */
        evmContract: v.pipe(
            v.nullable(
                v.object({
                    /** Contract address. */
                    address: v.pipe(
                        v.pipe(Hex, v.length(42)),
                        v.description("Contract address."),
                    ),
                    /** Extra decimals in the token's smallest unit. */
                    evm_extra_wei_decimals: v.pipe(
                        Integer,
                        v.description("Extra decimals in the token's smallest unit."),
                    ),
                }),
            ),
            v.description("EVM contract details."),
        ),
        /** Full display name of the token. */
        fullName: v.pipe(
            v.nullable(v.string()),
            v.description("Full display name of the token."),
        ),
        /** Deployer trading fee share for the token. */
        deployerTradingFeeShare: v.pipe(
            UnsignedDecimal,
            v.description("Deployer trading fee share for the token."),
        ),
    }),
    v.description("Details for a trading token in spot markets."),
);
export type SpotToken = v.InferOutput<typeof SpotToken>;

/** Trading universe parameters for spot assets. */
export const SpotUniverse = v.pipe(
    v.object({
        /** Token indices included in this universe. */
        tokens: v.pipe(
            v.array(UnsignedInteger),
            v.description("Token indices included in this universe."),
        ),
        /** Name of the universe. */
        name: v.pipe(
            v.string(),
            v.description("Name of the universe."),
        ),
        /** Unique identifier of the universe. */
        index: v.pipe(
            UnsignedInteger,
            v.description("Unique identifier of the universe."),
        ),
        /** Indicates if the token is the primary representation in the system. */
        isCanonical: v.pipe(
            v.boolean(),
            v.description("Indicates if the token is the primary representation in the system."),
        ),
    }),
    v.description("Trading universe parameters for spot assets."),
);
export type SpotUniverse = v.InferOutput<typeof SpotUniverse>;

/** Metadata for spot assets. */
export const SpotMeta = v.pipe(
    v.object({
        /** Trading universes available for spot trading. */
        universe: v.pipe(
            v.array(SpotUniverse),
            v.description("Trading universes available for spot trading."),
        ),
        /** Tokens available for spot trading. */
        tokens: v.pipe(
            v.array(SpotToken),
            v.description("Tokens available for spot trading."),
        ),
    }),
    v.description("Metadata for spot assets."),
);
export type SpotMeta = v.InferOutput<typeof SpotMeta>;

/** Metadata and context for spot assets. */
export const SpotMetaAndAssetCtxs = v.pipe(
    v.tuple([
        /** Metadata for assets. */
        v.pipe(
            SpotMeta,
            v.description("Metadata for assets."),
        ),
        /** Context for each spot asset. */
        v.pipe(
            v.array(SpotAssetCtx),
            v.description("Context for each spot asset."),
        ),
    ]),
    v.description("Metadata and context for spot assets."),
);
export type SpotMetaAndAssetCtxs = v.InferOutput<typeof SpotMetaAndAssetCtxs>;

/** Details of a token. */
export const TokenDetails = v.pipe(
    v.object({
        /** Name of the token. */
        name: v.pipe(
            v.string(),
            v.description("Name of the token."),
        ),
        /** Maximum supply of the token. */
        maxSupply: v.pipe(
            UnsignedDecimal,
            v.description("Maximum supply of the token."),
        ),
        /** Total supply of the token. */
        totalSupply: v.pipe(
            UnsignedDecimal,
            v.description("Total supply of the token."),
        ),
        /** Circulating supply of the token. */
        circulatingSupply: v.pipe(
            UnsignedDecimal,
            v.description("Circulating supply of the token."),
        ),
        /** Decimal places for the minimum tradable unit. */
        szDecimals: v.pipe(
            UnsignedInteger,
            v.description("Decimal places for the minimum tradable unit."),
        ),
        /** Decimal places for the token's smallest unit. */
        weiDecimals: v.pipe(
            UnsignedInteger,
            v.description("Decimal places for the token's smallest unit."),
        ),
        /** Mid price of the token. */
        midPx: v.pipe(
            UnsignedDecimal,
            v.description("Mid price of the token."),
        ),
        /** Mark price of the token. */
        markPx: v.pipe(
            UnsignedDecimal,
            v.description("Mark price of the token."),
        ),
        /** Previous day's price of the token. */
        prevDayPx: v.pipe(
            UnsignedDecimal,
            v.description("Previous day's price of the token."),
        ),
        /** Genesis data for the token. */
        genesis: v.pipe(
            v.nullable(
                v.object({
                    /** User balances. */
                    userBalances: v.pipe(
                        v.array(v.tuple([v.pipe(Hex, v.length(42)), v.string()])),
                        v.description("User balances."),
                    ),
                    /** Existing token balances. */
                    existingTokenBalances: v.pipe(
                        v.array(v.tuple([UnsignedInteger, v.string()])),
                        v.description("Existing token balances."),
                    ),
                    /** Blacklisted users. */
                    blacklistUsers: v.pipe(
                        v.array(v.pipe(Hex, v.length(42))),
                        v.description("Blacklisted users."),
                    ),
                }),
            ),
            v.description("Genesis data for the token."),
        ),
        /** Deployer address. */
        deployer: v.pipe(
            v.nullable(v.pipe(Hex, v.length(42))),
            v.description("Deployer address."),
        ),
        /** Gas used during token deployment. */
        deployGas: v.pipe(
            v.nullable(UnsignedDecimal),
            v.description("Gas used during token deployment."),
        ),
        /** Deployment time. */
        deployTime: v.pipe(
            v.nullable(v.string()),
            v.description("Deployment time."),
        ),
        /** Seeded USDC amount for the token. */
        seededUsdc: v.pipe(
            UnsignedDecimal,
            v.description("Seeded USDC amount for the token."),
        ),
        /** Non-circulating user balances of the token. */
        nonCirculatingUserBalances: v.pipe(
            v.array(v.tuple([v.pipe(Hex, v.length(42)), v.string()])),
            v.description("Non-circulating user balances of the token."),
        ),
        /** Future emissions amount. */
        futureEmissions: v.pipe(
            UnsignedDecimal,
            v.description("Future emissions amount."),
        ),
    }),
    v.description("Details of a token."),
);
export type TokenDetails = v.InferOutput<typeof TokenDetails>;
