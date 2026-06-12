/**
 * Identity-formation utilities for WebSocket request matching.
 * @module
 */

/** Matches a `0x`-prefixed hex string. */
const HEX_REGEX = /^0x[0-9a-f]+$/i;

/**
 * Builds a stable string identifier from an arbitrary value: payloads with
 * the same logical content produce the same id.
 *
 * Sorts object keys recursively and lowercases hex addresses.
 *
 * @example
 * ```ts ignore
 * requestToId({ user: "0xAbC123", type: "userFills" });
 * // => '{"type":"userFills","user":"0xabc123"}'
 * ```
 */
export function requestToId(value: unknown): string {
  return JSON.stringify(normalize(value));
}

/**
 * Counts the leaf values in `value`; a higher count means a more specific payload.
 *
 * @example
 * ```ts ignore
 * specificity({ type: "candle", coin: "ETH", interval: "1m" });
 * // => 3
 * ```
 */
export function specificity(value: unknown): number {
  if (typeof value !== "object" || value === null) return 1;
  return Object.values(value).reduce((sum: number, item) => sum + specificity(item), 0);
}

/**
 * Returns true if every field of `subset` is present in `superset` with an equal value.
 *
 * @example
 * ```ts ignore
 * isSubset({ coin: "BTC" }, { coin: "BTC", nSigFigs: null }); // => true
 * isSubset({ coin: "BTC", nSigFigs: 5 }, { coin: "BTC" }); // => false
 * ```
 */
export function isSubset(subset: unknown, superset: unknown): boolean {
  // Strings: compare hex addresses case-insensitively, others strictly
  if (typeof subset === "string" && typeof superset === "string") {
    return HEX_REGEX.test(subset) && HEX_REGEX.test(superset)
      ? subset.toLowerCase() === superset.toLowerCase()
      : subset === superset;
  }

  // Primitives or type mismatch
  if (typeof subset !== "object" || typeof superset !== "object" || subset === null || superset === null) {
    return subset === superset;
  }

  // Arrays: must match element by element
  if (Array.isArray(subset)) {
    return Array.isArray(superset) &&
      subset.length === superset.length &&
      subset.every((item, i) => isSubset(item, superset[i]));
  }

  // Objects: all keys in subset must exist in superset with matching values
  const sub = subset as Record<string, unknown>;
  const sup = superset as Record<string, unknown>;
  return Object.keys(sub).every((key) => key in sup && isSubset(sub[key], sup[key]));
}

/** Recursively sorts object keys and lowercases hex strings. */
function normalize(value: unknown): unknown {
  if (typeof value === "string" && HEX_REGEX.test(value)) {
    return value.toLowerCase();
  }
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      result[key] = normalize((value as Record<string, unknown>)[key]);
    }
    return result;
  }
  return value;
}
