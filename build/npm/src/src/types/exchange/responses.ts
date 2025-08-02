import type { Hex } from "../mod.js";

/** Response for order cancellation. */
export interface CancelResponse {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
        /** Type of response. */
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

/** Successful variant of {@linkcode CancelResponse} without errors. */
export interface CancelSuccessResponse {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
        /** Type of response. */
        type: "cancel";
        /** Specific data. */
        data: {
            /** Array of success statuses. */
            statuses: "success"[];
        };
    };
}

/** Response for creating a sub-account. */
export interface CreateSubAccountResponse {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
        /** Type of response. */
        type: "createSubAccount";
        /** Sub-account address. */
        data: Hex;
    };
}

/** Response for creating a vault. */
export interface CreateVaultResponse {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
        /** Type of response. */
        type: "createVault";
        /** Vault address. */
        data: Hex;
    };
}

/** Error response for failed operations. */
export interface ErrorResponse {
    /** Error status. */
    status: "err";
    /** Error message. */
    response: string;
}

/** Response for order placement and batch modifications. */
export interface OrderResponse {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
        /** Type of response. */
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
                        /**
                         * Total size filled.
                         * @pattern ^[0-9]+(\.[0-9]+)?$
                         */
                        totalSz: string;
                        /**
                         * Average price of fill.
                         * @pattern ^[0-9]+(\.[0-9]+)?$
                         */
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

/** Successful variant of {@linkcode OrderResponse} without errors. */
export type OrderSuccessResponse = {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
        /** Type of response. */
        type: "order";
        /** Specific data. */
        data: {
            /** Array of successful order statuses. */
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
};

/** Successful response without specific data. */
export interface SuccessResponse {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
        /** Type of response. */
        type: "default";
    };
}

/** Response for canceling a TWAP order. */
export interface TwapCancelResponse {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
        /** Type of response. */
        type: "twapCancel";
        /** Specific data. */
        data: {
            /** Status of the operation or error message. */
            status:
                | string
                | {
                    /** Error message. */
                    error: string;
                };
        };
    };
}

/** Successful variant of {@linkcode TwapCancelResponse} without errors. */
export type TwapCancelSuccessResponse = {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
        /** Type of response. */
        type: "twapCancel";
        /** Specific data. */
        data: {
            /** Status of the operation. */
            status: string;
        };
    };
};

/** Response for creating a TWAP order. */
export interface TwapOrderResponse {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
        /** Type of response. */
        type: "twapOrder";
        /** Specific data. */
        data: {
            /** Status of the operation or error message. */
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

/** Successful variant of {@linkcode TwapOrderResponse} without errors. */
export type TwapOrderSuccessResponse = {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
        /** Type of response. */
        type: "twapOrder";
        /** Specific data. */
        data: {
            /** Status of the operation. */
            status: {
                /** Running order status. */
                running: {
                    /** TWAP ID. */
                    twapId: number;
                };
            };
        };
    };
};
