/**
 * Low-level utilities for signing Hyperliquid transactions.
 *
 * @example Signing an L1 action
 * ```ts
 * import { canonicalize, signL1Action } from "@nktkas/hyperliquid/signing";
 * import { CancelRequest } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers or any AbstractWallet
 *
 * const action = canonicalize(CancelRequest.entries.action, {
 *   type: "cancel",
 *   cancels: [{ a: 0, o: 12345 }],
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
 * import { canonicalize, signUserSignedAction } from "@nktkas/hyperliquid/signing";
 * import { ApproveAgentRequest, ApproveAgentTypes } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers or any AbstractWallet
 *
 * const action = canonicalize(ApproveAgentRequest.entries.action, {
 *   type: "approveAgent",
 *   signatureChainId: "0x66eee" as const,
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
 * @module
 */

import { keccak_256 } from "@noble/hashes/sha3.js";
import { bytesToHex, concatBytes, hexToBytes } from "@noble/hashes/utils.js";
import { encode as encodeMsgpack, type ValueType } from "@std/msgpack/encode";
import { type AbstractWallet, type Signature, signTypedData } from "./_abstractWallet.ts";

export {
  type AbstractEthersV5Signer,
  type AbstractEthersV6Signer,
  type AbstractViemJsonRpcAccount,
  type AbstractViemLocalAccount,
  type AbstractWallet,
  AbstractWalletError,
  getWalletAddress,
  getWalletChainId,
  type Signature,
} from "./_abstractWallet.ts";
export { canonicalize, CanonicalizeError } from "./_canonicalize.ts";

// ============================================================
// EIP-712 Constants
// ============================================================

/** Zero address used as verifyingContract in EIP-712 domains. */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

/** EIP-712 domain for L1 actions. */
const L1_DOMAIN = {
  name: "Exchange",
  version: "1",
  chainId: 1337,
  verifyingContract: ZERO_ADDRESS,
} as const;

/** EIP-712 types for L1 actions. */
const L1_TYPES = {
  Agent: [
    { name: "source", type: "string" },
    { name: "connectionId", type: "bytes32" },
  ],
};

/** EIP-712 domain name for user-signed and multi-sig actions. */
const USER_SIGNED_DOMAIN_NAME = "HyperliquidSignTransaction" as const;

/** EIP-712 types for multi-sig wrapper actions. */
const MULTI_SIG_TYPES = {
  "HyperliquidTransaction:SendMultiSig": [
    { name: "hyperliquidChain", type: "string" },
    { name: "multiSigActionHash", type: "bytes32" },
    { name: "nonce", type: "uint64" },
  ],
};

// ============================================================
// Hashing
// ============================================================

/**
 * Creates a hash of the L1 action.
 *
 * @param args The action and metadata to hash
 * @return The keccak256 hash as a hex string
 *
 * @example
 * ```ts
 * import { canonicalize, createL1ActionHash } from "@nktkas/hyperliquid/signing";
 * import { CancelRequest } from "@nktkas/hyperliquid/api/exchange";
 *
 * const action = canonicalize(CancelRequest.entries.action, {
 *   type: "cancel",
 *   cancels: [{ a: 0, o: 12345 }],
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
  const actionBytes = encodeMsgpack(
    largeIntToBigInt(
      removeUndefinedKeys(action as ValueType),
    ),
  );

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

function largeIntToBigInt(obj: ValueType): ValueType {
  if (typeof obj === "number" && Number.isInteger(obj) && (obj >= 0x100000000 || obj < -0x80000000)) {
    return BigInt(obj);
  }
  if (Array.isArray(obj)) return obj.map(largeIntToBigInt);
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, ValueType> = {};
    for (const key in obj) result[key] = largeIntToBigInt(obj[key]);
    return result;
  }
  return obj;
}

function removeUndefinedKeys(obj: ValueType): ValueType {
  if (Array.isArray(obj)) return obj.map(removeUndefinedKeys);
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, ValueType> = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = removeUndefinedKeys(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

// ============================================================
// Signing
// ============================================================

/**
 * Signs an L1 action.
 *
 * @param args The wallet, action, and signing parameters
 * @return The ECDSA signature components
 *
 * @throws {AbstractWalletError} If signing fails
 *
 * @example
 * ```ts
 * import { canonicalize, signL1Action } from "@nktkas/hyperliquid/signing";
 * import { CancelRequest } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers or any AbstractWallet
 *
 * const action = canonicalize(CancelRequest.entries.action, {
 *   type: "cancel",
 *   cancels: [{ a: 0, o: 12345 }],
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
  /**
   * Indicates if the action is for the testnet.
   *
   * Default: `false`
   */
  isTestnet?: boolean;
  /** Optional vault address used in the action. */
  vaultAddress?: `0x${string}`;
  /** Optional expiration time of the action in ms since the epoch. */
  expiresAfter?: number;
}): Promise<Signature> {
  const { wallet, action, nonce, isTestnet = false, vaultAddress, expiresAfter } = args;
  const actionHash = createL1ActionHash({ action, nonce, vaultAddress, expiresAfter });
  return await signTypedData({
    wallet,
    domain: L1_DOMAIN,
    types: L1_TYPES,
    primaryType: "Agent",
    message: {
      source: isTestnet ? "b" : "a",
      connectionId: actionHash,
    },
  });
}

/**
 * Signs a user-signed action.
 *
 * @param args The wallet, action, and EIP-712 types
 * @return The ECDSA signature components
 *
 * @throws {AbstractWalletError} If signing fails
 *
 * @example
 * ```ts
 * import { canonicalize, signUserSignedAction } from "@nktkas/hyperliquid/signing";
 * import { ApproveAgentRequest, ApproveAgentTypes } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers or any AbstractWallet
 *
 * const action = canonicalize(ApproveAgentRequest.entries.action, {
 *   type: "approveAgent",
 *   signatureChainId: "0x66eee" as const,
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
  action: {
    signatureChainId: `0x${string}`;
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
      name: USER_SIGNED_DOMAIN_NAME,
      version: "1",
      chainId: parseInt(action.signatureChainId),
      verifyingContract: ZERO_ADDRESS,
    },
    types,
    primaryType: Object.keys(types)[0],
    message: action,
  });
}

/**
 * Signs a multi-signature action wrapper with the leader signer.
 *
 * @param args The wallet, action, and signing parameters
 * @return The ECDSA signature components
 *
 * @throws {AbstractWalletError} If signing fails
 *
 * @example
 * ```ts
 * import { canonicalize, signL1Action, signMultiSigAction, trimSignature } from "@nktkas/hyperliquid/signing";
 * import { ScheduleCancelRequest } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers or any AbstractWallet
 * const multiSigUser = "0x...";
 *
 * const action = canonicalize(ScheduleCancelRequest.entries.action, {
 *   type: "scheduleCancel",
 *   time: Date.now() + 10000,
 * });
 * const nonce = Date.now();
 *
 * // Create the required number of signatures
 * const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
 *   const sig = await signL1Action({
 *     wallet: privateKeyToAccount(signerPrivKey as `0x${string}`), // viem or ethers or any AbstractWallet
 *     action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), action], // hex strings must be in lower case
 *     nonce,
 *   });
 *   return trimSignature(sig);
 * }));
 *
 * // Then use signatures in the multi-sig action
 * const multiSigAction = {
 *   type: "multiSig",
 *   signatureChainId: "0x66eee" as const,
 *   signatures,
 *   payload: {
 *     multiSigUser,
 *     outerSigner: wallet.address,
 *     action,
 *   },
 * };
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
  /**
   * Indicates if the action is for the testnet.
   *
   * Default: `false`
   */
  isTestnet?: boolean;
  /** Optional vault address used in the action. */
  vaultAddress?: `0x${string}`;
  /** Optional expiration time of the action in ms since the epoch. */
  expiresAfter?: number;
}): Promise<Signature> {
  const { wallet, action, nonce, isTestnet = false, vaultAddress, expiresAfter } = args;

  // Remove 'type' field from action (destructure to exclude it)
  const { type: _, ...actionWithoutType } = action;

  const actionHash = createL1ActionHash({ action: actionWithoutType, nonce, vaultAddress, expiresAfter });
  return await signTypedData({
    wallet,
    domain: {
      name: USER_SIGNED_DOMAIN_NAME,
      version: "1",
      chainId: parseInt(actionWithoutType.signatureChainId),
      verifyingContract: ZERO_ADDRESS,
    },
    types: MULTI_SIG_TYPES,
    primaryType: "HyperliquidTransaction:SendMultiSig",
    message: {
      hyperliquidChain: isTestnet ? "Testnet" : "Mainnet",
      multiSigActionHash: actionHash,
      nonce,
    },
  });
}

// ============================================================
// Multi-sig Orchestration
// ============================================================

/**
 * Signs an L1 action with multi-sig orchestration.
 *
 * Collects signatures from all signers, builds the multi-sig wrapper,
 * and signs the wrapper with the leader (first signer).
 *
 * @param args The signers, action, and signing parameters
 * @return A tuple of [multiSigAction, leaderSignature]
 *
 * @throws {AbstractWalletError} If signing fails
 */
export async function signMultiSigL1(args: {
  /** Array of wallets for multi-sig. First wallet is the leader. */
  signers: readonly [AbstractWallet, ...AbstractWallet[]];
  /** The multi-signature account address. */
  multiSigUser: `0x${string}`;
  /** The leader wallet address (outer signer). */
  outerSigner: `0x${string}`;
  /** Signature chain ID for EIP-712. */
  signatureChainId: `0x${string}`;
  /** The action payload. */
  action: Record<string, unknown>;
  /** The current timestamp in ms. */
  nonce: number;
  /**
   * Indicates if the action is for the testnet.
   *
   * Default: `false`
   */
  isTestnet?: boolean;
  /** Optional vault address used in the action. */
  vaultAddress?: `0x${string}`;
  /** Optional expiration time of the action in ms since the epoch. */
  expiresAfter?: number;
}): Promise<[Record<string, unknown>, Signature]> {
  const {
    signers,
    action,
    nonce,
    isTestnet = false,
    vaultAddress,
    expiresAfter,
    signatureChainId,
  } = args;
  const multiSigUser = args.multiSigUser.toLowerCase() as `0x${string}`;
  const outerSigner = args.outerSigner.toLowerCase() as `0x${string}`;

  // Collect trimmed signatures from all signers
  const signatures = await Promise.all(signers.map(async (signer) => {
    const signature = await signL1Action({
      wallet: signer,
      action: [multiSigUser, outerSigner, action],
      nonce,
      isTestnet,
      vaultAddress,
      expiresAfter,
    });
    return trimSignature(signature);
  }));

  // Build multi-sig action wrapper
  const multiSigAction = {
    type: "multiSig",
    signatureChainId,
    signatures,
    payload: { multiSigUser, outerSigner, action },
  };

  // Sign the wrapper with the leader
  const signature = await signMultiSigAction({
    wallet: signers[0],
    action: multiSigAction,
    nonce,
    isTestnet,
    vaultAddress,
    expiresAfter,
  });

  return [multiSigAction, signature];
}

/**
 * Signs a user-signed action (EIP-712) with multi-sig orchestration.
 *
 * Collects signatures from all signers (with multi-sig payload fields injected),
 * builds the multi-sig wrapper, and signs the wrapper with the leader.
 *
 * @param args The signers, action, types, and signing parameters
 * @return A tuple of [multiSigAction, leaderSignature]
 *
 * @throws {AbstractWalletError} If signing fails
 */
export async function signMultiSigUserSigned(args: {
  /** Array of wallets for multi-sig. First wallet is the leader. */
  signers: readonly [AbstractWallet, ...AbstractWallet[]];
  /** The multi-signature account address. */
  multiSigUser: `0x${string}`;
  /** The leader wallet address (outer signer). */
  outerSigner: `0x${string}`;
  /** The action payload (must include signatureChainId). */
  action: {
    signatureChainId: `0x${string}`;
    [key: string]: unknown;
  };
  /** EIP-712 type definitions. */
  types: { [key: string]: { name: string; type: string }[] };
  /** The current timestamp in ms. */
  nonce: number;
  /**
   * Indicates if the action is for the testnet.
   *
   * Default: `false`
   */
  isTestnet?: boolean;
}): Promise<[Record<string, unknown>, Signature]> {
  const {
    signers,
    action,
    types,
    nonce,
    isTestnet = false,
  } = args;
  const multiSigUser = args.multiSigUser.toLowerCase() as `0x${string}`;
  const outerSigner = args.outerSigner.toLowerCase() as `0x${string}`;

  // Inject multi-sig fields into types (after hyperliquidChain)
  const primaryType = Object.keys(types)[0];
  const primaryTypeArray = types[primaryType];
  const extendedTypes = {
    ...types,
    [primaryType]: [
      primaryTypeArray[0],
      { name: "payloadMultiSigUser", type: "address" },
      { name: "outerSigner", type: "address" },
      ...primaryTypeArray.slice(1),
    ],
  };

  // Collect trimmed signatures from all signers
  const signatures = await Promise.all(signers.map(async (signer) => {
    const signature = await signUserSignedAction({
      wallet: signer,
      action: { payloadMultiSigUser: multiSigUser, outerSigner, ...action },
      types: extendedTypes,
    });
    return trimSignature(signature);
  }));

  // Build multi-sig action wrapper
  const multiSigAction = {
    type: "multiSig",
    signatureChainId: action.signatureChainId,
    signatures,
    payload: { multiSigUser, outerSigner, action },
  };

  // Sign the wrapper with the leader
  const signature = await signMultiSigAction({
    wallet: signers[0],
    action: multiSigAction,
    nonce,
    isTestnet,
  });

  return [multiSigAction, signature];
}

// ============================================================
// Utilities
// ============================================================

/** Remove leading zeros from signature r,s components (required for multi-signature in Hyperliquid API). */
export function trimSignature(sig: Signature): Signature {
  return {
    r: sig.r.replace(/^0x0+/, "0x") as `0x${string}`,
    s: sig.s.replace(/^0x0+/, "0x") as `0x${string}`,
    v: sig.v,
  };
}
