/**
 * Represents an error from the Hyperliquid API.
 */
export class HyperliquidAPIError extends Error {
    /**
     * Constructs a new `HyperliquidAPIError` instance.
     */
    constructor(
        /** Error message. */
        message: string,
    ) {
        super(message);
        this.name = "HyperliquidAPIError";
    }
}

/**
 * Represents an error for batch operations in the Hyperliquid API.
 */
export class HyperliquidBatchAPIError extends Error {
    /** Array of error messages. */
    messages: string[];

    /**
     * Constructs a new `HyperliquidBatchAPIError` instance.
     */
    constructor(
        /** Array of error messages. */
        messages: string[],
    ) {
        super(messages.join("\n"));
        this.name = "HyperliquidBatchAPIError";
        this.messages = messages;
    }
}
