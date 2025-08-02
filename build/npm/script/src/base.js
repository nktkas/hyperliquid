"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HyperliquidError = void 0;
/** Base error class for all SDK errors. */
class HyperliquidError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = "HyperliquidError";
    }
}
exports.HyperliquidError = HyperliquidError;
