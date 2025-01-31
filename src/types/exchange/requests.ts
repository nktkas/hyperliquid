import type { Hex } from "../common.ts";
import type { OrderParams } from "./common.ts";

/** Base structure for exchange requests. */
export interface BaseExchangeRequest {
    /** Action to perform. */
    action: {
        /** Type of action. */
        type: string;
        /** Additional action parameters. */
        [key: string]: unknown;
    };
    /** Unique request identifier (recommended current timestamp in ms). */
    nonce: number;
    /** Cryptographic signature. */
    signature: { r: Hex; s: Hex; v: number };
}

/**
 * Approve an agent to sign on behalf of the master or sub-accounts.
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet | Hyperliquid GitBook}
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
        /** Unique request identifier (recommended current timestamp in ms). */
        nonce: number;
        /** Agent address. */
        agentAddress: Hex;
        /** Agent name. */
        agentName: string;
    };
}

/**
 * Approve a max fee rate for a builder address.
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee | Hyperliquid GitBook}
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
        /** Unique request identifier (recommended current timestamp in ms). */
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders | Hyperliquid GitBook}
 */
export interface BatchModifyRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "batchModify";
        /** Order modifications. */
        modifies: {
            /** Order ID to modify. */
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s | Hyperliquid GitBook}
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid | Hyperliquid GitBook}
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
 * Create a sub-account.
 * @returns {CreateSubAccountResponse}
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
 * Modify an order.
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order | Hyperliquid GitBook}
 */
export interface ModifyRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "modify";
        /** Order ID to modify. */
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order | Hyperliquid GitBook}
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
 * Schedule a time to cancel all open orders.
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch | Hyperliquid GitBook}
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
 * Set a referral code.
 * @returns {SuccessResponse}
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
 * Transfer a spot asset on L1 to another address.
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-spot-transfer | Hyperliquid GitBook}
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
        /** Unique request identifier (recommended current timestamp in ms). */
        time: number;
        /** Recipient address. */
        destination: Hex;
        /** Token identifier. */
        token: `${string}:${Hex}`;
        /** Amount to send. */
        amount: string;
    };
}

/**
 * Transfer between sub-accounts.
 * @returns {SuccessResponse}
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
        /** Raw amount to transfer (float * 1e6). */
        usd: number;
    };
}

/**
 * Cancel a TWAP order.
 * @returns {TwapCancelResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order | Hyperliquid GitBook}
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order | Hyperliquid GitBook}
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
 * Update isolated margin for a position.
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin | Hyperliquid GitBook}
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
        /** Amount to adjust (in USD). */
        ntli: number;
    };
    /** Vault address (for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Update leverage for cross or isolated margin.
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage | Hyperliquid GitBook}
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
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa | Hyperliquid GitBook}
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
        /** Unique request identifier (recommended current timestamp in ms). */
        nonce: number;
        /** Amount to transfer. */
        amount: string;
        /** `true` for Spot to Perp, `false` for Perp to Spot. */
        toPerp: boolean;
    };
}

/**
 * Transfer USDC on L1 to another address.
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer | Hyperliquid GitBook}
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
        /** Unique request identifier (recommended current timestamp in ms). */
        time: number;
        /** Recipient address. */
        destination: Hex;
        /** Amount to send. */
        amount: string;
    };
}

/**
 * Add or remove funds from a vault.
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault | Hyperliquid GitBook}
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
        /** Raw amount to transfer (float * 1e6). */
        usd: number;
    };
}

/**
 * Initiate a withdrawal request.
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request | Hyperliquid GitBook}
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
        /** Unique request identifier (recommended current timestamp in ms). */
        time: number;
        /** Amount to withdraw. */
        amount: string;
        /** Recipient address. */
        destination: Hex;
    };
}
