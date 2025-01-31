import type { BlockDetails, TxDetails } from "./common.ts";

/** Response containing transaction information. */
export interface TxDetailsResponse {
    /** Type of response. */
    type: "txDetails";
    /** The details of a transaction. */
    tx: TxDetails;
}

/** Response containing block information. */
export interface BlockDetailsResponse {
    /** Type of response. */
    type: "blockDetails";
    /** The details of a block. */
    blockDetails: BlockDetails;
}
