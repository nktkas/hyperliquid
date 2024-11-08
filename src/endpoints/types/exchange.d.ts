import type { TIF } from "./info.d.ts";
import type { Hex } from "../../utils/hex.ts";

/**
 * Order grouping strategy:
 * - `"na"`: Standard order without grouping.
 * - `"normalTpsl"`: TP/SL order with fixed size that doesn't adjust with position changes.
 * - `"positionTpsl"`: TP/SL order that adjusts proportionally with the position size.
 */
export type OrderGroupingStrategy =
    | "na"
    | "normalTpsl"
    | "positionTpsl";

/** Order parameters. */
export type Order = {
    /** An integer representing the asset being traded. */
    a: number;

    /** Is the order to buy? */
    b: boolean;

    /** Price. */
    p: string;

    /** Size (in base currency units). */
    s: string;

    /** Is reduce-only? */
    r: boolean;

    /** Order type and parameters. */
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
                /** Is the market order. */
                isMarket: boolean;

                /** Trigger price. */
                triggerPx: string;

                /** Indicates if it's take-profit (tp) or stop-loss (sl). */
                tpsl: "tp" | "sl";
            };
        };

    /** Client Order ID. */
    c?: Hex;
};

// ———————————————Responses————————————————

export interface BaseExchangeResponse {
    /** Successful status. */
    status: "ok" | "err";

    /** Response details. */
    response:
        | {
            /** Type of operation. */
            type: string;

            /** Specific data. */
            data?:
                | {
                    statuses: (
                        | Record<string, unknown>
                        | string
                    )[];
                }
                | string;
        }
        | string;
}

/** Successful response without specific data. */
export interface SuccessResponse extends BaseExchangeResponse {
    /** Successful status. */
    status: "ok";

    /** Response details. */
    response: {
        /** Type of operation. */
        type: "default";
    };
}

/** Error response for failed operations. */
export interface ErrorResponse extends BaseExchangeResponse {
    /** Error status. */
    status: "err";

    /** Error message. */
    response: string;
}

/** Response for order cancellation. */
export interface CancelResponse extends BaseExchangeResponse {
    /** Successful status. */
    status: "ok";

    /** Response details. */
    response: {
        /** Type of operation. */
        type: "cancel";

        /** Specific data. */
        data: {
            /** Array of statuses or error messages. */
            statuses: (
                | "success"
                | {
                    /** Error message. */
                    error: string;
                }
            )[];
        };
    };
}

/** Response for creating a sub-account. */
export interface CreateSubAccountResponse extends BaseExchangeResponse {
    /** Successful status. */
    status: "ok";

    /** Response details. */
    response: {
        /** Type of operation. */
        type: "createSubAccount";

        /** Sub-account address. */
        data: Hex;
    };
}

/** Response for order placement and batch modifications. */
export interface OrderResponse extends BaseExchangeResponse {
    /** Successful status. */
    status: "ok";

    /** Response details. */
    response: {
        /** Type of operation. */
        type: "order";

        /** Specific data. */
        data: {
            /** Array of statuses or error messages. */
            statuses: (
                | {
                    /** Resting order status. */
                    resting: {
                        /** Order ID. */
                        oid: number;

                        /** Client Order ID. */
                        cloid?: Hex;
                    };
                }
                | {
                    /** Filled order status. */
                    filled: {
                        /** Total size filled. */
                        totalSz: string;

                        /** Average price of fill. */
                        avgPx: string;

                        /** Order ID. */
                        oid: number;

                        /** Client Order ID. */
                        cloid?: Hex;
                    };
                }
                | {
                    /** Error message. */
                    error: string;
                }
            )[];
        };
    };
}

/** Successful variant of {@linkcode CancelResponse}. */
export interface CancelResponseSuccess extends CancelResponse {
    /** Successful status. */
    status: "ok";

    /** Response details. */
    response: {
        /** Type of operation. */
        type: "cancel";

        /** Specific data. */
        data: {
            /** Array of statuses. */
            statuses: "success"[];
        };
    };
}

/** Successful variant of {@linkcode OrderResponse}. */
export interface OrderResponseSuccess extends OrderResponse {
    /** Successful status. */
    status: "ok";

    /** Response details. */
    response: {
        /** Type of operation. */
        type: "order";

        /** Specific data. */
        data: {
            /** Array of statuses. */
            statuses: (
                | {
                    /** Resting order status. */
                    resting: {
                        /** Order ID. */
                        oid: number;

                        /** Client Order ID. */
                        cloid?: Hex;
                    };
                }
                | {
                    /** Filled order status. */
                    filled: {
                        /** Total size filled. */
                        totalSz: string;

                        /** Average price of fill. */
                        avgPx: string;

                        /** Order ID. */
                        oid: number;

                        /** Client Order ID. */
                        cloid?: Hex;
                    };
                }
            )[];
        };
    };
}

// ———————————————Requests————————————————

/** Base structure for exchange requests. */
export interface BaseExchangeRequest {
    /** Action to perform. */
    action: Record<string, unknown>;

    /** Unique request identifier (recommended: current timestamp in ms). */
    nonce: number;

    /** Cryptographic signature. */
    signature: { r: Hex; s: Hex; v: number };

    /** Vault address (optional, for vault trading). */
    vaultAddress?: Hex;
}

/**
 * Approve an agent to sign on behalf of the master or sub-accounts.
 *
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet|Hyperliquid GitBook}
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

        /** Agent address. */
        agentAddress: Hex;

        /** Agent name. */
        agentName: string;

        /** Unique request identifier (recommended: current timestamp in ms). */
        nonce: number;
    };

    /** Not applicable for this action. */
    vaultAddress?: never;
}

/**
 * Approve a max fee rate for a builder address.
 *
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee|Hyperliquid GitBook}
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

        /** Max fee rate (e.g., "0.01%"). */
        maxFeeRate: `${string}%`;

        /** Builder address. */
        builder: Hex;

        /** Unique request identifier (recommended: current timestamp in ms). */
        nonce: number;
    };

    /** Not applicable for this action. */
    vaultAddress?: never;
}

/**
 * Modify multiple orders.
 *
 * @returns {OrderResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders|Hyperliquid GitBook}
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
            order: Order;
        }[];
    };
}

/**
 * Cancel order(s).
 *
 * @returns {CancelResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s|Hyperliquid GitBook}
 */
export interface CancelRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "cancel";

        /** Orders to cancel. */
        cancels: {
            /** An integer representing the asset being traded. */
            a: number;

            /** Order ID. */
            o: number;
        }[];
    };
}

/**
 * Cancel order(s) by Client Order ID.
 *
 * @returns {CancelResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid|Hyperliquid GitBook}
 */
export interface CancelByCloidRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "cancelByCloid";

        /** Orders to cancel. */
        cancels: {
            /** An integer representing the asset being traded. */
            asset: number;

            /** Client Order ID. */
            cloid: Hex;
        }[];
    };
}

/**
 * Create a sub-account.
 *
 * @returns {CreateSubAccountResponse}
 * @see null
 */
export interface CreateSubAccountRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "createSubAccount";

        /** Sub-account name. */
        name: string;
    };

    /** Not applicable for this action. */
    vaultAddress?: never;
}

/**
 * Modify an order.
 *
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order|Hyperliquid GitBook}
 */
export interface ModifyRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "modify";

        /** Order ID to modify. */
        oid: number;

        /** New order parameters. */
        order: Order;
    };
}

/**
 * Place an order(s).
 *
 * @returns {OrderResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order|Hyperliquid GitBook}
 */
export interface OrderRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "order";

        /** Order parameters. */
        orders: Order[];

        /** Order grouping strategy. */
        grouping: OrderGroupingStrategy;

        /** Builder fee. */
        builder?: {
            /** The address of the builder. */
            b: Hex;

            /** The builder fee to charge in tenths of basis points. */
            f: number;
        };
    };
}

/**
 * Schedule a time to cancel all open orders.
 *
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch|Hyperliquid GitBook}
 */
export interface ScheduleCancelRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "scheduleCancel";

        /** Scheduled time (in ms since epoch). Must be at least 5 seconds in the future. */
        time: number;
    };
}

/**
 * Set a referral code.
 *
 * @returns {SuccessResponse}
 * @see null
 */
export interface SetReferrerRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "setReferrer";

        /** Referral code. */
        code: string;
    };

    /** Not applicable for this action. */
    vaultAddress?: never;
}

/**
 * Transfer a spot asset on L1 to another address.
 *
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-spot-transfer|Hyperliquid GitBook}
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

        /** Recipient address. */
        destination: Hex;

        /** Token identifier (e.g., tokenName:tokenId). */
        token: `${string}:${Hex}`;

        /** Amount to send. */
        amount: string;

        /** Current timestamp in ms. */
        time: number;
    };

    /** Not applicable for this action. */
    vaultAddress?: never;
}

/**
 * Transfer between sub-accounts.
 *
 * @returns {SuccessResponse}
 * @see null
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

    /** Not applicable for this action. */
    vaultAddress?: never;
}

/**
 * Update isolated margin for a position.
 *
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin|Hyperliquid GitBook}
 */
export interface UpdateIsolatedMarginRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "updateIsolatedMargin";

        /** An integer representing the asset being traded. */
        asset: number;

        /** Position side (`true` for long, `false` for short). */
        isBuy: boolean;

        /** Amount to adjust (in USD). This should be an integer value. */
        ntli: number;
    };
}

/**
 * Update leverage for cross or isolated margin.
 *
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage|Hyperliquid GitBook}
 */
export interface UpdateLeverageRequest extends BaseExchangeRequest {
    /** Action to be performed. */
    action: {
        /** Type of action. */
        type: "updateLeverage";

        /** An integer representing the asset being traded. */
        asset: number;

        /** `true` for cross leverage, `false` for isolated leverage. */
        isCross: boolean;

        /** New leverage value. */
        leverage: number;
    };
}

/**
 * Transfer funds between Spot and Perp accounts.
 *
 * @returns {SuccessResponse}
 * @see null
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

        /** USD amount to transfer. */
        amount: string;

        /** `true` for Spot to Perp, `false` for Perp to Spot. */
        toPerp: boolean;

        /** Unique request identifier (recommended: current timestamp in ms). */
        nonce: number;
    };

    /** Not applicable for this action. */
    vaultAddress?: never;
}

/**
 * Transfer USDC on L1 to another address.
 *
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer|Hyperliquid GitBook}
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

        /** Recipient address. */
        destination: Hex;

        /** USD amount to send. */
        amount: string;

        /** Current timestamp in ms. */
        time: number;
    };

    /** Not applicable for this action. */
    vaultAddress?: never;
}

/**
 * Transfer funds to/from a vault.
 *
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault|Hyperliquid GitBook}
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

        /** Amount to transfer (float * 1e6). */
        usd: number;
    };

    /** Not applicable for this action. */
    vaultAddress?: never;
}

/**
 * Initiate a withdrawal request.
 *
 * @returns {SuccessResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request|Hyperliquid GitBook}
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

        /** USD amount to withdraw. */
        amount: string;

        /** Current timestamp in ms. */
        time: number;

        /** Recipient address. */
        destination: Hex;
    };

    /** Not applicable for this action. */
    vaultAddress?: never;
}
