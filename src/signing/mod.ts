/**
 * This module contains functions for generating Hyperliquid transaction signatures
 * and interfaces to various wallet implementations.
 *
 * @example
 * ```ts
 * import { signL1Action } from "@nktkas/hyperliquid/signing";
 *
 * const action = {
 *   type: "cancel",
 *   cancels: [{ a: 0, o: 12345 }],
 * };
 * const nonce = Date.now();
 *
 * const signature = await signL1Action({
 *   wallet,
 *   action,
 *   nonce,
 *   isTestnet: true, // Change to false for mainnet
 * });
 * ```
 * @example
 * ```ts
 * import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
 *
 * const action = {
 *   type: "approveAgent",
 *   hyperliquidChain: "Testnet", // "Mainnet" or "Testnet"
 *   signatureChainId: "0x66eee",
 *   nonce: Date.now(),
 *   agentAddress: "0x...",
 *   agentName: "Agent",
 * };
 *
 * const signature = await signUserSignedAction({
 *   wallet,
 *   action,
 *   types: {
 *     "HyperliquidTransaction:ApproveAgent": [
 *       { name: "hyperliquidChain", type: "string" },
 *       { name: "agentAddress", type: "address" },
 *       { name: "agentName", type: "string" },
 *       { name: "nonce", type: "uint64" },
 *     ],
 *   },
 *   chainId: parseInt(action.signatureChainId, 16),
 * });
 * ```
 *
 * @module
 */

import { keccak_256 } from "@noble/hashes/sha3";
import { encode as encodeMsgpack, type ValueMap, type ValueType } from "@std/msgpack/encode";
import { decodeHex, encodeHex } from "@std/encoding/hex";
import { concat as concatBytes } from "@std/bytes/concat";
import {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
} from "./_ethers.ts";
import { isValidPrivateKey, signTypedDataWithPrivateKey } from "./_private_key.ts";
import { type AbstractViemWalletClient, isAbstractViemWalletClient } from "./_viem.ts";
import { type AbstractWindowEthereum, isAbstractWindowEthereum, signTypedDataWithWindowEthereum } from "./_window.ts";
import type { Hex } from "../base.ts";

export {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    type AbstractWindowEthereum,
    type Hex,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
    isAbstractViemWalletClient,
    isAbstractWindowEthereum,
    isValidPrivateKey,
    type ValueMap,
    type ValueType,
};
export * from "./_sorter.ts";

/** Abstract interface for a wallet that can sign typed data. */
export type AbstractWallet =
    | Hex // Private key
    | AbstractViemWalletClient
    | AbstractEthersSigner
    | AbstractEthersV5Signer
    | AbstractWindowEthereum;

export interface Signature {
    r: Hex;
    s: Hex;
    v: number;
}

/**
 * Create a hash of the L1 action.
 *
 * Note: Hash generation depends on the order of the action keys.
 *
 * @param action - The action to be hashed.
 * @param nonce - Unique request identifier (recommended current timestamp in ms).
 * @param vaultAddress - Optional vault address used in the action.
 * @param expiresAfter - Optional expiration time of the action in milliseconds since the epoch.
 * @returns The hash of the action.
 */
export function createL1ActionHash(action: ValueType, nonce: number, vaultAddress?: Hex, expiresAfter?: number): Hex {
    // 1. Action
    const actionBytes = encodeMsgpack(normalizeIntegersForMsgPack(action));

    // 2. Nonce
    const nonceBytes = new Uint8Array(8);
    new DataView(nonceBytes.buffer).setBigUint64(0, BigInt(nonce));

    // 3. Vault address
    const vaultMarker = vaultAddress ? Uint8Array.of(1) : Uint8Array.of(0);
    const vaultBytes = vaultAddress ? decodeHex(vaultAddress.slice(2)) : new Uint8Array();

    // 4. Expires after
    let expiresMarker: Uint8Array;
    let expiresBytes: Uint8Array;
    if (expiresAfter !== undefined) {
        expiresMarker = Uint8Array.of(0);
        expiresBytes = new Uint8Array(8);
        new DataView(expiresBytes.buffer).setBigUint64(0, BigInt(expiresAfter));
    } else {
        expiresMarker = new Uint8Array();
        expiresBytes = new Uint8Array();
    }

    // Create a keccak256 hash
    const bytes = concatBytes([
        actionBytes,
        nonceBytes,
        vaultMarker,
        vaultBytes,
        expiresMarker,
        expiresBytes,
    ]);
    const hash = keccak_256(bytes);
    return `0x${encodeHex(hash)}`;
}

/** Layer to make {@link https://jsr.io/@std/msgpack | @std/msgpack} compatible with {@link https://github.com/msgpack/msgpack-javascript | @msgpack/msgpack}. */
function normalizeIntegersForMsgPack(obj: ValueType): ValueType {
    const THIRTY_ONE_BITS = 2147483648;
    const THIRTY_TWO_BITS = 4294967296;

    if (
        typeof obj === "number" && Number.isInteger(obj) &&
        obj <= Number.MAX_SAFE_INTEGER && obj >= Number.MIN_SAFE_INTEGER &&
        (obj >= THIRTY_TWO_BITS || obj < -THIRTY_ONE_BITS)
    ) {
        return BigInt(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(normalizeIntegersForMsgPack);
    }

    if (obj && typeof obj === "object" && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, normalizeIntegersForMsgPack(value)]),
        );
    }

    return obj;
}

/**
 * Sign an L1 action.
 *
 * Note: Signature generation depends on the order of the action keys.
 * @param args - Arguments for signing the action.
 * @returns The signature components r, s, and v.
 * @example
 * ```ts
 * import { signL1Action } from "@nktkas/hyperliquid/signing";
 *
 * const privateKey = "0x..."; // or `viem`, `ethers`
 *
 * const action = {
 *     type: "cancel",
 *     cancels: [
 *         { a: 0, o: 12345 }, // Asset index and order ID
 *     ],
 * };
 * const nonce = Date.now();
 *
 * const signature = await signL1Action({
 *     wallet: privateKey,
 *     action,
 *     nonce,
 *     isTestnet: true, // Change to false for mainnet
 * });
 *
 * const response = await fetch("https://api.hyperliquid-testnet.xyz/exchange", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ action, signature, nonce }),
 * });
 * const body = await response.json();
 * ```
 */
export async function signL1Action(args: {
    /** Wallet to sign the action. */
    wallet: AbstractWallet;
    /** The action to be signed. */
    action: ValueType;
    /** Unique request identifier (recommended current timestamp in ms). */
    nonce: number;
    /** Indicates if the action is for the testnet. Default is `false`. */
    isTestnet?: boolean;
    /** Optional vault address used in the action. */
    vaultAddress?: Hex;
    /** Optional expiration time of the action in milliseconds since the epoch. */
    expiresAfter?: number;
}): Promise<Signature> {
    const {
        wallet,
        action,
        nonce,
        isTestnet = false,
        vaultAddress,
        expiresAfter,
    } = args;

    const domain = {
        name: "Exchange",
        version: "1",
        chainId: 1337, // hyperliquid requires a fixed chain
        verifyingContract: "0x0000000000000000000000000000000000000000",
    } as const;
    const types = {
        Agent: [
            { name: "source", type: "string" },
            { name: "connectionId", type: "bytes32" },
        ],
    };

    const actionHash = createL1ActionHash(action, nonce, vaultAddress, expiresAfter);
    const message = {
        source: isTestnet ? "b" : "a",
        connectionId: actionHash,
    };

    const signature = await abstractSignTypedData({ wallet, domain, types, message });
    return splitSignature(signature);
}

/**
 * Sign a user-signed action.
 *
 * Note: Signature generation depends on the order of types.
 *
 * @param args - Arguments for signing the action.
 * @returns The signature components r, s, and v.
 * @example
 * ```ts
 * import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
 *
 * const privateKey = "0x..."; // or `viem`, `ethers`
 *
 * const action = {
 *     type: "approveAgent",
 *     hyperliquidChain: "Testnet", // "Mainnet" or "Testnet"
 *     signatureChainId: "0x66eee",
 *     nonce: Date.now(),
 *     agentAddress: "0x...", // Change to your agent address
 *     agentName: "Agent",
 * };
 *
 * const signature = await signUserSignedAction({
 *     wallet: privateKey,
 *     action,
 *     types: {
 *         "HyperliquidTransaction:ApproveAgent": [
 *             { name: "hyperliquidChain", type: "string" },
 *             { name: "agentAddress", type: "address" },
 *             { name: "agentName", type: "string" },
 *             { name: "nonce", type: "uint64" },
 *         ],
 *     },
 *     chainId: parseInt(action.signatureChainId, 16),
 * });
 *
 * const response = await fetch("https://api.hyperliquid-testnet.xyz/exchange", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ action, signature, nonce: action.nonce }),
 * });
 * const body = await response.json();
 * ```
 */
export async function signUserSignedAction(args: {
    /** Wallet to sign the action. */
    wallet: AbstractWallet;
    /** The action to be signed. */
    action: Record<string, unknown>;
    /** The types of the action. */
    types: { [key: string]: { name: string; type: string }[] };
    /** The chain ID. */
    chainId: number;
}): Promise<Signature> {
    const { wallet, action, types, chainId } = args;

    const domain = {
        name: "HyperliquidSignTransaction",
        version: "1",
        chainId,
        verifyingContract: "0x0000000000000000000000000000000000000000",
    } as const;

    const signature = await abstractSignTypedData({ wallet, domain, types, message: action });
    return splitSignature(signature);
}

/**
 * Sign a multi-signature action.
 *
 * Note: Signature generation depends on the order of the action keys.
 *
 * @param args - Arguments for signing the action.
 * @returns The signature components r, s, and v.
 * @example
 * ```ts
 * import { signL1Action, signMultiSigAction } from "@nktkas/hyperliquid/signing";
 * import { privateKeyToAccount } from "viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x...");
 * const multiSigUser = "0x..."; // Multi-sig user address
 *
 * const nonce = Date.now();
 * const action = { // Example action
 *   type: "scheduleCancel",
 *   time: Date.now() + 10000
 * };
 *
 * // First, create signature from one of the authorized signers
 * const signature = await signL1Action({
 *   wallet,
 *   action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), action],
 *   nonce,
 *   isTestnet: true,
 * });
 *
 * // Then use it in the multi-sig action
 * const multiSigSignature = await signMultiSigAction({
 *   wallet,
 *   action: {
 *     type: "multiSig",
 *     signatureChainId: "0x66eee",
 *     signatures: [signature],
 *     payload: {
 *       multiSigUser,
 *       outerSigner: wallet.address,
 *       action,
 *     }
 *   },
 *   nonce,
 *   hyperliquidChain: "Testnet",
 *   signatureChainId: "0x66eee",
 * });
 * ```
 */
export async function signMultiSigAction(args: {
    /** Wallet to sign the action. */
    wallet: AbstractWallet;
    /** The action to be signed. */
    action: ValueMap;
    /** Unique request identifier (recommended current timestamp in ms). */
    nonce: number;
    /** Optional vault address used in the action. */
    vaultAddress?: Hex;
    /** Optional expiration time of the action in milliseconds since the epoch. */
    expiresAfter?: number;
    /** HyperLiquid network ("Mainnet" or "Testnet"). */
    hyperliquidChain: "Mainnet" | "Testnet";
    /** Chain ID used for signing. */
    signatureChainId: Hex;
}): Promise<Signature> {
    const {
        wallet,
        action,
        nonce,
        hyperliquidChain,
        signatureChainId,
        vaultAddress,
        expiresAfter,
    } = args;

    const multiSigActionHash = createL1ActionHash(action, nonce, vaultAddress, expiresAfter);
    const message = {
        multiSigActionHash,
        hyperliquidChain,
        signatureChainId,
        nonce,
    };

    return await signUserSignedAction({
        wallet,
        action: message,
        types: {
            "HyperliquidTransaction:SendMultiSig": [
                { name: "hyperliquidChain", type: "string" },
                { name: "multiSigActionHash", type: "bytes32" },
                { name: "nonce", type: "uint64" },
            ],
        },
        chainId: parseInt(signatureChainId, 16),
    });
}

/** Signs typed data with the provided wallet using EIP-712. */
async function abstractSignTypedData(args: {
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
    message: Record<string, unknown>;
}): Promise<Hex> {
    const { wallet, domain, types, message } = args;
    if (isValidPrivateKey(wallet)) {
        return await signTypedDataWithPrivateKey({
            privateKey: wallet,
            domain,
            types,
            primaryType: Object.keys(types)[0],
            message,
        });
    } else if (isAbstractViemWalletClient(wallet)) {
        return await wallet.signTypedData({
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
            primaryType: Object.keys(types)[0],
            message,
        });
    } else if (isAbstractEthersSigner(wallet)) {
        return await wallet.signTypedData(domain, types, message) as Hex;
    } else if (isAbstractEthersV5Signer(wallet)) {
        return await wallet._signTypedData(domain, types, message) as Hex;
    } else if (isAbstractWindowEthereum(wallet)) {
        return await signTypedDataWithWindowEthereum(wallet, domain, types, message);
    } else {
        throw new Error("Unsupported wallet for signing typed data");
    }
}

/** Splits a signature hexadecimal string into its components. */
function splitSignature(signature: Hex): Signature {
    const r = `0x${signature.slice(2, 66)}` as const;
    const s = `0x${signature.slice(66, 130)}` as const;
    const v = parseInt(signature.slice(130, 132), 16);
    return { r, s, v };
}
