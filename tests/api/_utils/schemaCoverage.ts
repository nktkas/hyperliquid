/**
 * Schema coverage testing utility for validating valibot schemas.
 *
 * Ensures that test data covers all branches, values, and edge cases in a schema.
 * This helps verify that test samples are comprehensive and exercise all schema paths.
 *
 * @example Basic usage
 * ```ts
 * import { schemaCoverage } from "./schemaCoverage.ts";
 * import * as v from "@valibot/valibot";
 *
 * const schema = v.union([v.literal("a"), v.literal("b")]);
 * schemaCoverage(schema, ["a", "b"] as const); // passes - all branches covered
 * ```
 *
 * @example Handling coverage issues
 * ```ts
 * // @ts-nocheck
 * import { schemaCoverage, SchemaCoverageError } from "./schemaCoverage.ts";
 * import * as v from "@valibot/valibot";
 *
 * const schema = v.union([v.literal("a"), v.literal("b")]);
 * try {
 *   schemaCoverage(schema, ["a"]); // throws - branch "b" uncovered
 * } catch (e) {
 *   if (e instanceof SchemaCoverageError) {
 *     console.log(e.issues); // [{ path: "#", type: "BRANCH_UNCOVERED", ... }]
 *   }
 * }
 * ```
 *
 * @example Ignoring specific paths
 * ```ts
 * // @ts-nocheck
 * import { schemaCoverage } from "./schemaCoverage.ts";
 * import * as v from "@valibot/valibot";
 *
 * const schema = v.union([v.literal("a"), v.literal("b")]);
 * schemaCoverage(schema, ["a"], ["#/union/1"]); // passes - branch 1 ignored
 * ```
 */

// deno-lint-ignore-file camelcase

import * as v from "@valibot/valibot";

// =============================================================================
// Types & Interfaces
// =============================================================================

/** Types of coverage issues that can be detected. */
export type IssueType =
  | "BRANCH_UNCOVERED"
  | "ARRAY_EMPTY"
  | "VALUE_UNCOVERED"
  | "NULL_TYPE_UNCOVERED"
  | "UNDEFINED_TYPE_UNCOVERED"
  | "DEFINED_TYPE_UNCOVERED";

/** A single coverage issue found during schema validation. */
export interface CoverageIssue {
  /** JSON pointer path to the schema location (e.g., "#/properties/name"). */
  path: string;
  /** Type of coverage issue. */
  type: IssueType;
  /** Human-readable description of the issue. */
  message: string;
}

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

/**
 * Type-level equality check for distributive conditional types.
 * Used to ensure compile-time type safety between schema output and sample data.
 */
type Equal<T, U> = (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2) ? true : false;

// =============================================================================
// Utility Functions
// =============================================================================

/** Schema types that wrap another schema with null/undefined handling. */
type WrapperType = "nullable" | "optional" | "nullish" | "undefinedable" | "exact_optional";

/**
 * Check if a value is "defined" for a given wrapper type.
 * - nullable: defined means not null
 * - optional/undefinedable/exact_optional: defined means not undefined
 * - nullish: defined means not null AND not undefined
 */
function isDefined(value: unknown, wrapperType: WrapperType): boolean {
  switch (wrapperType) {
    case "nullable":
      return value !== null;
    case "optional":
    case "undefinedable":
    case "exact_optional":
      return value !== undefined;
    case "nullish":
      return value !== null && value !== undefined;
  }
}

/** Collect only defined (non-null/non-undefined) samples based on wrapper type. */
function collectDefinedSamples(samples: unknown[], wrapperType: WrapperType): unknown[] {
  return samples.filter((s) => isDefined(s, wrapperType));
}

/** Check if any sample is defined based on wrapper type. */
function hasDefinedSample(samples: unknown[], wrapperType: WrapperType): boolean {
  return samples.some((s) => isDefined(s, wrapperType));
}

/** Type guard for object records (non-array objects). */
function isObjectRecord(s: unknown): s is Record<string, unknown> {
  return typeof s === "object" && s !== null && !Array.isArray(s);
}

// =============================================================================
// Type Helpers for Schema Access
// =============================================================================

// deno-lint-ignore no-explicit-any
type AnySchema = any;

interface WrappedSchema {
  wrapped: v.GenericSchema;
  default?: unknown;
}

interface ItemSchema {
  item: v.GenericSchema;
}

interface ValueSchema {
  value: v.GenericSchema;
}

interface KeyValueSchema {
  key: v.GenericSchema;
  value: v.GenericSchema;
}

interface OptionsSchema {
  options: v.GenericSchema[];
}

interface EntriesSchema {
  entries: Record<string, v.GenericSchema>;
  pipe?: v.GenericPipeAction[];
}

interface ItemsSchema {
  items: v.GenericSchema[];
  pipe?: v.GenericPipeAction[];
}

interface RestSchema {
  rest: v.GenericSchema;
}

interface GetterSchema {
  getter: () => v.GenericSchema;
}

interface EnumSchema {
  enum: Record<string, unknown>;
}

interface PicklistOptionsSchema {
  options: unknown[];
}

// =============================================================================
// Main API
// =============================================================================

/**
 * Validates samples against a valibot schema and checks for coverage issues.
 *
 * Coverage checking ensures that all branches, values, and edge cases in the schema
 * are exercised by the provided samples. This helps verify that test data is comprehensive.
 *
 * @param schema - The valibot schema to validate against
 * @param samples - Array of data samples (must match schema output type)
 * @param ignorePaths - Paths to ignore during coverage checking
 * @throws {Error} If samples are invalid or empty
 * @throws {SchemaCoverageError} If coverage issues are found
 *
 * @example
 * ```ts
 * // @ts-nocheck
 * import { schemaCoverage } from "./schemaCoverage.ts";
 * import * as v from "@valibot/valibot";
 *
 * const schema = v.union([v.literal("a"), v.literal("b")]);
 * schemaCoverage(schema, ["a", "b"]); // passes
 * schemaCoverage(schema, ["a"]); // throws: BRANCH_UNCOVERED
 * schemaCoverage(schema, ["a"], ["#"]); // passes: root path ignored
 * ```
 */
export function schemaCoverage<TSchema extends v.GenericSchema, TSample>(
  schema: TSchema,
  samples: TSample[] & (Equal<TSample, v.InferOutput<TSchema>> extends true ? TSample[] : never),
  ignorePaths: string[] = [],
): void {
  // Validate samples against strictified schema
  const validationResult = v.safeParse(v.pipe(v.array(strictify(schema)), v.nonEmpty()), samples);
  if (!validationResult.success) {
    throw new Error(JSON.stringify(samples) + "\n\n" + v.summarize(validationResult.issues));
  }

  // Check coverage
  const issues = checkCoverage(schema, samples, ignorePaths, "#");
  if (issues.length > 0) {
    const details = issues.map((i) => `- ${i.path}: ${i.type} - ${i.message}`).join("\n");
    throw new SchemaCoverageError(`Schema coverage issues:\n${details}`, issues);
  }
}

// =============================================================================
// Schema Transformation
// =============================================================================

/** Options for creating a schema transformer. */
export interface SchemaTransformOptions {
  /**
   * Called before standard handling. Return a schema to use it, or null to continue with standard handling.
   * The recurse function should be called to transform nested schemas.
   */
  preTransform?: (schema: v.GenericSchema, recurse: (s: v.GenericSchema) => v.GenericSchema) => v.GenericSchema | null;
  /** Factory for creating object schemas. Defaults to v.object. */
  objectFactory?: (entries: Record<string, v.GenericSchema>) => v.GenericSchema;
  /** Factory for creating tuple schemas. Defaults to v.tuple. */
  tupleFactory?: (items: v.GenericSchema[]) => v.GenericSchema;
  /** If true, intersect options are transformed. Defaults to false (intersect returned as-is). */
  transformIntersect?: boolean;
}

/** Transform handler type. */
type TransformHandler = (s: AnySchema, transform: (schema: v.GenericSchema) => v.GenericSchema) => v.GenericSchema;

/** Transform entries helper. */
function transformEntries(
  entries: Record<string, v.GenericSchema>,
  transform: (s: v.GenericSchema) => v.GenericSchema,
): Record<string, v.GenericSchema> {
  return Object.fromEntries(
    Object.entries(entries).map(([k, val]) => [k, transform(val)]),
  );
}

/** Apply pipe if present. */
function withPipe(schema: v.GenericSchema, s: AnySchema): v.GenericSchema {
  return s.pipe ? v.pipe(schema, ...s.pipe) : schema;
}

/** Create wrapper handler (optional, nullable, etc.) */
function createWrapperHandler(
  factory: (wrapped: v.GenericSchema) => v.GenericSchema,
  factoryWithDefault: (wrapped: v.GenericSchema, def: unknown) => v.GenericSchema,
): TransformHandler {
  return (s, transform) => {
    const wrapped = transform(s.wrapped);
    return s.default !== undefined ? factoryWithDefault(wrapped, s.default) : factory(wrapped);
  };
}

/** Create transform handlers map with given factories. */
function createTransformHandlers(
  objectFactory: (entries: Record<string, v.GenericSchema>) => v.GenericSchema,
  tupleFactory: (items: v.GenericSchema[]) => v.GenericSchema,
  transformIntersect: boolean,
): Record<string, TransformHandler> {
  return {
    // Wrapper schemas with default preservation
    optional: createWrapperHandler(v.optional, v.optional),
    nullable: createWrapperHandler(v.nullable, v.nullable),
    nullish: createWrapperHandler(v.nullish, v.nullish),
    undefinedable: createWrapperHandler(v.undefinedable, v.undefinedable),
    exact_optional: createWrapperHandler(v.exactOptional, v.exactOptional),

    // Non-wrapper schemas
    non_nullable: (s, transform) => v.nonNullable(transform(s.wrapped)),
    non_nullish: (s, transform) => v.nonNullish(transform(s.wrapped)),
    non_optional: (s, transform) => v.nonOptional(transform(s.wrapped)),

    // Collection schemas
    array: (s, transform) => v.array(transform(s.item)),
    set: (s, transform) => v.set(transform(s.value)),
    map: (s, transform) => v.map(transform(s.key), transform(s.value)),
    record: (s, transform) => {
      const key = s.key ? transform(s.key) : v.string();
      return v.record(key as v.GenericSchema<string, string | number | symbol>, transform(s.value));
    },

    // Composite schemas
    union: (s, transform) => v.union(s.options.map(transform)),
    variant: (s, transform) => v.variant(s.key, s.options.map(transform) as v.VariantOptions<string>),
    intersect: (s, transform) => transformIntersect ? v.intersect(s.options.map(transform) as v.IntersectOptions) : s,

    // Lazy schema
    lazy: (s, transform) => v.lazy(() => transform(s.getter())),

    // Object schemas
    object: (s, transform) => withPipe(objectFactory(transformEntries(s.entries, transform)), s),
    strict_object: (s, transform) => withPipe(objectFactory(transformEntries(s.entries, transform)), s),
    loose_object: (s, transform) => withPipe(v.looseObject(transformEntries(s.entries, transform)), s),
    object_with_rest: (s, transform) =>
      withPipe(v.objectWithRest(transformEntries(s.entries, transform), transform(s.rest)), s),

    // Tuple schemas
    tuple: (s, transform) => withPipe(tupleFactory(s.items.map(transform)), s),
    strict_tuple: (s, transform) => withPipe(tupleFactory(s.items.map(transform)), s),
    loose_tuple: (s, transform) => withPipe(v.looseTuple(s.items.map(transform)), s),
    tuple_with_rest: (s, transform) => withPipe(v.tupleWithRest(s.items.map(transform), transform(s.rest)), s),
  };
}

/**
 * Creates a schema transformer function that recursively transforms schemas.
 * Used internally for strictification and can be used by wrappers for custom transformations.
 *
 * @param options - Transformation options
 * @returns A function that transforms schemas
 */
export function createSchemaTransformer(
  options: SchemaTransformOptions = {},
): (schema: v.GenericSchema) => v.GenericSchema {
  const {
    preTransform,
    objectFactory = v.object,
    tupleFactory = v.tuple,
    transformIntersect = false,
  } = options;

  const handlers = createTransformHandlers(objectFactory, tupleFactory, transformIntersect);

  function transform(schema: v.GenericSchema): v.GenericSchema {
    // Pre-transform hook
    if (preTransform) {
      const result = preTransform(schema, transform);
      if (result !== null) return result;
    }

    const s = schema as AnySchema;
    const type = s.type as string | undefined;
    if (!type) return schema;

    const handler = handlers[type];
    return handler ? handler(s, transform) : schema;
  }

  return transform;
}

/** Convert a schema to its strict version (no extra properties/items allowed). */
const strictify = createSchemaTransformer({
  objectFactory: v.strictObject,
  tupleFactory: v.strictTuple,
});

// =============================================================================
// Coverage Checking
// =============================================================================

/** Handler for checking coverage of a specific schema type. */
type CoverageHandler = (schema: AnySchema, samples: unknown[], ignorePaths: string[], path: string) => CoverageIssue[];

/** Handlers for checking coverage of specific schema types. */
const coverageHandlers: Record<string, CoverageHandler> = {
  // Branch schemas (union/variant)
  union: handleBranchSchema,
  variant: handleBranchSchema,

  // Enumeration schemas
  picklist: handlePicklistSchema,
  enum: handleEnumSchema,

  // Collection schemas
  array: handleArraySchema,
  set: handleSetSchema,
  map: handleMapSchema,
  record: handleRecordSchema,

  // Tuple schemas
  tuple: handleTupleSchema,
  strict_tuple: handleTupleSchema,
  loose_tuple: handleTupleSchema,
  tuple_with_rest: handleTupleWithRestSchema,

  // Object schemas
  object: handleObjectSchema,
  strict_object: handleObjectSchema,
  loose_object: handleObjectSchema,
  object_with_rest: handleObjectWithRestSchema,

  // Composite schemas
  intersect: handleIntersectSchema,

  // Wrapper schemas (nullable/optional/nullish/undefinedable)
  nullable: handleWrapperSchema,
  optional: handleWrapperSchema,
  nullish: handleWrapperSchema,
  undefinedable: handleWrapperSchema,
  exact_optional: handleExactOptionalSchema,

  // Non-wrapper schemas (unwrap and check inner)
  non_nullable: handleNonWrapperSchema,
  non_nullish: handleNonWrapperSchema,
  non_optional: handleNonWrapperSchema,

  // Lazy schemas
  lazy: handleLazySchema,
};

/**
 * Recursively check schema coverage against samples.
 * @returns Array of coverage issues found
 */
function checkCoverage(
  schema: v.GenericSchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  // Skip ignored paths
  if (ignorePaths.includes(path)) {
    return [];
  }

  // Handle pipe schemas - find the base schema
  if ("pipe" in schema && Array.isArray(schema.pipe)) {
    const baseSchema = schema.pipe.find((item) =>
      typeof item === "object" && item !== null && "kind" in item && item.kind === "schema" && "type" in item
    );
    if (baseSchema) {
      return checkCoverage(baseSchema, samples, ignorePaths, path);
    }
  }

  // Dispatch to handler
  const type = (schema as { type?: string }).type;
  if (type) {
    const handler = coverageHandlers[type];
    if (handler) {
      return handler(schema, samples, ignorePaths, path);
    }
  }

  return [];
}

// =============================================================================
// Coverage Handlers - Shared Helpers
// =============================================================================

/** Check that all expected values are covered by samples. */
function checkValuesCoverage(
  expectedValues: unknown[],
  samples: unknown[],
  ignorePaths: string[],
  path: string,
  schemaType: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const sampleSet = new Set(samples);

  expectedValues.forEach((value, idx) => {
    const valuePath = `${path}/${schemaType}/${idx}`;
    if (ignorePaths.includes(valuePath)) return;

    if (!sampleSet.has(value)) {
      issues.push({
        path: valuePath,
        type: "VALUE_UNCOVERED",
        message: `Value '${String(value)}' is not covered by samples`,
      });
    }
  });

  return issues;
}

/** Check coverage for tuple items (shared between tuple and tuple_with_rest handlers). */
function checkTupleItemsCoverage(
  items: v.GenericSchema[],
  arrays: unknown[][],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  items.forEach((itemSchema, idx) => {
    const itemSamples = arrays.filter((arr) => arr.length > idx).map((arr) => arr[idx]);
    if (itemSamples.length > 0) {
      issues.push(...checkCoverage(itemSchema, itemSamples, ignorePaths, `${path}/items/${idx}`));
    }
  });
  return issues;
}

/** Check coverage for optional/nullish/exact_optional object properties. */
function checkOptionalPropertyCoverage(
  propSchema: v.GenericSchema,
  propSamples: unknown[],
  objects: Record<string, unknown>[],
  key: string,
  propPath: string,
  ignorePaths: string[],
  wrapperType: WrapperType,
): CoverageIssue[] {
  // Skip if path is ignored
  if (ignorePaths.includes(propPath)) {
    return [];
  }

  const issues: CoverageIssue[] = [];
  const isExactOptional = wrapperType === "exact_optional";
  const isNullish = wrapperType === "nullish";

  // Check undefined/missing coverage
  const undefinedPath = `${propPath}/undefined`;
  const hasUndefined = isExactOptional
    ? objects.some((obj) => !(key in obj))
    : objects.some((obj) => !(key in obj) || obj[key] === undefined);

  if (!hasUndefined && !ignorePaths.includes(undefinedPath)) {
    issues.push({
      path: undefinedPath,
      type: "UNDEFINED_TYPE_UNCOVERED",
      message: isExactOptional
        ? "ExactOptional property never appears as missing in samples"
        : "Optional property never appears as undefined in samples",
    });
  }

  // Check null coverage for nullish
  if (isNullish) {
    const nullPath = `${propPath}/null`;
    const hasNull = objects.some((obj) => key in obj && obj[key] === null);
    if (!hasNull && !ignorePaths.includes(nullPath)) {
      issues.push({
        path: nullPath,
        type: "NULL_TYPE_UNCOVERED",
        message: "Nullish property never appears as null in samples",
      });
    }
  }

  // Check defined coverage
  const definedPath = `${propPath}/defined`;
  const hasDefined = isExactOptional
    ? propSamples.length > 0 && hasDefinedSample(propSamples, wrapperType)
    : hasDefinedSample(propSamples, wrapperType);

  if (!hasDefined && !ignorePaths.includes(definedPath)) {
    issues.push({
      path: definedPath,
      type: "DEFINED_TYPE_UNCOVERED",
      message: isExactOptional
        ? "ExactOptional property never appears with a value in samples"
        : `${isNullish ? "Nullish" : "Optional"} property never appears with a value in samples`,
    });
  }

  // Check wrapped schema
  const wrappedSchema = (propSchema as unknown as WrappedSchema).wrapped;
  const definedSamples = collectDefinedSamples(propSamples, wrapperType);
  if (wrappedSchema && definedSamples.length > 0) {
    issues.push(...checkCoverage(wrappedSchema, definedSamples, ignorePaths, propPath));
  }

  return issues;
}

// =============================================================================
// Coverage Handlers
// =============================================================================

/** Handle union and variant schemas - check all branches are covered. */
function handleBranchSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const type = schema.type as string;
  const schemaOptions = (schema as OptionsSchema).options;

  schemaOptions.forEach((option, idx) => {
    const branchPath = `${path}/${type}/${idx}`;
    if (ignorePaths.includes(branchPath)) return;

    const matched = samples.filter((s) => v.safeParse(option, s).success);
    if (matched.length === 0) {
      issues.push({
        path: branchPath,
        type: "BRANCH_UNCOVERED",
        message: `Branch ${idx} in ${type} is not covered by samples`,
      });
    } else {
      issues.push(...checkCoverage(option, matched, ignorePaths, branchPath));
    }
  });

  return issues;
}

/** Handle picklist schemas - check all values are covered. */
function handlePicklistSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  return checkValuesCoverage((schema as PicklistOptionsSchema).options, samples, ignorePaths, path, "picklist");
}

/** Handle enum schemas - check all enum values are covered. */
function handleEnumSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const enumObj = (schema as EnumSchema).enum;
  // Filter out reverse mappings for numeric enums (where value -> key mapping exists)
  const enumValues = Object.keys(enumObj)
    .filter((key) => isNaN(Number(key)))
    .map((key) => enumObj[key]);
  return checkValuesCoverage(enumValues, samples, ignorePaths, path, "enum");
}

/** Handle array schemas - check arrays are non-empty and items are covered. */
function handleArraySchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const itemSchema = (schema as ItemSchema).item;
  const arrays = samples.filter(Array.isArray);

  // Check for empty arrays
  const arrayPath = `${path}/array`;
  if (arrays.length > 0 && arrays.every((arr) => arr.length === 0) && !ignorePaths.includes(arrayPath)) {
    issues.push({
      path: arrayPath,
      type: "ARRAY_EMPTY",
      message: "Array is empty in all samples",
    });
  }

  // Check items coverage
  const allItems = arrays.flat();
  if (allItems.length > 0) {
    issues.push(...checkCoverage(itemSchema, allItems, ignorePaths, `${path}/items`));
  }

  return issues;
}

/** Handle set schemas - check set items are covered. */
function handleSetSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const valueSchema = (schema as ValueSchema).value;
  const sets = samples.filter((s): s is Set<unknown> => s instanceof Set);
  const allItems: unknown[] = [];

  for (const set of sets) {
    allItems.push(...set);
  }

  if (allItems.length > 0) {
    issues.push(...checkCoverage(valueSchema, allItems, ignorePaths, `${path}/items`));
  }

  return issues;
}

/** Handle map schemas - check map keys and values are covered. */
function handleMapSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const mapSchema = schema as KeyValueSchema;
  const maps = samples.filter((s): s is Map<unknown, unknown> => s instanceof Map);

  const allKeys: unknown[] = [];
  const allValues: unknown[] = [];

  for (const map of maps) {
    allKeys.push(...map.keys());
    allValues.push(...map.values());
  }

  if (allKeys.length > 0) {
    issues.push(...checkCoverage(mapSchema.key, allKeys, ignorePaths, `${path}/keys`));
  }
  if (allValues.length > 0) {
    issues.push(...checkCoverage(mapSchema.value, allValues, ignorePaths, `${path}/values`));
  }

  return issues;
}

/** Handle record schemas - check record values are covered. */
function handleRecordSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const valueSchema = (schema as ValueSchema).value;
  const objects = samples.filter(isObjectRecord);
  const allValues: unknown[] = [];

  for (const obj of objects) {
    allValues.push(...Object.values(obj));
  }

  if (allValues.length > 0) {
    issues.push(...checkCoverage(valueSchema, allValues, ignorePaths, `${path}/values`));
  }

  return issues;
}

/** Handle tuple schemas - check all tuple items are covered. */
function handleTupleSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const items = (schema as ItemsSchema).items;
  const arrays = samples.filter(Array.isArray);
  return checkTupleItemsCoverage(items, arrays, ignorePaths, path);
}

/** Handle tuple with rest schemas - check items and rest are covered. */
function handleTupleWithRestSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const tupleSchema = schema as ItemsSchema & RestSchema;
  const arrays = samples.filter(Array.isArray);

  // Check fixed items
  issues.push(...checkTupleItemsCoverage(tupleSchema.items, arrays, ignorePaths, path));

  // Check rest items
  const restItems: unknown[] = [];
  for (const arr of arrays) {
    if (arr.length > tupleSchema.items.length) {
      restItems.push(...arr.slice(tupleSchema.items.length));
    }
  }
  if (restItems.length > 0) {
    issues.push(...checkCoverage(tupleSchema.rest, restItems, ignorePaths, `${path}/rest`));
  }

  return issues;
}

/** Handle object schemas - check all properties are covered. */
function handleObjectSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const entries = (schema as EntriesSchema).entries;
  const objects = samples.filter(isObjectRecord);

  for (const [key, propSchema] of Object.entries(entries)) {
    const propPath = `${path}/properties/${key}`;
    const propSamples = objects.filter((obj) => key in obj).map((obj) => obj[key]);
    const propType = (propSchema as { type?: string }).type;

    // Handle optional/nullish/exact_optional properties
    if (propType === "optional" || propType === "nullish" || propType === "exact_optional") {
      issues.push(...checkOptionalPropertyCoverage(
        propSchema,
        propSamples,
        objects,
        key,
        propPath,
        ignorePaths,
        propType as WrapperType,
      ));
    } // Handle required properties
    else if (propSamples.length > 0) {
      issues.push(...checkCoverage(propSchema, propSamples, ignorePaths, propPath));
    }
  }

  return issues;
}

/** Handle object with rest schemas - check entries and rest are covered. */
function handleObjectWithRestSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const objSchema = schema as EntriesSchema & RestSchema;
  const objects = samples.filter(isObjectRecord);

  // Check defined entries (required properties only for object_with_rest)
  for (const [key, propSchema] of Object.entries(objSchema.entries)) {
    const propPath = `${path}/properties/${key}`;
    const propSamples = objects.filter((obj) => key in obj).map((obj) => obj[key]);
    if (propSamples.length > 0) {
      issues.push(...checkCoverage(propSchema, propSamples, ignorePaths, propPath));
    }
  }

  // Check rest values
  const definedKeys = new Set(Object.keys(objSchema.entries));
  const restValues: unknown[] = [];
  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj)) {
      if (!definedKeys.has(key)) {
        restValues.push(value);
      }
    }
  }
  if (restValues.length > 0) {
    issues.push(...checkCoverage(objSchema.rest, restValues, ignorePaths, `${path}/rest`));
  }

  return issues;
}

/** Handle intersect schemas - check all intersected schemas are covered. */
function handleIntersectSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const schemaOptions = (schema as OptionsSchema).options;

  schemaOptions.forEach((subschema, idx) => {
    issues.push(...checkCoverage(subschema, samples, ignorePaths, `${path}/intersect/${idx}`));
  });

  return issues;
}

/** Handle wrapper schemas (nullable/optional/nullish/undefinedable). */
function handleWrapperSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const wrapperType = schema.type as WrapperType;
  const wrappedSchema = (schema as WrappedSchema).wrapped;

  const hasNull = samples.some((s) => s === null);
  const hasUndefined = samples.some((s) => s === undefined);
  const hasDefined = hasDefinedSample(samples, wrapperType);

  // Check null coverage for nullable/nullish
  const nullPath = `${path}/null`;
  if ((wrapperType === "nullable" || wrapperType === "nullish") && !hasNull && !ignorePaths.includes(nullPath)) {
    issues.push({
      path: nullPath,
      type: "NULL_TYPE_UNCOVERED",
      message: `Type 'null' in ${wrapperType} is not covered by samples`,
    });
  }

  // Check undefined coverage for optional/nullish/undefinedable
  const undefinedPath = `${path}/undefined`;
  if (
    (wrapperType === "optional" || wrapperType === "nullish" || wrapperType === "undefinedable") && !hasUndefined &&
    !ignorePaths.includes(undefinedPath)
  ) {
    issues.push({
      path: undefinedPath,
      type: "UNDEFINED_TYPE_UNCOVERED",
      message: `Type 'undefined' in ${wrapperType} is not covered by samples`,
    });
  }

  // Check defined coverage
  const definedPath = `${path}/defined`;
  if (!hasDefined && !ignorePaths.includes(definedPath)) {
    const typeDesc = wrapperType === "nullable" ? "Non-null type" : "Defined value";
    issues.push({
      path: definedPath,
      type: "DEFINED_TYPE_UNCOVERED",
      message: `${typeDesc} in ${wrapperType} is not covered by samples`,
    });
  }

  // Check wrapped schema
  const definedSamples = collectDefinedSamples(samples, wrapperType);
  if (definedSamples.length > 0) {
    issues.push(...checkCoverage(wrappedSchema, definedSamples, ignorePaths, `${path}/wrapped`));
  }

  return issues;
}

/** Handle exactOptional schemas (missing vs undefined distinction). */
function handleExactOptionalSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const wrappedSchema = (schema as WrappedSchema).wrapped;

  // exactOptional only accepts missing, not undefined, so we only check defined coverage
  const hasDefined = hasDefinedSample(samples, "exact_optional");
  const definedPath = `${path}/defined`;

  if (!hasDefined && !ignorePaths.includes(definedPath)) {
    issues.push({
      path: definedPath,
      type: "DEFINED_TYPE_UNCOVERED",
      message: "Defined value in exact_optional is not covered by samples",
    });
  }

  // Check wrapped schema for defined samples
  const definedSamples = collectDefinedSamples(samples, "exact_optional");
  if (definedSamples.length > 0) {
    issues.push(...checkCoverage(wrappedSchema, definedSamples, ignorePaths, `${path}/wrapped`));
  }

  return issues;
}

/** Handle non-wrapper schemas (nonNullable/nonNullish/nonOptional) - just check wrapped. */
function handleNonWrapperSchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const wrappedSchema = (schema as WrappedSchema).wrapped;
  return checkCoverage(wrappedSchema, samples, ignorePaths, path);
}

/** Handle lazy schemas - resolve and check. */
function handleLazySchema(
  schema: AnySchema,
  samples: unknown[],
  ignorePaths: string[],
  path: string,
): CoverageIssue[] {
  const resolvedSchema = (schema as GetterSchema).getter();
  return checkCoverage(resolvedSchema, samples, ignorePaths, path);
}
