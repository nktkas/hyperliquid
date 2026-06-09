/**
 * Configuration types for Exchange API requests.
 * @module
 */

import type { AbstractWallet } from "../../../../signing/mod.ts";
import type { IRequestTransport } from "../../../../transport/mod.ts";

// ============================================================
// Type Utilities
// ============================================================

/** A value or a Promise of that value. */
type MaybePromise<T> = T | Promise<T>;

/** Flatten an intersection type for cleaner IDE display. */
// deno-lint-ignore ban-types
type Prettify<T> = { [K in keyof T]: T[K] } & {};

// ============================================================
// Configuration
// ============================================================

/** Base configuration shared by single-wallet and multi-sig configs. */
interface BaseConfig<T extends IRequestTransport = IRequestTransport> {
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
export interface ExchangeSingleWalletConfig<T extends IRequestTransport = IRequestTransport> extends BaseConfig<T> {
  /** The wallet used to sign requests. */
  wallet: AbstractWallet;
}

/** Configuration for multi-signature Exchange API requests. */
export interface ExchangeMultiSigConfig<T extends IRequestTransport = IRequestTransport> extends BaseConfig<T> {
  /** Array of wallets for multi-sig. First wallet is the leader. */
  signers: readonly [AbstractWallet, ...AbstractWallet[]];
  /** The multi-signature account address. */
  multiSigUser: `0x${string}`;
}

/** Union type for all Exchange API configurations. */
export type ExchangeConfig<T extends IRequestTransport = IRequestTransport> =
  | ExchangeSingleWalletConfig<T>
  | ExchangeMultiSigConfig<T>;

// ============================================================
// Options
// ============================================================

/** Common options for execute functions. */
interface BaseOptions {
  /** {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel a request. */
  signal?: AbortSignal;
}

/** Extract request options from a request type (excludes action, nonce, signature). */
export type ExtractRequestOptions<T extends { action: Record<string, unknown> }> = Prettify<
  & BaseOptions
  & Omit<T, "action" | "nonce" | "signature">
>;
