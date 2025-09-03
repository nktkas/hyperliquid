import * as v from "valibot";
import { Hex, UnsignedDecimal } from "../_base.ts";

/** Response for order cancellation. */
export const CancelResponse = v.pipe(
    v.strictObject({
        /** Successful status. */
        status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
        ),
        /** Response details. */
        response: v.pipe(
            v.strictObject({
                /** Type of response. */
                type: v.pipe(
                    v.literal("cancel"),
                    v.description("Type of response."),
                ),
                /** Specific data. */
                data: v.pipe(
                    v.strictObject({
                        /** Array of statuses or error messages. */
                        statuses: v.pipe(
                            v.array(
                                v.union([
                                    v.literal("success"),
                                    v.strictObject({
                                        /** Error message. */
                                        error: v.pipe(
                                            v.string(),
                                            v.description("Error message."),
                                        ),
                                    }),
                                ]),
                            ),
                            v.description("Array of statuses or error messages."),
                        ),
                    }),
                    v.description("Specific data."),
                ),
            }),
            v.description("Response details."),
        ),
    }),
    v.description("Response for order cancellation."),
);
export type CancelResponse = v.InferOutput<typeof CancelResponse>;

/** Successful variant of {@linkcode CancelResponse} without errors. */
export const CancelSuccessResponse = v.pipe(
    v.strictObject({
        /** Successful status. */
        status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
        ),
        /** Response details. */
        response: v.pipe(
            v.strictObject({
                /** Type of response. */
                type: v.pipe(
                    v.literal("cancel"),
                    v.description("Type of response."),
                ),
                /** Specific data. */
                data: v.pipe(
                    v.strictObject({
                        /** Array of success statuses. */
                        statuses: v.pipe(
                            v.array(v.literal("success")),
                            v.description("Array of success statuses."),
                        ),
                    }),
                    v.description("Specific data."),
                ),
            }),
            v.description("Response details."),
        ),
    }),
    v.description("Successful variant of `CancelResponse` without errors."),
);
export type CancelSuccessResponse = v.InferOutput<typeof CancelSuccessResponse>;

/** Response for creating a sub-account. */
export const CreateSubAccountResponse = v.pipe(
    v.strictObject({
        /** Successful status. */
        status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
        ),
        /** Response details. */
        response: v.pipe(
            v.strictObject({
                /** Type of response. */
                type: v.pipe(
                    v.literal("createSubAccount"),
                    v.description("Type of response."),
                ),
                /** Sub-account address. */
                data: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Sub-account address."),
                ),
            }),
            v.description("Response details."),
        ),
    }),
    v.description("Response for creating a sub-account."),
);
export type CreateSubAccountResponse = v.InferOutput<typeof CreateSubAccountResponse>;

/** Response for creating a vault. */
export const CreateVaultResponse = v.pipe(
    v.strictObject({
        /** Successful status. */
        status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
        ),
        /** Response details. */
        response: v.pipe(
            v.strictObject({
                /** Type of response. */
                type: v.pipe(
                    v.literal("createVault"),
                    v.description("Type of response."),
                ),
                /** Vault address. */
                data: v.pipe(
                    v.pipe(Hex, v.length(42)),
                    v.description("Vault address."),
                ),
            }),
            v.description("Response details."),
        ),
    }),
    v.description("Response for creating a vault."),
);
export type CreateVaultResponse = v.InferOutput<typeof CreateVaultResponse>;

/** Error response for failed operations. */
export const ErrorResponse = v.pipe(
    v.strictObject({
        /** Error status. */
        status: v.pipe(
            v.literal("err"),
            v.description("Error status."),
        ),
        /** Error message. */
        response: v.pipe(
            v.string(),
            v.description("Error message."),
        ),
    }),
    v.description("Error response for failed operations."),
);
export type ErrorResponse = v.InferOutput<typeof ErrorResponse>;

/** Response for order placement and batch modifications. */
export const OrderResponse = v.pipe(
    v.strictObject({
        /** Successful status. */
        status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
        ),
        /** Response details. */
        response: v.pipe(
            v.strictObject({
                /** Type of response. */
                type: v.pipe(
                    v.literal("order"),
                    v.description("Type of response."),
                ),
                /** Specific data. */
                data: v.pipe(
                    v.strictObject({
                        /** Array of statuses or error messages. */
                        statuses: v.pipe(
                            v.array(
                                v.union([
                                    v.strictObject({
                                        /** Resting order status. */
                                        resting: v.pipe(
                                            v.strictObject({
                                                /** Order ID. */
                                                oid: v.pipe(
                                                    v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
                                                    v.description("Order ID."),
                                                ),
                                                /** Client Order ID. */
                                                cloid: v.pipe(
                                                    v.optional(v.pipe(Hex, v.length(34))),
                                                    v.description("Client Order ID."),
                                                ),
                                            }),
                                            v.description("Resting order status."),
                                        ),
                                    }),
                                    v.strictObject({
                                        /** Filled order status. */
                                        filled: v.pipe(
                                            v.strictObject({
                                                /** Total size filled. */
                                                totalSz: v.pipe(
                                                    UnsignedDecimal,
                                                    v.description("Total size filled."),
                                                ),
                                                /** Average price of fill. */
                                                avgPx: v.pipe(
                                                    UnsignedDecimal,
                                                    v.description("Average price of fill."),
                                                ),
                                                /** Order ID. */
                                                oid: v.pipe(
                                                    v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
                                                    v.description("Order ID."),
                                                ),
                                                /** Client Order ID. */
                                                cloid: v.pipe(
                                                    v.optional(v.pipe(Hex, v.length(34))),
                                                    v.description("Client Order ID."),
                                                ),
                                            }),
                                            v.description("Filled order status."),
                                        ),
                                    }),
                                    v.strictObject({
                                        /** Error message. */
                                        error: v.pipe(
                                            v.string(),
                                            v.description("Error message."),
                                        ),
                                    }),
                                ]),
                            ),
                            v.description("Array of statuses or error messages."),
                        ),
                    }),
                    v.description("Specific data."),
                ),
            }),
            v.description("Response details."),
        ),
    }),
    v.description("Response for order placement and batch modifications."),
);
export type OrderResponse = v.InferOutput<typeof OrderResponse>;

/** Successful variant of {@linkcode OrderResponse} without errors. */
export const OrderSuccessResponse = v.pipe(
    v.strictObject({
        /** Successful status. */
        status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
        ),
        /** Response details. */
        response: v.pipe(
            v.strictObject({
                /** Type of response. */
                type: v.pipe(
                    v.literal("order"),
                    v.description("Type of response."),
                ),
                /** Specific data. */
                data: v.pipe(
                    v.strictObject({
                        /** Array of successful order statuses. */
                        statuses: v.pipe(
                            v.array(
                                v.union([
                                    v.strictObject({
                                        /** Resting order status. */
                                        resting: v.pipe(
                                            v.strictObject({
                                                /** Order ID. */
                                                oid: v.pipe(
                                                    v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
                                                    v.description("Order ID."),
                                                ),
                                                /** Client Order ID. */
                                                cloid: v.pipe(
                                                    v.optional(v.pipe(Hex, v.length(34))),
                                                    v.description("Client Order ID."),
                                                ),
                                            }),
                                            v.description("Resting order status."),
                                        ),
                                    }),
                                    v.strictObject({
                                        /** Filled order status. */
                                        filled: v.pipe(
                                            v.strictObject({
                                                /** Total size filled. */
                                                totalSz: v.pipe(
                                                    UnsignedDecimal,
                                                    v.description("Total size filled."),
                                                ),
                                                /** Average price of fill. */
                                                avgPx: v.pipe(
                                                    UnsignedDecimal,
                                                    v.description("Average price of fill."),
                                                ),
                                                /** Order ID. */
                                                oid: v.pipe(
                                                    v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
                                                    v.description("Order ID."),
                                                ),
                                                /** Client Order ID. */
                                                cloid: v.pipe(
                                                    v.optional(v.pipe(Hex, v.length(34))),
                                                    v.description("Client Order ID."),
                                                ),
                                            }),
                                            v.description("Filled order status."),
                                        ),
                                    }),
                                ]),
                            ),
                            v.description("Array of successful order statuses."),
                        ),
                    }),
                    v.description("Specific data."),
                ),
            }),
            v.description("Response details."),
        ),
    }),
    v.description("Successful variant of `OrderResponse` without errors."),
);
export type OrderSuccessResponse = v.InferOutput<typeof OrderSuccessResponse>;

/** Successful response without specific data. */
export const SuccessResponse = v.pipe(
    v.strictObject({
        /** Successful status. */
        status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
        ),
        /** Response details. */
        response: v.pipe(
            v.strictObject({
                /** Type of response. */
                type: v.pipe(
                    v.literal("default"),
                    v.description("Type of response."),
                ),
            }),
            v.description("Response details."),
        ),
    }),
    v.description("Successful response without specific data."),
);
export type SuccessResponse = v.InferOutput<typeof SuccessResponse>;

/** Response for canceling a TWAP order. */
export const TwapCancelResponse = v.pipe(
    v.strictObject({
        /** Successful status. */
        status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
        ),
        /** Response details. */
        response: v.pipe(
            v.strictObject({
                /** Type of response. */
                type: v.pipe(
                    v.literal("twapCancel"),
                    v.description("Type of response."),
                ),
                /** Specific data. */
                data: v.pipe(
                    v.strictObject({
                        /** Status of the operation or error message. */
                        status: v.pipe(
                            v.union([
                                v.string(),
                                v.strictObject({
                                    /** Error message. */
                                    error: v.pipe(
                                        v.string(),
                                        v.description("Error message."),
                                    ),
                                }),
                            ]),
                            v.description("Status of the operation or error message."),
                        ),
                    }),
                    v.description("Specific data."),
                ),
            }),
            v.description("Response details."),
        ),
    }),
    v.description("Response for canceling a TWAP order."),
);
export type TwapCancelResponse = v.InferOutput<typeof TwapCancelResponse>;

/** Successful variant of {@linkcode TwapCancelResponse} without errors. */
export const TwapCancelSuccessResponse = v.pipe(
    v.strictObject({
        /** Successful status. */
        status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
        ),
        /** Response details. */
        response: v.pipe(
            v.strictObject({
                /** Type of response. */
                type: v.pipe(
                    v.literal("twapCancel"),
                    v.description("Type of response."),
                ),
                /** Specific data. */
                data: v.pipe(
                    v.strictObject({
                        /** Status of the operation. */
                        status: v.pipe(
                            v.string(),
                            v.description("Status of the operation."),
                        ),
                    }),
                    v.description("Specific data."),
                ),
            }),
            v.description("Response details."),
        ),
    }),
    v.description("Successful variant of `TwapCancelResponse` without errors."),
);
export type TwapCancelSuccessResponse = v.InferOutput<typeof TwapCancelSuccessResponse>;

/** Response for creating a TWAP order. */
export const TwapOrderResponse = v.pipe(
    v.strictObject({
        /** Successful status. */
        status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
        ),
        /** Response details. */
        response: v.pipe(
            v.strictObject({
                /** Type of response. */
                type: v.pipe(
                    v.literal("twapOrder"),
                    v.description("Type of response."),
                ),
                /** Specific data. */
                data: v.pipe(
                    v.strictObject({
                        /** Status of the operation or error message. */
                        status: v.pipe(
                            v.union([
                                v.strictObject({
                                    /** Running order status. */
                                    running: v.pipe(
                                        v.strictObject({
                                            /** TWAP ID. */
                                            twapId: v.pipe(
                                                v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
                                                v.description("TWAP ID."),
                                            ),
                                        }),
                                        v.description("Running order status."),
                                    ),
                                }),
                                v.strictObject({
                                    /** Error message. */
                                    error: v.pipe(
                                        v.string(),
                                        v.description("Error message."),
                                    ),
                                }),
                            ]),
                            v.description("Status of the operation or error message."),
                        ),
                    }),
                    v.description("Specific data."),
                ),
            }),
            v.description("Response details."),
        ),
    }),
    v.description("Response for creating a TWAP order."),
);
export type TwapOrderResponse = v.InferOutput<typeof TwapOrderResponse>;

/** Successful variant of {@linkcode TwapOrderResponse} without errors. */
export const TwapOrderSuccessResponse = v.pipe(
    v.strictObject({
        /** Successful status. */
        status: v.pipe(
            v.literal("ok"),
            v.description("Successful status."),
        ),
        /** Response details. */
        response: v.pipe(
            v.strictObject({
                /** Type of response. */
                type: v.pipe(
                    v.literal("twapOrder"),
                    v.description("Type of response."),
                ),
                /** Specific data. */
                data: v.pipe(
                    v.strictObject({
                        /** Status of the operation. */
                        status: v.pipe(
                            v.strictObject({
                                /** Running order status. */
                                running: v.pipe(
                                    v.strictObject({
                                        /** TWAP ID. */
                                        twapId: v.pipe(
                                            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
                                            v.description("TWAP ID."),
                                        ),
                                    }),
                                    v.description("Running order status."),
                                ),
                            }),
                            v.description("Status of the operation."),
                        ),
                    }),
                    v.description("Specific data."),
                ),
            }),
            v.description("Response details."),
        ),
    }),
    v.description("Successful variant of `TwapOrderResponse` without errors."),
);
export type TwapOrderSuccessResponse = v.InferOutput<typeof TwapOrderSuccessResponse>;
