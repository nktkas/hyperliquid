/**
 * Nonce manager for generating unique, monotonically increasing nonces.
 * @module
 */

/** Default upper bound on map size before stale entries are pruned. */
const DEFAULT_MAX_ENTRIES = 10_000;

/** Nonce manager interface. */
export interface NonceManager {
  /** Returns a unique nonce for the given key, monotonically increasing per key. */
  getNonce(key: string): number;
}

/**
 * Creates a nonce manager that issues unique, monotonically increasing nonces per key.
 *
 * Uses `Date.now()` in ms; if the previous nonce for the key is greater than or equal to
 * `Date.now()`, increments by 1 to maintain monotonicity.
 *
 * To bound memory under high-cardinality workloads (e.g., a server proxying many wallets),
 * stale entries are pruned when the internal map grows beyond `maxEntries`. An entry is
 * considered stale if `Date.now()` has advanced past its last issued nonce.
 *
 * @param maxEntries Upper bound on map size before stale entries are pruned. Default: `10000`.
 * @return A {@linkcode NonceManager}.
 */
export function createNonceManager(maxEntries: number = DEFAULT_MAX_ENTRIES): NonceManager {
  const map = new Map<string, number>();
  return {
    getNonce(key: string): number {
      const now = Date.now();
      if (map.size > maxEntries) {
        for (const [k, last] of map) {
          if (now > last) map.delete(k);
        }
      }
      const last = map.get(key) ?? 0;
      const nonce = now > last ? now : last + 1;
      map.set(key, nonce);
      return nonce;
    },
  };
}

/** Default global nonce manager instance. */
export const globalNonceManager: NonceManager = /* @__PURE__ */ createNonceManager();
