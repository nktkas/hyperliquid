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
import { keccak_256 } from "@noble/hashes/sha3";
import { etc } from "@noble/secp256k1";
import { encode as encodeMsgpack } from "@msgpack/msgpack";
import { getWalletAddress, getWalletChainId, signTypedData, } from "./_signTypedData/mod.js";
import { actionSorter, userSignedActionEip712Types } from "./_sorter.js";
export { actionSorter, getWalletAddress, getWalletChainId, userSignedActionEip712Types, };
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
export function createL1ActionHash(args) {
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
    const bytes = etc.concatBytes(actionBytes, nonceBytes, vaultMarker, vaultBytes, expiresMarker, expiresBytes);
    const hash = keccak_256(bytes);
    return `0x${etc.bytesToHex(hash)}`;
}
function toUint64Bytes(n) {
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
export async function signL1Action(args) {
    const { wallet, action, nonce, isTestnet = false, vaultAddress, expiresAfter, } = args;
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
export async function signUserSignedAction(args) {
    let { wallet, action, types } = args;
    if (action.type === "approveAgent" && !action.agentName) { // special case for `approveAgent`
        action = { ...action, agentName: "" }; // set to empty string instead of null
    }
    if ("payloadMultiSigUser" in action && "outerSigner" in action) { // special case for multi-sign payload
        types = structuredClone(types); // for safe mutation
        Object.values(types)[0].splice(// array mutation
        1, // after `hyperliquidChain`
        0, // do not remove any elements
        { name: "payloadMultiSigUser", type: "address" }, { name: "outerSigner", type: "address" });
    }
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
export async function signMultiSigAction(args) {
    let { wallet, action, nonce, isTestnet = false, vaultAddress, expiresAfter, } = args;
    if ("type" in action) {
        action = structuredClone(action); // for safe mutation
        delete action.type;
    }
    const multiSigActionHash = createL1ActionHash({ action, nonce, vaultAddress, expiresAfter });
    const message = {
        hyperliquidChain: isTestnet ? "Testnet" : "Mainnet",
        multiSigActionHash,
        nonce,
    };
    return await signTypedData({
        wallet,
        domain: {
            name: "HyperliquidSignTransaction",
            version: "1",
            chainId: parseInt(action.signatureChainId),
            verifyingContract: "0x0000000000000000000000000000000000000000",
        },
        types: userSignedActionEip712Types.multiSig,
        primaryType: Object.keys(userSignedActionEip712Types.multiSig)[0],
        message,
    });
}
