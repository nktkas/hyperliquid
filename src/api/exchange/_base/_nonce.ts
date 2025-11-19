/**
 * Nonce manager for generating unique nonces for signing transactions.
 * Uses the current timestamp, and increments if the timestamp is not greater than the last nonce.
 */
class NonceManager {
  private lastNonce = 0;
  getNonce(): number {
    let nonce = Date.now();
    if (nonce <= this.lastNonce) {
      nonce = ++this.lastNonce;
    } else {
      this.lastNonce = nonce;
    }
    return nonce;
  }
}

const globalNonceManager = /* @__PURE__ */ new NonceManager();

/** Get nonce from config or use global nonce manager. */
export async function getNonce(
  config: { nonceManager?: number | ((address: string) => Promise<number> | number) },
  address: string,
): Promise<number> {
  const { nonceManager } = config;
  if (typeof nonceManager === "number") return nonceManager;
  if (typeof nonceManager === "function") return await nonceManager(address);
  return globalNonceManager.getNonce();
}
