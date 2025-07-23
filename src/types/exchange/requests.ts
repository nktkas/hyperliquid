import type { Hex } from "../mod.ts";
import type { TIF } from "../info/orders.ts";

/** ECDSA signature components for Ethereum typed data. */
export interface Signature {
    /** First 32-byte component of ECDSA signature. */
    r: Hex;
    /** Second 32-byte component of ECDSA signature. */
    s: Hex;
    /** Recovery identifier. */
    v: 27 | 28;
}

/** Order parameters. */
export type OrderParams = {
    /** Asset ID. */
    a: number;
    /** Position side (`true` for long, `false` for short). */
    b: boolean;
    /**
     * Price.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    p: string;
    /**
     * Size (in base currency units).
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
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
                /**
                 * Trigger price.
                 * @pattern ^[0-9]+(\.[0-9]+)?$
                 */
                triggerPx: string;
                /** Indicates whether it is take profit or stop loss. */
                tpsl: "tp" | "sl";
            };
        };
    /** Client Order ID. */
    c?: Hex;
};

/**
 * Approve an agent to sign on behalf of the master account.
 * @returns {SuccessResponse}
 */
export interface ApproveAgentRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "approveAgent";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Agent address. */
        agentAddress: Hex;
        /** Agent name or null for unnamed agent. */
        agentName: string | null;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
}

/**
 * Approve a maximum fee rate for a builder.
 * @returns {SuccessResponse}
 */
export interface ApproveBuilderFeeRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
}

/**
 * Modify multiple orders.
 * @returns {OrderResponse}
 */
export interface BatchModifyRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "batchModify";
        /** Order modifications. */
        modifies: {
            /** Order ID or Client Order ID. */
            oid: number | Hex;
            /** New order parameters. */
            order: OrderParams;
        }[];
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Cancel order(s).
 * @returns {CancelResponse}
 */
export interface CancelRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Cancel order(s) by cloid.
 * @returns {CancelResponse}
 */
export interface CancelByCloidRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Transfer native token from the user spot account into staking for delegating to validators.
 * @returns {SuccessResponse}
 */
export interface CDepositRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
}

/**
 * Claim rewards from referral program.
 * @returns {SuccessResponse}
 */
export interface ClaimRewardsRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "claimRewards";
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Convert a single-signature account to a multi-signature account.
 * @returns {SuccessResponse}
 */
export interface ConvertToMultiSigUserRequest {
    /** Action to perform. */
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
         * Must be {@linkcode ConvertToMultiSigUserRequestSigners} converted to a string via `JSON.stringify(...)`.
         */
        signers: string;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
}
/**
 * Convert a single-signature account to a multi-signature account (without JSON.stringify).
 * @returns {SuccessResponse}
 */
export interface ConvertToMultiSigUserRequestWithoutStringify {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "convertToMultiSigUser";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Signers configuration. */
        signers: ConvertToMultiSigUserRequestSigners;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
}
/** Signers configuration for {@linkcode ConvertToMultiSigUserRequest}. */
export type ConvertToMultiSigUserRequestSigners =
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
 */
export interface CreateSubAccountRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "createSubAccount";
        /** Sub-account name. */
        name: string;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Create a vault.
 * @returns {CreateVaultResponse}
 */
export interface CreateVaultRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Perform an action on a signer:
 * - Jail to prevent them from signing transactions.
 * - Unjail to allow them to sign transactions again.
 * @returns {SuccessResponse}
 */
export interface CSignerActionRequest {
    /** Action to perform. */
    action:
        | {
            /** Type of action. */
            type: "CSignerAction";
            /** Jail the signer. */
            jailSelf: null;
        }
        | {
            /** Type of action. */
            type: "CSignerAction";
            /** Unjail the signer. */
            unjailSelf: null;
        };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Perform an action on a validator:
 * - Change profile information.
 * - Register a new validator.
 * - Unregister an existing validator.
 * @returns {SuccessResponse}
 */
export interface CValidatorActionRequest {
    /** Action to perform. */
    action:
        | {
            /** Type of action. */
            type: "CValidatorAction";
            /** Profile changes to apply. */
            changeProfile: {
                /** Validator node IP address. */
                node_ip:
                    | {
                        /** IP address. */
                        Ip: string;
                    }
                    | null;
                /** Validator name. */
                name: string | null;
                /** Validator description. */
                description: string | null;
                /** Validator jail status. */
                unjailed: boolean;
                /** Enable or disable delegations. */
                disable_delegations: boolean | null;
                /** Commission rate in basis points (1 = 0.0001%). */
                commission_bps: number | null;
                /** Signer address. */
                signer: Hex | null;
            };
        }
        | {
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
        }
        | {
            /** Type of action. */
            type: "CValidatorAction";
            /** Unregister the validator. */
            unregister: null;
        };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Transfer native token from staking into the user spot account.
 * @returns {SuccessResponse}
 */
export interface CWithdrawRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
}

/**
 * Configure block type for EVM transactions.
 * @returns {SuccessResponse}
 */
export interface EvmUserModifyRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "evmUserModify";
        /** `true` for large blocks, `false` for small blocks. */
        usingBigBlocks: boolean;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Modify an order.
 * @returns {SuccessResponse}
 */
export interface ModifyRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "modify";
        /** Order ID or Client Order ID. */
        oid: number | Hex;
        /** New order parameters. */
        order: OrderParams;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * A multi-signature request.
 * @returns {SuccessResponse}
 */
export interface MultiSigRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "multiSig";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** List of signatures from authorized signers. */
        signatures: Signature[];
        /** Multi-signature payload information. */
        payload: {
            /** Address of the multi-signature user account. */
            multiSigUser: Hex;
            /** Address of the authorized user initiating the request. */
            outerSigner: Hex;
            /** The underlying action to be executed through multi-sig. */
            action:
                | ApproveAgentRequest["action"]
                | ApproveBuilderFeeRequest["action"]
                | BatchModifyRequest["action"]
                | CancelRequest["action"]
                | CancelByCloidRequest["action"]
                | CDepositRequest["action"]
                | ClaimRewardsRequest["action"]
                | (
                    | ConvertToMultiSigUserRequest["action"]
                    | ConvertToMultiSigUserRequestWithoutStringify["action"]
                )
                | CreateSubAccountRequest["action"]
                | CreateVaultRequest["action"]
                | CSignerActionRequest["action"]
                | CValidatorActionRequest["action"]
                | CWithdrawRequest["action"]
                | EvmUserModifyRequest["action"]
                | ModifyRequest["action"]
                | MultiSigRequest["action"]
                | OrderRequest["action"]
                | PerpDeployRequest["action"]
                | RegisterReferrerRequest["action"]
                | ReserveRequestWeightRequest["action"]
                | ScheduleCancelRequest["action"]
                | SetDisplayNameRequest["action"]
                | SetReferrerRequest["action"]
                | SpotDeployRequest["action"]
                | SpotSendRequest["action"]
                | SpotUserRequest["action"]
                | SubAccountModifyRequest["action"]
                | SubAccountSpotTransferRequest["action"]
                | SubAccountTransferRequest["action"]
                | TokenDelegateRequest["action"]
                | TwapCancelRequest["action"]
                | TwapOrderRequest["action"]
                | UpdateIsolatedMarginRequest["action"]
                | UpdateLeverageRequest["action"]
                | UsdClassTransferRequest["action"]
                | UsdSendRequest["action"]
                | VaultDistributeRequest["action"]
                | VaultModifyRequest["action"]
                | VaultTransferRequest["action"]
                | Withdraw3Request["action"];
        };
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Place an order(s).
 * @returns {OrderResponse}
 */
export interface OrderRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Deploying HIP-3 assets:
 * - Register Asset
 * - Set Oracle
 * @returns {SuccessResponse}
 */
export interface PerpDeployRequest {
    /** Action to perform. */
    action:
        | {
            /** Type of action. */
            type: "perpDeploy";
            /** Parameters for registering a new perpetual asset. */
            registerAsset: {
                /** Max gas in native token wei. If not provided, then uses current deploy auction price. */
                maxGas: number | null;
                /** Contains new asset listing parameters. */
                assetRequest: {
                    /** Coin symbol for the new asset. */
                    coin: string;
                    /** Number of decimal places for size. */
                    szDecimals: number;
                    /**
                     * Initial oracle price for the asset.
                     * @pattern ^[0-9]+(\.[0-9]+)?$
                     */
                    oraclePx: string;
                    /** Margin table identifier for risk management. */
                    marginTableId: number;
                    /** Whether the asset can only be traded with isolated margin. */
                    onlyIsolated: boolean;
                };
                /** Name of the dex. */
                dex: string;
                /** Contains new dex parameters. */
                schema:
                    | {
                        /** Full name of the dex. */
                        fullName: string;
                        /** Collateral token index. */
                        collateralToken: number;
                        /** User to update oracles. If not provided, then deployer is assumed to be oracle updater. */
                        oracleUpdater: Hex | null;
                    }
                    | null;
            };
        }
        | {
            /** Type of action. */
            type: "perpDeploy";
            /** Parameters for setting oracle and mark prices for assets. */
            setOracle: {
                /** Name of the dex. */
                dex: string;
                /** A list (sorted by key) of asset and oracle prices. */
                oraclePxs: [string, string][];
                /** An outer list of inner lists (inner list sorted by key) of asset and mark prices. */
                markPxs: [string, string][][];
            };
        };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Create a referral code.
 * @returns {SuccessResponse}
 */
export interface RegisterReferrerRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "registerReferrer";
        /** Referral code to create. */
        code: string;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Reserve additional rate-limited actions for a fee.
 * @returns {SuccessResponse}
 */
export interface ReserveRequestWeightRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "reserveRequestWeight";
        /** Amount of request weight to reserve. */
        weight: number;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Schedule a cancel-all operation at a future time.
 * @returns {SuccessResponse}
 */
export interface ScheduleCancelRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Set the display name in the leaderboard.
 * @returns {SuccessResponse}
 */
export interface SetDisplayNameRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Set a referral code.
 * @returns {SuccessResponse}
 */
export interface SetReferrerRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "setReferrer";
        /** Referral code. */
        code: string;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Deploying HIP-1 and HIP-2 assets:
 * - Genesis
 * - Register Hyperliquidity
 * - Register Spot
 * - Register Token2
 * - Set Deployer Trading Fee Share
 * - User Genesis
 * @returns {SuccessResponse}
 */
export interface SpotDeployRequest {
    /** Action to perform. */
    action:
        | {
            /** Type of action. */
            type: "spotDeploy";
            /** Genesis parameters. */
            genesis: {
                /** Token identifier. */
                token: number;
                /**
                 * Maximum token supply.
                 * @pattern ^[0-9]+(\.[0-9]+)?$
                 */
                maxSupply: string;
                /** Set hyperliquidity balance to 0. */
                noHyperliquidity?: true;
            };
        }
        | {
            /** Type of action. */
            type: "spotDeploy";
            /** Register hyperliquidity parameters. */
            registerHyperliquidity: {
                /** Spot index (distinct from base token index). */
                spot: number;
                /**
                 * Starting price for liquidity seeding.
                 * @pattern ^[0-9]+(\.[0-9]+)?$
                 */
                startPx: string;
                /**
                 * Order size as a float (not in wei).
                 * @pattern ^[0-9]+(\.[0-9]+)?$
                 */
                orderSz: string;
                /** Total number of orders to place. */
                nOrders: number;
                /** Number of levels to seed with USDC. */
                nSeededLevels?: number;
            };
        }
        | {
            /** Type of action. */
            type: "spotDeploy";
            /** Register spot parameters. */
            registerSpot: {
                /** Tuple containing base and quote token indices. */
                tokens: [number, number];
            };
        }
        | {
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
        }
        | {
            /** Type of action. */
            type: "spotDeploy";
            /** Set deployer trading fee share parameters. */
            setDeployerTradingFeeShare: {
                /** Token identifier. */
                token: number;
                /** The deployer trading fee share. Range is 0% to 100%. */
                share: `${string}%`;
            };
        }
        | {
            /** Type of action. */
            type: "spotDeploy";
            /** User genesis parameters. */
            userGenesis: {
                /** Token identifier. */
                token: number;
                /** Array of tuples: [user address, genesis amount in wei]. */
                userAndWei: [Hex, string][];
                /** Array of tuples: [existing token identifier, genesis amount in wei]. */
                existingTokenAndWei: [number, string][];
                /** Array of tuples: [user address, blacklist status] (`true` for blacklist, `false` to remove existing blacklisted user). */
                blacklistUsers?: [Hex, boolean][];
            };
        };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Send spot assets to another address.
 * @returns {SuccessResponse}
 */
export interface SpotSendRequest {
    /** Action to perform. */
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
        /**
         * Amount to send (not in wei).
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        amount: string;
        /** Unique request identifier (current timestamp in ms). */
        time: number;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
}

/**
 * Opt Out of Spot Dusting.
 * @returns {SuccessResponse}
 */
export interface SpotUserRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "spotUser";
        /** Spot dusting options. */
        toggleSpotDusting: {
            /** Opt out of spot dusting. */
            optOut: boolean;
        };
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Modify a sub-account.
 * @returns {SuccessResponse}
 */
export interface SubAccountModifyRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "subAccountModify";
        /** Sub-account address to modify. */
        subAccountUser: Hex;
        /** New sub-account name. */
        name: string;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Transfer between sub-accounts (spot).
 * @returns {SuccessResponse}
 */
export interface SubAccountSpotTransferRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "subAccountSpotTransfer";
        /** Sub-account address. */
        subAccountUser: Hex;
        /** `true` for deposit, `false` for withdrawal. */
        isDeposit: boolean;
        /** Token identifier. */
        token: `${string}:${Hex}`;
        /**
         * Amount to send (not in wei).
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        amount: string;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Transfer between sub-accounts (perpetual).
 * @returns {SuccessResponse}
 */
export interface SubAccountTransferRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Delegate or undelegate native tokens to or from a validator.
 * @returns {SuccessResponse}
 */
export interface TokenDelegateRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
}

/**
 * Cancel a TWAP order.
 * @returns {TwapCancelResponse}
 */
export interface TwapCancelRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "twapCancel";
        /** Asset ID. */
        a: number;
        /** Twap ID. */
        t: number;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Place a TWAP order.
 * @returns {TwapOrderResponse}
 */
export interface TwapOrderRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "twapOrder";
        /** Twap parameters. */
        twap: {
            /** Asset ID. */
            a: number;
            /** Position side (`true` for long, `false` for short). */
            b: boolean;
            /**
             * Size (in base currency units).
             * @pattern ^[0-9]+(\.[0-9]+)?$
             */
            s: string;
            /** Is reduce-only? */
            r: boolean;
            /** TWAP duration in minutes. */
            m: number;
            /** Enable random order timing. */
            t: boolean;
        };
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Add or remove margin from isolated position.
 * @returns {SuccessResponse}
 */
export interface UpdateIsolatedMarginRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Update cross or isolated leverage on a coin.
 * @returns {SuccessResponse}
 */
export interface UpdateLeverageRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Transfer funds between Spot account and Perp account.
 * @returns {SuccessResponse}
 */
export interface UsdClassTransferRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "usdClassTransfer";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /**
         * Amount to transfer (1 = 1$).
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        amount: string;
        /** `true` for Spot to Perp, `false` for Perp to Spot. */
        toPerp: boolean;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
}

/**
 * Send usd to another address.
 * @returns {SuccessResponse}
 */
export interface UsdSendRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "usdSend";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Destination address. */
        destination: Hex;
        /**
         * Amount to send (1 = 1$).
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        amount: string;
        /** Unique request identifier (current timestamp in ms). */
        time: number;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
}

/**
 * Distribute funds from a vault between followers.
 * @returns {SuccessResponse}
 */
export interface VaultDistributeRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Vault address (for vault trading). */
    expiresAfter?: number;
}

/**
 * Modify a vault configuration.
 * @returns {SuccessResponse}
 */
export interface VaultModifyRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Deposit or withdraw from a vault.
 * @returns {SuccessResponse}
 */
export interface VaultTransferRequest {
    /** Action to perform. */
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
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
    /** Expiration time of the action. */
    expiresAfter?: number;
}

/**
 * Initiate a withdrawal request.
 * @returns {SuccessResponse}
 */
export interface Withdraw3Request {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "withdraw3";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Destination address. */
        destination: Hex;
        /**
         * Amount to withdraw (1 = 1$).
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        amount: string;
        /** Unique request identifier (current timestamp in ms). */
        time: number;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: Signature;
}
