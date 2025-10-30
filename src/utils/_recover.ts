import { keccak_256 } from "@noble/hashes/sha3.js";
import * as secp from "@noble/secp256k1";
import { createL1ActionHash, type Signature } from "../signing/mod.ts";
import { hashTypedData } from "./_eip712.ts";

/**
 * Recover the Ethereum address that signed an L1 action.
 * @example
 * ```ts
 * import { recoverUserFromL1Action } from "@nktkas/hyperliquid/utils";
 *
 * const action = {
 *   type: "cancel",
 *   cancels: [{ a: 0, o: 12345 }],
 * };
 * const nonce = 1700000000000;
 * const signature = {
 *   r: "0x...",
 *   s: "0x...",
 *   v: 27,
 * } as const;
 *
 * const address = await recoverUserFromL1Action({ action, nonce, signature });
 * console.log(`Signer address: ${address}`);
 * ```
 */
export async function recoverUserFromL1Action(params: {
  /** The action that was signed (hash depends on key order). */
  action: Record<string, unknown>;
  /** The timestamp in ms used when signing. */
  nonce: number;
  /** The signature to recover the address from. */
  signature: Signature;
  /** Indicates if the action is for the testnet. (default: false) */
  isTestnet?: boolean;
  /** Optional vault address used in the action. */
  vaultAddress?: `0x${string}`;
  /** Optional expiration time in ms used in the action. */
  expiresAfter?: number;
}): Promise<`0x${string}`> {
  const {
    action,
    signature,
    nonce,
    isTestnet = false,
    vaultAddress,
    expiresAfter,
  } = params;

  // 1. Create the action hash
  const actionHash = createL1ActionHash({ action, nonce, vaultAddress, expiresAfter });

  // 2. Hash the typed data according to EIP-712
  const hash = hashTypedData({
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

  // 3. Convert signature to recovery format (v, r, s)
  const sigr = secp.etc.concatBytes(
    new Uint8Array([signature.v - 27]),
    secp.etc.hexToBytes(signature.r.slice(2)),
    secp.etc.hexToBytes(signature.s.slice(2)),
  );

  // 4. Recover the public key from the signature and hash
  const compressedPubKey = await secp.recoverPublicKeyAsync(sigr, hash, { prehash: false });
  const uncompressedPubKey = secp.Point.fromBytes(compressedPubKey).toBytes(false);

  // 5. Convert the public key to an Ethereum address
  return publicKeyToAddress(uncompressedPubKey);
}

/**
 * Recover the Ethereum address that signed a user-signed action.
 * @example
 * ```ts
 * import { recoverUserFromUserSigned } from "@nktkas/hyperliquid/utils";
 *
 * const action = {
 *   type: "approveAgent",
 *   signatureChainId: "0x66eee" as const,
 *   hyperliquidChain: "Mainnet",
 *   agentAddress: "0x...",
 *   agentName: "Agent",
 *   nonce: 1700000000000,
 * };
 * const types = {
 *   HyperliquidTransaction: [
 *     { name: "hyperliquidChain", type: "string" },
 *     // ... other fields
 *   ],
 * };
 * const signature = {
 *   r: "0x...",
 *   s: "0x...",
 *   v: 27,
 * } as const;
 *
 * const address = await recoverUserFromUserSigned({ action, types, signature });
 * console.log(`Signer address: ${address}`);
 * ```
 */
export async function recoverUserFromUserSigned(params: {
  /** The action that was signed (hex strings must be in lower case). */
  action:
    & {
      signatureChainId: `0x${string}`;
      [key: string]: unknown;
    }
    & (
      | { nonce: number; time?: undefined }
      | { time: number; nonce?: undefined }
    );
  /** The types of the action (hash depends on key order). */
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
  /** The signature to recover the address from. */
  signature: Signature;
}): Promise<`0x${string}`> {
  const { action, types, signature } = params;

  // 1. Hash the typed data according to EIP-712
  const hash = hashTypedData({
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

  // 2. Convert signature to recovery format (v, r, s)
  const sigr = secp.etc.concatBytes(
    new Uint8Array([signature.v - 27]),
    secp.etc.hexToBytes(signature.r.slice(2)),
    secp.etc.hexToBytes(signature.s.slice(2)),
  );

  // 3. Recover the public key from the signature and hash
  const compressedPubKey = await secp.recoverPublicKeyAsync(sigr, hash, { prehash: false });
  const uncompressedPubKey = secp.Point.fromBytes(compressedPubKey).toBytes(false);

  // 4. Convert the public key to an Ethereum address
  return publicKeyToAddress(uncompressedPubKey);
}

/** Convert a public key to an Ethereum address. */
function publicKeyToAddress(publicKey: Uint8Array): `0x${string}` {
  // Remove the 0x04 prefix from uncompressed public key
  const publicKeyWithoutPrefix = publicKey.slice(1);
  // Hash the public key and take the last 20 bytes as the address
  const hash = keccak_256(publicKeyWithoutPrefix);
  const addressBytes = hash.slice(-20);
  return `0x${secp.etc.bytesToHex(addressBytes)}`;
}
