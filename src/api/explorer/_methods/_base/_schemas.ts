/**
 * Common types shared across Explorer API methods.
 * @module
 */

/** Explorer transaction. */
export type ExplorerTransaction = {
  /** Action performed in transaction. */
  action: {
    /** Action type. */
    type: string;
    [key: string]: unknown;
  };
  /** Block number where transaction was included. */
  block: number;
  /** Error message if transaction failed. */
  error: string | null;
  /**
   * Transaction hash.
   * @pattern ^0x[a-fA-F0-9]{64}$
   */
  hash: `0x${string}`;
  /** Transaction creation timestamp. */
  time: number;
  /**
   * Creator's address.
   * @pattern ^0x[a-fA-F0-9]{40}$
   */
  user: `0x${string}`;
};
