import type { Hex } from "../../base.ts";

/**
 * Block details by block height.
 * @returns {BlockDetailsResponse}
 */
export interface BlockDetailsRequest {
    /** Type of request. */
    type: "blockDetails";
    /** Block height. */
    height: number;
}

/**
 * Request transaction details by transaction hash.
 * @returns {TxDetailsResponse}
 */
export interface TxDetailsRequest {
    /** Type of request. */
    type: "txDetails";
    /** Transaction hash. */
    hash: Hex;
}

/**
 * Request user details by user's address.
 * @returns {UserDetailsResponse}
 */
export interface UserDetailsRequest {
    /** Type of request. */
    type: "userDetails";
    /** User's address. */
    user: Hex;
}
