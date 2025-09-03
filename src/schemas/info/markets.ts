import * as v from "valibot";
import { Hex, UnsignedDecimal } from "../_base.ts";

/** Status of the deploy auction. */
export const DeployAuctionStatus = v.pipe(
    v.strictObject({
        /** Current gas. */
        currentGas: v.pipe(
            v.nullable(UnsignedDecimal),
            v.description("Current gas."),
        ),
        /** Duration in seconds. */
        durationSeconds: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Duration in seconds."),
        ),
        /** Ending gas. */
        endGas: v.pipe(
            v.nullable(UnsignedDecimal),
            v.description("Ending gas."),
        ),
        /** Starting gas. */
        startGas: v.pipe(
            UnsignedDecimal,
            v.description("Starting gas."),
        ),
        /** Auction start time (seconds since epoch). */
        startTimeSeconds: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Auction start time (seconds since epoch)."),
        ),
    }),
    v.description("Status of the deploy auction."),
);
export type DeployAuctionStatus = v.InferOutput<typeof DeployAuctionStatus>;

/** Exchange system status information. */
export const ExchangeStatus = v.pipe(
    v.strictObject({
        /** Server time (in ms since epoch). */
        time: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Server time (in ms since epoch)."),
        ),
        specialStatuses: v.pipe(
            v.union([v.unknown(), v.null()]),
        ),
    }),
    v.description("Exchange system status information."),
);
export type ExchangeStatus = v.InferOutput<typeof ExchangeStatus>;

/** Deploy state for spot tokens. */
export const SpotDeployState = v.pipe(
    v.strictObject({
        /** Array of deploy states for tokens. */
        states: v.pipe(
            v.array(
                v.strictObject({
                    /** Token ID. */
                    token: v.pipe(
                        v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
                        v.description("Token ID."),
                    ),
                    /** Token specification. */
                    spec: v.pipe(
                        v.strictObject({
                            /** Name of the token. */
                            name: v.pipe(
                                v.string(),
                                v.description("Name of the token."),
                            ),
                            /** Minimum decimal places for order sizes. */
                            szDecimals: v.pipe(
                                v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
                                v.description("Minimum decimal places for order sizes."),
                            ),
                            /** Number of decimals for the token's smallest unit. */
                            weiDecimals: v.pipe(
                                v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
                                v.description("Number of decimals for the token's smallest unit."),
                            ),
                        }),
                        v.description("Token specification."),
                    ),
                    /** Full name of the token. */
                    fullName: v.pipe(
                        v.nullable(v.string()),
                        v.description("Full name of the token."),
                    ),
                    /** Deployer trading fee share for the token. */
                    deployerTradingFeeShare: v.pipe(
                        UnsignedDecimal,
                        v.description("Deployer trading fee share for the token."),
                    ),
                    /** Spot indices for the token. */
                    spots: v.pipe(
                        v.array(v.pipe(v.number(), v.safeInteger(), v.minValue(0))),
                        v.description("Spot indices for the token."),
                    ),
                    /** Maximum supply of the token. */
                    maxSupply: v.pipe(
                        v.nullable(UnsignedDecimal),
                        v.description("Maximum supply of the token."),
                    ),
                    /** Hyperliquidity genesis balance of the token. */
                    hyperliquidityGenesisBalance: v.pipe(
                        UnsignedDecimal,
                        v.description("Hyperliquidity genesis balance of the token."),
                    ),
                    /** Total genesis balance (in wei) for the token. */
                    totalGenesisBalanceWei: v.pipe(
                        UnsignedDecimal,
                        v.description("Total genesis balance (in wei) for the token."),
                    ),
                    /** User genesis balances for the token. */
                    userGenesisBalances: v.pipe(
                        v.array(v.strictTuple([v.pipe(Hex, v.length(42)), UnsignedDecimal])),
                        v.description("User genesis balances for the token."),
                    ),
                    /** Existing token genesis balances for the token. */
                    existingTokenGenesisBalances: v.pipe(
                        v.array(v.strictTuple([v.pipe(v.number(), v.safeInteger(), v.minValue(0)), UnsignedDecimal])),
                        v.description("Existing token genesis balances for the token."),
                    ),
                    /** Blacklisted users for the token. */
                    blacklistUsers: v.pipe(
                        v.array(v.pipe(Hex, v.length(42))),
                        v.description("Blacklisted users for the token."),
                    ),
                }),
            ),
            v.description("Array of deploy states for tokens."),
        ),
        /** Status of the deploy auction. */
        gasAuction: v.pipe(
            DeployAuctionStatus,
            v.description("Status of the deploy auction."),
        ),
    }),
    v.description("Deploy state for spot tokens."),
);
export type SpotDeployState = v.InferOutput<typeof SpotDeployState>;
