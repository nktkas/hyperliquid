import * as v from "valibot";
import { Hex } from "../_base.ts";

/**
 * Request block details by block height.
 * @returns {BlockDetailsResponse}
 */
export const BlockDetailsRequest = v.pipe(
    v.strictObject({
        /** Type of request. */
        type: v.pipe(
            v.literal("blockDetails"),
            v.description("Type of request."),
        ),
        /** Block height. */
        height: v.pipe(
            v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
            v.description("Block height."),
        ),
    }),
    v.description("Request block details by block height."),
);
export type BlockDetailsRequest = v.InferOutput<typeof BlockDetailsRequest>;

/**
 * Request transaction details by transaction hash.
 * @returns {TxDetailsResponse}
 */
export const TxDetailsRequest = v.pipe(
    v.strictObject({
        /** Type of request. */
        type: v.pipe(
            v.literal("txDetails"),
            v.description("Type of request."),
        ),
        /** Transaction hash. */
        hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("Transaction hash."),
        ),
    }),
    v.description("Request transaction details by transaction hash."),
);
export type TxDetailsRequest = v.InferOutput<typeof TxDetailsRequest>;

/**
 * Request user details by user address.
 * @returns {UserDetailsResponse}
 */
export const UserDetailsRequest = v.pipe(
    v.strictObject({
        /** Type of request. */
        type: v.pipe(
            v.literal("userDetails"),
            v.description("Type of request."),
        ),
        /** User address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("User address."),
        ),
    }),
    v.description("Request user details by user address."),
);
export type UserDetailsRequest = v.InferOutput<typeof UserDetailsRequest>;
