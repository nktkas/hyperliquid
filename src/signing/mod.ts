/**
 * This module contains functions for generating Hyperliquid transaction signatures.
 *
 * @example Signing an L1 action
 * ```ts
 * import { signL1Action } from "@nktkas/hyperliquid/signing";
 * import { CancelRequest, parser } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 *
 * const action = parser(CancelRequest.entries.action)({ // for correct signature generation
 *   type: "cancel",
 *   cancels: [
 *     { a: 0, o: 12345 },
 *   ],
 * });
 * const nonce = Date.now();
 *
 * const signature = await signL1Action({ wallet, action, nonce });
 *
 * // Send the signed action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ action, signature, nonce }),
 * });
 * const body = await response.json();
 * ```
 *
 * @example Signing a user-signed action
 * ```ts
 * import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
 * import { ApproveAgentRequest, ApproveAgentTypes, parser } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 *
 * const action = parser(ApproveAgentRequest.entries.action)({ // for correct signature generation
 *   type: "approveAgent",
 *   signatureChainId: "0x66eee",
 *   hyperliquidChain: "Mainnet",
 *   agentAddress: "0x...",
 *   agentName: "Agent",
 *   nonce: Date.now(),
 * });
 *
 * const signature = await signUserSignedAction({ wallet, action, types: ApproveAgentTypes });
 *
 * // Send the signed action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ action, signature, nonce: action.nonce }),
 * });
 * const body = await response.json();
 * ```
 *
 * @example Signing a multi-signature action
 * ```ts
 * import { signL1Action, signMultiSigAction } from "@nktkas/hyperliquid/signing";
 * import { MultiSigRequest, parser, ScheduleCancelRequest } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const multiSigUser = "0x...";
 *
 * const action = parser(ScheduleCancelRequest.entries.action)({ // for correct signature generation
 *   type: "scheduleCancel",
 *   time: Date.now() + 10000,
 * });
 * const nonce = Date.now();
 *
 * // Create the required number of signatures
 * const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
 *   return await signL1Action({
 *     wallet: privateKeyToAccount(signerPrivKey as `0x${string}`), // viem or ethers
 *     action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), action],
 *     nonce,
 *   });
 * }));
 *
 * // // or user-signed action
 * // const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
 * //   return await signUserSignedAction({
 * //     wallet: privateKeyToAccount(signerPrivKey as `0x${string}`), // viem or ethers
 * //     action: {
 * //       ...action,
 * //       payloadMultiSigUser: multiSigUser,
 * //       outerSigner: wallet.address,
 * //     },
 * //     types: SomeTypes,
 * //   });
 * // }));
 *
 * // Then use signatures in the multi-sig action
 * const multiSigAction = parser(MultiSigRequest.entries.action)({
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
 *   body: JSON.stringify({ action: multiSigAction, signature: multiSigSignature, nonce }),
 * });
 * const body = await response.json();
 * ```
 *
 * @module
 */

import { keccak_256 } from "@noble/hashes/sha3.js";
import { bytesToHex, concatBytes, hexToBytes } from "@noble/hashes/utils.js";
import { encode as encodeMsgpack } from "@msgpack/msgpack";
import { type AbstractWallet, type Signature, signTypedData } from "./_signTypedData.ts";

export {
  type AbstractEthersV5Signer,
  type AbstractEthersV6Signer,
  type AbstractViemJsonRpcAccount,
  type AbstractViemLocalAccount,
  getWalletAddress,
  getWalletChainId,
} from "./_signTypedData.ts";
export type { AbstractWallet, Signature };

/**
 * Create a hash of the L1 action.
 * @example
 * ```ts
 * import { createL1ActionHash } from "@nktkas/hyperliquid/signing";
 * import { CancelRequest, parser } from "@nktkas/hyperliquid/api/exchange";
 *
 * const action = parser(CancelRequest.entries.action)({ // for correct signature generation
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
export function createL1ActionHash(args: {
  /** The action to be hashed (hash depends on key order). */
  action: Record<string, unknown> | unknown[];
  /** The current timestamp in ms. */
  nonce: number;
  /** Optional vault address used in the action. */
  vaultAddress?: `0x${string}`;
  /** Optional expiration time of the action in ms since the epoch. */
  expiresAfter?: number;
}): `0x${string}` {
  const { action, nonce, vaultAddress, expiresAfter } = args;

  // 1. Action
  const actionBytes = encodeMsgpack(action, { ignoreUndefined: true });

  // 2. Nonce
  const nonceBytes = toUint64Bytes(nonce);

  // 3. Vault address
  const vaultMarker = vaultAddress ? new Uint8Array([1]) : new Uint8Array([0]);
  const vaultBytes = vaultAddress ? hexToBytes(vaultAddress.slice(2)) : new Uint8Array();

  // 4. Expires after
  const expiresMarker = expiresAfter !== undefined ? new Uint8Array([0]) : new Uint8Array();
  const expiresBytes = expiresAfter !== undefined ? toUint64Bytes(expiresAfter) : new Uint8Array();

  // Create a hash
  const bytes = concatBytes(
    actionBytes,
    nonceBytes,
    vaultMarker,
    vaultBytes,
    expiresMarker,
    expiresBytes,
  );
  const hash = keccak_256(bytes);
  return `0x${bytesToHex(hash)}`;
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
 * import { signL1Action } from "@nktkas/hyperliquid/signing";
 * import { CancelRequest, parser } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 *
 * const action = parser(CancelRequest.entries.action)({ // for correct signature generation
 *   type: "cancel",
 *   cancels: [
 *     { a: 0, o: 12345 },
 *   ],
 * });
 * const nonce = Date.now();
 *
 * const signature = await signL1Action({ wallet, action, nonce });
 *
 * // Send the signed action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ action, signature, nonce }),
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
  vaultAddress?: `0x${string}`;
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
 * import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
 * import { ApproveAgentRequest, ApproveAgentTypes, parser } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 *
 * const action = parser(ApproveAgentRequest.entries.action)({ // for correct signature generation
 *   type: "approveAgent",
 *   signatureChainId: "0x66eee",
 *   hyperliquidChain: "Mainnet",
 *   agentAddress: "0x...",
 *   agentName: "Agent",
 *   nonce: Date.now(),
 * });
 *
 * const signature = await signUserSignedAction({ wallet, action, types: ApproveAgentTypes });
 *
 * // Send the signed action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ action, signature, nonce: action.nonce }),
 * });
 * const body = await response.json();
 * ```
 */
export async function signUserSignedAction(args: {
  /** Wallet to sign the action. */
  wallet: AbstractWallet;
  /** The action to be signed (hex strings must be in lower case). */
  action:
    & {
      signatureChainId: `0x${string}`;
      [key: string]: unknown;
    }
    // special case for multi-sign payload
    & (
      | { payloadMultiSigUser: `0x${string}`; outerSigner: `0x${string}` }
      | { payloadMultiSigUser?: undefined; outerSigner?: undefined }
    );
  /** The types of the action (hash depends on key order). */
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
}): Promise<Signature> {
  let { wallet, action, types } = args;

  if (action.type === "approveAgent" && !action.agentName) { // special case for `approveAgent`
    action = { ...action, agentName: "" }; // set to empty string instead of null
  }
  if ("payloadMultiSigUser" in action && "outerSigner" in action) { // special case for multi-sign payload
    types = structuredClone(types); // for safe mutation
    Object.values(types)[0].splice( // array mutation
      1, // after `hyperliquidChain`
      0, // do not remove any elements
      { name: "payloadMultiSigUser", type: "address" },
      { name: "outerSigner", type: "address" },
    );
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
 * import { signL1Action, signMultiSigAction } from "@nktkas/hyperliquid/signing";
 * import { MultiSigRequest, parser, ScheduleCancelRequest } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const multiSigUser = "0x...";
 *
 * const nonce = Date.now();
 * const action = parser(ScheduleCancelRequest.entries.action)({ // for correct signature generation
 *   type: "scheduleCancel",
 *   time: Date.now() + 10000,
 * });
 *
 * // Create the required number of signatures
 * const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
 *   return await signL1Action({
 *     wallet: privateKeyToAccount(signerPrivKey as `0x${string}`), // viem or ethers
 *     action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), action],
 *     nonce,
 *   });
 * }));
 *
 * // // or user-signed action
 * // const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
 * //   return await signUserSignedAction({
 * //     wallet: privateKeyToAccount(signerPrivKey as `0x${string}`), // viem or ethers
 * //     action: {
 * //       ...action,
 * //       payloadMultiSigUser: multiSigUser,
 * //       outerSigner: wallet.address,
 * //     },
 * //     types: SomeTypes,
 * //   });
 * // }));
 *
 * // Then use signatures in the multi-sig action
 * const multiSigAction = parser(MultiSigRequest.entries.action)({
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
 *   body: JSON.stringify({ action: multiSigAction, signature: multiSigSignature, nonce }),
 * });
 * const body = await response.json();
 * ```
 */
export async function signMultiSigAction(args: {
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
}): Promise<Signature> {
  let {
    wallet,
    action,
    nonce,
    isTestnet = false,
    vaultAddress,
    expiresAfter,
  } = args;

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
