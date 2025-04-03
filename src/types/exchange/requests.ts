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
    action: {
        /** Type of action. */
        type: string;
        /** Additional action parameters. */
        [key: string]: unknown;
    };
    /** Unique request identifier (current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: { r: Hex; s: Hex; v: number };
}

/**
 * Approve an agent to sign on behalf of the master account.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
 */
export interface ApproveAgentRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "approveAgent";
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
        /** Agent address. */
        agentAddress: Hex;
        /** Agent name. */
        agentName: string;
    };
}

/**
 * Approve a maximum fee rate for a builder.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
 */
export interface ApproveBuilderFeeRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "approveBuilderFee";
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
        /** Max fee rate (e.g., "0.01%"). */
        maxFeeRate: `${string}%`;
        /** Builder address. */
        builder: Hex;
    };
}

/**
 * Modify multiple orders.
 * @returns {OrderResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
 */
export interface BatchModifyRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "batchModify";
        /** Order modifications. */
        modifies: {
            /** Order ID. */
            oid: number;
            /** New order parameters. */
            order: OrderParams;
        }[];
    };
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Cancel order(s).
 * @returns {CancelResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
 */
export interface CancelRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Cancel order(s) by cloid.
 * @returns {CancelResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
 */
export interface CancelByCloidRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Transfer native token from the user's spot account into staking for delegating to validators.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
 */
export interface CDepositRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "cDeposit";
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
        /** Amount of wei to deposit into staking balance (float * 1e8). */
        wei: number;
    };
}

/**
 * Claim rewards from referral program.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface ClaimRewardsRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "claimRewards";
    };
}

/**
 * Create a sub-account.
 * @returns {CreateSubAccountResponse}
 * @see null - no documentation
 */
export interface CreateSubAccountRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "createSubAccount";
        /** Sub-account name. */
        name: string;
    };
}

/**
 * Create a vault.
 * @returns {CreateVaultResponse}
 * @see null - no documentation
 */
export interface CreateVaultRequest extends BaseExchangeRequest {
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
}

/**
 * Transfer native token from staking into the user's spot account.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
 */
export interface CWithdrawRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "cWithdraw";
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
        /** Amount of wei to withdraw from staking balance (float * 1e8). */
        wei: number;
    };
}

/**
 * Configure block type for EVM transactions.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/evm/dual-block-architecture
 */
export interface EvmUserModifyRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "evmUserModify";
        /** `true` for large blocks, `false` for small blocks. */
        usingBigBlocks: boolean;
    };
}

/**
 * Modify an order.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order
 */
export interface ModifyRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "modify";
        /** Order ID. */
        oid: number;
        /** New order parameters. */
        order: OrderParams;
    };
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Place an order(s).
 * @returns {OrderResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
 */
export interface OrderRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Create a referral code.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface RegisterReferrerRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "registerReferrer";
        /** Referral code to create. */
        code: string;
    };
}

/**
 * Reserve additional rate-limited actions for a fee.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
 */
export interface ReserveRequestWeightRequest extends BaseExchangeRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: "reserveRequestWeight";
        /** Amount of request weight to reserve. */
        weight: number;
    };
}

/**
 * Schedule a cancel-all operation at a future time.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
 */
export interface ScheduleCancelRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Set the display name in the leaderboard.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface SetDisplayNameRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
}

/**
 * Set a referral code.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface SetReferrerRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "setReferrer";
        /** Referral code. */
        code: string;
    };
}

/**
 * Deploying HIP-1 and HIP-2 assets.
 *
 * Step 1: Register Token
 * @returns {unknown}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export interface SpotDeployRequest_RegisterToken2 extends BaseExchangeRequest {
    /** Action to be performed. */
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
}
/**
 * Deploying HIP-1 and HIP-2 assets.
 *
 * Step 2: User Genesis
 * @returns {unknown}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export interface SpotDeployRequest_UserGenesis extends BaseExchangeRequest {
    /** Action to be performed. */
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
        };
    };
}
/**
 * Deploying HIP-1 and HIP-2 assets.
 *
 * Step 3: Genesis
 * @returns {unknown}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export interface SpotDeployRequest_Genesis extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "spotDeploy";
        /** Genesis parameters. */
        genesis: {
            /** Token identifier. */
            token: number;
            /** Maximum token supply. */
            maxSupply: string;
        };
    };
}
/**
 * Deploying HIP-1 and HIP-2 assets.
 *
 * Step 4: Register Spot
 * @returns {unknown}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export interface SpotDeployRequest_RegisterSpot extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "spotDeploy";
        /** Register spot parameters. */
        registerSpot: {
            /** Tuple containing base and quote token indices. */
            tokens: [number, number];
        };
    };
}
/**
 * Deploying HIP-1 and HIP-2 assets.
 *
 * Step 5: Register Hyperliquidity
 * @returns {unknown}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
 */
export interface SpotDeployRequest_RegisterHyperliquidity extends BaseExchangeRequest {
    /** Action to be performed. */
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
            nSeededLevels: number;
        };
    };
}

/**
 * Send spot assets to another address.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
 */
export interface SpotSendRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "spotSend";
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** Unique request identifier (current timestamp in ms). */
        time: number;
        /** Destination address. */
        destination: Hex;
        /** Token identifier. */
        token: `${string}:${Hex}`;
        /** Amount to send (not in wei). */
        amount: string;
    };
}

/**
 * Opt Out of Spot Dusting.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface SpotUserRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "spotUser";
        /** Spot dusting options. */
        toggleSpotDusting: {
            /** Opt out of spot dusting. */
            optOut: boolean;
        };
    };
}

/**
 * Transfer between sub-accounts (spot).
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface SubAccountSpotTransferRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
}

/**
 * Transfer between sub-accounts (perpetual).
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface SubAccountTransferRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
}

/**
 * Delegate or undelegate native tokens to or from a validator.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
 */
export interface TokenDelegateRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "tokenDelegate";
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
        /** Validator address. */
        validator: Hex;
        /** `true` for undelegate, `false` for delegate. */
        isUndelegate: boolean;
        /** Amount for delegate/undelegate (float * 1e8). */
        wei: number;
    };
}

/**
 * Cancel a TWAP order.
 * @returns {TwapCancelResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
 */
export interface TwapCancelRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "twapCancel";
        /** Asset ID. */
        a: number;
        /** Twap ID. */
        t: number;
    };
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Place a TWAP order.
 * @returns {TwapOrderResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
 */
export interface TwapOrderRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Add or remove margin from isolated position.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export interface UpdateIsolatedMarginRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Update cross or isolated leverage on a coin.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
 */
export interface UpdateLeverageRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Transfer funds between Spot and Perp accounts.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
 */
export interface UsdClassTransferRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "usdClassTransfer";
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** Unique request identifier (current timestamp in ms). */
        nonce: number;
        /** Amount to transfer (1 = 1$). */
        amount: string;
        /** `true` for Spot to Perp, `false` for Perp to Spot. */
        toPerp: boolean;
    };
}

/**
 * Send usd to another address.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
 */
export interface UsdSendRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "usdSend";
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** Unique request identifier (current timestamp in ms). */
        time: number;
        /** Destination address. */
        destination: Hex;
        /** Amount to send (1 = 1$). */
        amount: string;
    };
}

/**
 * Distribute funds from a vault between followers.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface VaultDistributeRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
}

/**
 * Modify a vault's configuration.
 * @returns {SuccessResponse}
 * @see null - no documentation
 */
export interface VaultModifyRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
}

/**
 * Deposit or withdraw from a vault.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
 */
export interface VaultTransferRequest extends BaseExchangeRequest {
    /** Action to be performed. */
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
}

/**
 * Initiate a withdrawal request.
 * @returns {SuccessResponse}
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
 */
export interface Withdraw3Request extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "withdraw3";
        /** HyperLiquid network. */
        hyperliquidChain: "Mainnet" | "Testnet";
        /** Chain ID used for signing. */
        signatureChainId: Hex;
        /** Unique request identifier (current timestamp in ms). */
        time: number;
        /** Amount to withdraw (1 = 1$). */
        amount: string;
        /** Destination address. */
        destination: Hex;
    };
}
