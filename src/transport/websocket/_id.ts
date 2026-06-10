/**
 * Identity-formation utilities for WebSocket request matching.
 * @module
 */

/** Matches a `0x`-prefixed hex string. */
const HEX_REGEX = /^0x[0-9a-f]+$/i;

/**
 * Builds a stable string identifier from an arbitrary value.
 *
 * Sorts object keys recursively and lowercases hex addresses, so payloads
 * with the same logical content but different ordering or casing produce
 * the same id.
 */
export function requestToId(value: unknown): string {
  return JSON.stringify(recursiveHexToLowercase(recursiveSortObjectKeys(value)));
}

/** Returns true if every field of `subset` is present in `superset` with an equal value. */
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

// =============================================================================
// Internal
// =============================================================================

function recursiveSortObjectKeys<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(recursiveSortObjectKeys) as T;
  }
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      result[key] = recursiveSortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return result as T;
  }
  return obj;
}

function recursiveHexToLowercase(value: unknown): unknown {
  if (typeof value === "string" && HEX_REGEX.test(value)) {
    return value.toLowerCase();
  }
  if (Array.isArray(value)) {
    return value.map(recursiveHexToLowercase);
  }
  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const key in value) {
      result[key] = recursiveHexToLowercase((value as Record<string, unknown>)[key]);
    }
    return result;
  }
  return value;
}
