import type { ValueMap } from "@std/msgpack/encode";
import type { Hex } from "../../base.ts";
import type { TIF } from "../info/orders.ts";

/** Order parameters. */
export type OrderParams = {
    /** Asset ID. */
    a: number;
    /** Position side (`true` for long, `false` for short). */
    b: boolean;
    /** Price. */
    p: string;
    /** Size (in base currency units). */
    s: string;
    /** Is reduce-only? */
    r: boolean;
    /** Order type. */
    t:
        | {
            /** Limit order parameters. */
            limit: {
                /** Time-in-force. */
                tif: TIF;
            };
        }
        | {
            /** Trigger order parameters. */
            trigger: {
                /** Is market order? */
                isMarket: boolean;
                /** Trigger price. */
                triggerPx: string;
                /** Indicates whether it is take profit or stop loss. */
                tpsl: "tp" | "sl";
            };
        };
    /** Client Order ID. */
    c?: Hex | null;
};

/** Base structure for exchange requests. */
export interface BaseExchangeRequest {
    /** Action to perform. */
    action: ValueMap & {
        /** Type of action. */
        type: string;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: { r: Hex; s: Hex; v: number };
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Approve an agent to sign on behalf of the master account.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
 */
export interface ApproveAgentRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "approveAgent";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Agent address. */
        agentAddress: Hex;
        /** Agent name or undefined for unnamed agent. */
        agentName?: string | null;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Approve a maximum fee rate for a builder.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
 */
export interface ApproveBuilderFeeRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "approveBuilderFee";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Max fee rate (e.g., "0.01%"). */
        maxFeeRate: `${string}%`;
        /** Builder address. */
        builder: Hex;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Modify multiple orders.
 * @returns {OrderResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
 */
export interface BatchModifyRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "batchModify";
        /** Order modifications. */
        modifies: {
            /** Order ID or CLient Order ID. */
            oid: number | Hex;
            /** New order parameters. */
            order: OrderParams;
        }[];
    };
    vaultAddress?: Hex;
    expiresAfter?: number;
}

/**
 * Cancel order(s).
 * @returns {CancelResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
 */
export interface CancelRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "cancel";
        /** Orders to cancel. */
        cancels: {
            /** Asset ID. */
            a: number;
            /** Order ID. */
            o: number;
        }[];
    };
    vaultAddress?: Hex;
    expiresAfter?: number;
}

/**
 * Cancel order(s) by cloid.
 * @returns {CancelResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
 */
export interface CancelByCloidRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "cancelByCloid";
        /** Orders to cancel. */
        cancels: {
            /** Asset ID. */
            asset: number;
            /** Client Order ID. */
            cloid: Hex;
        }[];
    };
    vaultAddress?: Hex;
    expiresAfter?: number;
}

/**
 * Transfer native token from the user's spot account into staking for delegating to validators.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
 */
export interface CDepositRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "cDeposit";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Amount of wei to deposit into staking balance (float * 1e8). */
        wei: number;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Claim rewards from referral program.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface ClaimRewardsRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "claimRewards";
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Convert a single-signature account to a multi-signature account.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
 */
export interface ConvertToMultiSigUserRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "convertToMultiSigUser";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /**
         * Signers configuration.
         *
         * Must be {@linkcode ConvertToMultiSigUserRequest_Signers} converted to a string via `JSON.stringify(...)`.
         */
        signers: string;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/** Signers configuration for {@linkcode ConvertToMultiSigUserRequest}. */
export type ConvertToMultiSigUserRequest_Signers =
    | {
        /** List of authorized user addresses. */
        authorizedUsers: Hex[];
        /** Minimum number of signatures required. */
        threshold: number;
    }
    /** Convert a multi-signature account to a single-signature account. */
    | null;

/**
 * Create a sub-account.
 * @returns {CreateSubAccountResponse}
 * @see null - no documentation
 */
export interface CreateSubAccountRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "createSubAccount";
        /** Sub-account name. */
        name: string;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Create a vault.
 * @returns {CreateVaultResponse}
 * @see null - no documentation
 */
export interface CreateVaultRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "createVault";
        /** Vault name. */
        name: string;
        /** Vault description. */
        description: string;
        /** Initial balance (float * 1e6). */
        initialUsd: number;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Jail a signer to prevent them from signing transactions.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface CSignerActionRequest_JailSelf extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "CSignerAction";
        /** Jail the signer. */
        jailSelf: null;
    };
    vaultAddress?: undefined;
    expiresAfter?: number;
}

/**
 * Unjail a signer to allow them to sign transactions again.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface CSignerActionRequest_UnjailSelf extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "CSignerAction";
        /** Unjail the signer. */
        unjailSelf: null;
    };
    vaultAddress?: undefined;
    expiresAfter?: number;
}

/**
 * Change a validator's profile information.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface CValidatorActionRequest_ChangeProfile extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "CValidatorAction";
        /** Profile changes to apply. */
        changeProfile: {
            /** Validator node IP address. */
            node_ip?:
                | {
                    /** IP address. */
                    Ip: string;
                }
                | null;
            /** Validator name. */
            name?: string | null;
            /** Validator description. */
            description?: string | null;
            /** Validator jail status. */
            unjailed: boolean;
            /** Enable or disable delegations. */
            disable_delegations?: boolean | null;
            /** Commission rate in basis points (1 = 0.0001%). */
            commission_bps?: number | null;
            /** Signer address. */
            signer?: Hex | null;
        };
    };
    vaultAddress?: undefined;
    expiresAfter?: number;
}

/**
 * Register a new validator.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface CValidatorActionRequest_Register extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "CValidatorAction";
        /** Registration parameters. */
        register: {
            /** Validator profile information. */
            profile: {
                /** Validator node IP address. */
                node_ip: {
                    /** IP address. */
                    Ip: string;
                };
                /** Validator name. */
                name: string;
                /** Validator description. */
                description: string;
                /** Whether delegations are disabled. */
                delegations_disabled: boolean;
                /** Commission rate in basis points (1 = 0.0001%). */
                commission_bps: number;
                /** Signer address. */
                signer: Hex;
            };
            /** Initial jail status. */
            unjailed: boolean;
            /** Initial stake amount in wei. */
            initial_wei: number;
        };
    };
    vaultAddress?: undefined;
    expiresAfter?: number;
}

/**
 * Unregister an existing validator.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface CValidatorActionRequest_Unregister extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "CValidatorAction";
        /** Unregister the validator. */
        unregister: null;
    };
    vaultAddress?: undefined;
    expiresAfter?: number;
}

/**
 * Transfer native token from staking into the user's spot account.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
 */
export interface CWithdrawRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "cWithdraw";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Amount of wei to withdraw from staking balance (float * 1e8). */
        wei: number;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Configure block type for EVM transactions.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/evm/dual-block-architecture
 */
export interface EvmUserModifyRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "evmUserModify";
        /** `true` for large blocks, `false` for small blocks. */
        usingBigBlocks: boolean;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Modify an order.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order
 */
export interface ModifyRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "modify";
        /** Order ID or CLient Order ID. */
        oid: number | Hex;
        /** New order parameters. */
        order: OrderParams;
    };
    vaultAddress?: Hex;
    expiresAfter?: number;
}

/**
 * A multi-signature request.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
 */
export interface MultiSigRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "multiSig";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** List of signatures from authorized signers. */
        signatures: { r: Hex; s: Hex; v: number }[];
        /** Multi-signature payload information. */
        payload: {
            /** Address of the multi-signature user account. */
            multiSigUser: Hex;
            /** Address of the authorized user initiating the request. */
            outerSigner: Hex;
            /** The underlying action to be executed through multi-sig. */
            action: BaseExchangeRequest["action"];
        };
    };
    vaultAddress?: Hex;
    expiresAfter?: number;
}

/**
 * Place an order(s).
 * @returns {OrderResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
 */
export interface OrderRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "order";
        /** Order parameters. */
        orders: OrderParams[];
        /**
         * Order grouping strategy:
         * - `na`: Standard order without grouping.
         * - `normalTpsl`: TP/SL order with fixed size that doesn't adjust with position changes.
         * - `positionTpsl`: TP/SL order that adjusts proportionally with the position size.
         */
        grouping: "na" | "normalTpsl" | "positionTpsl";
        /** Builder fee. */
        builder?: {
            /** Builder address. */
            b: Hex;
            /** Builder fee in 0.1bps (1 = 0.0001%). */
            f: number;
        };
    };
    vaultAddress?: Hex;
    expiresAfter?: number;
}

/**
 * Deploying HIP-3 assets (Register Asset).
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-3-assets
 */
export interface PerpDeployRequest_RegisterAsset extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "perpDeploy";
        /** Parameters for registering a new perpetual asset. */
        registerAsset: {
            /** Max gas in native token wei. If not provided, then uses current deploy auction price. */
            maxGas?: number | null;
            /** Contains new asset listing parameters. */
            assetRequest: {
                /** Coin symbol for the new asset. */
                coin: string;
                /** Number of decimal places for size. */
                szDecimals: number;
                /** Initial oracle price for the asset. */
                oraclePx: string;
                /** Margin table identifier for risk management. */
                marginTableId: number;
                /** Whether the asset can only be traded with isolated margin. */
                onlyIsolated: boolean;
            };
            /** Name of the perp dex (<= 6 characters). */
            dex: string;
            /** Contains new perp dex parameters. */
            schema?: {
                /** Full name of the perp dex. */
                fullName: string;
                /** Collateral token index. */
                collateralToken: number;
                /** User to update oracles. If not provided, then deployer is assumed to be oracle updater. */
                oracleUpdater?: Hex | null;
            } | null;
        };
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Deploying HIP-3 assets (Set Oracle).
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-3-assets
 */
export interface PerpDeployRequest_SetOracle extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "perpDeploy";
        /** Parameters for setting oracle and mark prices for assets. */
        setOracle: {
            /** Name of the perp dex (<= 6 characters). */
            dex: string;
            /** A list (sorted by key) of asset and oracle prices. */
            oraclePxs: [string, string][];
            /** A list (sorted by key) of asset and mark prices. */
            markPxs: [string, string][];
        };
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Transfer funds between Spot account and Perp dex account.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-for-builder-deployed-dex-and-vice-versa
 */
export interface PerpDexClassTransferRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "PerpDexClassTransfer";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Name of perp dex. */
        dex: string;
        /** Collateral token of the perp dex as a string. */
        token: string;
        /** Amount of collateral token to transfer (1 = 1$). */
        amount: string;
        /** `true` for transferring from perp dex to spot account, `false` for transferring from spot account to perp dex. */
        toPerp: boolean;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Create a referral code.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface RegisterReferrerRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "registerReferrer";
        /** Referral code to create. */
        code: string;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Reserve additional rate-limited actions for a fee.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
 */
export interface ReserveRequestWeightRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "reserveRequestWeight";
        /** Amount of request weight to reserve. */
        weight: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: number;
}

/**
 * Schedule a cancel-all operation at a future time.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
 */
export interface ScheduleCancelRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "scheduleCancel";
        /**
         * Scheduled time (in ms since epoch).
         * Must be at least 5 seconds in the future.
         *
         * If not specified, will cause all scheduled cancel operations to be deleted.
         */
        time?: number;
    };
    vaultAddress?: Hex;
    expiresAfter?: number;
}

/**
 * Set the display name in the leaderboard.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface SetDisplayNameRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "setDisplayName";
        /**
         * Display name.
         *
         * Set to an empty string to remove the display name.
         */
        displayName: string;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Set a referral code.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface SetReferrerRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "setReferrer";
        /** Referral code. */
        code: string;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Deploying HIP-1 and HIP-2 assets (Genesis).
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export interface SpotDeployRequest_Genesis extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "spotDeploy";
        /** Genesis parameters. */
        genesis: {
            /** Token identifier. */
            token: number;
            /** Maximum token supply. */
            maxSupply: string;
            /** Set hyperliquidity balance to 0. */
            noHyperliquidity?: true;
        };
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Deploying HIP-1 and HIP-2 assets (Register Hyperliquidity).
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export interface SpotDeployRequest_RegisterHyperliquidity extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "spotDeploy";
        /** Register hyperliquidity parameters. */
        registerHyperliquidity: {
            /** Spot index (distinct from base token index). */
            spot: number;
            /** Starting price for liquidity seeding. */
            startPx: string;
            /** Order size as a float (not in wei). */
            orderSz: string;
            /** Total number of orders to place. */
            nOrders: number;
            /** Number of levels to seed with USDC. */
            nSeededLevels?: number;
        };
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Deploying HIP-1 and HIP-2 assets (Register Spot).
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export interface SpotDeployRequest_RegisterSpot extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "spotDeploy";
        /** Register spot parameters. */
        registerSpot: {
            /** Tuple containing base and quote token indices. */
            tokens: [number, number];
        };
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Deploying HIP-1 and HIP-2 assets (Register Token).
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export interface SpotDeployRequest_RegisterToken2 extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "spotDeploy";
        /** Register token parameters. */
        registerToken2: {
            /** Token specifications. */
            spec: {
                /** Token name. */
                name: string;
                /** Number of decimals for token size. */
                szDecimals: number;
                /** Number of decimals for token amounts in wei. */
                weiDecimals: number;
            };
            /** Maximum gas allowed for registration. */
            maxGas: number;
            /** Optional full token name. */
            fullName?: string;
        };
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Deploying HIP-1 and HIP-2 assets (Set Deployer Trading Fee Share).
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export interface SpotDeployRequest_SetDeployerTradingFeeShare extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "spotDeploy";
        /** Set deployer trading fee share parameters. */
        setDeployerTradingFeeShare: {
            /** Token identifier. */
            token: number;
            /**  The deployer trading fee share. Range: ["0%", "100%"]. */
            share: `${string}%`;
        };
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Deploying HIP-1 and HIP-2 assets (User Genesis).
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export interface SpotDeployRequest_UserGenesis extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "spotDeploy";
        /** User genesis parameters. */
        userGenesis: {
            /** Token identifier. */
            token: number;
            /** Array of tuples: [user address, genesis amount in wei]. */
            userAndWei: [string, string][];
            /** Array of tuples: [existing token identifier, genesis amount in wei]. */
            existingTokenAndWei: [number, string][];
            /** Array of tuples: [user address, blacklist status] (`true` for blacklist, `false` to remove existing blacklisted user). */
            blacklistUsers?: [string, boolean][];
        };
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Send spot assets to another address.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
 */
export interface SpotSendRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "spotSend";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Destination address. */
        destination: Hex;
        /** Token identifier. */
        token: `${string}:${Hex}`;
        /** Amount to send (not in wei). */
        amount: string;
        /** Unique request identifier (current timestamp in ms). */
        time: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Opt Out of Spot Dusting.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface SpotUserRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "spotUser";
        /** Spot dusting options. */
        toggleSpotDusting: {
            /** Opt out of spot dusting. */
            optOut: boolean;
        };
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Transfer between sub-accounts (spot).
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface SubAccountSpotTransferRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "subAccountSpotTransfer";
        /** Sub-account address. */
        subAccountUser: Hex;
        /** `true` for deposit, `false` for withdrawal. */
        isDeposit: boolean;
        /** Token identifier. */
        token: `${string}:${Hex}`;
        /** Amount to send (not in wei). */
        amount: string;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Transfer between sub-accounts (perpetual).
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface SubAccountTransferRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "subAccountTransfer";
        /** Sub-account address. */
        subAccountUser: Hex;
        /** `true` for deposit, `false` for withdrawal. */
        isDeposit: boolean;
        /** Amount to transfer (float * 1e6). */
        usd: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Delegate or undelegate native tokens to or from a validator.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
 */
export interface TokenDelegateRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "tokenDelegate";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Validator address. */
        validator: Hex;
        /** Amount for delegate/undelegate (float * 1e8). */
        wei: number;
        /** `true` for undelegate, `false` for delegate. */
        isUndelegate: boolean;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Cancel a TWAP order.
 * @returns {TwapCancelResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
 */
export interface TwapCancelRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "twapCancel";
        /** Asset ID. */
        a: number;
        /** Twap ID. */
        t: number;
    };
    vaultAddress?: Hex;
    expiresAfter?: number;
}

/**
 * Place a TWAP order.
 * @returns {TwapOrderResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
 */
export interface TwapOrderRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "twapOrder";
        /** Twap parameters. */
        twap: {
            /** Asset ID. */
            a: number;
            /** Position side (`true` for long, `false` for short). */
            b: boolean;
            /** Size (in base currency units). */
            s: string;
            /** Is reduce-only? */
            r: boolean;
            /** TWAP duration in minutes. */
            m: number;
            /** Enable random order timing. */
            t: boolean;
        };
    };
    vaultAddress?: Hex;
    expiresAfter?: number;
}

/**
 * Add or remove margin from isolated position.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export interface UpdateIsolatedMarginRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "updateIsolatedMargin";
        /** Asset ID. */
        asset: number;
        /** Position side (`true` for long, `false` for short). */
        isBuy: boolean;
        /** Amount to adjust (float * 1e6). */
        ntli: number;
    };
    vaultAddress?: Hex;
    expiresAfter?: number;
}

/**
 * Update cross or isolated leverage on a coin.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
 */
export interface UpdateLeverageRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "updateLeverage";
        /** Asset ID. */
        asset: number;
        /** `true` for cross leverage, `false` for isolated leverage. */
        isCross: boolean;
        /** New leverage value. */
        leverage: number;
    };
    vaultAddress?: Hex;
    expiresAfter?: number;
}

/**
 * Transfer funds between Spot account and Perp account.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export interface UsdClassTransferRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "usdClassTransfer";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Amount to transfer (1 = 1$). */
        amount: string;
        /** `true` for Spot to Perp, `false` for Perp to Spot. */
        toPerp: boolean;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Send usd to another address.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
 */
export interface UsdSendRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "usdSend";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Destination address. */
        destination: Hex;
        /** Amount to send (1 = 1$). */
        amount: string;
        /** Unique request identifier (current timestamp in ms). */
        time: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Distribute funds from a vault between followers.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface VaultDistributeRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "vaultDistribute";
        /** Vault address. */
        vaultAddress: Hex;
        /**
         * Amount to distribute (float * 1e6).
         *
         * Set to 0 to close the vault.
         */
        usd: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Modify a vault's configuration.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface VaultModifyRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "vaultModify";
        /** Vault address. */
        vaultAddress: Hex;
        /** Allow deposits from followers. */
        allowDeposits: boolean | null;
        /** Always close positions on withdrawal. */
        alwaysCloseOnWithdraw: boolean | null;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}

/**
 * Deposit or withdraw from a vault.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
 */
export interface VaultTransferRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "vaultTransfer";
        /** Vault address. */
        vaultAddress: Hex;
        /** `true` for deposit, `false` for withdrawal. */
        isDeposit: boolean;
        /** Amount for deposit/withdrawal (float * 1e6). */
        usd: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: number;
}

/**
 * Initiate a withdrawal request.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
 */
export interface Withdraw3Request extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "withdraw3";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Destination address. */
        destination: Hex;
        /** Amount to withdraw (1 = 1$). */
        amount: string;
        /** Unique request identifier (current timestamp in ms). */
        time: number;
    };
    vaultAddress?: undefined;
    expiresAfter?: undefined;
}
