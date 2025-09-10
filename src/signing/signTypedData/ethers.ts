/** Abstract interface for an {@link https://docs.ethers.org/v6/api/providers/#Signer | ethers.js signer}. */
export interface AbstractEthersV6Signer {
    signTypedData(
        domain: {
            name: string;
            version: string;
            chainId: number;
            verifyingContract: string;
        },
        types: {
            [key: string]: {
                name: string;
                type: string;
            }[];
        },
        value: Record<string, unknown>,
    ): Promise<string>;
    getAddress?(): Promise<string>;
    provider?:
        | { getNetwork(): Promise<{ chainId: number | bigint }> }
        | null;
}

/** Abstract interface for an {@link https://docs.ethers.org/v5/api/signer/ | ethers.js v5 signer}. */
export interface AbstractEthersV5Signer {
    _signTypedData(
        domain: {
            name: string;
            version: string;
            chainId: number;
            verifyingContract: string;
        },
        types: {
            [key: string]: {
                name: string;
                type: string;
            }[];
        },
        value: Record<string, unknown>,
    ): Promise<string>;
    getAddress?(): Promise<string>;
    provider?:
        | { getNetwork(): Promise<{ chainId: number | bigint }> }
        | null;
}

/** Checks if the given value is an abstract ethers signer. */
export function isAbstractEthersV6Signer(client: unknown): client is AbstractEthersV6Signer {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" &&
        client.signTypedData.length === 3;
}

/** Checks if the given value is an abstract ethers v5 signer. */
export function isAbstractEthersV5Signer(client: unknown): client is AbstractEthersV5Signer {
    return typeof client === "object" && client !== null &&
        "_signTypedData" in client && typeof client._signTypedData === "function" &&
        client._signTypedData.length === 3;
}
