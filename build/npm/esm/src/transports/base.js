import { HyperliquidError } from "../base.js";
/** Base class for all transport-related errors. */
export class TransportError extends HyperliquidError {
    constructor(message, options) {
        super(message, options);
        this.name = "TransportError";
    }
}
