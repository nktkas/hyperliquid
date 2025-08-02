/**
 * This module contains functions for generating Hyperliquid transaction signatures
 * and interfaces to various wallet implementations.
 *
 * @example Signing an L1 action
 * ```ts
 * import { actionSorter, signL1Action } from "@nktkas/hyperliquid/signing";
 *
 * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
 *
 * const action = actionSorter.cancel({
 *   type: "cancel",
 *   cancels: [
 *     { a: 0, o: 12345 },
 *   ],
 * });
 * const nonce = Date.now();
 *
 * const signature = await signL1Action({ wallet: privateKey, action, nonce });
 *
 * // Send the signed action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ action, signature, nonce }), // recommended to send the same formatted action
 * });
 * const body = await response.json();
 * ```
 *
 * @example Signing a user-signed action
 * ```ts
 * import { actionSorter, signUserSignedAction, userSignedActionEip712Types } from "@nktkas/hyperliquid/signing";
 *
 * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
 *
 * const action = actionSorter.approveAgent({
 *   type: "approveAgent",
 *   signatureChainId: "0x66eee",
 *   hyperliquidChain: "Mainnet",
 *   agentAddress: "0x...",
 *   agentName: "Agent",
 *   nonce: Date.now(),
 * });
 *
 * const signature = await signUserSignedAction({
 *   wallet: privateKey,
 *   action,
 *   types: userSignedActionEip712Types[action.type],
 * });
 *
 * // Send the signed action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ action, signature, nonce: action.nonce }), // recommended to send the same formatted action
 * });
 * const body = await response.json();
 * ```
 *
 * @example Signing a multi-signature action
 * ```ts
 * import { actionSorter, signL1Action, signMultiSigAction } from "@nktkas/hyperliquid/signing";
 * import { privateKeyToAccount } from "viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // or `ethers`, private key directly
 * const multiSigUser = "0x...";
 *
 * const action = actionSorter.scheduleCancel({
 *   type: "scheduleCancel",
 *   time: Date.now() + 10000,
 * });
 * const nonce = Date.now();
 *
 * // Create the required number of signatures
 * const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
 *   return await signL1Action({
 *     wallet: signerPrivKey as `0x${string}`,
 *     action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), action],
 *     nonce,
 *   });
 * }));
 *
 * // or user-signed action
 * // const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
 * //   return await signUserSignedAction({
 * //     wallet: signerPrivKey as `0x${string}`,
 * //     action: {
 * //       ...action,
 * //       payloadMultiSigUser: multiSigUser,
 * //       outerSigner: wallet.address,
 * //     },
 * //     types: userSignedActionEip712Types[action.type],
 * //   });
 * // }));
 *
 * // Then use signatures in the multi-sig action
 * const multiSigAction = actionSorter.multiSig({
 *   type: "multiSig",
 *   signatureChainId: "0x66eee",
 *   signatures,
 *   payload: {
 *     multiSigUser,
 *     outerSigner: wallet.address,
 *     action,
 *   },
 * });
 * const multiSigSignature = await signMultiSigAction({ wallet, action: multiSigAction, nonce });
 *
 * // Send the multi-sig action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ action: multiSigAction, signature: multiSigSignature, nonce }), // recommended to send the same formatted action
 * });
 * const body = await response.json();
 * ```
 *
 * @module
 */
import { type AbstractWallet, getWalletAddress, getWalletChainId, type Signature } from "./_signTypedData/mod.js";
import { actionSorter, userSignedActionEip712Types } from "./_sorter.js";
export { type AbstractWallet, actionSorter, getWalletAddress, getWalletChainId, type Signature, userSignedActionEip712Types, };
/**
 * Create a hash of the L1 action.
 * @example
 * ```ts
 * import { actionSorter, createL1ActionHash } from "@nktkas/hyperliquid/signing";
 *
 * const action = actionSorter.cancel({
 *   type: "cancel",
 *   cancels: [
 *     { a: 0, o: 12345 },
 *   ],
 * });
 * const nonce = Date.now();
 *
 * const actionHash = createL1ActionHash({ action, nonce });
 * ```
 */
export declare function createL1ActionHash(args: {
    /** The action to be hashed (hash depends on key order). */
    action: Record<string, unknown> | unknown[];
    /** The current timestamp in ms. */
    nonce: number;
    /** Optional vault address used in the action. */
    vaultAddress?: `0x${string}`;
    /** Optional expiration time of the action in ms since the epoch. */
    expiresAfter?: number;
}): `0x${string}`;
/**
 * Sign an L1 action.
 * @example
 * ```ts
 * import { actionSorter, signL1Action } from "@nktkas/hyperliquid/signing";
 *
 * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
 *
 * const action = actionSorter.cancel({
 *   type: "cancel",
 *   cancels: [
 *     { a: 0, o: 12345 },
 *   ],
 * });
 * const nonce = Date.now();
 *
 * const signature = await signL1Action({ wallet: privateKey, action, nonce });
 *
 * // Send the signed action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ action, signature, nonce }), // recommended to send the same formatted action
 * });
 * const body = await response.json();
 * ```
 */
export declare function signL1Action(args: {
    /** Wallet to sign the action. */
    wallet: AbstractWallet;
    /** The action to be signed (hash depends on key order). */
    action: Record<string, unknown> | unknown[];
    /** The current timestamp in ms. */
    nonce: number;
    /** Indicates if the action is for the testnet. (default: false) */
    isTestnet?: boolean;
    /** Optional vault address used in the action. */
    vaultAddress?: `0x${string}`;
    /** Optional expiration time of the action in ms since the epoch. */
    expiresAfter?: number;
}): Promise<Signature>;
/**
 * Sign a user-signed action.
 * @example
 * ```ts
 * import { actionSorter, signUserSignedAction, userSignedActionEip712Types } from "@nktkas/hyperliquid/signing";
 *
 * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
 *
 * const action = actionSorter.approveAgent({
 *   type: "approveAgent",
 *   signatureChainId: "0x66eee",
 *   hyperliquidChain: "Mainnet",
 *   agentAddress: "0x...",
 *   agentName: "Agent",
 *   nonce: Date.now(),
 * });
 *
 * const signature = await signUserSignedAction({
 *   wallet: privateKey,
 *   action,
 *   types: userSignedActionEip712Types[action.type],
 * });
 *
 * // Send the signed action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ action, signature, nonce: action.nonce }), // recommended to send the same formatted action
 * });
 * const body = await response.json();
 * ```
 */
export declare function signUserSignedAction(args: {
    /** Wallet to sign the action. */
    wallet: AbstractWallet;
    /** The action to be signed (hex strings must be in lower case). */
    action: {
        signatureChainId: `0x${string}`;
        [key: string]: unknown;
    } & ({
        payloadMultiSigUser: `0x${string}`;
        outerSigner: `0x${string}`;
    } | {
        payloadMultiSigUser?: undefined;
        outerSigner?: undefined;
    });
    /** The types of the action (hash depends on key order). */
    types: {
        [key: string]: {
            name: string;
            type: string;
        }[];
    };
}): Promise<Signature>;
/**
 * Sign a multi-signature action.
 * @example
 * ```ts
 * import { actionSorter, signL1Action, signMultiSigAction } from "@nktkas/hyperliquid/signing";
 * import { privateKeyToAccount } from "viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // or ethers, private key directly
 * const multiSigUser = "0x...";
 *
 * const action = actionSorter.scheduleCancel({
 *   type: "scheduleCancel",
 *   time: Date.now() + 10000,
 * });
 * const nonce = Date.now();
 *
 * // Create the required number of signatures
 * const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
 *   return await signL1Action({
 *     wallet: signerPrivKey as `0x${string}`,
 *     action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), action],
 *     nonce,
 *   });
 * }));
 *
 * // or user-signed action
 * // const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
 * //   return await signUserSignedAction({
 * //     wallet: signerPrivKey as `0x${string}`,
 * //     action: {
 * //       ...action,
 * //       payloadMultiSigUser: multiSigUser,
 * //       outerSigner: wallet.address,
 * //     },
 * //     types: userSignedActionEip712Types[action.type],
 * //   });
 * // }));
 *
 * // Then use signatures in the multi-sig action
 * const multiSigAction = actionSorter.multiSig({
 *   type: "multiSig",
 *   signatureChainId: "0x66eee",
 *   signatures,
 *   payload: {
 *     multiSigUser,
 *     outerSigner: wallet.address,
 *     action,
 *   },
 * });
 * const multiSigSignature = await signMultiSigAction({ wallet, action: multiSigAction, nonce });
 *
 * // Send the multi-sig action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ action: multiSigAction, signature: multiSigSignature, nonce }), // recommended to send the same formatted action
 * });
 * const body = await response.json();
 * ```
 */
export declare function signMultiSigAction(args: {
    /** Wallet to sign the action. */
    wallet: AbstractWallet;
    /** The action to be signed (hash depends on key order). */
    action: {
        signatureChainId: `0x${string}`;
        [key: string]: unknown;
    };
    /** The current timestamp in ms. */
    nonce: number;
    /** Indicates if the action is for the testnet. (default: false) */
    isTestnet?: boolean;
    /** Optional vault address used in the action. */
    vaultAddress?: `0x${string}`;
    /** Optional expiration time of the action in ms since the epoch. */
    expiresAfter?: number;
}): Promise<Signature>;
//# sourceMappingURL=mod.d.ts.map