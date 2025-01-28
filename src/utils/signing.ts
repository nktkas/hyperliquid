import { keccak_256 } from "@noble/hashes/sha3";
import { encode, type ValueType } from "@std/msgpack/encode";
import { decodeHex, encodeHex } from "@std/encoding/hex";

type Hex = `0x${string}`;

/** Abstract interface for a [ethers.js](https://docs.ethers.org/v6/api/providers/#Signer) signer. */
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

/** Abstract interface for a [ethers.js v5](https://docs.ethers.org/v5/api/providers/#Signer) signer. */
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

/** Abstract interface for a [viem](https://viem.sh/docs/clients/wallet) wallet client. */
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

/**
 * Create a hash of the action.
 * @param action - The action to hash.
 * @param nonce - The nonce of the action.
 * @param vaultAddress - Optional vault address.
 * @returns The hash of the action.
 */
export function createActionHash(action: ValueType, nonce: number, vaultAddress?: Hex): Hex {
    const normalizedAction = normalizeIntegersForMsgPack(action);
    const msgPackBytes = encode(normalizedAction);

    const additionalBytesLength = vaultAddress ? 29 : 9;
    const data = new Uint8Array(msgPackBytes.length + additionalBytesLength);
    data.set(msgPackBytes);

    const view = new DataView(data.buffer);
    view.setBigUint64(msgPackBytes.length, BigInt(nonce));

    if (vaultAddress) {
        view.setUint8(msgPackBytes.length + 8, 1);
        const normalizedVaultAddress = vaultAddress.startsWith("0x") ? vaultAddress.slice(2) : vaultAddress;
        data.set(decodeHex(normalizedVaultAddress), msgPackBytes.length + 9);
    } else {
        view.setUint8(msgPackBytes.length + 8, 0);
    }

    return `0x${encodeHex(keccak_256(data))}`;
}

/**
 * Layer to make {@link https://jsr.io/@std/msgpack | @std/msgpack} compatible with {@link https://github.com/msgpack/msgpack-javascript | @msgpack/msgpack}.
 * @returns A new object with integers normalized.
 */
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
 * @param wallet - The wallet to sign with.
 * @param isTestnet - A boolean indicating if the action is for the testnet.
 * @param action - The action to sign.
 * @param nonce - The nonce of the action.
 * @param vaultAddress - Optional vault address.
 * @returns The signature.
 */
export async function signL1Action(
    wallet: AbstractEthersSigner | AbstractEthersV5Signer | AbstractViemWalletClient,
    isTestnet: boolean,
    action: ValueType,
    nonce: number,
    vaultAddress?: Hex,
): Promise<{ r: Hex; s: Hex; v: number }> {
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

    const actionHash = createActionHash(action, nonce, vaultAddress);
    const message = {
        source: isTestnet ? "b" : "a",
        connectionId: actionHash,
    };

    let signature: string;
    if (isAbstractViemWalletClient(wallet)) {
        signature = await wallet.signTypedData({ domain, types, primaryType: "Agent", message });
    } else if (isAbstractEthersSigner(wallet)) {
        signature = await wallet.signTypedData(domain, types, message);
    } else if (isAbstractEthersV5Signer(wallet)) {
        signature = await wallet._signTypedData(domain, types, message);
    } else {
        throw new Error("Unsupported wallet for signing typed data", { cause: wallet });
    }
    return parseSignature(signature);
}

/**
 * Sign a user-signed action.
 * @param wallet - The wallet to sign with.
 * @param action - The action to sign.
 * @param types - The types of the action.
 * @param chainId - The chain ID of the action.
 * @returns The signature.
 */
export async function signUserSignedAction(
    wallet: AbstractEthersSigner | AbstractEthersV5Signer | AbstractViemWalletClient,
    action: Record<string, unknown>,
    types: { [key: string]: { name: string; type: string }[] },
    chainId: number,
): Promise<{ r: Hex; s: Hex; v: number }> {
    const domain = {
        name: "HyperliquidSignTransaction",
        version: "1",
        chainId,
        verifyingContract: "0x0000000000000000000000000000000000000000",
    } as const;

    let signature: string;
    if (isAbstractViemWalletClient(wallet)) {
        const primaryType = Object.keys(types)[0];
        signature = await wallet.signTypedData({ domain, types, primaryType, message: action });
    } else if (isAbstractEthersSigner(wallet)) {
        signature = await wallet.signTypedData(domain, types, action);
    } else if (isAbstractEthersV5Signer(wallet)) {
        signature = await wallet._signTypedData(domain, types, action);
    } else {
        throw new Error("Unsupported wallet for signing typed data", { cause: wallet });
    }
    return parseSignature(signature);
}

/**
 * Parses a signature hexadecimal string into its components.
 */
function parseSignature(signature: string): { r: Hex; s: Hex; v: number } {
    const normalizedSignature = signature.startsWith("0x") ? signature.slice(2) : signature;

    if (normalizedSignature.length !== 130) {
        throw new Error(`Invalid signature length. Expected 130 characters. Received ${normalizedSignature.length}.`);
    }

    const r = `0x${normalizedSignature.slice(0, 64)}` as const;
    const s = `0x${normalizedSignature.slice(64, 128)}` as const;
    const v = parseInt(normalizedSignature.slice(128, 130), 16);

    return { r, s, v };
}

/**
 * Checks if the given client is an abstract signer (ethers.js).
 * @param client - The client to check.
 * @returns A boolean indicating if the client is an abstract signer.
 */
export function isAbstractEthersSigner(client: unknown): client is AbstractEthersSigner {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" &&
        client.signTypedData.length === 3;
}

/**
 * Checks if the given client is an abstract signer (ethers.js v5).
 * @param client - The client to check.
 * @returns A boolean indicating if the client is an abstract signer.
 */
export function isAbstractEthersV5Signer(client: unknown): client is AbstractEthersV5Signer {
    return typeof client === "object" && client !== null &&
        "_signTypedData" in client && typeof client._signTypedData === "function" &&
        client._signTypedData.length === 3;
}

/**
 * Checks if the given client is an abstract wallet client (viem).
 * @param client - The client to check.
 * @returns A boolean indicating if the client is an abstract wallet client.
 */
export function isAbstractViemWalletClient(client: unknown): client is AbstractViemWalletClient {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" &&
        client.signTypedData.length === 1;
}
