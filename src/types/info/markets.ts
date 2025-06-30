import type { Hex } from "../../base.ts";

/** Status of the deploy auction. */
export interface DeployAuctionStatus {
    /**
     * Current gas.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    currentGas: string | null;
    /** Duration in seconds. */
    durationSeconds: number;
    /**
     * Ending gas.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    endGas: string | null;
    /**
     * Starting gas.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    startGas: string;
    /** Auction start time (seconds since epoch). */
    startTimeSeconds: number;
}

/** Exchange system status information. */
export interface ExchangeStatus {
    /** Server time (in ms since epoch). */
    time: number;
    specialStatuses: unknown | null;
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
        /**
         * Deployer trading fee share for the token.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        deployerTradingFeeShare: string;
        /** Spot indices for the token. */
        spots: number[];
        /**
         * Maximum supply of the token.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        maxSupply: string | null;
        /**
         * Hyperliquidity genesis balance of the token.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        hyperliquidityGenesisBalance: string;
        /**
         * Total genesis balance (in wei) for the token.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        totalGenesisBalanceWei: string;
        /** User genesis balances for the token. */
        userGenesisBalances: [Hex, string][];
        /** Existing token genesis balances for the token. */
        existingTokenGenesisBalances: [number, string][];
        /** Blacklisted users for the token. */
        blacklistUsers: Hex[];
    }[];
    /** Status of the deploy auction. */
    gasAuction: DeployAuctionStatus;
}
