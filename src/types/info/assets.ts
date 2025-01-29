import type { Hex } from "../common.ts";

/** Mid coin prices. */
export interface AllMids {
    /** Maps coin symbols to mid prices. */
    [coin: string]: string;
}

/** Context information for a perpetual asset. */
export interface PerpsAssetCtx extends SharedAssetCtx {
    /** Funding rate. */
    funding: string;

    /** Total open interest. */
    openInterest: string;

    /** Premium price. */
    premium: string | null;

    /** Oracle price. */
    oraclePx: string;

    /** Impact prices. */
    impactPxs: string[] | null;

    /** Daily volume in base currency. */
    dayBaseVlm: string;
}

/** Base asset context information. */
export interface SharedAssetCtx {
    /** Previous day's closing price. */
    prevDayPx: string;

    /** Daily volume. */
    dayNtlVlm: string;

    /** Mark price. */
    markPx: string;

    /** Index price. */
    midPx: string | null;
}

/** Context information for a spot asset. */
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

/** Metadata for perpetual assets. */
export interface PerpsMeta {
    /** Universes available for trading. */
    universe: PerpsUniverse[];
}

/** Metadata for spot assets. */
export interface SpotMeta {
    /** Universes available for trading. */
    universe: SpotUniverse[];

    /** Tokens available for trading. */
    tokens: SpotToken[];
}

/** Trading universe with specific parameters for perpetual. */
export interface PerpsUniverse {
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

    /** Whether the universe is delisted. */
    isDelisted?: true;
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

    /** Fee share for the deployer of the token. */
    deployerTradingFeeShare: string;
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
        /** The user balances. */
        userBalances: [Hex, string][];

        /** The existing token balances. */
        existingTokenBalances: [number, string][];

        /** The blacklisted users. */
        blacklistUsers: Hex[];
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
export type PerpsMetaAndAssetCtxs = [
    /** Metadata for assets. */
    PerpsMeta,

    /** Context information for each asset. */
    PerpsAssetCtx[],
];

/** Metadata and context information for each spot asset. */
export type SpotMetaAndAssetCtxs = [
    /** Metadata for assets. */
    SpotMeta,

    /** Context information for each asset. */
    SpotAssetCtx[],
];

/** Candlestick data point. */
export interface Candle {
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

/** Predicted funding data for an asset. */
export type PredictedFunding = [
    /** Asset symbol. */
    string,

    /** Predicted funding data for each exchange. */
    [
        /** Exchange symbol. */
        string,

        /** Predicted funding data. */
        {
            /** Predicted funding rate. */
            fundingRate: string;

            /** Next funding time (in ms since epoch). */
            nextFundingTime: number;
        } | null,
    ][],
];

/** The deploy state of a user. */
export interface SpotDeployState {
    /** The deploy state of a user. */
    states: {
        /** The token ID. */
        token: number;

        /** The spec of the token. */
        spec: {
            /** The name of the token. */
            name: string;

            /** The number of decimal places for minimum tradable unit (lot size) */
            szDecimals: number;

            /** The number of decimal places for minimum token unit (wei size) */
            weiDecimals: number;
        };

        /** The full name of the token. */
        fullName: string | null;

        /** The deployer trading fee share of the token. */
        deployerTradingFeeShare: string;

        /** The spots of the token. */
        spots: number[];

        /** The max supply of the token. */
        maxSupply: string | null;

        /** The hyperliquidity genesis balance of the token. */
        hyperliquidityGenesisBalance: string;

        /** The total genesis balance of the token. */
        totalGenesisBalanceWei: string;

        /** The user genesis balances of the token. */
        userGenesisBalances: [Hex, string][];

        /** The existing token genesis balances of the token. */
        existingTokenGenesisBalances: [number, string][];
    }[];

    /** The gas auction details. */
    gasAuction: {
        /** Current gas. */
        currentGas: string | null;

        /** Duration (in seconds). */
        durationSeconds: number;

        /** End gas. */
        endGas: string | null;

        /** Start gas. */
        startGas: string;

        /** Start time (in seconds since epoch). */
        startTimeSeconds: number;
    };
}
