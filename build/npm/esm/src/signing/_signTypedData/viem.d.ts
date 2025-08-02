/** Abstract interface for a viem {@link https://viem.sh/docs/accounts/jsonRpc#json-rpc-account | JSON-RPC Account}. */
export interface AbstractViemJsonRpcAccount {
    signTypedData(params: {
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
    }, options?: unknown): Promise<`0x${string}`>;
    getAddresses?(): Promise<`0x${string}`[]>;
    getChainId?(): Promise<number>;
}
/** Abstract interface for a viem {@link https://viem.sh/docs/accounts/local | Local Account}. */
export interface AbstractViemLocalAccount {
    signTypedData(params: {
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
    }, options?: unknown): Promise<`0x${string}`>;
    address?: `0x${string}`;
}
/** Checks if the given value is an abstract viem wallet. */
export declare function isAbstractViemWallet(client: unknown): client is AbstractViemJsonRpcAccount | AbstractViemLocalAccount;
//# sourceMappingURL=viem.d.ts.map