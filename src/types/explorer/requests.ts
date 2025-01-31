import type { Hex } from "../common.ts";

/**
 * Request for transaction details by transaction hash.
 * @returns {TxDetailsResponse} Transaction details response.
 */
export interface TxDetailsRequest {
    /** Type of request. */
    type: "txDetails";
    /** Transaction hash. */
    hash: Hex;
}

/**
 * Request for block details by block height.
 * @returns {BlockDetailsResponse} Block details response.
 */
export interface BlockDetailsRequest {
    /** Type of request. */
    type: "blockDetails";
    /** Block height. */
    height: number;
}
