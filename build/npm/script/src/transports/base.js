"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportError = void 0;
const base_js_1 = require("../base.js");
/** Base class for all transport-related errors. */
class TransportError extends base_js_1.HyperliquidError {
    constructor(message, options) {
        super(message, options);
        this.name = "TransportError";
    }
}
exports.TransportError = TransportError;
