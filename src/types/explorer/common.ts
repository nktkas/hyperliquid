import type { Hex } from "../common.ts";

/** Transaction details. */
export interface TxDetails {
    /** Action performed in transaction. */
    action: {
        /** Action type. */
        type: string;
        /** Additional action parameters. */
        [key: string]: unknown;
    };
    /** Block number where transaction was included. */
    block: number;
    /** Error message if transaction failed. */
    error: string | null;
    /** Transaction hash. */
    hash: Hex;
    /** Transaction creation timestamp. */
    time: number;
    /** Creator's address. */
    user: Hex;
}

/** Block details. */
export interface BlockDetails {
    /** Block creation timestamp. */
    blockTime: number;
    /** Block hash. */
    hash: Hex;
    /** Block height in chain. */
    height: number;
    /** Total transactions in block. */
    numTxs: number;
    /** Block proposer address. */
    proposer: Hex;
    /** List of transactions. */
    txs: TxDetails[];
}
