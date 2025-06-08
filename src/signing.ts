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
import { concat } from "@std/bytes/concat";
import type { Hex } from "./base.ts";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CDepositRequest,
    ClaimRewardsRequest,
    ConvertToMultiSigUserRequest,
    CreateSubAccountRequest,
    CreateVaultRequest,
    CSignerActionRequest_JailSelf,
    CSignerActionRequest_UnjailSelf,
    CValidatorActionRequest_ChangeProfile,
    CValidatorActionRequest_Register,
    CValidatorActionRequest_Unregister,
    CWithdrawRequest,
    EvmUserModifyRequest,
    ModifyRequest,
    MultiSigRequest,
    OrderRequest,
    PerpDeployRequest_RegisterAsset,
    PerpDeployRequest_SetOracle,
    PerpDexClassTransferRequest,
    RegisterReferrerRequest,
    ReserveRequestWeightRequest,
    ScheduleCancelRequest,
    SetDisplayNameRequest,
    SetReferrerRequest,
    SpotDeployRequest_Genesis,
    SpotDeployRequest_RegisterHyperliquidity,
    SpotDeployRequest_RegisterSpot,
    SpotDeployRequest_RegisterToken2,
    SpotDeployRequest_SetDeployerTradingFeeShare,
    SpotDeployRequest_UserGenesis,
    SpotSendRequest,
    SpotUserRequest,
    SubAccountSpotTransferRequest,
    SubAccountTransferRequest,
    TokenDelegateRequest,
    TwapCancelRequest,
    TwapOrderRequest,
    UpdateIsolatedMarginRequest,
    UpdateLeverageRequest,
    UsdClassTransferRequest,
    UsdSendRequest,
    VaultDistributeRequest,
    VaultModifyRequest,
    VaultTransferRequest,
    Withdraw3Request,
} from "./types/exchange/requests.ts";

export type { Hex };
export type { ValueMap, ValueType };

/** Abstract interface for a wallet that can sign typed data. */
export type AbstractWallet =
    | AbstractViemWalletClient
    | AbstractEthersSigner
    | AbstractEthersV5Signer
    | AbstractWindowEthereum;

/** Abstract interface for a [viem wallet](https://viem.sh/docs/clients/wallet). */
export interface AbstractViemWalletClient {
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

/** Abstract interface for an [ethers.js v5 signer](https://docs.ethers.org/v5/api/signer/). */
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

/** Abstract interface for a [window.ethereum](https://eips.ethereum.org/EIPS/eip-1193) object. */
export interface AbstractWindowEthereum {
    // deno-lint-ignore no-explicit-any
    request(args: { method: any; params: any }): Promise<any>;
}

export interface Signature {
    r: Hex;
    s: Hex;
    v: number;
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
    let vaultMarker: Uint8Array;
    let vaultBytes: Uint8Array;
    if (vaultAddress) {
        vaultMarker = Uint8Array.of(1);
        vaultBytes = decodeHex(vaultAddress.slice(2));
    } else {
        vaultMarker = new Uint8Array(1);
        vaultBytes = new Uint8Array();
    }

    // 4. Expires after
    let expiresMarker: Uint8Array;
    let expiresBytes: Uint8Array;
    if (expiresAfter !== undefined) {
        expiresMarker = new Uint8Array(1);
        expiresBytes = new Uint8Array(8);
        new DataView(expiresBytes.buffer).setBigUint64(0, BigInt(expiresAfter));
    } else {
        expiresMarker = new Uint8Array();
        expiresBytes = new Uint8Array();
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
 * const wallet = privateKeyToAccount("0x..."); // Your private key
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
 *
 * @param args - Arguments for signing the action.
 * @returns The signature components r, s, and v.
 * @example
 * ```ts
 * import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
 * import { privateKeyToAccount } from "viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // Your private key
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
 * const wallet = privateKeyToAccount("0x..."); // Your private key
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
    if (isAbstractViemWalletClient(wallet)) {
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
function splitSignature(signature: Hex): Signature {
    const r = `0x${signature.slice(2, 66)}` as const;
    const s = `0x${signature.slice(66, 130)}` as const;
    const v = parseInt(signature.slice(130, 132), 16);
    return { r, s, v };
}

/** Checks if the given value is an abstract viem wallet. */
export function isAbstractViemWalletClient(client: unknown): client is AbstractViemWalletClient {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" &&
        (client.signTypedData.length === 1 || client.signTypedData.length === 2);
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

/** Checks if the given value is an abstract `window.ethereum` object. */
export function isAbstractWindowEthereum(client: unknown): client is AbstractWindowEthereum {
    return typeof client === "object" && client !== null &&
        "request" in client && typeof client.request === "function" &&
        client.request.length >= 1;
}

/** Action sorter for correct signature generation. */
export const actionSorter = {
    /** Sorts and formats an `approveAgent` action. */
    approveAgent: (action: ApproveAgentRequest["action"]): ApproveAgentRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            agentAddress: action.agentAddress.toLowerCase() as Hex,
            agentName: action.agentName ?? "",
            nonce: action.nonce,
        };
    },

    /** Sorts and formats an `approveBuilderFee` action. */
    approveBuilderFee: (action: ApproveBuilderFeeRequest["action"]): ApproveBuilderFeeRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            maxFeeRate: action.maxFeeRate,
            builder: action.builder.toLowerCase() as Hex,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `batchModify` action. */
    batchModify: (action: BatchModifyRequest["action"]): BatchModifyRequest["action"] => {
        return {
            type: action.type,
            modifies: action.modifies.map((modify) => {
                const sortedModify = {
                    oid: modify.oid,
                    order: {
                        a: modify.order.a,
                        b: modify.order.b,
                        p: formatDecimal(modify.order.p),
                        s: formatDecimal(modify.order.s),
                        r: modify.order.r,
                        t: "limit" in modify.order.t
                            ? {
                                limit: {
                                    tif: modify.order.t.limit.tif,
                                },
                            }
                            : {
                                trigger: {
                                    isMarket: modify.order.t.trigger.isMarket,
                                    triggerPx: formatDecimal(modify.order.t.trigger.triggerPx),
                                    tpsl: modify.order.t.trigger.tpsl,
                                },
                            },
                        c: modify.order.c,
                    },
                };
                if (sortedModify.order.c === undefined) delete sortedModify.order.c;
                return sortedModify;
            }),
        };
    },

    /** Sorts and formats a `cancel` action. */
    cancel: (action: CancelRequest["action"]): CancelRequest["action"] => {
        return {
            type: action.type,
            cancels: action.cancels.map((cancel) => ({
                a: cancel.a,
                o: cancel.o,
            })),
        };
    },

    /** Sorts and formats a `cancelByCloid` action. */
    cancelByCloid: (action: CancelByCloidRequest["action"]): CancelByCloidRequest["action"] => {
        return {
            type: action.type,
            cancels: action.cancels.map((cancel) => ({
                asset: cancel.asset,
                cloid: cancel.cloid,
            })),
        };
    },

    /** Sorts and formats a `cDeposit` action. */
    cDeposit: (action: CDepositRequest["action"]): CDepositRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            wei: action.wei,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `claimRewards` action. */
    claimRewards: (action: ClaimRewardsRequest["action"]): ClaimRewardsRequest["action"] => {
        return {
            type: action.type,
        };
    },

    /** Sorts and formats a `convertToMultiSigUser` action. */
    convertToMultiSigUser: (action: ConvertToMultiSigUserRequest["action"]): ConvertToMultiSigUserRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            signers: action.signers,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `createSubAccount` action. */
    createSubAccount: (action: CreateSubAccountRequest["action"]): CreateSubAccountRequest["action"] => {
        return {
            type: action.type,
            name: action.name,
        };
    },

    /** Sorts and formats a `createVault` action. */
    createVault: (action: CreateVaultRequest["action"]): CreateVaultRequest["action"] => {
        return {
            type: action.type,
            name: action.name,
            description: action.description,
            initialUsd: action.initialUsd,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `CSignerAction` action (jail/unjail). */
    CSignerAction: (
        action:
            | CSignerActionRequest_JailSelf["action"]
            | CSignerActionRequest_UnjailSelf["action"],
    ):
        | CSignerActionRequest_JailSelf["action"]
        | CSignerActionRequest_UnjailSelf["action"] => {
        if ("jailSelf" in action) {
            return {
                type: action.type,
                jailSelf: action.jailSelf,
            };
        } else {
            return {
                type: action.type,
                unjailSelf: action.unjailSelf,
            };
        }
    },

    /** Sorts and formats a `CValidatorAction` action (register/unregister/change profile). */
    CValidatorAction: (
        action:
            | CValidatorActionRequest_ChangeProfile["action"]
            | CValidatorActionRequest_Register["action"]
            | CValidatorActionRequest_Unregister["action"],
    ):
        | CValidatorActionRequest_ChangeProfile["action"]
        | CValidatorActionRequest_Register["action"]
        | CValidatorActionRequest_Unregister["action"] => {
        if ("changeProfile" in action) {
            return {
                type: action.type,
                changeProfile: {
                    node_ip: action.changeProfile.node_ip ?? null,
                    name: action.changeProfile.name ?? null,
                    description: action.changeProfile.description ?? null,
                    unjailed: action.changeProfile.unjailed,
                    disable_delegations: action.changeProfile.disable_delegations ?? null,
                    commission_bps: action.changeProfile.commission_bps ?? null,
                    signer: action.changeProfile.signer?.toLowerCase() as Hex | undefined ?? null,
                },
            };
        } else if ("register" in action) {
            return {
                type: action.type,
                register: {
                    profile: {
                        node_ip: {
                            Ip: action.register.profile.node_ip.Ip,
                        },
                        name: action.register.profile.name,
                        description: action.register.profile.description,
                        delegations_disabled: action.register.profile.delegations_disabled,
                        commission_bps: action.register.profile.commission_bps,
                        signer: action.register.profile.signer.toLowerCase() as Hex,
                    },
                    unjailed: action.register.unjailed,
                    initial_wei: action.register.initial_wei,
                },
            };
        } else { // "unregister" in action
            return {
                type: action.type,
                unregister: action.unregister,
            };
        }
    },

    /** Sorts and formats a `cWithdraw` action. */
    cWithdraw: (action: CWithdrawRequest["action"]): CWithdrawRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            wei: action.wei,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats an `evmUserModify` action. */
    evmUserModify: (action: EvmUserModifyRequest["action"]): EvmUserModifyRequest["action"] => {
        return {
            type: action.type,
            usingBigBlocks: action.usingBigBlocks,
        };
    },

    /** Sorts and formats a `modify` action. */
    modify: (action: ModifyRequest["action"]): ModifyRequest["action"] => {
        const sortedAction = {
            type: action.type,
            oid: action.oid,
            order: {
                a: action.order.a,
                b: action.order.b,
                p: formatDecimal(action.order.p),
                s: formatDecimal(action.order.s),
                r: action.order.r,
                t: "limit" in action.order.t
                    ? {
                        limit: {
                            tif: action.order.t.limit.tif,
                        },
                    }
                    : {
                        trigger: {
                            isMarket: action.order.t.trigger.isMarket,
                            triggerPx: formatDecimal(action.order.t.trigger.triggerPx),
                            tpsl: action.order.t.trigger.tpsl,
                        },
                    },
                c: action.order.c,
            },
        };
        if (sortedAction.order.c === undefined) delete sortedAction.order.c;
        return sortedAction;
    },

    /** Sorts and formats a `multiSig` action. */
    multiSig: (action: MultiSigRequest["action"]): MultiSigRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            signatures: action.signatures.map((signature) => ({
                r: signature.r.replace(/^0x0+/, "0x").toLowerCase() as Hex,
                s: signature.s.replace(/^0x0+/, "0x").toLowerCase() as Hex,
                v: signature.v,
            })),
            payload: {
                multiSigUser: action.payload.multiSigUser.toLowerCase() as Hex,
                outerSigner: action.payload.outerSigner.toLowerCase() as Hex,
                action: action.payload.action,
            },
        };
    },

    /** Sorts and formats an `order` action. */
    order: (action: OrderRequest["action"]): OrderRequest["action"] => {
        const sortedAction = {
            type: action.type,
            orders: action.orders.map((order) => {
                const sortedOrder = {
                    a: order.a,
                    b: order.b,
                    p: formatDecimal(order.p),
                    s: formatDecimal(order.s),
                    r: order.r,
                    t: "limit" in order.t
                        ? {
                            limit: {
                                tif: order.t.limit.tif,
                            },
                        }
                        : {
                            trigger: {
                                isMarket: order.t.trigger.isMarket,
                                triggerPx: formatDecimal(order.t.trigger.triggerPx),
                                tpsl: order.t.trigger.tpsl,
                            },
                        },
                    c: order.c,
                };
                if (order.c === undefined) delete sortedOrder.c;
                return sortedOrder;
            }),
            grouping: action.grouping,
            builder: action.builder
                ? {
                    b: action.builder.b.toLowerCase() as Hex,
                    f: action.builder.f,
                }
                : action.builder,
        };
        if (sortedAction.builder === undefined) delete sortedAction.builder;
        return sortedAction;
    },

    /** Sorts and formats a `perpDeploy` action. */
    perpDeploy: (
        action:
            | PerpDeployRequest_RegisterAsset["action"]
            | PerpDeployRequest_SetOracle["action"],
    ):
        | PerpDeployRequest_RegisterAsset["action"]
        | PerpDeployRequest_SetOracle["action"] => {
        if ("registerAsset" in action) {
            return {
                type: action.type,
                registerAsset: {
                    maxGas: action.registerAsset.maxGas ?? null,
                    assetRequest: {
                        coin: action.registerAsset.assetRequest.coin,
                        szDecimals: action.registerAsset.assetRequest.szDecimals,
                        oraclePx: action.registerAsset.assetRequest.oraclePx,
                        marginTableId: action.registerAsset.assetRequest.marginTableId,
                        onlyIsolated: action.registerAsset.assetRequest.onlyIsolated,
                    },
                    dex: action.registerAsset.dex,
                    schema: action.registerAsset.schema
                        ? {
                            fullName: action.registerAsset.schema.fullName,
                            collateralToken: action.registerAsset.schema.collateralToken,
                            oracleUpdater:
                                action.registerAsset.schema.oracleUpdater?.toLowerCase() as Hex | undefined ?? null,
                        }
                        : null,
                },
            };
        } else {
            return {
                type: action.type,
                setOracle: {
                    dex: action.setOracle.dex,
                    oraclePxs: action.setOracle.oraclePxs,
                    markPxs: action.setOracle.markPxs,
                },
            };
        }
    },

    /** Sorts and formats a `PerpDexClassTransfer` action. */
    PerpDexClassTransfer: (action: PerpDexClassTransferRequest["action"]): PerpDexClassTransferRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            dex: action.dex,
            token: action.token,
            amount: action.amount,
            toPerp: action.toPerp,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `registerReferrer` action. */
    registerReferrer: (action: RegisterReferrerRequest["action"]): RegisterReferrerRequest["action"] => {
        return {
            type: action.type,
            code: action.code,
        };
    },

    /** Sorts and formats a `reserveRequestWeight` action. */
    reserveRequestWeight: (action: ReserveRequestWeightRequest["action"]): ReserveRequestWeightRequest["action"] => {
        return {
            type: action.type,
            weight: action.weight,
        };
    },

    /** Sorts and formats a `scheduleCancel` action. */
    scheduleCancel: (action: ScheduleCancelRequest["action"]): ScheduleCancelRequest["action"] => {
        const sortedAction = {
            type: action.type,
            time: action.time,
        };
        if (sortedAction.time === undefined) delete sortedAction.time;
        return sortedAction;
    },

    /** Sorts and formats a `setDisplayName` action. */
    setDisplayName: (action: SetDisplayNameRequest["action"]): SetDisplayNameRequest["action"] => {
        return {
            type: action.type,
            displayName: action.displayName,
        };
    },

    /** Sorts and formats a `setReferrer` action. */
    setReferrer: (action: SetReferrerRequest["action"]): SetReferrerRequest["action"] => {
        return {
            type: action.type,
            code: action.code,
        };
    },

    /** Sorts and formats a `spotDeploy` action. */
    spotDeploy: (
        action:
            | SpotDeployRequest_Genesis["action"]
            | SpotDeployRequest_RegisterHyperliquidity["action"]
            | SpotDeployRequest_RegisterSpot["action"]
            | SpotDeployRequest_RegisterToken2["action"]
            | SpotDeployRequest_SetDeployerTradingFeeShare["action"]
            | SpotDeployRequest_UserGenesis["action"],
    ):
        | SpotDeployRequest_Genesis["action"]
        | SpotDeployRequest_RegisterHyperliquidity["action"]
        | SpotDeployRequest_RegisterSpot["action"]
        | SpotDeployRequest_RegisterToken2["action"]
        | SpotDeployRequest_SetDeployerTradingFeeShare["action"]
        | SpotDeployRequest_UserGenesis["action"] => {
        if ("genesis" in action) {
            const sortedAction: SpotDeployRequest_Genesis["action"] = {
                type: action.type,
                genesis: {
                    token: action.genesis.token,
                    maxSupply: action.genesis.maxSupply,
                    noHyperliquidity: action.genesis.noHyperliquidity,
                },
            };
            if (sortedAction.genesis.noHyperliquidity === undefined) {
                delete sortedAction.genesis.noHyperliquidity;
            }
            return sortedAction;
        } else if ("registerHyperliquidity" in action) {
            const sortedAction: SpotDeployRequest_RegisterHyperliquidity["action"] = {
                type: action.type,
                registerHyperliquidity: {
                    spot: action.registerHyperliquidity.spot,
                    startPx: action.registerHyperliquidity.startPx,
                    orderSz: action.registerHyperliquidity.orderSz,
                    nOrders: action.registerHyperliquidity.nOrders,
                    nSeededLevels: action.registerHyperliquidity.nSeededLevels,
                },
            };
            if (sortedAction.registerHyperliquidity.nSeededLevels === undefined) {
                delete sortedAction.registerHyperliquidity.nSeededLevels;
            }
            return sortedAction;
        } else if ("registerSpot" in action) {
            return {
                type: action.type,
                registerSpot: {
                    tokens: action.registerSpot.tokens,
                },
            };
        } else if ("registerToken2" in action) {
            const sortedAction: SpotDeployRequest_RegisterToken2["action"] = {
                type: action.type,
                registerToken2: {
                    spec: {
                        name: action.registerToken2.spec.name,
                        szDecimals: action.registerToken2.spec.szDecimals,
                        weiDecimals: action.registerToken2.spec.weiDecimals,
                    },
                    maxGas: action.registerToken2.maxGas,
                    fullName: action.registerToken2.fullName,
                },
            };
            if (sortedAction.registerToken2.fullName === undefined) {
                delete sortedAction.registerToken2.fullName;
            }
            return sortedAction;
        } else if ("setDeployerTradingFeeShare" in action) {
            return {
                type: action.type,
                setDeployerTradingFeeShare: {
                    token: action.setDeployerTradingFeeShare.token,
                    share: action.setDeployerTradingFeeShare.share,
                },
            };
        } else { // "userGenesis" in action
            const sortedAction: SpotDeployRequest_UserGenesis["action"] = {
                type: action.type,
                userGenesis: {
                    token: action.userGenesis.token,
                    userAndWei: action.userGenesis.userAndWei,
                    existingTokenAndWei: action.userGenesis.existingTokenAndWei,
                    blacklistUsers: action.userGenesis.blacklistUsers,
                },
            };
            if (sortedAction.userGenesis.blacklistUsers === undefined) {
                delete sortedAction.userGenesis.blacklistUsers;
            }
            return sortedAction;
        }
    },

    /** Sorts and formats a `spotSend` action. */
    spotSend: (action: SpotSendRequest["action"]): SpotSendRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            destination: action.destination.toLowerCase() as Hex,
            token: action.token,
            amount: action.amount,
            time: action.time,
        };
    },

    /** Sorts and formats a `spotUser` action. */
    spotUser: (action: SpotUserRequest["action"]): SpotUserRequest["action"] => {
        return {
            type: action.type,
            toggleSpotDusting: {
                optOut: action.toggleSpotDusting.optOut,
            },
        };
    },

    /** Sorts and formats a `subAccountSpotTransfer` action. */
    subAccountSpotTransfer: (
        action: SubAccountSpotTransferRequest["action"],
    ): SubAccountSpotTransferRequest["action"] => {
        return {
            type: action.type,
            subAccountUser: action.subAccountUser.toLowerCase() as Hex,
            isDeposit: action.isDeposit,
            token: action.token,
            amount: action.amount,
        };
    },

    /** Sorts and formats a `subAccountTransfer` action. */
    subAccountTransfer: (action: SubAccountTransferRequest["action"]): SubAccountTransferRequest["action"] => {
        return {
            type: action.type,
            subAccountUser: action.subAccountUser.toLowerCase() as Hex,
            isDeposit: action.isDeposit,
            usd: action.usd,
        };
    },

    /** Sorts and formats a `tokenDelegate` action. */
    tokenDelegate: (action: TokenDelegateRequest["action"]): TokenDelegateRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            validator: action.validator.toLowerCase() as Hex,
            wei: action.wei,
            isUndelegate: action.isUndelegate,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `twapCancel` action. */
    twapCancel: (action: TwapCancelRequest["action"]): TwapCancelRequest["action"] => {
        return {
            type: action.type,
            a: action.a,
            t: action.t,
        };
    },

    /** Sorts and formats a `twapOrder` action. */
    twapOrder: (action: TwapOrderRequest["action"]): TwapOrderRequest["action"] => {
        return {
            type: action.type,
            twap: {
                a: action.twap.a,
                b: action.twap.b,
                s: formatDecimal(action.twap.s),
                r: action.twap.r,
                m: action.twap.m,
                t: action.twap.t,
            },
        };
    },

    /** Sorts and formats an `updateIsolatedMargin` action. */
    updateIsolatedMargin: (action: UpdateIsolatedMarginRequest["action"]): UpdateIsolatedMarginRequest["action"] => {
        return {
            type: action.type,
            asset: action.asset,
            isBuy: action.isBuy,
            ntli: action.ntli,
        };
    },

    /** Sorts and formats an `updateLeverage` action. */
    updateLeverage: (action: UpdateLeverageRequest["action"]): UpdateLeverageRequest["action"] => {
        return {
            type: action.type,
            asset: action.asset,
            isCross: action.isCross,
            leverage: action.leverage,
        };
    },

    /** Sorts and formats an `usdClassTransfer` action. */
    usdClassTransfer: (action: UsdClassTransferRequest["action"]): UsdClassTransferRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            amount: action.amount,
            toPerp: action.toPerp,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats an `usdSend` action. */
    usdSend: (action: UsdSendRequest["action"]): UsdSendRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            destination: action.destination.toLowerCase() as Hex,
            amount: action.amount,
            time: action.time,
        };
    },

    /** Sorts and formats a `vaultDistribute` action. */
    vaultDistribute: (action: VaultDistributeRequest["action"]): VaultDistributeRequest["action"] => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            usd: action.usd,
        };
    },

    /** Sorts and formats a `vaultModify` action. */
    vaultModify: (action: VaultModifyRequest["action"]): VaultModifyRequest["action"] => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            allowDeposits: action.allowDeposits,
            alwaysCloseOnWithdraw: action.alwaysCloseOnWithdraw,
        };
    },

    /** Sorts and formats a `vaultTransfer` action. */
    vaultTransfer: (action: VaultTransferRequest["action"]): VaultTransferRequest["action"] => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            isDeposit: action.isDeposit,
            usd: action.usd,
        };
    },

    /** Sorts and formats a `withdraw3` action. */
    withdraw3: (action: Withdraw3Request["action"]): Withdraw3Request["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            destination: action.destination.toLowerCase() as Hex,
            amount: action.amount,
            time: action.time,
        };
    },
};

/** Removes trailing zeros from decimal string. */
function formatDecimal(numStr: string): string {
    if (!numStr.includes(".")) return numStr;

    const [intPart, fracPart] = numStr.split(".");
    const newFrac = fracPart.replace(/0+$/, "");

    return newFrac ? `${intPart}.${newFrac}` : intPart;
}

/** EIP-712 type definitions for user-signed actions. */
export const userSignedActionEip712Types = {
    approveAgent: {
        "HyperliquidTransaction:ApproveAgent": [
            { name: "hyperliquidChain", type: "string" },
            { name: "agentAddress", type: "address" },
            { name: "agentName", type: "string" },
            { name: "nonce", type: "uint64" },
        ],
    },
    approveBuilderFee: {
        "HyperliquidTransaction:ApproveBuilderFee": [
            { name: "hyperliquidChain", type: "string" },
            { name: "maxFeeRate", type: "string" },
            { name: "builder", type: "address" },
            { name: "nonce", type: "uint64" },
        ],
    },
    cDeposit: {
        "HyperliquidTransaction:CDeposit": [
            { name: "hyperliquidChain", type: "string" },
            { name: "wei", type: "uint64" },
            { name: "nonce", type: "uint64" },
        ],
    },
    convertToMultiSigUser: {
        "HyperliquidTransaction:ConvertToMultiSigUser": [
            { name: "hyperliquidChain", type: "string" },
            { name: "signers", type: "string" },
            { name: "nonce", type: "uint64" },
        ],
    },
    cWithdraw: {
        "HyperliquidTransaction:CWithdraw": [
            { name: "hyperliquidChain", type: "string" },
            { name: "wei", type: "uint64" },
            { name: "nonce", type: "uint64" },
        ],
    },
    PerpDexClassTransfer: {
        "HyperliquidTransaction:PerpDexClassTransfer": [
            { name: "hyperliquidChain", type: "string" },
            { name: "dex", type: "string" },
            { name: "token", type: "string" },
            { name: "amount", type: "string" },
            { name: "toPerp", type: "bool" },
            { name: "nonce", type: "uint64" },
        ],
    },
    spotSend: {
        "HyperliquidTransaction:SpotSend": [
            { name: "hyperliquidChain", type: "string" },
            { name: "destination", type: "string" },
            { name: "token", type: "string" },
            { name: "amount", type: "string" },
            { name: "time", type: "uint64" },
        ],
    },
    tokenDelegate: {
        "HyperliquidTransaction:TokenDelegate": [
            { name: "hyperliquidChain", type: "string" },
            { name: "validator", type: "address" },
            { name: "wei", type: "uint64" },
            { name: "isUndelegate", type: "bool" },
            { name: "nonce", type: "uint64" },
        ],
    },
    usdClassTransfer: {
        "HyperliquidTransaction:UsdClassTransfer": [
            { name: "hyperliquidChain", type: "string" },
            { name: "amount", type: "string" },
            { name: "toPerp", type: "bool" },
            { name: "nonce", type: "uint64" },
        ],
    },
    usdSend: {
        "HyperliquidTransaction:UsdSend": [
            { name: "hyperliquidChain", type: "string" },
            { name: "destination", type: "string" },
            { name: "amount", type: "string" },
            { name: "time", type: "uint64" },
        ],
    },
    withdraw3: {
        "HyperliquidTransaction:Withdraw": [
            { name: "hyperliquidChain", type: "string" },
            { name: "destination", type: "string" },
            { name: "amount", type: "string" },
            { name: "time", type: "uint64" },
        ],
    },
};
