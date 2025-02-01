import type { Hex } from "../common.ts";

/**
 * Request for transaction details by transaction hash.
 * @returns {TxDetailsResponse} Transaction details response.
 * @see null - no documentation
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
 * @see null - no documentation
 */
export interface BlockDetailsRequest {
    /** Type of request. */
    type: "blockDetails";
    /** Block height. */
    height: number;
}

/**
 * Request for user details by user's address.
 * @returns {UserDetailsResponse} User details response.
 * @see null - no documentation
 */
export interface UserDetailsRequest {
    /** Type of request. */
    type: "userDetails";
    /** User's address. */
    user: Hex;
}
