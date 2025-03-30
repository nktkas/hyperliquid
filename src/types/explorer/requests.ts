import type { Hex } from "../../base.ts";

/**
 * Block details by block height.
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
 * Transaction details by transaction hash.
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
 * User details by user's address.
 * @returns {UserDetailsResponse} User details response.
 * @see null - no documentation
 */
export interface UserDetailsRequest {
    /** Type of request. */
    type: "userDetails";
    /** User's address. */
    user: Hex;
}
