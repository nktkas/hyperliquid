import type { Hex } from "../../base.ts";

/** Mapping of coin symbols to mid prices. */
export interface AllMids {
    /** Mid prices mapped by coin symbol. */
    [coin: string]: string;
}

/** Candlestick data point. */
export interface Candle {
    /** Opening timestamp (ms since epoch). */
    t: number;
    /** Closing timestamp (ms since epoch). */
    T: number;
    /** Asset symbol. */
    s: string;
    /** Candle interval (e.g., "1m", "5m", "1h", etc.). */
    i: string;
    /** Opening price. */
    o: string;
    /** Closing price. */
    c: string;
    /** Highest price. */
    h: string;
    /** Lowest price. */
    l: string;
    /** Total volume traded in base currency. */
    v: string;
    /** Number of trades executed. */
    n: number;
}

/** Historical funding rate record for an asset. */
export interface FundingHistory {
    /** Asset symbol. */
    coin: string;
    /** Funding rate. */
    fundingRate: string;
    /** Premium price. */
    premium: string;
    /** Funding record timestamp (ms since epoch). */
    time: number;
}

/** Perpetual dex metadata. */
export interface PerpDex {
    /** Short name of the perpetual dex. */
    name: string;
    /** Complete name of the perpetual dex. */
    full_name: string;
    /** Hex address of the dex deployer. */
    deployer: Hex;
    /** Hex address of the oracle updater, or null if not available. */
    oracle_updater: Hex | null;
}

/** Collection of margin tables indexed by ID. */
export type MarginTables = [number, MarginTable][];

/** Margin requirements table with multiple tiers. */
export interface MarginTable {
    /** Description of the margin table. */
    description: string;
    /** Array of margin tiers defining leverage limits. */
    marginTiers: MarginTier[];
}

/** Individual tier in a margin requirements table. */
export interface MarginTier {
    /** Lower position size boundary for this tier. */
    lowerBound: string;
    /** Maximum allowed leverage for this tier. */
    maxLeverage: number;
}

/** Context for a perpetual asset. */
export interface PerpsAssetCtx extends SharedAssetCtx {
    /** Funding rate. */
    funding: string;
    /** Total open interest. */
    openInterest: string;
    /** Premium price. */
    premium: string | null;
    /** Oracle price. */
    oraclePx: string;
    /** Array of impact prices. */
    impactPxs: string[] | null;
    /** Daily volume in base currency. */
    dayBaseVlm: string;
}

/** Metadata for perpetual assets. */
export interface PerpsMeta {
    /** Trading universes available for perpetual trading. */
    universe: PerpsUniverse[];
    /** Margin requirement tables for different leverage tiers. */
    marginTables: MarginTables;
}

/** Metadata and context for perpetual assets. */
export type PerpsMetaAndAssetCtxs = [
    /** Metadata for assets. */
    PerpsMeta,
    /** Context for each perpetual asset. */
    PerpsAssetCtx[],
];

/** Trading universe parameters for perpetual assets. */
export interface PerpsUniverse {
    /** Minimum decimal places for order sizes. */
    szDecimals: number;
    /** Name of the universe. */
    name: string;
    /** Maximum allowed leverage. */
    maxLeverage: number;
    /** Unique identifier for the margin requirements table. */
    marginTableId: number;
    /** Indicates if only isolated margin trading is allowed. */
    onlyIsolated?: true;
    /** Indicates if the universe is delisted. */
    isDelisted?: true;
}

/**
 * Predicted funding data.
 *
 * The first element is the asset symbol and the second element is an array of predicted funding data for each exchange.
 */
export type PredictedFunding = [
    /** Asset symbol. */
    string,
    /** Array of predicted funding data for each exchange. */
    [
        /** Exchange symbol. */
        string,
        /** Predicted funding data. */
        {
            /** Predicted funding rate. */
            fundingRate: string;
            /** Next funding time (ms since epoch). */
            nextFundingTime: number;
            /** Funding interval in hours. */
            fundingIntervalHours?: number;
        } | null,
    ][],
];

/** Shared context for assets. */
export interface SharedAssetCtx {
    /** Previous day's closing price. */
    prevDayPx: string;
    /** Daily notional volume. */
    dayNtlVlm: string;
    /** Mark price. */
    markPx: string;
    /** Mid price. */
    midPx: string | null;
}

/** Context for a spot asset. */
export interface SpotAssetCtx extends SharedAssetCtx {
    /** Circulating supply. */
    circulatingSupply: string;
    /** Asset symbol. */
    coin: string;
    /** Total supply. */
    totalSupply: string;
    /** Daily volume in base currency. */
    dayBaseVlm: string;
}

/** Deploy state for spot tokens. */
export interface SpotDeployState {
    /** Array of deploy states for tokens. */
    states: {
        /** Token ID. */
        token: number;
        /** Token specification. */
        spec: {
            /** Name of the token. */
            name: string;
            /** Minimum decimal places for order sizes. */
            szDecimals: number;
            /** Number of decimals for the token's smallest unit. */
            weiDecimals: number;
        };
        /** Full name of the token. */
        fullName: string | null;
        /** Deployer trading fee share for the token. */
        deployerTradingFeeShare: string;
        /** Spot indices for the token. */
        spots: number[];
        /** Maximum supply of the token. */
        maxSupply: string | null;
        /** Hyperliquidity genesis balance of the token. */
        hyperliquidityGenesisBalance: string;
        /** Total genesis balance (in wei) for the token. */
        totalGenesisBalanceWei: string;
        /** User genesis balances for the token. */
        userGenesisBalances: [Hex, string][];
        /** Existing token genesis balances for the token. */
        existingTokenGenesisBalances: [number, string][];
        /** Blacklisted users for the token. */
        blacklistUsers: Hex[];
    }[];
    /** Gas auction details. */
    gasAuction: {
        /** Current gas. */
        currentGas: string | null;
        /** Duration in seconds. */
        durationSeconds: number;
        /** Ending gas. */
        endGas: string | null;
        /** Starting gas. */
        startGas: string;
        /** Auction start time (seconds since epoch). */
        startTimeSeconds: number;
    };
}

/** Metadata for spot assets. */
export interface SpotMeta {
    /** Trading universes available for spot trading. */
    universe: SpotUniverse[];
    /** Tokens available for spot trading. */
    tokens: SpotToken[];
}

/** Metadata and context for spot assets. */
export type SpotMetaAndAssetCtxs = [
    /** Metadata for assets. */
    SpotMeta,
    /** Context for each spot asset. */
    SpotAssetCtx[],
];

/** Details for a trading token in spot markets. */
export interface SpotToken {
    /**
     * Name of the token.
     *
     * Note: Maximum length 6 characters. No uniqueness constraints.
     */
    name: string;
    /** Minimum decimal places for order sizes. */
    szDecimals: number;
    /** Number of decimals for the token's smallest unit. */
    weiDecimals: number;
    /** Unique identifier for the token. */
    index: number;
    /** Token ID. */
    tokenId: Hex;
    /** Indicates if the token is the primary representation in the system. */
    isCanonical: boolean;
    /** EVM contract details. */
    evmContract: {
        /** Contract address. */
        address: Hex;
        /** Extra decimals in the token's smallest unit. */
        evm_extra_wei_decimals: number;
    } | null;
    /** Full display name of the token. */
    fullName: string | null;
    /** Deployer trading fee share for the token. */
    deployerTradingFeeShare: string;
}

/** Trading universe parameters for spot assets. */
export interface SpotUniverse {
    /** Token indices included in this universe. */
    tokens: number[];
    /**
     * Name of the universe.
     *
     * Note: Maximum length 6 characters. No uniqueness constraints.
     */
    name: string;
    /** Unique identifier of the universe. */
    index: number;
    /** Indicates if the token is the primary representation in the system. */
    isCanonical: boolean;
}

/** Details of a token. */
export interface TokenDetails {
    /** Name of the token. */
    name: string;
    /** Maximum supply of the token. */
    maxSupply: string;
    /** Total supply of the token. */
    totalSupply: string;
    /** Circulating supply of the token. */
    circulatingSupply: string;
    /** Decimal places for the minimum tradable unit. */
    szDecimals: number;
    /** Decimal places for the token's smallest unit. */
    weiDecimals: number;
    /** Mid price of the token. */
    midPx: string;
    /** Mark price of the token. */
    markPx: string;
    /** Previous day's price of the token. */
    prevDayPx: string;
    /** Genesis data for the token. */
    genesis: {
        /** User balances. */
        userBalances: [Hex, string][];
        /** Existing token balances. */
        existingTokenBalances: [number, string][];
        /** Blacklisted users. */
        blacklistUsers: Hex[];
    } | null;
    /** Deployer address. */
    deployer: Hex | null;
    /** Gas used during token deployment. */
    deployGas: string | null;
    /** Deployment time. */
    deployTime: string | null;
    /** Seeded USDC amount for the token. */
    seededUsdc: string;
    /** Non-circulating user balances of the token. */
    nonCirculatingUserBalances: [Hex, string][];
    /** Future emissions amount. */
    futureEmissions: string;
}
