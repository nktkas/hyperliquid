import { type AbstractEthersV5Signer, type AbstractEthersV6Signer } from "./ethers.js";
import { type AbstractViemJsonRpcAccount, type AbstractViemLocalAccount } from "./viem.js";
/** Abstract interface for a wallet that can sign typed data. */
export type AbstractWallet = `0x${string}` | AbstractViemJsonRpcAccount | AbstractViemLocalAccount | AbstractEthersV6Signer | AbstractEthersV5Signer;
/** ECDSA signature components for Ethereum transactions and typed data. */
export interface Signature {
    /** First 32-byte component of ECDSA signature */
    r: `0x${string}`;
    /** Second 32-byte component of ECDSA signature */
    s: `0x${string}`;
    /** Recovery identifier */
    v: 27 | 28;
}
export declare function signTypedData(args: {
    wallet: AbstractWallet;
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
}): Promise<Signature>;
/** Get the chain ID of the wallet. */
export declare function getWalletChainId(wallet: AbstractWallet): Promise<`0x${string}`>;
/** Get the wallet address from various wallet types. */
export declare function getWalletAddress(wallet: AbstractWallet): Promise<`0x${string}`>;
//# sourceMappingURL=mod.d.ts.map