/**
 * Common execution shell shared by L1 and user-signed Exchange API actions.
 * @module
 */

import { getWalletAddress, type Signature } from "../../../../signing/mod.ts";
import type { ExchangeConfig } from "./_config.ts";
import { assertSuccessResponse } from "./errors.ts";
import { globalNonceManager } from "./_nonce.ts";
import { withLock } from "./_semaphore.ts";

/** Result returned by the {@linkcode executeWithShell} `build` callback. */
export interface BuildResult {
  /** The final action to send (post-signing). Shape is opaque to the shell — passed through to the transport. */
  action: unknown;
  /** The signature to send. */
  signature: Signature;
  /** Optional extra fields to merge into the request payload (e.g., `vaultAddress`, `expiresAfter`). */
  extras?: Record<string, unknown>;
}

/**
 * Common shell for executing an Exchange API request:
 * acquires per-`(walletAddress × isTestnet)` lock, generates nonce, calls `build` to construct
 * the signed payload, sends to the Exchange endpoint, and validates the response.
 *
 * @param config Exchange API configuration.
 * @param build Callback that, given the nonce, returns the action, signature, and any extras.
 * @param signal Optional {@link AbortSignal} to cancel the request.
 * @return The validated API response.
 *
 * @throws {ApiRequestError} If the API returns an error response.
 */
export async function executeWithShell<T>(
  config: ExchangeConfig,
  build: (nonce: number) => Promise<BuildResult>,
  signal?: AbortSignal,
): Promise<T> {
  const leader = "wallet" in config ? config.wallet : config.signers[0];
  const walletAddress = await getWalletAddress(leader);

  // Lock per (wallet × testnet) ensures requests arrive at the server in nonce order.
  const key = `${walletAddress}:${config.transport.isTestnet}`;
  return await withLock(key, async () => {
    const nonce = await (config.nonceManager?.(walletAddress) ?? globalNonceManager.getNonce(key));
    const { action, signature, extras } = await build(nonce);
    const response = await config.transport.request<T>("exchange", {
      action,
      signature,
      nonce,
      ...extras,
    }, signal);
    assertSuccessResponse(response);
    return response;
  });
}
