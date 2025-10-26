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

export const globalNonceManager = /* @__PURE__ */ new NonceManager();
