import type { Hex } from "../common.ts";

/** The transaction details. */
export interface TxDetails {
    /** The action of the transaction. */
    action: {
        /** Type of action. */
        type: string;

        /** Additional action parameters. */
        [key: string]: unknown;
    };

    /** The block number in which the transaction was included. */
    block: number;

    /** The error message if the transaction failed. */
    error: string | null;

    /** The hash of the transaction. */
    hash: Hex;

    /** The time at which the transaction was created. */
    time: number;

    /** The user that created the transaction. */
    user: Hex;
}

/** The block details. */
export interface BlockDetails {
    /** The time at which the block was created. */
    blockTime: number;

    /** The hash of the block. */
    hash: Hex;

    /** The height of the block. */
    height: number;

    /** The number of transactions in the block. */
    numTxs: number;

    /** The proposer of the block. */
    proposer: Hex;

    /** The transactions in the block. */
    txs: TxDetails[];
}
