/**
 * Hyperliquid-specific wrapper for schema coverage testing.
 *
 * This module provides project-specific extensions to the generic schemaCoverage.ts library:
 * - Normalizes numeric schemas (Integer, Decimal, etc.) to avoid false-positive coverage issues
 * - Provides excludeErrorResponse helper for testing success paths only
 *
 * @example
 * ```ts
 * // @ts-nocheck
 * import { schemaCoverage, excludeErrorResponse } from "./schemaCoverageHyperliquid.ts";
 *
 * const data = await client.myMethod();
 * schemaCoverage(excludeErrorResponse(OrderResponse), [data]);
 * ```
 */

import * as v from "@valibot/valibot";
import { createSchemaTransformer, schemaCoverage as baseSchemaCoverage } from "./schemaCoverage.ts";
import { Decimal, Integer, UnsignedDecimal, UnsignedInteger } from "../../../src/api/_schemas.ts";
import type { ExcludeErrorResponse } from "../../../src/api/exchange/_methods/_base/errors.ts";

// Re-export for convenience
export { type CoverageIssue, type IssueType, SchemaCoverageError } from "./schemaCoverage.ts";

// =============================================================================
// Numeric Schema Normalization
// =============================================================================

/**
 * Schemas that output number (Integer, UnsignedInteger).
 * These have internal union([string, number]) but always output number after toNumber().
 */
const NUMBER_OUTPUT_SCHEMAS = new Set<v.GenericSchema>([Integer, UnsignedInteger]);

/**
 * Schemas that output string (Decimal, UnsignedDecimal).
 * These have internal union([string, number]) but always output string after toString().
 */
const STRING_OUTPUT_SCHEMAS = new Set<v.GenericSchema>([Decimal, UnsignedDecimal]);

/** Type-level equality check. */
type Equal<T, U> = (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2) ? true : false;

/**
 * Normalize a schema by replacing numeric schemas with their output type.
 * This avoids false-positive BRANCH_UNCOVERED issues for Integer/Decimal schemas that have internal union([string, number]).
 */
const normalizeSchema = createSchemaTransformer({
  transformIntersect: true,
  preTransform: (schema, recurse) => {
    // Replace Integer/UnsignedInteger with v.number() (their output type)
    if (NUMBER_OUTPUT_SCHEMAS.has(schema)) {
      return v.number();
    }

    // Replace Decimal/UnsignedDecimal with v.string() (their output type)
    if (STRING_OUTPUT_SCHEMAS.has(schema)) {
      return v.string();
    }

    // Handle pipe schemas - find and normalize the base schema, preserve other pipe items
    if ("pipe" in schema && Array.isArray(schema.pipe)) {
      const baseSchemaIndex = schema.pipe.findIndex((item) =>
        typeof item === "object" && item !== null && "kind" in item && item.kind === "schema" && "type" in item
      );
      if (baseSchemaIndex !== -1) {
        const baseSchema = schema.pipe[baseSchemaIndex] as v.GenericSchema;
        const normalizedBase = recurse(baseSchema);
        // If base was normalized to a different schema, rebuild the pipe
        if (normalizedBase !== baseSchema) {
          const newPipe = [...schema.pipe];
          newPipe[baseSchemaIndex] = normalizedBase;
          return { ...schema, pipe: newPipe } as v.GenericSchema;
        }
      }
    }

    return null; // Continue with standard handling
  },
});

// =============================================================================
// Main API
// =============================================================================

/**
 * Hyperliquid-specific schema coverage checker.
 *
 * Wraps the generic schemaCoverage function with:
 * - Automatic normalization of Integer/Decimal schemas to avoid false positives
 *
 * @param schema - The valibot schema to validate against
 * @param samples - Array of data samples (must match schema output type)
 * @param ignorePaths - Paths to ignore during coverage checking
 * @throws {Error} If samples are invalid or empty
 * @throws {SchemaCoverageError} If coverage issues are found
 */
export function schemaCoverage<TSchema extends v.GenericSchema, TSample>(
  schema: TSchema,
  samples: TSample[] & (Equal<TSample, v.InferOutput<TSchema>> extends true ? TSample[] : never),
  ignorePaths: string[] = [],
): void {
  const normalizedSchema = normalizeSchema(schema);
  baseSchemaCoverage(normalizedSchema, samples as v.InferOutput<typeof normalizedSchema>[], ignorePaths);
}

// =============================================================================
// Error Response Exclusion
// =============================================================================

type InferOutputWithoutErrors<T> = T extends v.GenericSchema<unknown, infer O> ? ExcludeErrorResponse<O> : never;

/**
 * Removes error response variants from a schema for testing success paths only.
 *
 * This is useful when testing API responses where you only want to validate
 * the success case and exclude error branches from coverage requirements.
 *
 * Removes:
 * - Top-level union branches with `{ status: "err" }`
 * - Nested error responses in `response.data.statuses[]` and `response.data.status`
 *
 * @param schema - The schema containing error response variants
 * @returns A new schema with error variants removed
 *
 * @example
 * ```ts
 * // @ts-nocheck
 * import { excludeErrorResponse, schemaCoverage } from "./schemaCoverageHyperliquid.ts";
 *
 * const successSchema = excludeErrorResponse(TwapOrderResponse);
 * schemaCoverage(successSchema, [successfulResponse]);
 * ```
 */
export function excludeErrorResponse<T extends v.GenericSchema>(
  schema: T,
): v.GenericSchema<v.InferInput<T>, InferOutputWithoutErrors<T>> {
  // Schemas that should not be cloned (for normalizeSchema to work via reference equality)
  const SKIP_CLONE = new Set<v.GenericSchema>([Integer, UnsignedInteger, Decimal, UnsignedDecimal]);

  // Deep clone schema preserving functions and getters
  function cloneSchema(s: v.GenericSchema): v.GenericSchema {
    // Don't clone known numeric schemas - they need reference equality for normalizeSchema
    if (SKIP_CLONE.has(s)) return s;

    const clone = Object.defineProperties({}, Object.getOwnPropertyDescriptors(s)) as v.GenericSchema;

    // Pipe schemas (v.pipe)
    if ("pipe" in clone && Array.isArray(clone.pipe)) {
      (clone as Record<string, unknown>).pipe = clone.pipe.map((p) =>
        typeof p === "object" && p !== null ? cloneSchema(p as v.GenericSchema) : p
      );
    }
    // Union/variant/intersect options
    if ("options" in clone && Array.isArray(clone.options)) {
      (clone as Record<string, unknown>).options = clone.options.map(cloneSchema);
    }
    // Object entries
    if ("entries" in clone && typeof clone.entries === "object" && clone.entries !== null) {
      (clone as Record<string, unknown>).entries = Object.fromEntries(
        Object.entries(clone.entries).map(([k, val]) => [k, cloneSchema(val as v.GenericSchema)]),
      );
    }
    // Tuple items
    if ("items" in clone && Array.isArray(clone.items)) {
      (clone as Record<string, unknown>).items = clone.items.map(cloneSchema);
    }
    // Array item
    if ("item" in clone && typeof clone.item === "object" && clone.item !== null) {
      (clone as Record<string, unknown>).item = cloneSchema(clone.item as v.GenericSchema);
    }
    // Wrapper wrapped (optional, nullable, etc.)
    if ("wrapped" in clone && typeof clone.wrapped === "object" && clone.wrapped !== null) {
      (clone as Record<string, unknown>).wrapped = cloneSchema(clone.wrapped as v.GenericSchema);
    }
    // Rest schema (tupleWithRest, objectWithRest)
    if ("rest" in clone && typeof clone.rest === "object" && clone.rest !== null) {
      (clone as Record<string, unknown>).rest = cloneSchema(clone.rest as v.GenericSchema);
    }
    // Set/record value
    if ("value" in clone && typeof clone.value === "object" && clone.value !== null) {
      (clone as Record<string, unknown>).value = cloneSchema(clone.value as v.GenericSchema);
    }
    // Map/record key
    if ("key" in clone && typeof clone.key === "object" && clone.key !== null) {
      (clone as Record<string, unknown>).key = cloneSchema(clone.key as v.GenericSchema);
    }
    // Lazy getter - wrap to return cloned schema
    if ("getter" in clone && typeof clone.getter === "function") {
      const originalGetter = clone.getter as () => v.GenericSchema;
      (clone as Record<string, unknown>).getter = () => cloneSchema(originalGetter());
    }
    return clone;
  }

  // Work on a cloned copy to avoid mutating the original
  const cloned = cloneSchema(schema);

  // Unwrap pipe wrapper to get the underlying schema
  function getBase(s: v.GenericSchema): v.GenericSchema {
    return "pipe" in s && Array.isArray(s.pipe) ? s.pipe[0] : s;
  }

  function getEntries(s: v.GenericSchema): Record<string, v.GenericSchema> | null {
    const base = getBase(s);
    return "entries" in base && typeof base.entries === "object"
      ? base.entries as Record<string, v.GenericSchema>
      : null;
  }

  function getArrayItem(s: v.GenericSchema): v.GenericSchema | null {
    const base = getBase(s);
    return "item" in base && typeof base.item === "object" ? base.item as v.GenericSchema : null;
  }

  function getUnionOptions(s: v.GenericSchema): v.GenericSchema[] | null {
    const base = getBase(s);
    return "type" in base && base.type === "union" && "options" in base && Array.isArray(base.options)
      ? base.options
      : null;
  }

  function setUnionOptions(s: v.GenericSchema, options: v.GenericSchema[]): void {
    const base = getBase(s);
    if ("options" in s) (s as { options: v.GenericSchema[] }).options = options;
    if (base !== s && "options" in base) (base as { options: v.GenericSchema[] }).options = options;
  }

  function hasErrStatus(s: v.GenericSchema): boolean {
    const entries = getEntries(s);
    if (!entries || !("status" in entries)) return false;
    const statusBase = getBase(entries.status);
    return "type" in statusBase && statusBase.type === "literal" && "literal" in statusBase &&
      statusBase.literal === "err";
  }

  function hasErrorField(s: v.GenericSchema): boolean {
    const entries = getEntries(s);
    return entries !== null && "error" in entries;
  }

  function filterUnion(s: v.GenericSchema, predicate: (opt: v.GenericSchema) => boolean): void {
    const options = getUnionOptions(s);
    if (!options) return;
    const filtered = options.filter(predicate);
    if (filtered.length > 0 && filtered.length < options.length) {
      setUnionOptions(s, filtered);
    }
  }

  // Remove top-level ErrorResponse (status: "err") from union
  if (getUnionOptions(cloned)) {
    filterUnion(cloned, (opt) => !hasErrStatus(opt));
  }

  // Remove nested error responses from `response.data.statuses[]` or `response.data.status`
  function processNestedErrors(target: v.GenericSchema): void {
    const topEntries = getEntries(target);
    if (!topEntries?.response) return;

    const responseEntries = getEntries(topEntries.response);
    if (!responseEntries?.data) return;

    const dataEntries = getEntries(responseEntries.data);
    if (!dataEntries) return;

    if ("statuses" in dataEntries) {
      const item = getArrayItem(dataEntries.statuses);
      if (item) filterUnion(item, (opt) => !hasErrorField(opt));
    }

    if ("status" in dataEntries) {
      filterUnion(dataEntries.status, (opt) => !hasErrorField(opt));
    }
  }

  const options = getUnionOptions(cloned);
  if (options) {
    options.forEach(processNestedErrors);
  } else {
    processNestedErrors(cloned);
  }

  return cloned as v.GenericSchema<v.InferInput<T>, InferOutputWithoutErrors<T>>;
}
