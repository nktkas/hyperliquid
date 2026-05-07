/**
 * Abstract wallet interfaces and signing utilities for [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data.
 * @module
 */

import { HyperliquidError } from "../_base.ts";

// ============================================================
// Error
// ============================================================

/** Thrown when an error occurs in AbstractWallet operations (e.g., signing, getting address). */
export class AbstractWalletError extends HyperliquidError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AbstractWalletError";
  }
}

// ============================================================
// Signer Adapter Infrastructure
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
  [key: string]: readonly { name: string; type: string }[];
}

/** Arguments passed to {@link Signer.signTypedData}. */
interface TypedDataArgs {
  domain: TypedDataDomain;
  types: TypedDataTypes;
  primaryType: string;
  message: Record<string, unknown>;
}

/** ECDSA signature components. */
export interface Signature {
  /** First 32-byte component of ECDSA signature. */
  r: `0x${string}`;
  /** Second 32-byte component of ECDSA signature. */
  s: `0x${string}`;
  /** Recovery identifier. */
  v: 27 | 28;
}

/** Uniform interface produced by adapting any {@link AbstractWallet}. */
interface Signer {
  /** Wallet kind label, used in error messages. */
  readonly kind: "viem-local" | "viem-jsonrpc" | "ethers-v6" | "ethers-v5";
  /** Sign EIP-712 typed data and return the parsed signature. */
  signTypedData(args: TypedDataArgs): Promise<Signature>;
  /** Lowercase wallet address. */
  getAddress(): Promise<`0x${string}`>;
  /** Wallet chain ID as a hex string. */
  getChainId(): Promise<`0x${string}`>;
}

/** Parse a 65-byte hex signature into `{r, s, v}`. Normalizes raw recovery 0/1 to 27/28. */
function parseSignature(hex: `0x${string}`): Signature {
  if (hex.length !== 132) {
    throw new AbstractWalletError(`Expected 65-byte signature (132 hex chars), got ${hex.length}`);
  }
  const r = `0x${hex.slice(2, 66)}` as `0x${string}`;
  const s = `0x${hex.slice(66, 130)}` as `0x${string}`;
  let v = parseInt(hex.slice(130, 132), 16);
  if (v === 0 || v === 1) v += 27;
  if (v !== 27 && v !== 28) {
    throw new AbstractWalletError(`Invalid signature recovery value: ${v}, expected 0/1 or 27/28`);
  }
  return { r, s, v };
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

function adaptEthersV6(wallet: AbstractEthersV6Signer): Signer {
  return {
    kind: "ethers-v6",
    async signTypedData(args: TypedDataArgs): Promise<Signature> {
      const hex = await wallet.signTypedData(args.domain, args.types, args.message);
      return parseSignature(hex as `0x${string}`);
    },
    async getAddress(): Promise<`0x${string}`> {
      const address = await wallet.getAddress();
      return address.toLowerCase() as `0x${string}`;
    },
    async getChainId(): Promise<`0x${string}`> {
      if (!wallet.provider) return "0x1";
      const network = await wallet.provider.getNetwork();
      return `0x${network.chainId.toString(16)}`;
    },
  };
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

function adaptEthersV5(wallet: AbstractEthersV5Signer): Signer {
  return {
    kind: "ethers-v5",
    async signTypedData(args: TypedDataArgs): Promise<Signature> {
      const hex = await wallet._signTypedData(args.domain, args.types, args.message);
      return parseSignature(hex as `0x${string}`);
    },
    async getAddress(): Promise<`0x${string}`> {
      const address = await wallet.getAddress();
      return address.toLowerCase() as `0x${string}`;
    },
    async getChainId(): Promise<`0x${string}`> {
      if (!wallet.provider) return "0x1";
      const network = await wallet.provider.getNetwork();
      return `0x${network.chainId.toString(16)}`;
    },
  };
}

// ============================================================
// Viem JSON-RPC Account
// ============================================================

/** EIP-712 domain type definition; viem wallet adapters require it in `types`. */
const EIP712_DOMAIN_TYPE = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

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
  /**
   * `options` is not in {@link https://viem.sh/docs/actions/wallet/signTypedData | base viem};
   * accepted for wallet extensions like {@link https://docs.privy.io/wallets/using-wallets/ethereum/sign-typed-data | Privy}.
   */
  signTypedData(params: ViemTypedDataParams, options?: unknown): Promise<`0x${string}`>;
  getAddresses(): Promise<`0x${string}`[]>;
  getChainId(): Promise<number>;
}

function isViemJsonRpc(wallet: AbstractWallet): wallet is AbstractViemJsonRpcAccount {
  return "signTypedData" in wallet && typeof wallet.signTypedData === "function" &&
    (wallet.signTypedData.length === 1 || wallet.signTypedData.length === 2) &&
    "getAddresses" in wallet && typeof wallet.getAddresses === "function" &&
    "getChainId" in wallet && typeof wallet.getChainId === "function";
}

function adaptViemJsonRpc(wallet: AbstractViemJsonRpcAccount): Signer {
  return {
    kind: "viem-jsonrpc",
    async signTypedData(args: TypedDataArgs): Promise<Signature> {
      const hex = await wallet.signTypedData({
        domain: args.domain,
        types: { EIP712Domain: EIP712_DOMAIN_TYPE, ...args.types },
        primaryType: args.primaryType,
        message: args.message,
      });
      return parseSignature(hex);
    },
    async getAddress(): Promise<`0x${string}`> {
      const addresses = await wallet.getAddresses();
      if (!addresses.length) throw new AbstractWalletError("Wallet returned no addresses");
      return addresses[0].toLowerCase() as `0x${string}`;
    },
    async getChainId(): Promise<`0x${string}`> {
      const id = await wallet.getChainId();
      return `0x${id.toString(16)}`;
    },
  };
}

// ============================================================
// Viem Local Account
// ============================================================

/** Abstract interface for a {@link https://viem.sh/docs/accounts/local | viem Local Account}. */
export interface AbstractViemLocalAccount {
  /**
   * `options` is not in {@link https://viem.sh/docs/actions/wallet/signTypedData | base viem};
   * accepted for wallet extensions like {@link https://docs.privy.io/wallets/using-wallets/ethereum/sign-typed-data | Privy}.
   */
  signTypedData(params: ViemTypedDataParams, options?: unknown): Promise<`0x${string}`>;
  address: `0x${string}`;
}

function isViemLocal(wallet: AbstractWallet): wallet is AbstractViemLocalAccount {
  return "signTypedData" in wallet && typeof wallet.signTypedData === "function" &&
    (wallet.signTypedData.length === 1 || wallet.signTypedData.length === 2) &&
    "address" in wallet && typeof wallet.address === "string";
}

function adaptViemLocal(wallet: AbstractViemLocalAccount): Signer {
  return {
    kind: "viem-local",
    async signTypedData(args: TypedDataArgs): Promise<Signature> {
      const hex = await wallet.signTypedData({
        domain: args.domain,
        types: { EIP712Domain: EIP712_DOMAIN_TYPE, ...args.types },
        primaryType: args.primaryType,
        message: args.message,
      });
      return parseSignature(hex);
    },
    getAddress(): Promise<`0x${string}`> {
      return Promise.resolve(wallet.address.toLowerCase() as `0x${string}`);
    },
    getChainId(): Promise<`0x${string}`> {
      // Local accounts have no notion of chain; default to "0x1".
      return Promise.resolve("0x1");
    },
  };
}

// ============================================================
// AbstractWallet & Dispatcher
// ============================================================

/** Abstract interface for a wallet that can sign typed data. */
export type AbstractWallet =
  | AbstractViemJsonRpcAccount
  | AbstractViemLocalAccount
  | AbstractEthersV6Signer
  | AbstractEthersV5Signer;

/** Adapt a wallet of any supported kind to the uniform {@link Signer} interface. */
function adapt(wallet: AbstractWallet): Signer {
  if (isViemJsonRpc(wallet)) return adaptViemJsonRpc(wallet);
  if (isViemLocal(wallet)) return adaptViemLocal(wallet);
  if (isEthersV6Signer(wallet)) return adaptEthersV6(wallet);
  if (isEthersV5Signer(wallet)) return adaptEthersV5(wallet);
  throw new AbstractWalletError("Failed to adapt wallet: unknown wallet type");
}

// ============================================================
// Public API
// ============================================================

/**
 * Signs [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data using the provided wallet.
 *
 * @param args The wallet, domain, types, primary type, and message to sign.
 * @return The ECDSA signature components.
 *
 * @throws {AbstractWalletError} If the wallet type is unknown or signing fails.
 */
export async function signTypedData(args: {
  wallet: AbstractWallet;
  domain: TypedDataDomain;
  types: TypedDataTypes;
  primaryType: string;
  message: Record<string, unknown>;
}): Promise<Signature> {
  try {
    // Filter message to only contain fields defined in types (required by some wallets)
    const typeFields = args.types[args.primaryType];
    const message = typeFields
      ? Object.fromEntries(Object.entries(args.message).filter(([k]) => typeFields.some((f) => f.name === k)))
      : args.message;

    return await adapt(args.wallet).signTypedData({
      domain: args.domain,
      types: args.types,
      primaryType: args.primaryType,
      message,
    });
  } catch (error) {
    if (error instanceof AbstractWalletError) throw error;
    throw new AbstractWalletError(`Failed to sign the typed data using the wallet`, { cause: error });
  }
}

/**
 * Gets the lowercase wallet address from various wallet types.
 *
 * @param wallet The wallet to query.
 * @return The lowercase wallet address as a hex string.
 *
 * @throws {AbstractWalletError} If getting the address fails or the wallet type is unknown.
 */
export async function getWalletAddress(wallet: AbstractWallet): Promise<`0x${string}`> {
  try {
    return await adapt(wallet).getAddress();
  } catch (error) {
    if (error instanceof AbstractWalletError) throw error;
    throw new AbstractWalletError("Failed to get an address from the wallet", { cause: error });
  }
}

/**
 * Gets the chain ID of the wallet.
 *
 * For wallets that have no notion of chain (e.g., a viem local account, or an ethers signer without a provider),
 * defaults to `"0x1"`.
 *
 * @param wallet The wallet to query.
 * @return The chain ID as a hex string.
 *
 * @throws {AbstractWalletError} If getting the chain ID fails or the wallet type is unknown.
 */
export async function getWalletChainId(wallet: AbstractWallet): Promise<`0x${string}`> {
  try {
    return await adapt(wallet).getChainId();
  } catch (error) {
    if (error instanceof AbstractWalletError) throw error;
    throw new AbstractWalletError("Failed to get the chain ID from the wallet", { cause: error });
  }
}
