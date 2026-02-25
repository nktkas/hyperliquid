/**
 * Nonce manager for generating unique, monotonically increasing nonces.
 * @module
 */

/**
 * Nonce manager for generating unique nonces per wallet address and network.
 * Uses lazy cleanup: removes entries when Date.now() > lastNonce.
 */
class NonceManager {
  private _map = new Map<string, number>();

  getNonce(key: string): number {
    const now = Date.now();
    this._cleanup(now);

    const lastNonce = this._map.get(key) ?? 0;
    const nonce = now > lastNonce ? now : lastNonce + 1;
    this._map.set(key, nonce);
    return nonce;
  }

  private _cleanup(now: number): void {
    for (const [key, lastNonce] of this._map) {
      if (now > lastNonce) {
        this._map.delete(key);
      }
    }
  }
}

/** Global nonce manager instance. */
export const globalNonceManager = /* @__PURE__ */ new NonceManager();
