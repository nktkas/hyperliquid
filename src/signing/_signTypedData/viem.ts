/** Abstract interface for a [viem wallet](https://viem.sh/docs/clients/wallet). */
export interface AbstractViemWalletClient {
    address?: `0x${string}`;
    signTypedData(
        params: {
            domain: {
                name: string;
                version: string;
                chainId: number;
                verifyingContract: `0x${string}`;
            };
            types: {
                [key: string]: {
                    name: string;
                    type: string;
                }[];
            };
            primaryType: string;
            message: Record<string, unknown>;
        },
        options?: unknown,
    ): Promise<`0x${string}`>;
}

/** Checks if the given value is an abstract viem wallet. */
export function isAbstractViemWalletClient(client: unknown): client is AbstractViemWalletClient {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" &&
        (client.signTypedData.length === 1 || client.signTypedData.length === 2);
}
