import * as v from "valibot";
import { Hex, UnsignedInteger } from "../_base.ts";

/** Transaction details. */
export const TxDetails = v.pipe(
    v.object({
        /** Action performed in transaction. */
        action: v.pipe(
            v.looseObject({
                /** Action type. */
                type: v.pipe(
                    v.string(),
                    v.description("Action type."),
                ),
            }),
            v.description("Action performed in transaction."),
        ),
        /** Block number where transaction was included. */
        block: v.pipe(
            UnsignedInteger,
            v.description("Block number where transaction was included."),
        ),
        /** Error message if transaction failed. */
        error: v.pipe(
            v.nullable(v.string()),
            v.description("Error message if transaction failed."),
        ),
        /** Transaction hash. */
        hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("Transaction hash."),
        ),
        /** Transaction creation timestamp. */
        time: v.pipe(
            UnsignedInteger,
            v.description("Transaction creation timestamp."),
        ),
        /** Creator's address. */
        user: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Creator's address."),
        ),
    }),
    v.description("Transaction details."),
);
export type TxDetails = v.InferOutput<typeof TxDetails>;

/** Response containing transaction information. */
export const TxDetailsResponseSchema = v.pipe(
    v.object({
        /** Type of response. */
        type: v.pipe(
            v.literal("txDetails"),
            v.description("Type of response."),
        ),
        /** The details of a transaction. */
        tx: v.pipe(
            TxDetails,
            v.description("The details of a transaction."),
        ),
    }),
    v.description("Response containing transaction information."),
);
export type TxDetailsResponse = v.InferOutput<typeof TxDetailsResponseSchema>;

/** Block details. */
export const BlockDetails = v.pipe(
    v.object({
        /** Block creation timestamp. */
        blockTime: v.pipe(
            UnsignedInteger,
            v.description("Block creation timestamp."),
        ),
        /** Block hash. */
        hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("Block hash."),
        ),
        /** Block height in chain. */
        height: v.pipe(
            UnsignedInteger,
            v.description("Block height in chain."),
        ),
        /** Total transactions in block. */
        numTxs: v.pipe(
            UnsignedInteger,
            v.description("Total transactions in block."),
        ),
        /** Block proposer address. */
        proposer: v.pipe(
            v.pipe(Hex, v.length(42)),
            v.description("Block proposer address."),
        ),
        /** List of transactions. */
        txs: v.pipe(
            v.array(TxDetails),
            v.description("List of transactions."),
        ),
    }),
    v.description("Block details."),
);
export type BlockDetails = v.InferOutput<typeof BlockDetails>;

/** Response containing block information. */
export const BlockDetailsResponse = v.pipe(
    v.object({
        /** Type of response. */
        type: v.pipe(
            v.literal("blockDetails"),
            v.description("Type of response."),
        ),
        /** The details of a block. */
        blockDetails: v.pipe(
            BlockDetails,
            v.description("The details of a block."),
        ),
    }),
    v.description("Response containing block information."),
);
export type BlockDetailsResponse = v.InferOutput<typeof BlockDetailsResponse>;

/** Response containing user details. */
export const UserDetailsResponse = v.pipe(
    v.object({
        /** Type of response. */
        type: v.pipe(
            v.literal("userDetails"),
            v.description("Type of response."),
        ),
        /** The transactions of a user. */
        txs: v.pipe(
            v.array(TxDetails),
            v.description("The transactions of a user."),
        ),
    }),
    v.description("Response containing user details."),
);
export type UserDetailsResponse = v.InferOutput<typeof UserDetailsResponse>;
