import type { Hex } from "../mod.js";
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
/** Response containing transaction information. */
export interface TxDetailsResponse {
    /** Type of response. */
    type: "txDetails";
    /** The details of a transaction. */
    tx: TxDetails;
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
/** Response containing block information. */
export interface BlockDetailsResponse {
    /** Type of response. */
    type: "blockDetails";
    /** The details of a block. */
    blockDetails: BlockDetails;
}
/** Response containing user details. */
export interface UserDetailsResponse {
    /** Type of response. */
    type: "userDetails";
    /** The transactions of a user. */
    txs: TxDetails[];
}
//# sourceMappingURL=responses.d.ts.map