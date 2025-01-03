import { keccak_256 } from "@noble/hashes/sha3";
import { encode, type ValueType } from "@std/msgpack/encode";
import { bytesToHex, type Hex, hexToBytes, parseSignature } from "./hex.ts";

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
    // Layer for compatibility of @std/msgpack with @msgpack/msgpack
    // In the future should be replaced by the msgpack extension: https://github.com/denoland/std/issues/3534
    const float64IntegersToUint64 = (obj: ValueType): ValueType => {
        const THIRTY_ONE_BITS = 2147483648;
        const THIRTY_TWO_BITS = 4294967296;
        if (typeof obj === "number" && Number.isInteger(obj) && (obj >= THIRTY_TWO_BITS || obj < -THIRTY_ONE_BITS)) {
            return BigInt(obj); // Now @std/msgpack will handle integer 64 bit as int64/uint64 instead of float64
        } else if (Array.isArray(obj)) {
            return obj.map(float64IntegersToUint64);
        } else if (obj && typeof obj === "object") {
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [key, float64IntegersToUint64(value)]),
            );
        }
        return obj;
    };

    const msgPackBytes = encode(float64IntegersToUint64(action));
    const additionalBytesLength = vaultAddress ? 29 : 9;

    const data = new Uint8Array(msgPackBytes.length + additionalBytesLength);
    data.set(msgPackBytes);

    const view = new DataView(data.buffer);
    view.setBigUint64(msgPackBytes.length, BigInt(nonce));

    if (vaultAddress) {
        view.setUint8(msgPackBytes.length + 8, 1);
        data.set(hexToBytes(vaultAddress), msgPackBytes.length + 9);
    } else {
        view.setUint8(msgPackBytes.length + 8, 0);
    }

    return bytesToHex(keccak_256(data));
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
