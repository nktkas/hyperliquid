import type { Hex } from "viem";
import type { TIF } from "./info.d.ts";

type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [k: string | number]: JSONValue };

interface JSONObject {
    [k: string | number]: JSONValue;
}

// ———————————————Individual Types———————————————

/**
 * Order grouping strategy:
 *
 * - `"na"`: Standard order without grouping.
 * - `"normalTpsl"`: Take Profit or Stop Loss order with fixed size that does not adjust with position changes. These TP/SL orders are linked to the initial order size and remain constant even if the position size changes. Useful when you want a TP/SL order to represent a specific amount independently of your current position.
 * - `"positionTpsl"`: Take Profit or Stop Loss order that automatically adjusts proportionally with the current position size. These TP/SL orders are linked to the position and will increase or decrease in size as your position size changes. Ideal for maintaining TP/SL orders that always cover your entire position.
 */
export type OrderGroupingStrategy = "na" | "normalTpsl" | "positionTpsl";

/**
 * Order parameters.
 */
export type Order = {
    /** Index of the coin. */
    a: number;

    /** Indicates whether this is a buy order. */
    b: boolean;

    /** Price of the order. */
    p: string;

    /** Size of the order in units of the coin (base currency). */
    s: string;

    /** Indicates whether this order reduces an existing position. */
    r: boolean;

    /** Order type and specific parameters. */
    t:
        | {
            /** Parameters for a limit order. */
            limit: {
                /** Time-in-force; defines the behavior of the order upon entering the order book. */
                tif: TIF;
            };
        }
        | {
            /** Parameters for a trigger order. */
            trigger: {
                /** Indicates whether this is a market order. */
                isMarket: boolean;

                /** Trigger price for conditional orders. */
                triggerPx: string;

                /** Indicates if the order is a take-profit (`"tp"`) or stop-loss (`"sl"`). */
                tpsl: "tp" | "sl";
            };
        };

    /** Client Order ID. */
    c?: Hex;
};

/**
 * Base structure for all exchange requests.
 */
export interface BaseExchangeRequest {
    /** Action to be performed. */
    action: JSONObject;

    /** Unique identifier for the request (recommended: current timestamp in milliseconds). */
    nonce: number;

    /** Cryptographic signature. */
    signature: { r: Hex; s: Hex; v: number };

    /** On-chain address of the vault (if trading on behalf of a vault). */
    vaultAddress?: Hex;
}

/**
 * Base structure for all exchange responses.
 */
export interface BaseExchangeResponse {
    /** Status of the response. */
    status: "ok" | "err";

    /** Response body with operation-specific details or error message. */
    response:
        | {
            /** Type of operation. */
            type: "default" | "order" | "cancel";
            data?: {
                /** Array of statuses for the operation. */
                statuses: (
                    | JSONValue
                    | {
                        /** Error message. */
                        error: string;
                    }
                )[];
            };
        }
        /** Error message. */
        | string;
}

// ———————————————API (Requests)———————————————

/**
 * Places an order.
 *
 * @requestWeight 1
 * @response {@link OrderResponse}
 */
export interface OrderRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "order";

        /** Array of open order parameters. */
        orders: Order[];

        /** Grouping strategy for orders. */
        grouping: OrderGroupingStrategy;
    };
}

/**
 * Cancels order(s).
 *
 * @requestWeight 1
 * @response {@link CancelResponse}
 * @throws {HyperliquidBatchAPIError} If the API returns an error.
 */
export interface CancelRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "cancel";

        /** Array of orders to cancel. */
        cancels: {
            /** Index of the coin. */
            a: number;

            /** Order ID. */
            o: number;
        }[];
    };
}

/**
 * Cancels order(s) by client order ID.
 *
 * @requestWeight 1
 * @response {@link CancelResponse}
 * @throws {HyperliquidBatchAPIError} If the API returns an error.
 */
export interface CancelByCloidRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "cancelByCloid";

        /** Array of orders to cancel. */
        cancels: {
            /** Index of the coin. */
            asset: number;

            /** Client Order ID. */
            cloid: Hex;
        }[];
    };
}

/**
 * Schedules a cancel-all operation (dead man's switch).
 *
 * @requestWeight 1
 * @response {@link SuccessResponse}
 * @throws {HyperliquidAPIError} If the API returns an error.
 */
export interface ScheduleCancelRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "scheduleCancel";

        /** Scheduled time for the cancel-all operation (set to `null` to remove scheduled cancel). */
        time: number | null;
    };
}

/**
 * Modifies an order.
 *
 * @requestWeight 1
 * @response {@link SuccessResponse}
 * @throws {HyperliquidAPIError} If the API returns an error.
 */
export interface ModifyRequest extends BaseExchangeRequest {
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
 * Modifies multiple orders.
 *
 * @requestWeight 1
 * @response {@link OrderResponse}
 * @throws {HyperliquidBatchAPIError} If the API returns an error.
 */
export interface BatchModifyRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "batchModify";

        /** Array of order modifications. */
        modifies: {
            /** Order ID to modify. */
            oid: number;

            /** New order parameters. */
            order: Order;
        }[];
    };
}

/**
 * Updates cross or isolated leverage for a coin.
 *
 * @requestWeight 1
 * @response {@link SuccessResponse}
 * @throws {HyperliquidAPIError} If the API returns an error.
 */
export interface UpdateLeverageRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "updateLeverage";

        /** Index of the coin. */
        asset: number;

        /** `true` for cross leverage; `false` for isolated leverage. */
        isCross: boolean;

        /** New leverage value. */
        leverage: number;
    };
}

/**
 * Adds or removes margin from an isolated position.
 *
 * @requestWeight 1
 * @response {@link SuccessResponse}
 * @throws {HyperliquidAPIError} If the API returns an error.
 */
export interface UpdateIsolatedMarginRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "updateIsolatedMargin";

        /** Index of the coin. */
        asset: number;

        /** Position side (`true` for long, `false` for short). Has no effect until hedge mode is implemented. */
        isBuy: boolean;

        /** Amount to add or remove (in USD). */
        ntli: number;
    };
}

/**
 * Transfers USDC on L1 to another address.
 *
 * @requestWeight 1
 * @response {@link SuccessResponse}
 * @throws {HyperliquidAPIError} If the API returns an error.
 */
export interface UsdSendRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "usdSend";

        /** HyperLiquid network to use. */
        hyperliquidChain: "Mainnet" | "Testnet";

        /** Chain ID used when signing. */
        signatureChainId: Hex;

        /** Recipient's address. */
        destination: Hex;

        /** Amount of USD to send. */
        amount: string;

        /** Current timestamp in milliseconds. */
        time: number;
    };
    vaultAddress?: never;
}

/**
 * Transfers a spot asset on L1 to another address.
 *
 * @requestWeight 1
 * @response {@link SuccessResponse}
 * @throws {HyperliquidAPIError} If the API returns an error.
 */
export interface SpotSendRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "spotSend";

        /** HyperLiquid network to use. */
        hyperliquidChain: "Mainnet" | "Testnet";

        /** Chain ID used when signing. */
        signatureChainId: Hex;

        /** Recipient's address. */
        destination: Hex;

        /** Token identifier (format: `tokenName:tokenId`). */
        token: `${string}:${Hex}`;

        /** Amount of token to send. */
        amount: string;

        /** Current timestamp in milliseconds. */
        time: number;
    };
    vaultAddress?: never;
}

/**
 * Initiates a withdrawal request.
 *
 * @requestWeight 1
 * @response {@link SuccessResponse}
 * @throws {HyperliquidAPIError} If the API returns an error.
 */
export interface Withdraw3Request extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "withdraw3";

        /** HyperLiquid network to use. */
        hyperliquidChain: "Mainnet" | "Testnet";

        /** Chain ID used when signing. */
        signatureChainId: Hex;

        /** Amount of USD to withdraw. */
        amount: string;

        /** Current timestamp in milliseconds. */
        time: number;

        /** Recipient's address. */
        destination: Hex;
    };
    vaultAddress?: never;
}

/**
 * Transfers funds between Spot and Perp accounts.
 *
 * @requestWeight 1
 * @response {@link SuccessResponse}
 * @throws {HyperliquidAPIError} If the API returns an error.
 */
export interface SpotUserRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "spotUser";

        /** Transfer parameters. */
        classTransfer: {
            /** Amount of raw USDC to send (float amount * 1e6). */
            usdc: number;

            /** `true` for Spot to Perp; `false` for Perp to Spot. */
            toPerp: boolean;
        };
    };
    vaultAddress?: never;
}

/**
 * Deposits or withdraws from a vault.
 *
 * @requestWeight 1
 * @response {@link SuccessResponse}
 * @throws {HyperliquidAPIError} If the API returns an error.
 */
export interface VaultTransferRequest extends BaseExchangeRequest {
    action: {
        /** Type of action. */
        type: "vaultTransfer";

        /** Address of the vault. */
        vaultAddress: Hex;

        /** `true` for deposit; `false` for withdrawal. */
        isDeposit: boolean;

        /** Amount of raw USD to transfer (float amount * 1e6). */
        usd: number;
    };
    vaultAddress?: never;
}

// ———————————————API (Responses)———————————————

/**
 * Successful response without specific data.
 */
export interface SuccessResponse extends BaseExchangeResponse {
    status: "ok";
    response: {
        type: "default";
        data?: never;
    };
}

/**
 * Error response for failed operations.
 */
export interface ErrorResponse extends BaseExchangeResponse {
    status: "err";
    response: string;
}

/**
 * Response for order placement and batch modify operations.
 */
export interface OrderResponse extends BaseExchangeResponse {
    status: "ok";
    response: {
        type: "order";
        data: {
            statuses: (
                | {
                    /** Status for a resting order. */
                    resting: {
                        /** Order ID. */
                        oid: number;

                        /** Client Order ID. */
                        cloid?: Hex;
                    };
                }
                | {
                    /** Status for a filled order. */
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

/**
 * Response for order cancellation.
 */
export interface CancelResponse extends BaseExchangeResponse {
    status: "ok";
    response: {
        type: "cancel";
        data: {
            statuses: (
                | "success"
                | { error: string }
            )[];
        };
    };
}
