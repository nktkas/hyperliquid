/**
 * Nonce manager for generating unique nonces per wallet address and network.
 * Uses lazy cleanup: removes entries when Date.now() > lastNonce.
 */
class NonceManager {
  private readonly map = new Map<string, number>();

  getNonce(key: string): number {
    const now = Date.now();
    this.cleanup(now);

    const lastNonce = this.map.get(key) ?? 0;
    const nonce = now > lastNonce ? now : lastNonce + 1;
    this.map.set(key, nonce);
    return nonce;
  }

  private cleanup(now: number): void {
    for (const [key, lastNonce] of this.map) {
      if (now > lastNonce) {
        this.map.delete(key);
      }
    }
  }
}

/** Default nonce manager, used when custom nonceManager is not provided in config. */
export const defaultNonceManager = /* @__PURE__ */ new NonceManager();
