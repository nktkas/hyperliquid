"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAbstractViemWallet = isAbstractViemWallet;
/** Checks if the given value is an abstract viem wallet. */
function isAbstractViemWallet(client) {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" &&
        (client.signTypedData.length === 1 || client.signTypedData.length === 2);
}
