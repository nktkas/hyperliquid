import type { Hex } from "../common.d.ts";

/** Base structure for exchange responses. */
export interface BaseExchangeResponse {
    /** Response status */
    status: "ok" | "err";

    /** Error message or success data */
    response: string | {
        /** Type of operation. */
        type: string;

        /** Specific data for the operation. */
        data?: unknown;
    };
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

/** Response for creating a TWAP order. */
export interface TwapOrderResponse extends BaseExchangeResponse {
    /** Successful status. */
    status: "ok";

    /** Response details. */
    response: {
        /** Type of operation. */
        type: "twapOrder";

        /** Specific data. */
        data: {
            /** Status of the operation. */
            status:
                | {
                    /** Running order status. */
                    running: {
                        /** TWAP ID. */
                        twapId: number;
                    };
                }
                | {
                    /** Error message. */
                    error: string;
                };
        };
    };
}

/** Response for canceling a TWAP order. */
export interface TwapCancelResponse extends BaseExchangeResponse {
    /** Successful status. */
    status: "ok";

    /** Response details. */
    response: {
        /** Type of operation. */
        type: "twapCancel";

        /** Specific data. */
        data: {
            /** Status of the operation. */
            status:
                | string
                | {
                    /** Error message. */
                    error: string;
                };
        };
    };
}
