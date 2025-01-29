import type { BlockDetails, TxDetails } from "./common.ts";

/** The response to get the details of a transaction. */
export interface TxDetailsResponse {
    /** Type of response. */
    type: "txDetails";

    /** The details of a transaction. */
    tx: TxDetails;
}

/** The response to get the details of a block. */
export interface BlockDetailsResponse {
    /** Type of response. */
    type: "blockDetails";

    /** The details of a block. */
    blockDetails: BlockDetails;
}
