/**
 * This module contains functions for generating Hyperliquid transaction signatures
 * and interfaces to various wallet implementations.
 *
 * @example Signing an L1 action
 * ```ts
 * import { actionSorter, signL1Action } from "@nktkas/hyperliquid/signing";
 *
 * const privateKey = "0x..."; // or `viem`, `ethers`
 *
 * const nonce = Date.now();
 * const action = {
 *     type: "cancel",
 *     cancels: [
 *         { a: 0, o: 12345 },
 *     ],
 * } as const;
 *
 * const signature = await signL1Action({
 *     wallet: privateKey,
 *     action: actionSorter[action.type](action),
 *     nonce,
 * });
 * ```
 *
 * @example Signing a user-signed action
 * ```ts
 * import { signUserSignedAction, userSignedActionEip712Types } from "@nktkas/hyperliquid/signing";
 *
 * const privateKey = "0x..."; // or `viem`, `ethers`
 *
 * const action = {
 *     type: "approveAgent",
 *     signatureChainId: "0x66eee",
 *     hyperliquidChain: "Mainnet",
 *     agentAddress: "0x...",
 *     agentName: "Agent",
 *     nonce: Date.now(),
 * } as const;
 *
 * const signature = await signUserSignedAction({
 *     wallet: privateKey,
 *     action,
 *     types: userSignedActionEip712Types[action.type],
 * });
 * ```
 *
 * @example Signing a multi-signature action
 * ```ts
 * import { actionSorter, signL1Action, signMultiSigAction } from "@nktkas/hyperliquid/signing";
 * import { privateKeyToAccount } from "viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // or `ethers`, private key with address
 * const multiSigUser = "0x...";
 *
 * const nonce = Date.now();
 * const action = {
 *     type: "scheduleCancel",
 *     time: Date.now() + 10000,
 * } as const;
 *
 * // First, create the required number of signatures
 * const signature = await signL1Action({
 *     wallet,
 *     action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), actionSorter[action.type](action)],
 *     nonce,
 * });
 *
 * // Then use signatures in the multi-sig action
 * const multiSigSignature = await signMultiSigAction({
 *     wallet,
 *     action: {
 *         signatureChainId: "0x66eee",
 *         signatures: [signature],
 *         payload: {
 *             multiSigUser,
 *             outerSigner: wallet.address,
 *             action,
 *         },
 *     },
 *     nonce,
 * });
 * ```
 *
 * @module
 */

import { keccak_256 } from "@noble/hashes/sha3";
import { etc } from "@noble/secp256k1";
import { encode as encodeMsgpack } from "@msgpack/msgpack";
import type { Hex } from "../base.ts";
import {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    type AbstractWallet,
    type AbstractWindowEthereum,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
    isAbstractViemWalletClient,
    isAbstractWindowEthereum,
    isValidPrivateKey,
    type Signature,
    signTypedData,
} from "./_signTypedData/mod.ts";

export {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    type AbstractWallet,
    type AbstractWindowEthereum,
    type Hex,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
    isAbstractViemWalletClient,
    isAbstractWindowEthereum,
    isValidPrivateKey,
    type Signature,
};
export * from "./_sorter.ts";

/**
 * Create a hash of the L1 action.
 * @example
 * ```ts
 * import { actionSorter, createL1ActionHash } from "@nktkas/hyperliquid/signing";
 *
 * const action = {
 *     type: "cancel",
 *     cancels: [
 *         { a: 0, o: 12345 },
 *     ],
 * } as const;
 * const nonce = Date.now();
 *
 * const actionHash = createL1ActionHash({
 *     action: actionSorter[action.type](action),
 *     nonce,
 *     vaultAddress: "0x...", // optional
 *     expiresAfter: Date.now() + 10_000, // optional
 * });
 * ```
 */
export function createL1ActionHash(args: {
    /** The action to be hashed (hash depends on key order). */
    action: Record<string, unknown> | unknown[];
    /** The current timestamp in ms. */
    nonce: number;
    /** Optional vault address used in the action. */
    vaultAddress?: Hex;
    /** Optional expiration time of the action in ms since the epoch. */
    expiresAfter?: number;
}): Hex {
    const { action, nonce, vaultAddress, expiresAfter } = args;

    // 1. Action
    const actionBytes = encodeMsgpack(action);

    // 2. Nonce
    const nonceBytes = toUint64Bytes(nonce);

    // 3. Vault address
    const vaultMarker = vaultAddress ? new Uint8Array([1]) : new Uint8Array([0]);
    const vaultBytes = vaultAddress ? etc.hexToBytes(vaultAddress.slice(2)) : new Uint8Array();

    // 4. Expires after
    const expiresMarker = expiresAfter !== undefined ? new Uint8Array([0]) : new Uint8Array();
    const expiresBytes = expiresAfter !== undefined ? toUint64Bytes(expiresAfter) : new Uint8Array();

    // Create a hash
    const bytes = etc.concatBytes(
        actionBytes,
        nonceBytes,
        vaultMarker,
        vaultBytes,
        expiresMarker,
        expiresBytes,
    );
    const hash = keccak_256(bytes);
    return `0x${etc.bytesToHex(hash)}`;
}

function toUint64Bytes(n: bigint | number | string): Uint8Array {
    const bytes = new Uint8Array(8);
    new DataView(bytes.buffer).setBigUint64(0, BigInt(n));
    return bytes;
}

/**
 * Sign an L1 action.
 * @example
 * ```ts
 * import { actionSorter, signL1Action } from "@nktkas/hyperliquid/signing";
 *
 * const privateKey = "0x..."; // or `viem`, `ethers`
 *
 * const nonce = Date.now();
 * const action = {
 *     type: "cancel",
 *     cancels: [
 *         { a: 0, o: 12345 },
 *     ],
 * } as const;
 *
 * const signature = await signL1Action({
 *     wallet: privateKey,
 *     action: actionSorter[action.type](action),
 *     nonce,
 * });
 *
 * // Send the signed action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
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
    /** The action to be signed (hash depends on key order). */
    action: Record<string, unknown> | unknown[];
    /** The current timestamp in ms. */
    nonce: number;
    /** Indicates if the action is for the testnet. (default: false) */
    isTestnet?: boolean;
    /** Optional vault address used in the action. */
    vaultAddress?: Hex;
    /** Optional expiration time of the action in ms since the epoch. */
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

    const actionHash = createL1ActionHash({ action, nonce, vaultAddress, expiresAfter });
    const message = {
        source: isTestnet ? "b" : "a",
        connectionId: actionHash,
    };

    return await signTypedData({
        wallet,
        domain: {
            name: "Exchange",
            version: "1",
            chainId: 1337, // hyperliquid requires chainId to be 1337
            verifyingContract: "0x0000000000000000000000000000000000000000",
        },
        types: {
            Agent: [
                { name: "source", type: "string" },
                { name: "connectionId", type: "bytes32" },
            ],
        },
        primaryType: "Agent",
        message,
    });
}

/**
 * Sign a user-signed action.
 * @example
 * ```ts
 * import { signUserSignedAction, userSignedActionEip712Types } from "@nktkas/hyperliquid/signing";
 *
 * const privateKey = "0x..."; // or `viem`, `ethers`
 *
 * const action = {
 *     type: "approveAgent",
 *     signatureChainId: "0x66eee",
 *     hyperliquidChain: "Mainnet",
 *     agentAddress: "0x...",
 *     agentName: "Agent",
 *     nonce: Date.now(),
 * } as const;
 *
 * const signature = await signUserSignedAction({
 *     wallet: privateKey,
 *     action,
 *     types: userSignedActionEip712Types[action.type],
 * });
 *
 * // Send the signed action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
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
    action: {
        signatureChainId: Hex;
        [key: string]: unknown;
    };
    /** The types of the action (hash depends on key order). */
    types: {
        [key: string]: {
            name: string;
            type: string;
        }[];
    };
}): Promise<Signature> {
    const { wallet, action, types } = args;
    return await signTypedData({
        wallet,
        domain: {
            name: "HyperliquidSignTransaction",
            version: "1",
            chainId: parseInt(action.signatureChainId),
            verifyingContract: "0x0000000000000000000000000000000000000000",
        },
        types,
        primaryType: Object.keys(types)[0],
        message: action,
    });
}

/**
 * Sign a multi-signature action.
 * @example
 * ```ts
 * import { actionSorter, signL1Action, signMultiSigAction } from "@nktkas/hyperliquid/signing";
 * import { privateKeyToAccount } from "viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // or `ethers`, private key with address
 * const multiSigUser = "0x...";
 *
 * const nonce = Date.now();
 * const action = {
 *     type: "scheduleCancel",
 *     time: Date.now() + 10000,
 * } as const;
 *
 * // First, create the required number of signatures
 * const signature = await signL1Action({
 *     wallet,
 *     action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), actionSorter[action.type](action)],
 *     nonce,
 * });
 *
 * // Then use signatures in the multi-sig action
 * const multiSigSignature = await signMultiSigAction({
 *     wallet,
 *     action: {
 *         signatureChainId: "0x66eee",
 *         signatures: [signature],
 *         payload: {
 *             multiSigUser,
 *             outerSigner: wallet.address,
 *             action,
 *         },
 *     },
 *     nonce,
 * });
 * ```
 */
export async function signMultiSigAction(args: {
    /** Wallet to sign the action. */
    wallet: AbstractWallet;
    /** The action to be signed (hash depends on key order). */
    action: {
        signatureChainId: Hex;
        [key: string]: unknown;
    };
    /** The current timestamp in ms. */
    nonce: number;
    /** Indicates if the action is for the testnet. (default: false) */
    isTestnet?: boolean;
    /** Optional vault address used in the action. */
    vaultAddress?: Hex;
    /** Optional expiration time of the action in ms since the epoch. */
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

    const multiSigActionHash = createL1ActionHash({ action, nonce, vaultAddress, expiresAfter });
    const message = {
        signatureChainId: action.signatureChainId,
        hyperliquidChain: isTestnet ? "Testnet" : "Mainnet",
        multiSigActionHash,
        nonce,
    };

    return await signTypedData({
        wallet,
        domain: {
            name: "HyperliquidSignTransaction",
            version: "1",
            chainId: parseInt(message.signatureChainId),
            verifyingContract: "0x0000000000000000000000000000000000000000",
        },
        types: {
            "HyperliquidTransaction:SendMultiSig": [
                { name: "hyperliquidChain", type: "string" },
                { name: "multiSigActionHash", type: "bytes32" },
                { name: "nonce", type: "uint64" },
            ],
        },
        primaryType: "HyperliquidTransaction:SendMultiSig",
        message,
    });
}
