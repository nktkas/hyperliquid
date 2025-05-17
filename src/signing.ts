/**
 * This module contains functions for generating Hyperliquid transaction signatures
 * and interfaces to various wallet implementations.
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
 * @module
 */

import { keccak_256 } from "@noble/hashes/sha3";
import { encode as encodeMsgpack, type ValueMap, type ValueType } from "@std/msgpack/encode";
import { decodeHex, encodeHex } from "@std/encoding/hex";
import { concat } from "@std/bytes/concat";
import type { Hex } from "./base.ts";

export type { Hex };
export type { ValueMap, ValueType };

/** Abstract interface for a wallet that can sign typed data. */
export type AbstractWallet =
    | AbstractViemWalletClient
    | AbstractEthersSigner
    | AbstractEthersV5Signer
    | AbstractExtendedViemWalletClient
    | AbstractWindowEthereum;

/** Abstract interface for a [viem wallet](https://viem.sh/docs/clients/wallet). */
export interface AbstractViemWalletClient {
    signTypedData(params: {
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
    }): Promise<Hex>;
}

/** Abstract interface for an [ethers.js signer](https://docs.ethers.org/v6/api/providers/#Signer). */
export interface AbstractEthersSigner {
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
}

/** Abstract interface for an [ethers.js v5 signer](https://docs.ethers.org/v5/api/providers/#Signer). */
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
}

/** Abstract interface for an extended [viem wallet](https://viem.sh/docs/clients/wallet) (e.g. privy [useSignTypedData](https://docs.privy.io/reference/sdk/react-auth/functions/useSignTypedData#returns)). */
export interface AbstractExtendedViemWalletClient {
    signTypedData(
        params: {
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
        },
        options?: unknown,
    ): Promise<Hex>;
}

/** Abstract interface for a [window.ethereum](https://eips.ethereum.org/EIPS/eip-1193) object. */
export interface AbstractWindowEthereum {
    // deno-lint-ignore no-explicit-any
    request(args: { method: any; params: any }): Promise<any>;
}

/**
 * Create a hash of the L1 action.
 *
 * Note: Hash generation depends on the order of the action keys.
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
    const vaultMarker = Uint8Array.of(vaultAddress ? 0x01 : 0x00);
    const vaultBytes = vaultAddress ? decodeHex(vaultAddress.slice(2)) : new Uint8Array();

    // 4. Expires after
    const expiresMarker = new Uint8Array(expiresAfter !== undefined ? 1 : 0);
    const expiresBytes = new Uint8Array(expiresAfter !== undefined ? 8 : 0);
    if (expiresAfter !== undefined) {
        new DataView(expiresBytes.buffer).setBigUint64(0, BigInt(expiresAfter));
    }

    // Create a keccak256 hash
    const chunks: Uint8Array[] = [
        actionBytes,
        nonceBytes,
        vaultMarker,
        vaultBytes,
        expiresMarker,
        expiresBytes,
    ];
    const bytes = concat(chunks);
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
 * import { privateKeyToAccount } from "viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // Change to your private key
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
 *     wallet,
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
}): Promise<{ r: Hex; s: Hex; v: number }> {
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
        chainId: 1337,
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
 * @param args - Arguments for signing the action.
 * @returns The signature components r, s, and v.
 * @example
 * ```ts
 * import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
 * import { privateKeyToAccount } from "viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // Change to your private key
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
 *     wallet,
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
}): Promise<{ r: Hex; s: Hex; v: number }> {
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
    if (isAbstractViemWalletClient(wallet) || isAbstractExtendedViemWalletClient(wallet)) {
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

/** Signs typed data using `window.ethereum` (EIP-1193) with `eth_signTypedData_v4` (EIP-712). */
async function signTypedDataWithWindowEthereum(
    ethereum: AbstractWindowEthereum,
    domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: Hex;
    },
    types: {
        [key: string]: {
            name: string;
            type: string;
        }[];
    },
    message: Record<string, unknown>,
): Promise<Hex> {
    const accounts = await ethereum.request({
        method: "eth_requestAccounts",
        params: [],
    });
    if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new Error("No Ethereum accounts available");
    }

    const from = accounts[0] as Hex;
    const dataToSign = JSON.stringify({
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
    return await ethereum.request({
        method: "eth_signTypedData_v4",
        params: [from, dataToSign],
    }) as Hex;
}

/** Splits a signature hexadecimal string into its components. */
function splitSignature(signature: Hex): { r: Hex; s: Hex; v: number } {
    const r = `0x${signature.slice(2, 66)}` as const;
    const s = `0x${signature.slice(66, 130)}` as const;
    const v = parseInt(signature.slice(130, 132), 16);
    return { r, s, v };
}

/** Checks if the given value is an abstract viem wallet. */
export function isAbstractViemWalletClient(client: unknown): client is AbstractViemWalletClient {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" &&
        client.signTypedData.length === 1;
}

/** Checks if the given value is an abstract ethers signer. */
export function isAbstractEthersSigner(client: unknown): client is AbstractEthersSigner {
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

/** Checks if the given value is an abstract extended viem wallet (e.g. privy `useSignTypedData`). */
export function isAbstractExtendedViemWalletClient(client: unknown): client is AbstractViemWalletClient {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" &&
        client.signTypedData.length === 2;
}

/** Checks if the given value is an abstract `window.ethereum` object. */
export function isAbstractWindowEthereum(client: unknown): client is AbstractWindowEthereum {
    return typeof client === "object" && client !== null &&
        "request" in client && typeof client.request === "function" &&
        client.request.length >= 1;
}
