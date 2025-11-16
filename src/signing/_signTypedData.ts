/**
 * Abstract interfaces and utilities for signing typed data with various wallet implementations.
 * Supports ethers.js (v5 and v6) and viem wallets.
 */

import * as v from "valibot";
import { HyperliquidError } from "../_base.ts";

// -------------------- Ethers V6 --------------------

/** Abstract interface for an {@link https://docs.ethers.org/v6/api/providers/#Signer | ethers.js signer}. */
export interface AbstractEthersV6Signer {
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
  getAddress(): Promise<string>;
  provider?:
    | { getNetwork(): Promise<{ chainId: number | bigint }> }
    | null;
}

const AbstractEthersV6Signer = v.object({
  signTypedData: v.pipe(
    v.function(),
    v.check((fn) => fn.length === 3),
  ),
  getAddress: v.function(),
  provider: v.nullish(
    v.object({ getNetwork: v.function() }),
  ),
});

// -------------------- Ethers V5 --------------------

/** Abstract interface for an {@link https://docs.ethers.org/v5/api/signer/ | ethers.js v5 signer}. */
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
  getAddress(): Promise<string>;
  provider?:
    | { getNetwork(): Promise<{ chainId: number | bigint }> }
    | null;
}

const AbstractEthersV5Signer = v.object({
  _signTypedData: v.pipe(
    v.function(),
    v.check((fn) => fn.length === 3),
  ),
  getAddress: v.function(),
  provider: v.nullish(
    v.object({ getNetwork: v.function() }),
  ),
});

// -------------------- Viem --------------------

/** Abstract interface for a viem {@link https://viem.sh/docs/accounts/jsonRpc#json-rpc-account | JSON-RPC Account}. */
export interface AbstractViemJsonRpcAccount {
  signTypedData(
    params: {
      domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: `0x${string}`;
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
  ): Promise<`0x${string}`>;
  getAddresses(): Promise<`0x${string}`[]>;
  getChainId(): Promise<number>;
}

const AbstractViemJsonRpcAccountSchema = v.object({
  signTypedData: v.pipe(
    v.function(),
    v.check((fn) => fn.length === 1 || fn.length === 2),
  ),
  getAddresses: v.function(),
  getChainId: v.function(),
});

/** Abstract interface for a viem {@link https://viem.sh/docs/accounts/local | Local Account}. */
export interface AbstractViemLocalAccount {
  signTypedData(
    params: {
      domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: `0x${string}`;
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
  ): Promise<`0x${string}`>;
  address: `0x${string}`;
}

const AbstractViemLocalAccountSchema = v.object({
  signTypedData: v.pipe(
    v.function(),
    v.check((fn) => fn.length === 1 || fn.length === 2),
  ),
  address: v.string(),
});

// -------------------- Abstract Signer --------------------

/** Abstract interface for a wallet that can sign typed data. */
export type AbstractWallet =
  | AbstractViemJsonRpcAccount
  | AbstractViemLocalAccount
  | AbstractEthersV6Signer
  | AbstractEthersV5Signer;

/** ECDSA signature components for Ethereum transactions and typed data. */
export interface Signature {
  /** First 32-byte component of ECDSA signature */
  r: `0x${string}`;
  /** Second 32-byte component of ECDSA signature */
  s: `0x${string}`;
  /** Recovery identifier */
  v: 27 | 28;
}

/** Thrown when an error occurs in AbstractWallet operations (e.g., signing, getting address). */
export class AbstractWalletError extends HyperliquidError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AbstractWalletError";
  }
}

export async function signTypedData(args: {
  wallet: AbstractWallet;
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: `0x${string}`;
  };
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
  primaryType: string;
  message: Record<string, unknown>;
}): Promise<Signature> {
  const { wallet, domain, types, primaryType, message } = args;

  let signature: `0x${string}`;
  if (v.is(AbstractViemJsonRpcAccountSchema, wallet) || v.is(AbstractViemLocalAccountSchema, wallet)) {
    try {
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
    } catch (error) {
      throw new AbstractWalletError("Failed to sign typed data with viem wallet. See cause for details.", {
        cause: error,
      });
    }
  } else if (v.is(AbstractEthersV6Signer, wallet)) {
    try {
      signature = await wallet.signTypedData(domain, types, message) as `0x${string}`;
    } catch (error) {
      throw new AbstractWalletError("Failed to sign typed data with ethers v6 wallet. See cause for details.", {
        cause: error,
      });
    }
  } else if (v.is(AbstractEthersV5Signer, wallet)) {
    try {
      signature = await wallet._signTypedData(domain, types, message) as `0x${string}`;
    } catch (error) {
      throw new AbstractWalletError("Failed to sign typed data with ethers v5 wallet. See cause for details.", {
        cause: error,
      });
    }
  } else {
    throw new AbstractWalletError("Failed to sign typed data: unknown wallet");
  }

  return splitSignature(signature);
}

function splitSignature(signature: `0x${string}`): Signature {
  const r = `0x${signature.slice(2, 66)}` as const;
  const s = `0x${signature.slice(66, 130)}` as const;
  const v = parseInt(signature.slice(130, 132), 16) as 27 | 28;
  return { r, s, v };
}

// -------------------- Utils --------------------

/** Get the chain ID of the wallet. */
export async function getWalletChainId(wallet: AbstractWallet): Promise<`0x${string}`> {
  if (v.is(AbstractViemJsonRpcAccountSchema, wallet)) {
    try {
      const chainId = await wallet.getChainId() as number;
      return `0x${chainId.toString(16)}`;
    } catch (error) {
      throw new AbstractWalletError("Failed to get chain ID from viem wallet. See cause for details.", {
        cause: error,
      });
    }
  }
  if (v.is(AbstractEthersV6Signer, wallet)) {
    if ("provider" in wallet && wallet.provider) {
      try {
        const network = await wallet.provider.getNetwork() as { chainId: number | bigint };
        return `0x${network.chainId.toString(16)}`;
      } catch (error) {
        throw new AbstractWalletError("Failed to get chain ID from ethers v6 wallet. See cause for details.", {
          cause: error,
        });
      }
    }
  }
  if (v.is(AbstractEthersV5Signer, wallet)) {
    if ("provider" in wallet && wallet.provider) {
      try {
        const network = await wallet.provider.getNetwork() as { chainId: number | bigint };
        return `0x${network.chainId.toString(16)}`;
      } catch (error) {
        throw new AbstractWalletError("Failed to get chain ID from ethers v5 wallet. See cause for details.", {
          cause: error,
        });
      }
    }
  }
  return "0x1";
}

/** Get the lowercase wallet address from various wallet types. */
export async function getWalletAddress(wallet: AbstractWallet): Promise<`0x${string}`> {
  if (v.is(AbstractViemJsonRpcAccountSchema, wallet)) {
    try {
      const addresses = await wallet.getAddresses() as `0x${string}`[];
      return addresses[0].toLowerCase() as `0x${string}`;
    } catch (error) {
      throw new AbstractWalletError("Failed to get address from viem wallet. See cause for details.", {
        cause: error,
      });
    }
  }
  if (v.is(AbstractViemLocalAccountSchema, wallet)) {
    return wallet.address.toLowerCase() as `0x${string}`;
  }
  if (v.is(AbstractEthersV6Signer, wallet) || v.is(AbstractEthersV5Signer, wallet)) {
    try {
      const address = await wallet.getAddress() as string;
      return address.toLowerCase() as `0x${string}`;
    } catch (error) {
      throw new AbstractWalletError("Failed to get address from ethers wallet. See cause for details.", {
        cause: error,
      });
    }
  }
  throw new AbstractWalletError("Failed to get wallet address: unknown wallet");
}
