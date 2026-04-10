/**
 * Schema-driven key canonicalization for Hyperliquid action objects.
 * @module
 */

import type { GenericSchema } from "@valibot/valibot";
import { HyperliquidError } from "../_base.ts";

/** Thrown when canonicalization fails due to schema/data key mismatch. */
export class CanonicalizeError extends HyperliquidError {
  constructor(message: string) {
    super(message);
    this.name = "CanonicalizeError";
  }
}

/**
 * Recursively rebuilds a value with object keys in schema-definition order.
 *
 * @param schema A valibot schema defining the canonical key order.
 * @param value The value whose keys should be reordered.
 * @return A new value with keys in schema-definition order.
 *
 * @throws {CanonicalizeError} If keys in data don't match the schema.
 *
 * @example
 * ```ts
 * import { canonicalize } from "@nktkas/hyperliquid/signing";
 * import { CancelRequest } from "@nktkas/hyperliquid/api/exchange";
 *
 * const action = canonicalize(CancelRequest.entries.action, {
 *   type: "cancel",
 *   cancels: [{ a: 0, o: 12345 }],
 * });
 * ```
 */
export function canonicalize<T>(schema: GenericSchema, value: T): T {
  return walk(schema, value) as T;
}

// ============================================================
// Internal schema interface
// ============================================================

interface SchemaNode {
  readonly type: string;
  readonly entries?: Record<string, SchemaNode>;
  readonly wrapped?: SchemaNode;
  readonly item?: SchemaNode;
  readonly items?: readonly SchemaNode[];
  readonly key?: string;
  readonly options?: readonly SchemaNode[];
  readonly literal?: unknown;
}

// ============================================================
// Recursive walker
// ============================================================

function walk(schema: SchemaNode, value: unknown): unknown {
  const t = schema.type;

  // Unwrap optional / nullable / nullish
  if (t === "optional" || t === "nullable" || t === "nullish") {
    return value === null || value === undefined ? value : walk(schema.wrapped!, value);
  }

  // Object → reorder keys by schema.entries
  if (t === "object" && isRecord(value)) {
    return reorderObject(schema.entries!, value);
  }

  // Array → canonicalize each item
  if (t === "array" && Array.isArray(value)) {
    return value.map((item) => walk(schema.item!, item));
  }

  // Tuple → canonicalize each item by index
  if (t === "tuple" && Array.isArray(value)) {
    return value.map((item, i) => walk(schema.items![i], item));
  }

  // Variant → match option by discriminator + structural fallback
  if (t === "variant" && isRecord(value)) {
    const option = matchVariantOption(schema.key!, schema.options!, value);
    if (option) return walk(option, value);
    throw new CanonicalizeError(
      `No variant option matches data (discriminator "${schema.key}" = ${JSON.stringify(value[schema.key!])})`,
    );
  }

  // Union → match option structurally
  if (t === "union" && isRecord(value)) {
    const option = matchByStructure(schema.options!, value);
    if (option) return walk(option, value);
    return value;
  }

  // Primitives, literals, picklists, enums → return as-is
  return value;
}

// ============================================================
// Helpers
// ============================================================

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function reorderObject(entries: Record<string, SchemaNode>, value: Record<string, unknown>): Record<string, unknown> {
  for (const key of Object.keys(value)) {
    if (!(key in entries)) {
      throw new CanonicalizeError(`Key "${key}" exists in data but not in schema`);
    }
  }

  for (const key of Object.keys(entries)) {
    if (!(key in value)) {
      const t = entries[key].type;
      if (t !== "optional" && t !== "nullable" && t !== "nullish") {
        throw new CanonicalizeError(`Required key "${key}" exists in schema but not in data`);
      }
    }
  }

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(entries)) {
    if (key in value) {
      result[key] = walk(entries[key], value[key]);
    }
  }
  return result;
}

function matchVariantOption(
  discriminatorKey: string,
  options: readonly SchemaNode[],
  value: Record<string, unknown>,
): SchemaNode | undefined {
  const discriminatorValue = value[discriminatorKey];

  const matching: SchemaNode[] = [];
  for (const option of options) {
    if (option.type === "object" && option.entries && discriminatorKey in option.entries) {
      const keySchema = option.entries[discriminatorKey];
      if (keySchema.type === "literal" && keySchema.literal === discriminatorValue) {
        matching.push(option);
      }
    }
  }

  if (matching.length === 1) return matching[0];
  if (matching.length > 1) return matchByStructure(matching, value);

  return undefined;
}

function matchByStructure(
  options: readonly SchemaNode[],
  value: Record<string, unknown>,
): SchemaNode | undefined {
  const dataKeys = new Set(Object.keys(value));

  for (const option of options) {
    if (option.type === "object" && option.entries) {
      if ([...dataKeys].every((k) => k in option.entries!)) {
        const allRequired = Object.keys(option.entries).every((k) => {
          if (dataKeys.has(k)) return true;
          const t = option.entries![k].type;
          return t === "optional" || t === "nullable" || t === "nullish";
        });
        if (allRequired) return option;
      }
    }
  }

  return undefined;
}
