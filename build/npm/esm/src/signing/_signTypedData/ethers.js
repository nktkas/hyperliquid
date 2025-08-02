/** Checks if the given value is an abstract ethers signer. */
export function isAbstractEthersV6Signer(client) {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" &&
        client.signTypedData.length === 3;
}
/** Checks if the given value is an abstract ethers v5 signer. */
export function isAbstractEthersV5Signer(client) {
    return typeof client === "object" && client !== null &&
        "_signTypedData" in client && typeof client._signTypedData === "function" &&
        client._signTypedData.length === 3;
}
