import {
    type AbstractEthersV5Signer,
    type AbstractEthersV6Signer,
    isAbstractEthersV5Signer,
    isAbstractEthersV6Signer,
} from "./ethers.js";
import { isValidPrivateKey, privateKeyToAddress, signTypedData as signTypedDataWithPrivateKey } from "./private_key.js";
import { type AbstractViemJsonRpcAccount, type AbstractViemLocalAccount, isAbstractViemWallet } from "./viem.js";

/** Abstract interface for a wallet that can sign typed data. */
export type AbstractWallet =
    | `0x${string}` // Private key
    | AbstractViemJsonRpcAccount
    | AbstractViemLocalAccount
    | AbstractEthersV6Signer
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
    if (isAbstractViemWallet(wallet)) {
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
    } else if (isAbstractEthersV6Signer(wallet)) {
        signature = await wallet.signTypedData(domain, types, message) as `0x${string}`;
    } else if (isAbstractEthersV5Signer(wallet)) {
        signature = await wallet._signTypedData(domain, types, message) as `0x${string}`;
    } else if (isValidPrivateKey(wallet)) {
        signature = await signTypedDataWithPrivateKey({ privateKey: wallet, domain, types, primaryType, message });
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

/** Get the chain ID of the wallet. */
export async function getWalletChainId(wallet: AbstractWallet): Promise<`0x${string}`> {
    if (isAbstractViemWallet(wallet)) {
        if ("getChainId" in wallet && wallet.getChainId) {
            const chainId = await wallet.getChainId();
            return `0x${chainId.toString(16)}`;
        } else {
            return "0x1";
        }
    } else if (isAbstractEthersV6Signer(wallet) || isAbstractEthersV5Signer(wallet)) {
        if ("provider" in wallet && wallet.provider) {
            const network = await wallet.provider.getNetwork();
            return `0x${network.chainId.toString(16)}`;
        } else {
            return "0x1";
        }
    } else {
        return "0x1";
    }
}

/** Get the wallet address from various wallet types. */
export async function getWalletAddress(wallet: AbstractWallet): Promise<`0x${string}`> {
    if (isAbstractViemWallet(wallet)) {
        if ("address" in wallet && wallet.address) {
            return wallet.address;
        } else if ("getAddresses" in wallet && wallet.getAddresses) {
            const addresses = await wallet.getAddresses();
            return addresses[0];
        }
    } else if (isAbstractEthersV6Signer(wallet) || isAbstractEthersV5Signer(wallet)) {
        if ("getAddress" in wallet && wallet.getAddress) {
            return await wallet.getAddress() as `0x${string}`;
        }
    } else if (isValidPrivateKey(wallet)) {
        return privateKeyToAddress(wallet);
    }
    throw new Error("Unsupported wallet for getting address");
}
