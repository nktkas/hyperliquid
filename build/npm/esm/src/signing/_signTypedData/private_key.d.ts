interface Types {
    [type: string]: {
        name: string;
        type: string;
    }[];
}
interface Domain extends Record<string, unknown> {
    name?: string;
    version?: string;
    chainId?: number | string | bigint | `0x${string}`;
    verifyingContract?: `0x${string}`;
    salt?: `0x${string}`;
}
/** Signs typed data with a private key. */
export declare function signTypedData(args: {
    privateKey: string;
    domain?: Domain;
    types: Types;
    primaryType: string;
    message: Record<string, unknown>;
}): Promise<`0x${string}`>;
/** Validates if a string is a valid secp256k1 private key. */
export declare function isValidPrivateKey(privateKey: unknown): privateKey is string;
/** Converts a private key to an Ethereum address. */
export declare function privateKeyToAddress(privateKey: string): `0x${string}`;
export {};
//# sourceMappingURL=private_key.d.ts.map