/**
 * Execute helpers for L1 and user-signed Exchange API actions.
 * @module
 */

import * as v from "@valibot/valibot";
import { HyperliquidError, parse } from "../../../../_base.ts";
import {
  getWalletChainId,
  signL1Action,
  signMultiSigL1,
  signMultiSigUserSigned,
  signUserSignedAction,
} from "../../../../signing/mod.ts";
import { Address, Hex, UnsignedInteger } from "../../../_schemas.ts";
import type { ExchangeConfig } from "./_config.ts";
import { executeWithShell } from "./_shell.ts";

// ============================================================
// Execute L1 Action
// ============================================================

/**
 * Execute an L1 action on the Hyperliquid Exchange.
 *
 * Handles both single-wallet and multi-sig signing.
 *
 * @param config Exchange API configuration.
 * @param action Action payload to execute.
 * @param options Additional options for the request.
 * @return API response.
 *
 * @throws {ValidationError} If the request options fail validation.
 * @throws {ApiRequestError} If the API returns an error response.
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
  // Validate options before acquiring the lock.
  const vaultAddress = parse(
    v.optional(Address),
    options?.vaultAddress ?? config.defaultVaultAddress,
  );
  const expiresAfter = parse(
    v.optional(UnsignedInteger),
    options?.expiresAfter ??
      (typeof config.defaultExpiresAfter === "function"
        ? await config.defaultExpiresAfter()
        : config.defaultExpiresAfter),
  );

  return executeWithShell<T>(config, async (nonce) => {
    if ("wallet" in config) {
      const signature = await signL1Action({
        wallet: config.wallet,
        action,
        nonce,
        isTestnet: config.transport.isTestnet,
        vaultAddress,
        expiresAfter,
      });
      return { action, signature, extras: { vaultAddress, expiresAfter } };
    } else {
      const { action: wrapper, signature } = await signMultiSigL1({
        signers: config.signers,
        multiSigUser: config.multiSigUser,
        signatureChainId: await resolveSignatureChainId(config),
        action,
        nonce,
        isTestnet: config.transport.isTestnet,
        vaultAddress,
        expiresAfter,
      });
      return { action: wrapper, signature, extras: { vaultAddress, expiresAfter } };
    }
  }, options?.signal);
}

// ============================================================
// Execute User-Signed Action
// ============================================================

/**
 * Execute a user-signed action (EIP-712) on the Hyperliquid Exchange.
 *
 * Handles both single-wallet and multi-sig signing.
 *
 * @param config Exchange API configuration.
 * @param action Action payload to execute.
 * @param types EIP-712 type definitions for signing.
 * @param options Additional options for the request.
 * @return API response.
 *
 * @throws {ValidationError} If the request options fail validation.
 * @throws {ApiRequestError} If the API returns an error response.
 */
export function executeUserSignedAction<T>(
  config: ExchangeConfig,
  action: Record<string, unknown>,
  types: Record<string, readonly { name: string; type: string }[]>,
  options?: {
    signal?: AbortSignal;
  },
): Promise<T> {
  return executeWithShell<T>(config, async (nonce) => {
    // --- Construct full action (type, system fields, user fields, nonce/time)
    const { type, ...restAction } = action;
    const nonceFieldName = extractNonceFieldName(types);
    const baseFields = {
      type,
      signatureChainId: await resolveSignatureChainId(config),
      hyperliquidChain: config.transport.isTestnet ? "Testnet" : "Mainnet",
    } as const;
    const fullAction = nonceFieldName === "nonce"
      ? { ...baseFields, ...restAction, nonce }
      : { ...baseFields, ...restAction, time: nonce };

    // --- Sign (single-wallet or multi-sig) -------------------
    if ("wallet" in config) {
      const signature = await signUserSignedAction({
        wallet: config.wallet,
        action: fullAction,
        types,
      });
      return { action: fullAction, signature };
    } else {
      const { action: wrapper, signature } = await signMultiSigUserSigned({
        signers: config.signers,
        multiSigUser: config.multiSigUser,
        action: fullAction,
        types,
      });
      return { action: wrapper, signature };
    }
  }, options?.signal);
}

// ============================================================
// Helpers
// ============================================================

/** Extracts the nonce field name ("nonce" or "time") from EIP-712 type definitions. */
function extractNonceFieldName(types: Record<string, readonly { name: string; type: string }[]>): "nonce" | "time" {
  const primaryType = Object.keys(types)[0];
  const field = types[primaryType].find((f) => f.name === "nonce" || f.name === "time");
  if (!field) {
    throw new HyperliquidError(`EIP-712 types must contain a "nonce" or "time" field in "${primaryType}"`);
  }
  return field.name as "nonce" | "time";
}

/** Resolves signature chain ID from config, or falls back to the leader wallet's chain ID. */
async function resolveSignatureChainId(config: ExchangeConfig): Promise<`0x${string}`> {
  if (config.signatureChainId) {
    const id = typeof config.signatureChainId === "function"
      ? await config.signatureChainId()
      : config.signatureChainId;
    return parse(Hex, id);
  }
  const leader = "wallet" in config ? config.wallet : config.signers[0];
  return await getWalletChainId(leader);
}
