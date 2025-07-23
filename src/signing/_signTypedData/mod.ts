import {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
} from "./ethers.ts";
import { isValidPrivateKey, privateKeyToAddress, signTypedData as signTypedDataWithPrivateKey } from "./private_key.ts";
import { type AbstractViemWalletClient, isAbstractViemWalletClient } from "./viem.ts";

export {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
    isAbstractViemWalletClient,
    isValidPrivateKey,
    privateKeyToAddress,
};

/** Abstract interface for a wallet that can sign typed data. */
export type AbstractWallet =
    | `0x${string}` // Private key
    | AbstractViemWalletClient
    | AbstractEthersSigner
    | AbstractEthersV5Signer;

/** ECDSA signature components for Ethereum transactions and typed data. */
export interface Signature {
    /** First 32-byte component of ECDSA signature */
    r: `0x${string}`;
    /** Second 32-byte component of ECDSA signature */
    s: `0x${string}`;
    /** Recovery identifier */
    v: 27 | 28;
}

export async function signTypedData(args: {
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
}): Promise<Signature> {
    const { wallet, domain, types, primaryType, message } = args;

    let signature: `0x${string}`;
    if (isValidPrivateKey(wallet)) {
        signature = await signTypedDataWithPrivateKey({
            privateKey: wallet,
            domain,
            types,
            primaryType,
            message,
        });
    } else if (isAbstractViemWalletClient(wallet)) {
        signature = await wallet.signTypedData({
            domain,
            types: {
                EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                    { name: "chainId", type: "uint256" },
                    { name: "verifyingContract", type: "address" },
                ],
                ...types,
            },
            primaryType,
            message,
        });
    } else if (isAbstractEthersSigner(wallet)) {
        signature = await wallet.signTypedData(domain, types, message) as `0x${string}`;
    } else if (isAbstractEthersV5Signer(wallet)) {
        signature = await wallet._signTypedData(domain, types, message) as `0x${string}`;
    } else {
        throw new Error("Unsupported wallet for signing typed data");
    }

    return splitSignature(signature);
}

function splitSignature(signature: `0x${string}`): Signature {
    const r = `0x${signature.slice(2, 66)}` as const;
    const s = `0x${signature.slice(66, 130)}` as const;
    const v = parseInt(signature.slice(130, 132), 16) as 27 | 28;
    return { r, s, v };
}
