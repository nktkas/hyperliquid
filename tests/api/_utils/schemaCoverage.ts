/**
 * Universal JSON Schema coverage checker.
 *
 * Validates that test samples exercise all branches, values, and structural
 * elements defined in a JSON Schema. Helps verify that test data is
 * comprehensive and covers all schema paths.
 *
 * Supports JSON Schema Draft-07 features including:
 * - Composition: anyOf, oneOf, allOf, if/then/else
 * - Types: object, array, tuple (items array), enum, const
 * - Nullable: type arrays with null, anyOf/oneOf with null branches
 * - References: $ref with definitions resolution
 * - Optional properties: required array checking
 *
 * @example
 * ```ts
 * import { schemaCoverage } from "./schemaCoverage.ts";
 *
 * const schema = { anyOf: [{ const: "a" }, { const: "b" }] };
 * schemaCoverage(schema, ["a", "b"]); // passes - all branches covered
 * ```
 *
 * @example
 * ```ts
 * // @ts-nocheck
 * import { schemaCoverage, SchemaCoverageError } from "./schemaCoverage.ts";
 *
 * const schema = { anyOf: [{ const: "a" }, { const: "b" }] };
 * try {
 *   schemaCoverage(schema, ["a"]); // throws - branch for "b" uncovered
 * } catch (e) {
 *   if (e instanceof SchemaCoverageError) {
 *     console.log(e.issues); // [{ path: "#/anyOf/1", type: "BRANCH_UNCOVERED", ... }]
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * import { schemaCoverage } from "./schemaCoverage.ts";
 *
 * const schema = { anyOf: [{ const: "a" }, { const: "b" }] };
 * schemaCoverage(schema, ["a"], ["#/anyOf/1"]); // passes - branch 1 ignored
 * ```
 *
 * @module
 */

import Ajv from "npm:ajv@8";

// ============================================================
// Types & Interfaces
// ============================================================

/** Subset of JSON Schema handled by this module. */
export interface JsonSchema {
  // Type
  type?: string | string[];
  const?: unknown;
  enum?: unknown[];
  // Object
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  patternProperties?: Record<string, JsonSchema>;
  // Array
  items?: JsonSchema | JsonSchema[];
  minItems?: number;
  maxItems?: number;
  // Composition
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  allOf?: JsonSchema[];
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
  // Reference
  $ref?: string;
  // Metadata
  description?: string;
  // Index signature for additional JSON Schema keywords
  [key: string]: unknown;
}

/** Types of coverage issues that can be detected. */
export type IssueType =
  | "BRANCH_UNCOVERED"
  | "VALUE_UNCOVERED"
  | "ARRAY_EMPTY"
  | "NULL_UNCOVERED"
  | "DEFINED_UNCOVERED"
  | "MISSING_UNCOVERED";

/** A single coverage issue found during schema validation. */
export interface CoverageIssue {
  /** JSON Pointer-like path to the schema location. */
  path: string;
  /** Type of coverage issue. */
  type: IssueType;
  /** Human-readable description of the issue. */
  message: string;
}

/** Internal context threaded through recursive coverage checking. */
interface CoverageContext {
  /** Ajv instance for branch matching validation. */
  ajv: InstanceType<typeof Ajv.default>;
  /** Top-level definitions for $ref resolution. */
  defs?: Record<string, JsonSchema>;
  /** Set of paths to skip during coverage checking. */
  ignorePaths: Set<string>;
  /** Cache of compiled Ajv validators keyed by original schema object. */
  validatorCache: Map<JsonSchema, (data: unknown) => boolean>;
}

// ============================================================
// Classes
// ============================================================

/** Error thrown when schema coverage issues are found. */
export class SchemaCoverageError extends Error {
  /** Array of coverage issues found. */
  issues: CoverageIssue[];

  constructor(message: string, issues: CoverageIssue[]) {
    super(message);
    this.name = "SchemaCoverageError";
    this.issues = issues;
  }
}

// ============================================================
// Main API
// ============================================================

/**
 * Validates samples against a JSON Schema and checks for coverage issues.
 *
 * Coverage checking ensures that all branches, values, and edge cases in the
 * schema are exercised by the provided samples.
 *
 * @param schema The JSON Schema to validate against
 * @param samples Array of data samples to check
 * @param ignorePaths Paths to skip during coverage checking
 *
 * @throws {Error} If samples are empty or fail schema validation
 * @throws {SchemaCoverageError} If coverage issues are found
 */
export function schemaCoverage(
  schema: JsonSchema,
  samples: unknown[],
  ignorePaths: string[] = [],
): void {
  if (samples.length === 0) {
    throw new Error("Samples array must not be empty");
  }

  // Validate all samples against the schema
  const ajv = new Ajv.default({ strict: false, allErrors: true });
  const validate = ajv.compile(schema);

  for (let i = 0; i < samples.length; i++) {
    if (!validate(samples[i])) {
      throw new Error(
        `Sample at index ${i} failed validation:\n` +
          JSON.stringify(samples[i], null, 2) + "\n\n" +
          "Errors:\n" + JSON.stringify(validate.errors, null, 2),
      );
    }
  }

  // Check coverage
  const ctx: CoverageContext = {
    ajv,
    defs: schema["definitions"] as Record<string, JsonSchema> | undefined,
    ignorePaths: new Set(ignorePaths),
    validatorCache: new Map(),
  };

  const issues = checkCoverage(schema, samples, "#", ctx);

  if (issues.length > 0) {
    const details = issues.map((i) => `- ${i.path}: ${i.type} - ${i.message}`).join("\n");
    throw new SchemaCoverageError(`Schema coverage issues:\n${details}`, issues);
  }
}

// ============================================================
// Coverage Checking
// ============================================================

/**
 * Recursively checks schema coverage against samples.
 *
 * @return Array of coverage issues found
 */
function checkCoverage(
  schema: JsonSchema,
  samples: unknown[],
  path: string,
  ctx: CoverageContext,
): CoverageIssue[] {
  if (ctx.ignorePaths.has(path)) return [];

  // Resolve $ref
  if (schema.$ref) {
    return checkCoverage(resolveRef(schema.$ref, ctx.defs), samples, path, ctx);
  }

  // Nullable type array: type: ["string", "null"]
  if (isNullableTypeArray(schema)) {
    return handleNullableTypeArray(schema, samples, path, ctx);
  }

  const issues: CoverageIssue[] = [];

  // Composition keywords (mutually exclusive at the same level for coverage purposes)
  if (schema.anyOf) issues.push(...handleComposition("anyOf", schema.anyOf, samples, path, ctx));
  else if (schema.oneOf) issues.push(...handleComposition("oneOf", schema.oneOf, samples, path, ctx));
  else if (schema.allOf) issues.push(...handleAllOf(schema.allOf, samples, path, ctx));
  else if (schema.enum) issues.push(...handleEnum(schema.enum, samples, path, ctx));
  else {
    // Type-specific keywords
    if (schema.type === "object" || schema.properties) {
      issues.push(...handleObject(schema, samples, path, ctx));
    }
    if (schema.type === "array") {
      issues.push(...handleArray(schema, samples, path, ctx));
    }
  }

  // Handle if/then/else (can coexist with other keywords)
  if (schema.if && (schema.then || schema.else)) {
    issues.push(...handleIfThenElse(schema, samples, path, ctx));
  }

  return issues;
}

// ============================================================
// Coverage Handlers - Composition
// ============================================================

/** Handles anyOf and oneOf schemas - checks all branches are covered. */
function handleComposition(
  keyword: "anyOf" | "oneOf",
  branches: JsonSchema[],
  samples: unknown[],
  path: string,
  ctx: CoverageContext,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];

  // Detect nullable: one of the branches is { type: "null" }
  const nullBranchIndex = branches.findIndex(isNullSchema);

  if (nullBranchIndex !== -1) {
    // Nullable composition: check null and non-null coverage separately
    const nullPath = `${path}/null`;
    const definedPath = `${path}/defined`;

    const hasNull = samples.some((s) => s === null);
    const hasNonNull = samples.some((s) => s !== null);

    if (!hasNull && !ctx.ignorePaths.has(nullPath)) {
      issues.push({
        path: nullPath,
        type: "NULL_UNCOVERED",
        message: `Nullable ${keyword} never receives null`,
      });
    }

    if (!hasNonNull && !ctx.ignorePaths.has(definedPath)) {
      issues.push({
        path: definedPath,
        type: "DEFINED_UNCOVERED",
        message: `Nullable ${keyword} never receives a non-null value`,
      });
    }

    // Check coverage of non-null branches with non-null samples
    const nonNullBranches = branches.filter((_, i) => i !== nullBranchIndex);
    const nonNullSamples = samples.filter((s) => s !== null);

    if (nonNullBranches.length === 1 && nonNullSamples.length > 0) {
      // Single non-null branch: recurse directly
      const originalIndex = branches.indexOf(nonNullBranches[0]);
      issues.push(
        ...checkCoverage(nonNullBranches[0], nonNullSamples, `${path}/${keyword}/${originalIndex}`, ctx),
      );
    } else if (nonNullBranches.length > 1 && nonNullSamples.length > 0) {
      // Multiple non-null branches: check each is covered
      for (const branch of nonNullBranches) {
        const originalIndex = branches.indexOf(branch);
        const branchPath = `${path}/${keyword}/${originalIndex}`;
        if (ctx.ignorePaths.has(branchPath)) continue;

        const matched = nonNullSamples.filter((s) => matchesBranch(branch, s, ctx));
        if (matched.length === 0) {
          issues.push({
            path: branchPath,
            type: "BRANCH_UNCOVERED",
            message: `Branch ${originalIndex} in ${keyword} is not covered by any sample`,
          });
        } else {
          issues.push(...checkCoverage(branch, matched, branchPath, ctx));
        }
      }
    }
  } else {
    // Non-nullable: standard branch coverage
    for (let i = 0; i < branches.length; i++) {
      const branchPath = `${path}/${keyword}/${i}`;
      if (ctx.ignorePaths.has(branchPath)) continue;

      const matched = samples.filter((s) => matchesBranch(branches[i], s, ctx));
      if (matched.length === 0) {
        issues.push({
          path: branchPath,
          type: "BRANCH_UNCOVERED",
          message: `Branch ${i} in ${keyword} is not covered by any sample`,
        });
      } else {
        issues.push(...checkCoverage(branches[i], matched, branchPath, ctx));
      }
    }
  }

  return issues;
}

/** Handles allOf schemas - recurses into each sub-schema. */
function handleAllOf(
  schemas: JsonSchema[],
  samples: unknown[],
  path: string,
  ctx: CoverageContext,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  for (let i = 0; i < schemas.length; i++) {
    issues.push(...checkCoverage(schemas[i], samples, `${path}/allOf/${i}`, ctx));
  }
  return issues;
}

// ============================================================
// Coverage Handlers - Enum
// ============================================================

/** Handles enum schemas - checks all values are covered. */
function handleEnum(
  values: unknown[],
  samples: unknown[],
  path: string,
  ctx: CoverageContext,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const sampleSet = new Set(samples.map((s) => JSON.stringify(s)));

  for (let i = 0; i < values.length; i++) {
    const valuePath = `${path}/enum/${i}`;
    if (ctx.ignorePaths.has(valuePath)) continue;

    if (!sampleSet.has(JSON.stringify(values[i]))) {
      issues.push({
        path: valuePath,
        type: "VALUE_UNCOVERED",
        message: `Enum value '${String(values[i])}' is not covered by any sample`,
      });
    }
  }

  return issues;
}

// ============================================================
// Coverage Handlers - Object
// ============================================================

/** Handles object schemas - checks all properties are covered. */
function handleObject(
  schema: JsonSchema,
  samples: unknown[],
  path: string,
  ctx: CoverageContext,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const properties = schema.properties;
  if (!properties) return issues;

  const requiredSet = new Set(schema.required ?? []);
  const objects = samples.filter(isObjectRecord);

  for (const [key, propSchema] of Object.entries(properties)) {
    const propPath = `${path}/properties/${key}`;
    if (ctx.ignorePaths.has(propPath)) continue;

    if (requiredSet.has(key)) {
      // Required property: collect values and recurse
      const propSamples = objects
        .filter((obj) => key in obj)
        .map((obj) => obj[key]);

      if (propSamples.length > 0) {
        issues.push(...checkCoverage(propSchema, propSamples, propPath, ctx));
      }
    } else {
      // Optional property: check missing and present coverage
      const missingPath = `${propPath}/missing`;
      const presentPath = `${propPath}/present`;

      const hasMissing = objects.some((obj) => !(key in obj));
      const hasPresent = objects.some((obj) => key in obj);

      if (!hasMissing && !ctx.ignorePaths.has(missingPath)) {
        issues.push({
          path: missingPath,
          type: "MISSING_UNCOVERED",
          message: `Optional property '${key}' is never missing in samples`,
        });
      }

      if (!hasPresent && !ctx.ignorePaths.has(presentPath)) {
        issues.push({
          path: presentPath,
          type: "DEFINED_UNCOVERED",
          message: `Optional property '${key}' is never present in samples`,
        });
      }

      // Recurse into present values
      const presentSamples = objects
        .filter((obj) => key in obj)
        .map((obj) => obj[key]);

      if (presentSamples.length > 0) {
        issues.push(...checkCoverage(propSchema, presentSamples, propPath, ctx));
      }
    }
  }

  return issues;
}

// ============================================================
// Coverage Handlers - Array & Tuple
// ============================================================

/** Handles array schemas - checks items and non-emptiness. */
function handleArray(
  schema: JsonSchema,
  samples: unknown[],
  path: string,
  ctx: CoverageContext,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const arrays = samples.filter(Array.isArray);

  // Check for tuple items (items array)
  const tupleItems = getTupleItems(schema);
  if (tupleItems) {
    return handleTuple(tupleItems, arrays, path, ctx);
  }

  // Homogeneous array: items as single schema
  if (schema.items && !Array.isArray(schema.items)) {
    // Check non-empty
    const arrayPath = `${path}/array`;
    if (arrays.length > 0 && arrays.every((arr) => arr.length === 0) && !ctx.ignorePaths.has(arrayPath)) {
      issues.push({
        path: arrayPath,
        type: "ARRAY_EMPTY",
        message: "Array is empty in all samples",
      });
    }

    // Recurse into items
    const allItems = arrays.flat();
    if (allItems.length > 0) {
      issues.push(...checkCoverage(schema.items, allItems, `${path}/items`, ctx));
    }
  }

  return issues;
}

/** Handles tuple schemas - checks each positional item. */
function handleTuple(
  tupleItems: JsonSchema[],
  arrays: unknown[][],
  path: string,
  ctx: CoverageContext,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];

  for (let i = 0; i < tupleItems.length; i++) {
    const itemPath = `${path}/items/${i}`;
    if (ctx.ignorePaths.has(itemPath)) continue;

    const itemSamples = arrays
      .filter((arr) => arr.length > i)
      .map((arr) => arr[i]);

    if (itemSamples.length > 0) {
      issues.push(...checkCoverage(tupleItems[i], itemSamples, itemPath, ctx));
    }
  }

  return issues;
}

// ============================================================
// Coverage Handlers - Nullable Type Array
// ============================================================

/**
 * Handles nullable type arrays: `type: ["string", "null"]`.
 * Checks that samples include both null and non-null values.
 */
function handleNullableTypeArray(
  schema: JsonSchema,
  samples: unknown[],
  path: string,
  ctx: CoverageContext,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const types = schema.type as string[];

  const nullPath = `${path}/null`;
  const definedPath = `${path}/defined`;

  const hasNull = samples.some((s) => s === null);
  const hasNonNull = samples.some((s) => s !== null);

  if (!hasNull && !ctx.ignorePaths.has(nullPath)) {
    issues.push({
      path: nullPath,
      type: "NULL_UNCOVERED",
      message: "Nullable type never receives null",
    });
  }

  if (!hasNonNull && !ctx.ignorePaths.has(definedPath)) {
    issues.push({
      path: definedPath,
      type: "DEFINED_UNCOVERED",
      message: "Nullable type never receives a non-null value",
    });
  }

  // Create non-null schema and recurse with non-null samples
  const nonNullTypes = types.filter((t) => t !== "null");
  const nonNullSamples = samples.filter((s) => s !== null);

  if (nonNullTypes.length > 0 && nonNullSamples.length > 0) {
    const nonNullSchema: JsonSchema = {
      ...schema,
      type: nonNullTypes.length === 1 ? nonNullTypes[0] : nonNullTypes,
    };
    issues.push(...checkCoverage(nonNullSchema, nonNullSamples, path, ctx));
  }

  return issues;
}

// ============================================================
// Coverage Handlers - if/then/else
// ============================================================

/** Handles if/then/else - checks both conditional paths are covered. */
function handleIfThenElse(
  schema: JsonSchema,
  samples: unknown[],
  path: string,
  ctx: CoverageContext,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];

  const matchesIf = samples.filter((s) => matchesBranch(schema.if!, s, ctx));
  const notMatchesIf = samples.filter((s) => !matchesBranch(schema.if!, s, ctx));

  if (schema.then) {
    const thenPath = `${path}/then`;
    if (!ctx.ignorePaths.has(thenPath)) {
      if (matchesIf.length === 0) {
        issues.push({
          path: thenPath,
          type: "BRANCH_UNCOVERED",
          message: "No sample matches the 'if' condition to cover 'then' branch",
        });
      } else {
        issues.push(...checkCoverage(schema.then, matchesIf, thenPath, ctx));
      }
    }
  }

  if (schema.else) {
    const elsePath = `${path}/else`;
    if (!ctx.ignorePaths.has(elsePath)) {
      if (notMatchesIf.length === 0) {
        issues.push({
          path: elsePath,
          type: "BRANCH_UNCOVERED",
          message: "All samples match 'if' condition, 'else' branch is not covered",
        });
      } else {
        issues.push(...checkCoverage(schema.else, notMatchesIf, elsePath, ctx));
      }
    }
  }

  return issues;
}

// ============================================================
// Utilities
// ============================================================

/** Resolves a $ref pointer to its target schema. */
function resolveRef(ref: string, defs?: Record<string, JsonSchema>): JsonSchema {
  const prefix = "#/definitions/";
  if (ref.startsWith(prefix) && defs) {
    const name = decodeURIComponent(ref.slice(prefix.length));
    const resolved = defs[name];
    if (resolved) return resolved;
  }
  throw new Error(`Cannot resolve $ref: ${ref}`);
}

/**
 * Checks if a sample matches a schema branch using Ajv validation.
 * Results are cached per schema object for performance.
 */
function matchesBranch(schema: JsonSchema, sample: unknown, ctx: CoverageContext): boolean {
  let validate = ctx.validatorCache.get(schema);
  if (!validate) {
    const withDefs = ctx.defs ? { ...schema, definitions: ctx.defs } : schema;
    try {
      const compiled = ctx.ajv.compile(withDefs);
      validate = (data: unknown) => compiled(data);
    } catch {
      // If compilation fails, fall back to always matching
      validate = () => true;
    }
    ctx.validatorCache.set(schema, validate);
  }
  return validate(sample);
}

/** Type guard for object records (non-array objects). */
function isObjectRecord(s: unknown): s is Record<string, unknown> {
  return typeof s === "object" && s !== null && !Array.isArray(s);
}

/** Checks if a schema represents the null type. */
function isNullSchema(schema: JsonSchema): boolean {
  return schema.type === "null";
}

/** Checks if a schema has a nullable type array (e.g., `type: ["string", "null"]`). */
function isNullableTypeArray(schema: JsonSchema): boolean {
  return Array.isArray(schema.type) && schema.type.includes("null");
}

/** Extracts tuple item schemas from items array. */
function getTupleItems(schema: JsonSchema): JsonSchema[] | null {
  if (Array.isArray(schema.items)) return schema.items;
  return null;
}
