import type { Hex } from "../common.ts";

/**
 * The request to get the details of a transaction.
 * @returns {TxDetailsResponse} The details of a transaction.
 */
export interface TxDetailsRequest {
    /** Type of request. */
    type: "txDetails";

    /** The hash of a transaction. */
    hash: Hex;
}

/**
 * The request to get the details of a block.
 * @returns {BlockDetailsResponse} The details of a block.
 */
export interface BlockDetailsRequest {
    /** Type of request. */
    type: "blockDetails";

    /** The height of a block. */
    height: number;
}
