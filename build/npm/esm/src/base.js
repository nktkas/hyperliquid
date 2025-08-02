/** Base error class for all SDK errors. */
export class HyperliquidError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = "HyperliquidError";
    }
}
