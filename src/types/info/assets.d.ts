import type { Hex } from "../common.d.ts";

/** Mid coin prices. */
export interface AllMids {
    /** Maps coin symbols to mid prices. */
    [coin: string]: string;
}

/** Context information for a perpetual asset. */
export interface AssetCtx {
    /** Funding rate. */
    funding: string;

    /** Total open interest. */
    openInterest: string;

    /** Previous day's closing price. */
    prevDayPx: string;

    /** Daily volume. */
    dayNtlVlm: string;

    /** Premium price. */
    premium: string | null;

    /** Oracle price. */
    oraclePx: string;

    /** Mark price. */
    markPx: string;

    /** Index price. */
    midPx: string | null;

    /** Impact prices. */
    impactPxs: string[] | null;

    /** Daily volume in base currency. */
    dayBaseVlm: string;
}

/** Context information for a spot asset. */
export interface SpotAssetCtx {
    /** Previous day's closing price. */
    prevDayPx: string;

    /** Daily volume. */
    dayNtlVlm: string;

    /** Mark price. */
    markPx: string;

    /** Index price. */
    midPx: string | null;

    /** Circulating supply. */
    circulatingSupply: string;

    /** Asset symbol. */
    coin: string;

    /** Total supply. */
    totalSupply: string;

    /** Daily volume in base currency. */
    dayBaseVlm: string;
}

/** Metadata for perpetual assets. */
export interface Meta {
    /** Universes available for trading. */
    universe: Universe[];
}

/** Metadata for spot assets. */
export interface SpotMeta {
    /** Universes available for trading. */
    universe: SpotUniverse[];

    /** Tokens available for trading. */
    tokens: SpotToken[];
}

/** Trading universe with specific parameters for perpetual. */
export interface Universe {
    /** Minimum decimal places for order sizes. */
    szDecimals: number;

    /**
     * Name of the universe.
     *
     * Note: Max length: 6 characters. No uniqueness constraints.
     */
    name: string;

    /** Maximum allowed leverage. */
    maxLeverage: number;

    /** Whether only isolated margin trading is allowed. */
    onlyIsolated?: true;
}

/** Trading universe with specific parameters for spot. */
export interface SpotUniverse {
    /** Token indices included in this universe. */
    tokens: number[];

    /**
     * Name of the universe.
     *
     * Note: Max length: 6 characters. No uniqueness constraints.
     */
    name: string;

    /** Unique identifier. */
    index: number;

    /** Whether this token is the primary representation in the system. */
    isCanonical: boolean;
}

/** Trading token for spot. */
export interface SpotToken {
    /**
     * Name of the token.
     *
     * Note: Max length: 6 characters. No uniqueness constraints.
     */
    name: string;

    /** Minimum decimal places for order sizes. */
    szDecimals: number;

    /** Number of decimals in the token's smallest unit. */
    weiDecimals: number;

    /** Unique identifier for the token. */
    index: number;

    /** Token ID. */
    tokenId: Hex;

    /** Whether this token is the primary representation in the system. */
    isCanonical: boolean;

    /**  EVM contract details. */
    evmContract: {
        /** Address of the contract. */
        address: Hex;

        /** Extra decimals in the token's smallest unit. */
        evm_extra_wei_decimals: number;
    } | null;

    /** Full display name of the token. */
    fullName: string | null;
}

/** The details of a token. */
export interface TokenDetails {
    /** The name of the token. */
    name: string;

    /** The maximum supply of the token. */
    maxSupply: string;

    /** The total supply of the token. */
    totalSupply: string;

    /** The number of tokens in circulation (total supply minus burned tokens). */
    circulatingSupply: string;

    /** The number of decimal places for minimum tradable unit (lot size) */
    szDecimals: number;

    /** The number of decimal places for minimum token unit (wei size) */
    weiDecimals: number;

    /** The mid price of the token. */
    midPx: string;

    /** The mark price of the token. */
    markPx: string;

    /** The previous day's price of the token. */
    prevDayPx: string;

    /** The genesis data of the token. */
    genesis: {
        /** The existing token balances. */
        existingTokenBalances: [number, string][];

        /** The user balances. */
        userBalances: [Hex, string][];
    } | null;

    /** The deployer of the token. */
    deployer: Hex | null;

    /** The gas used to deploy the token. */
    deployGas: string | null;

    /** The time at which the token was deployed. */
    deployTime: string | null;

    /** The seeded USDC of the token. */
    seededUsdc: string;

    /** The non-circulating user balances of the token. */
    nonCirculatingUserBalances: [Hex, string][];

    /** The future emissions of the token. */
    futureEmissions: string;
}

/** Metadata and context information for each perpetual asset. */
export type MetaAndAssetCtxs = [
    /** Metadata for assets. */
    Meta,

    /** Context information for each asset. */
    AssetCtx[],
];

/** Metadata and context information for each spot asset. */
export type SpotMetaAndAssetCtxs = [
    /** Metadata for assets. */
    SpotMeta,

    /** Context information for each asset. */
    SpotAssetCtx[],
];

/** Candlestick data point. */
export interface CandleSnapshot {
    /** Opening timestamp (in ms since epoch). */
    t: number;

    /** Closing timestamp (in ms since epoch). */
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

    /** Total volume traded (in base currency). */
    v: string;

    /** Number of trades executed. */
    n: number;
}

/** Historical funding rate data for an asset. */
export interface FundingHistory {
    /** Asset symbol. */
    coin: string;

    /** Funding rate. */
    fundingRate: string;

    /** Premium price. */
    premium: string;

    /** Timestamp of the funding record (in ms since epoch). */
    time: number;
}
