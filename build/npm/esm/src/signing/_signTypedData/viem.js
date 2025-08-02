/** Checks if the given value is an abstract viem wallet. */
export function isAbstractViemWallet(client) {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" &&
        (client.signTypedData.length === 1 || client.signTypedData.length === 2);
}
