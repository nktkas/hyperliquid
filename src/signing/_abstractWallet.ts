/**
 * Abstract wallet interfaces and signing utilities for EIP-712 typed data.
 * @module
 */

import { HyperliquidError } from "../_base.ts";

// ============================================================
// Common Types
// ============================================================

/** Common domain type for EIP-712 typed data signing. */
interface TypedDataDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
}

/** Common types structure for EIP-712 typed data. */
interface TypedDataTypes {
  [key: string]: { name: string; type: string }[];
}

// ============================================================
// Ethers V6
// ============================================================

/** Abstract interface for an {@link https://docs.ethers.org/v6/api/providers/#Signer | ethers.js v6}. */
export interface AbstractEthersV6Signer {
  signTypedData(
    domain: TypedDataDomain,
    types: TypedDataTypes,
    value: Record<string, unknown>,
  ): Promise<string>;
  getAddress(): Promise<string>;
  provider?:
    | { getNetwork(): Promise<{ chainId: number | bigint }> }
    | null;
}

function isEthersV6Signer(wallet: AbstractWallet): wallet is AbstractEthersV6Signer {
  return "signTypedData" in wallet && typeof wallet.signTypedData === "function" &&
    wallet.signTypedData.length === 3 &&
    "getAddress" in wallet && typeof wallet.getAddress === "function";
}

// ============================================================
// Ethers V5
// ============================================================

/** Abstract interface for an {@link https://docs.ethers.org/v5/api/signer/ | ethers.js v5}. */
export interface AbstractEthersV5Signer {
  _signTypedData(
    domain: TypedDataDomain,
    types: TypedDataTypes,
    value: Record<string, unknown>,
  ): Promise<string>;
  getAddress(): Promise<string>;
  provider?:
    | { getNetwork(): Promise<{ chainId: number | bigint }> }
    | null;
}

function isEthersV5Signer(wallet: AbstractWallet): wallet is AbstractEthersV5Signer {
  return "_signTypedData" in wallet && typeof wallet._signTypedData === "function" &&
    wallet._signTypedData.length === 3 &&
    "getAddress" in wallet && typeof wallet.getAddress === "function";
}

// ============================================================
// Viem
// ============================================================

/** Viem-style typed data parameters. */
interface ViemTypedDataParams {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: `0x${string}`;
  };
  types: TypedDataTypes;
  primaryType: string;
  message: Record<string, unknown>;
}

/** Abstract interface for a {@link https://viem.sh/docs/accounts/jsonRpc#json-rpc-account | viem JSON-RPC Account}. */
export interface AbstractViemJsonRpcAccount {
  signTypedData(params: ViemTypedDataParams, options?: unknown): Promise<`0x${string}`>;
  getAddresses(): Promise<`0x${string}`[]>;
  getChainId(): Promise<number>;
}

function isViemJsonRpcAccount(wallet: AbstractWallet): wallet is AbstractViemJsonRpcAccount {
  return "signTypedData" in wallet && typeof wallet.signTypedData === "function" &&
    (wallet.signTypedData.length === 1 || wallet.signTypedData.length === 2) &&
    "getAddresses" in wallet && typeof wallet.getAddresses === "function" &&
    "getChainId" in wallet && typeof wallet.getChainId === "function";
}

/** Abstract interface for a {@link https://viem.sh/docs/accounts/local | viem Local Account}. */
export interface AbstractViemLocalAccount {
  signTypedData(params: ViemTypedDataParams, options?: unknown): Promise<`0x${string}`>;
  address: `0x${string}`;
}

function isViemLocalAccount(wallet: AbstractWallet): wallet is AbstractViemLocalAccount {
  return "signTypedData" in wallet && typeof wallet.signTypedData === "function" &&
    (wallet.signTypedData.length === 1 || wallet.signTypedData.length === 2) &&
    "address" in wallet && typeof wallet.address === "string";
}

// ============================================================
// Abstract Signer
// ============================================================

/** Abstract interface for a wallet that can sign typed data. */
export type AbstractWallet =
  | AbstractViemJsonRpcAccount
  | AbstractViemLocalAccount
  | AbstractEthersV6Signer
  | AbstractEthersV5Signer;

/** ECDSA signature components. */
export interface Signature {
  /** First 32-byte component of ECDSA signature. */
  r: `0x${string}`;
  /** Second 32-byte component of ECDSA signature. */
  s: `0x${string}`;
  /** Recovery identifier. */
  v: 27 | 28;
}

/** Thrown when an error occurs in AbstractWallet operations (e.g., signing, getting address). */
export class AbstractWalletError extends HyperliquidError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AbstractWalletError";
  }
}

/**
 * Signs EIP-712 typed data using the provided wallet.
 *
 * @param args The wallet, domain, types, primary type, and message to sign
 * @return The ECDSA signature components
 *
 * @throws {AbstractWalletError} If the wallet type is unknown or signing fails
 */
export async function signTypedData(args: {
  wallet: AbstractWallet;
  domain: TypedDataDomain;
  types: TypedDataTypes;
  primaryType: string;
  message: Record<string, unknown>;
}): Promise<Signature> {
  const { wallet, domain, types, primaryType, message } = args;

  const isViemWallet = isViemJsonRpcAccount(wallet) || isViemLocalAccount(wallet);
  const isEthersV6 = isEthersV6Signer(wallet);
  const isEthersV5 = isEthersV5Signer(wallet);

  let signature: `0x${string}`;
  try {
    if (isViemWallet) {
      signature = await wallet.signTypedData({
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
        primaryType,
        message,
      }) as `0x${string}`;
    } else if (isEthersV6) {
      signature = await wallet.signTypedData(domain, types, message) as `0x${string}`;
    } else if (isEthersV5) {
      signature = await wallet._signTypedData(domain, types, message) as `0x${string}`;
    } else {
      throw new AbstractWalletError("Failed to sign typed data: unknown wallet type");
    }
  } catch (error) {
    if (error instanceof AbstractWalletError) throw error;
    const walletType = isViemWallet ? "viem" : isEthersV6 ? "ethers v6" : "ethers v5";
    throw new AbstractWalletError(`Failed to sign typed data with ${walletType} wallet`, { cause: error });
  }

  return splitSignature(signature);
}

function splitSignature(signature: `0x${string}`): Signature {
  const r = `0x${signature.slice(2, 66)}` as const;
  const s = `0x${signature.slice(66, 130)}` as const;
  const v = parseInt(signature.slice(130, 132), 16) as 27 | 28;
  return { r, s, v };
}

// ============================================================
// Helpers
// ============================================================

/**
 * Gets the chain ID of the wallet.
 *
 * @param wallet The wallet to query
 * @return The chain ID as a hex string
 *
 * @throws {AbstractWalletError} If getting the chain ID fails
 */
export async function getWalletChainId(wallet: AbstractWallet): Promise<`0x${string}`> {
  try {
    // Viem JSON-RPC account has getChainId method
    if (isViemJsonRpcAccount(wallet)) {
      const chainId = await wallet.getChainId() as number;
      return `0x${chainId.toString(16)}`;
    }

    // Ethers signers use provider.getNetwork()
    const isEthersSigner = isEthersV6Signer(wallet) || isEthersV5Signer(wallet);
    if (isEthersSigner && wallet.provider) {
      const network = await wallet.provider.getNetwork() as { chainId: number | bigint };
      return `0x${network.chainId.toString(16)}`;
    }
  } catch (error) {
    throw new AbstractWalletError("Failed to get chain ID from wallet", { cause: error });
  }

  // Default chain ID for local accounts or signers without provider
  return "0x1";
}

/**
 * Gets the lowercase wallet address from various wallet types.
 *
 * @param wallet The wallet to query
 * @return The lowercase wallet address as a hex string
 *
 * @throws {AbstractWalletError} If getting the address fails or wallet type is unknown
 */
export async function getWalletAddress(wallet: AbstractWallet): Promise<`0x${string}`> {
  try {
    // Viem JSON-RPC account uses getAddresses()
    if (isViemJsonRpcAccount(wallet)) {
      const addresses = await wallet.getAddresses() as `0x${string}`[];
      return addresses[0].toLowerCase() as `0x${string}`;
    }

    // Viem local account has address property
    if (isViemLocalAccount(wallet)) {
      return wallet.address.toLowerCase() as `0x${string}`;
    }

    // Ethers signers use getAddress()
    if (isEthersV6Signer(wallet) || isEthersV5Signer(wallet)) {
      const address = await wallet.getAddress() as string;
      return address.toLowerCase() as `0x${string}`;
    }
  } catch (error) {
    throw new AbstractWalletError("Failed to get address from wallet", { cause: error });
  }

  throw new AbstractWalletError("Failed to get wallet address: unknown wallet type");
}
