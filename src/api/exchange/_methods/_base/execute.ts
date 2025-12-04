import * as v from "@valibot/valibot";
import type { HttpTransport } from "../../../../transport/http/mod.ts";
import type { WebSocketTransport } from "../../../../transport/websocket/mod.ts";
import { Address, Hex, UnsignedInteger } from "../../../_schemas.ts";
import {
  type AbstractWallet,
  getWalletAddress,
  getWalletChainId,
  signL1Action,
  signMultiSigAction,
  signUserSignedAction,
} from "../../../../signing/mod.ts";
import { assertSuccessResponse } from "./errors.ts";
import { defaultNonceManager } from "./_nonce.ts";
import { withLock } from "./_semaphore.ts";
import type { Signature } from "./schemas.ts";

// =============================================================
// Type Utilities
// =============================================================

type MaybePromise<T> = T | Promise<T>;

// deno-lint-ignore ban-types
type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Extract request options from a request type (excludes action, nonce, signature). */
export type ExtractRequestOptions<T extends { action: Record<string, unknown> }> = Prettify<
  & { signal?: AbortSignal }
  & Omit<T, "action" | "nonce" | "signature">
>;

// =============================================================
// Config
// =============================================================

/** Base configuration shared by single-wallet and multi-sig configs. */
interface BaseConfig<T extends HttpTransport | WebSocketTransport = HttpTransport | WebSocketTransport> {
  /** The transport used to connect to the Hyperliquid Exchange API. */
  transport: T;

  /** Signature chain ID for EIP-712 signing, defaults to wallet's chain ID. */
  signatureChainId?: `0x${string}` | (() => MaybePromise<`0x${string}`>);

  /**
   * Default vault address for vault-based operations, used when not specified in action options.
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults
   */
  defaultVaultAddress?: `0x${string}`;

  /**
   * Default expiration time in milliseconds, used when not specified in action options.
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#expires-after
   */
  defaultExpiresAfter?: number | (() => MaybePromise<number>);

  /**
   * Custom nonce generator function.
   * Defaults to a global manager using timestamp with auto-increment.
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#hyperliquid-nonces
   */
  nonceManager?: (address: string) => MaybePromise<number>;
}

/** Configuration for single-wallet Exchange API requests. */
export interface ExchangeSingleWalletConfig<
  T extends HttpTransport | WebSocketTransport = HttpTransport | WebSocketTransport,
> extends BaseConfig<T> {
  /** The wallet used to sign requests. */
  wallet: AbstractWallet;
}

/** Configuration for multi-signature Exchange API requests. */
export interface ExchangeMultiSigConfig<
  T extends HttpTransport | WebSocketTransport = HttpTransport | WebSocketTransport,
> extends BaseConfig<T> {
  /** Array of wallets for multi-sig. First wallet is the leader. */
  wallet: readonly [AbstractWallet, ...AbstractWallet[]];
  /** The multi-signature account address. */
  multiSigUser: `0x${string}`;
}

/** Union type for all Exchange API configurations. */
export type ExchangeConfig = ExchangeSingleWalletConfig | ExchangeMultiSigConfig;

// =============================================================
// Execute L1 Action
// =============================================================

/**
 * Execute an L1 action on the Hyperliquid Exchange.
 * Handles both single-wallet and multi-sig signing.
 */
export async function executeL1Action<T>(
  config: ExchangeConfig,
  action: Record<string, unknown>,
  options?: {
    vaultAddress?: string;
    expiresAfter?: string | number;
    signal?: AbortSignal;
  },
): Promise<T> {
  const { transport } = config;
  const leader = getLeader(config);
  const walletAddress = await getWalletAddress(leader);

  // Semaphore ensures requests arrive at server in nonce order (prevents out-of-order delivery)
  const key = `${walletAddress}:${transport.isTestnet}`;
  return await withLock(key, async () => {
    const nonce = await (config.nonceManager?.(walletAddress) ?? defaultNonceManager.getNonce(key));

    // Validate and resolve options
    const vaultAddress = v.parse(
      v.optional(Address),
      options?.vaultAddress ?? config.defaultVaultAddress,
    );
    const expiresAfter = v.parse(
      v.optional(UnsignedInteger),
      options?.expiresAfter ??
        (typeof config.defaultExpiresAfter === "number"
          ? config.defaultExpiresAfter
          : await config.defaultExpiresAfter?.()),
    );
    const signal = options?.signal;

    // Sign action (multi-sig or single wallet)
    const [finalAction, signature] = isMultiSig(config)
      ? await signMultiSigL1(config, action, walletAddress, nonce, vaultAddress, expiresAfter)
      : [
        action,
        await signL1Action({
          wallet: leader,
          action,
          nonce,
          isTestnet: transport.isTestnet,
          vaultAddress,
          expiresAfter,
        }),
      ];

    // Send request and validate response
    const response = await transport.request("exchange", {
      action: finalAction,
      signature,
      nonce,
      vaultAddress,
      expiresAfter,
    }, signal);
    assertSuccessResponse(response);
    return response as T;
  });
}

// =============================================================
// Execute User-Signed Action
// =============================================================

/** Extract nonce field name from EIP-712 types ("nonce" or "time"). */
function getNonceFieldName(types: Record<string, { name: string; type: string }[]>): "nonce" | "time" {
  const primaryType = Object.keys(types)[0];
  const field = types[primaryType].find((f) => f.name === "nonce" || f.name === "time") as {
    name: "nonce" | "time";
    type: string;
  } | undefined;
  return field?.name ?? "nonce";
}

/**
 * Execute a user-signed action (EIP-712) on the Hyperliquid Exchange.
 * Handles both single-wallet and multi-sig signing.
 * Automatically adds signatureChainId, hyperliquidChain, and nonce/time.
 */
export async function executeUserSignedAction<T>(
  config: ExchangeConfig,
  action: Record<string, unknown>,
  types: Record<string, { name: string; type: string }[]>,
  options?: {
    signal?: AbortSignal;
  },
): Promise<T> {
  const { transport } = config;
  const leader = getLeader(config);
  const walletAddress = await getWalletAddress(leader);

  // Semaphore ensures requests arrive at server in nonce order (prevents out-of-order delivery)
  const key = `${walletAddress}:${transport.isTestnet}`;
  return withLock(key, async () => {
    const nonce = await (config.nonceManager?.(walletAddress) ?? defaultNonceManager.getNonce(key));
    const signal = options?.signal;

    // Add system fields for user-signed actions
    const { type, ...restAction } = action;
    const nonceFieldName = getNonceFieldName(types);
    const fullAction = { // key order is important for multi-sig
      type,
      signatureChainId: await getSignatureChainId(config),
      hyperliquidChain: transport.isTestnet ? "Testnet" : "Mainnet",
      ...restAction,
      [nonceFieldName]: nonce,
    };

    // Sign action (multi-sig or single wallet)
    const [finalAction, signature] = isMultiSig(config)
      ? await signMultiSigUserSigned(config, fullAction, types, walletAddress, nonce)
      : [fullAction, await signUserSignedAction({ wallet: leader, action: fullAction, types })];

    // Send request and validate response
    const response = await transport.request("exchange", {
      action: finalAction,
      signature,
      nonce,
    }, signal);
    assertSuccessResponse(response);
    return response as T;
  });
}

// =============================================================
// Multi-sig signing (private)
// =============================================================

/** Remove leading zeros from signature components (required by Hyperliquid). */
function trimSignature(sig: Signature): Signature {
  return {
    r: sig.r.replace(/^0x0+/, "0x") as `0x${string}`,
    s: sig.s.replace(/^0x0+/, "0x") as `0x${string}`,
    v: sig.v,
  };
}

/** Sign an L1 action with multi-sig. */
async function signMultiSigL1(
  config: ExchangeMultiSigConfig,
  action: Record<string, unknown>,
  outerSigner: `0x${string}`,
  nonce: number,
  vaultAddress?: `0x${string}`,
  expiresAfter?: number,
): Promise<[Record<string, unknown>, Signature]> {
  const { transport: { isTestnet }, wallet: signers, multiSigUser } = config;
  const multiSigUser_ = v.parse(Address, multiSigUser);
  const outerSigner_ = v.parse(Address, outerSigner);

  // Collect signatures from all signers
  const signatures = await Promise.all(signers.map(async (signer) => {
    const signature = await signL1Action({
      wallet: signer,
      action: [multiSigUser_, outerSigner_, action],
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
    signatureChainId: await getSignatureChainId(config),
    signatures,
    payload: { multiSigUser: multiSigUser_, outerSigner: outerSigner_, action },
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

/** Sign a user-signed action (EIP-712) with multi-sig. */
async function signMultiSigUserSigned(
  config: ExchangeMultiSigConfig,
  action: Record<string, unknown> & { signatureChainId: `0x${string}` },
  types: Record<string, { name: string; type: string }[]>,
  outerSigner: `0x${string}`,
  nonce: number,
): Promise<[Record<string, unknown>, Signature]> {
  const { wallet: signers, multiSigUser, transport: { isTestnet } } = config;
  const multiSigUser_ = v.parse(Address, multiSigUser);
  const outerSigner_ = v.parse(Address, outerSigner);

  // Collect signatures from all signers
  const signatures = await Promise.all(signers.map(async (signer) => {
    const signature = await signUserSignedAction({
      wallet: signer,
      action: { payloadMultiSigUser: multiSigUser_, outerSigner: outerSigner_, ...action },
      types,
    });
    return trimSignature(signature);
  }));

  // Build multi-sig action wrapper
  const multiSigAction = {
    type: "multiSig",
    signatureChainId: await getSignatureChainId(config),
    signatures,
    payload: { multiSigUser: multiSigUser_, outerSigner: outerSigner_, action },
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

// =============================================================
// Helpers (private)
// =============================================================

/** Type guard for multi-sig configuration. */
function isMultiSig(config: ExchangeConfig): config is ExchangeMultiSigConfig {
  return Array.isArray(config.wallet);
}

/** Get the leader wallet (first signer for multi-sig, or the single wallet). */
function getLeader(config: ExchangeConfig): AbstractWallet {
  return isMultiSig(config) ? config.wallet[0] : config.wallet;
}

/** Resolve signature chain ID from config or wallet. */
async function getSignatureChainId(config: ExchangeConfig): Promise<`0x${string}`> {
  if (config.signatureChainId) {
    const id = typeof config.signatureChainId === "function"
      ? await config.signatureChainId()
      : config.signatureChainId;
    return v.parse(Hex, id);
  }
  return getWalletChainId(getLeader(config));
}
