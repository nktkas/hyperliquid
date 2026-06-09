/**
 * L1 (phantom-agent) signing for trading actions.
 * @module
 */

import { keccak_256 } from "@noble/hashes/sha3.js";
import { bytesToHex, concatBytes, hexToBytes } from "@noble/hashes/utils.js";
import { encode as encodeMsgpack, type ValueType } from "@std/msgpack/encode";
import { type AbstractWallet, type Signature, signTypedData } from "./_abstractWallet.ts";
import { trimSignature } from "./_multiSig.ts";

/**
 * Creates a hash of the L1 action.
 *
 * @param args The action and metadata to hash.
 * @return The keccak256 hash as a hex string.
 *
 * @example
 * ```ts
 * import { createL1ActionHash } from "@nktkas/hyperliquid/signing";
 *
 * const action = { type: "cancel", cancels: [{ a: 0, o: 12345 }] };
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

  const actionBytes = encodeMsgpack(adjust(action as ValueType));
  const nonceBytes = toUint64Bytes(nonce);
  const vaultMarker = vaultAddress ? new Uint8Array([1]) : new Uint8Array([0]);
  const vaultBytes = vaultAddress ? hexToBytes(vaultAddress.slice(2)) : new Uint8Array();
  const expiresMarker = expiresAfter !== undefined ? new Uint8Array([0]) : new Uint8Array();
  const expiresBytes = expiresAfter !== undefined ? toUint64Bytes(expiresAfter) : new Uint8Array();

  const bytes = concatBytes(actionBytes, nonceBytes, vaultMarker, vaultBytes, expiresMarker, expiresBytes);
  return `0x${bytesToHex(keccak_256(bytes))}`;
}

/**
 * Normalizes a value into a shape that `@std/msgpack` encodes the way Hyperliquid expects on the wire:
 * - drops `undefined` properties (otherwise the encoder throws)
 * - widens `number`s outside the int32 range to `BigInt` (otherwise they would be encoded as float64 instead of int64)
 */
function adjust(value: ValueType): ValueType {
  if (Array.isArray(value)) return value.map(adjust);
  if (typeof value === "object" && value !== null) {
    const result: Record<string, ValueType> = {};
    for (const key in value) {
      const entry = value[key];
      if (entry !== undefined) result[key] = adjust(entry);
    }
    return result;
  }
  if (
    typeof value === "number" && Number.isInteger(value) &&
    (value >= 0x100000000 || value < -0x80000000)
  ) {
    return BigInt(value);
  }
  return value;
}

function toUint64Bytes(n: bigint | number): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(n));
  return bytes;
}

/**
 * Signs an L1 action.
 *
 * @param args The wallet, action, and signing parameters.
 * @return The ECDSA signature.
 *
 * @throws {AbstractWalletError} If signing fails.
 *
 * @example
 * ```ts
 * import { signL1Action } from "@nktkas/hyperliquid/signing";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // `viem` or `ethers` or any `AbstractWallet`
 *
 * const action = { type: "cancel", cancels: [{ a: 0, o: 12345 }] };
 * const nonce = Date.now();
 *
 * const signature = await signL1Action({ wallet, action, nonce });
 * ```
 *
 * @example
 * \- Full cycle of signing and sending an L1 action to the Hyperliquid API
 * ```ts
 * import { canonicalize, signL1Action } from "@nktkas/hyperliquid/signing";
 * import { CancelRequest } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // `viem` or `ethers` or any `AbstractWallet`
 *
 * //             For correct hashing, keys in the L1 action must be in
 * //             the same order as in the schema definition
 * //             ⌄⌄⌄⌄⌄⌄⌄⌄⌄
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
export async function signL1Action<TAction extends Record<string, unknown> | unknown[]>(args: {
  /** Wallet to sign the action. */
  wallet: AbstractWallet;
  /** The action to be signed (hash depends on key order). */
  action: TAction;
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
    domain: {
      name: "Exchange",
      version: "1",
      chainId: 1337,
      verifyingContract: "0x0000000000000000000000000000000000000000",
    },
    types: {
      Agent: [
        { name: "source", type: "string" },
        { name: "connectionId", type: "bytes32" },
      ],
    },
    primaryType: "Agent",
    message: {
      source: isTestnet ? "b" : "a",
      connectionId: actionHash,
    },
  });
}

/**
 * Signs an inner per-signer contribution to a multi-sig L1 action.
 *
 * Signs `[multiSigUser, outerSigner, action]` with both addresses lowercased;
 * the returned signature is trimmed for inclusion in the multi-sig wrapper.
 *
 * @param args The signer, action, and signing parameters.
 * @return The trimmed ECDSA signature.
 *
 * @throws {AbstractWalletError} If signing fails.
 */
export async function signL1Inner(args: {
  /** Inner signer (one of the multi-sig authorized users). */
  signer: AbstractWallet;
  /** The action to be authorized. */
  action: Record<string, unknown> | unknown[];
  /** The multi-sig account address. */
  multiSigUser: `0x${string}`;
  /** The leader address (address of the wallet that signs the outer wrapper). */
  outerSigner: `0x${string}`;
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
  const signature = await signL1Action({
    wallet: args.signer,
    action: [
      args.multiSigUser.toLowerCase(),
      args.outerSigner.toLowerCase(),
      args.action,
    ],
    nonce: args.nonce,
    isTestnet: args.isTestnet,
    vaultAddress: args.vaultAddress,
    expiresAfter: args.expiresAfter,
  });
  return trimSignature(signature);
}
