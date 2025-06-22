import type { Hex } from "../../base.ts";
import {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
} from "./ethers.ts";
import { isValidPrivateKey, signTypedData as signTypedDataWithPrivateKey } from "./private_key.ts";
import { type AbstractViemWalletClient, isAbstractViemWalletClient } from "./viem.ts";
import { type AbstractWindowEthereum, isAbstractWindowEthereum, signTypedDataWithWindowEthereum } from "./window.ts";

export {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    type AbstractWindowEthereum,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
    isAbstractViemWalletClient,
    isAbstractWindowEthereum,
    isValidPrivateKey,
};

/** Abstract interface for a wallet that can sign typed data. */
export type AbstractWallet =
    | Hex // Private key
    | AbstractViemWalletClient
    | AbstractEthersSigner
    | AbstractEthersV5Signer
    | AbstractWindowEthereum;

/** ECDSA signature components for Ethereum transactions and typed data. */
export interface Signature {
    /** First 32-byte component of ECDSA signature */
    r: Hex;
    /** Second 32-byte component of ECDSA signature */
    s: Hex;
    /** Recovery identifier (27 or 28, or 0 or 1 for EIP-155) */
    v: number;
}

export async function signTypedData(args: {
    wallet: AbstractWallet;
    domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: Hex;
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

    let signature: Hex;
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
        signature = await wallet.signTypedData(domain, types, message) as Hex;
    } else if (isAbstractEthersV5Signer(wallet)) {
        signature = await wallet._signTypedData(domain, types, message) as Hex;
    } else if (isAbstractWindowEthereum(wallet)) {
        signature = await signTypedDataWithWindowEthereum({
            ethereum: wallet,
            domain,
            types,
            primaryType,
            message,
        });
    } else {
        throw new Error("Unsupported wallet for signing typed data");
    }

    return splitSignature(signature);
}

function splitSignature(signature: Hex): Signature {
    const r = `0x${signature.slice(2, 66)}` as const;
    const s = `0x${signature.slice(66, 130)}` as const;
    const v = parseInt(signature.slice(130, 132), 16);
    return { r, s, v };
}
