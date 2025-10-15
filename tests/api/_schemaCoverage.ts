import * as v from "valibot";
import { Decimal, Integer, UnsignedDecimal, UnsignedInteger } from "../../src/api/_base.ts"; // Hack to avoid importing into every test

export type IssueType =
  | "BRANCH_UNCOVERED"
  | "ARRAY_EMPTY"
  | "LITERAL_VALUE_UNCOVERED"
  | "PICKLIST_VALUE_UNCOVERED"
  | "NULL_TYPE_UNCOVERED"
  | "UNDEFINED_TYPE_UNCOVERED"
  | "DEFINED_TYPE_UNCOVERED";

export interface CoverageIssue {
  path: string;
  type: IssueType;
  message: string;
}

export interface CoverageOptions {
  /** BRANCH_UNCOVERED - Uncovered branches in union/variant schemas */
  ignoreBranches?: Record<string, number[]>;
  /** ARRAY_EMPTY - Empty arrays in all samples */
  ignoreEmptyArray?: string[];
  /** LITERAL_VALUE_UNCOVERED - Uncovered literal values */
  ignoreLiteralValues?: Record<string, unknown[]>;
  /** PICKLIST_VALUE_UNCOVERED - Uncovered picklist values */
  ignorePicklistValues?: Record<string, unknown[]>;
  /** NULL_TYPE_UNCOVERED - Uncovered null types in nullable schemas */
  ignoreNullTypes?: string[];
  /** UNDEFINED_TYPE_UNCOVERED - Uncovered undefined types in optional/nullish schemas */
  ignoreUndefinedTypes?: string[];
  /** DEFINED_TYPE_UNCOVERED - Uncovered defined values in wrapper schemas */
  ignoreDefinedTypes?: string[];
  /** Schemas to skip coverage checking entirely */
  ignoreSchemas?: v.GenericSchema[];
}

export class SchemaCoverageError extends Error {
  constructor(message: string, public issues?: CoverageIssue[]) {
    super(message);
    this.name = "SchemaCoverageError";
  }
}

type Equal<T, U> = (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2) ? true : false;

/**
 * Validates a valibot schema against a set of samples and checks for coverage issues.
 * @param schema - The valibot schema object to validate
 * @param samples - Array of data samples to test against the schema
 * @param options - Configuration options to ignore specific coverage issues
 * @throws {SchemaCoverageError} If any coverage issues are found or if validation fails
 */
export function schemaCoverage<
  TSchema extends v.GenericSchema,
  TSample,
>(
  schema: TSchema,
  samples: TSample[] & (Equal<TSample, v.InferOutput<TSchema>> extends true ? TSample[] : never),
  options: CoverageOptions = {},
): void {
  const assertResult = v.safeParse(
    v.pipe(
      v.array(strict(schema)),
      v.minLength(1),
    ),
    samples,
  );
  if (!assertResult.success) {
    throw new Error(JSON.stringify(samples) + "\n\n" + v.summarize(assertResult.issues));
  }

  options.ignoreSchemas = options.ignoreSchemas || [Integer, UnsignedInteger, Decimal, UnsignedDecimal]; // Hack to avoid importing into every test
  const coverageIssues = checkCoverage(schema, samples, options);
  if (coverageIssues.length) {
    const details = coverageIssues
      .map((issue) => `- ${issue.path}: ${issue.type} - ${issue.message}`)
      .join("\n");
    throw new SchemaCoverageError(`Schema coverage issues:\n${details}`, coverageIssues);
  }
}

/** Convert an object or tuple schema to strict version (no extra properties/items allowed) recursively. */
function strict(schema: v.GenericSchema): v.GenericSchema {
  if (!("type" in schema)) return schema;

  // Optional
  if (schema.type === "optional" && "wrapped" in schema) {
    const wrapped = strict(schema.wrapped as v.GenericSchema);
    return "default" in schema && schema.default !== undefined
      ? v.optional(wrapped, schema.default)
      : v.optional(wrapped);
  }

  // Nullable
  if (schema.type === "nullable" && "wrapped" in schema) {
    const wrapped = strict(schema.wrapped as v.GenericSchema);
    return "default" in schema && schema.default !== undefined
      ? v.nullable(wrapped, schema.default)
      : v.nullable(wrapped);
  }

  // Nullish
  if (schema.type === "nullish" && "wrapped" in schema) {
    const wrapped = strict(schema.wrapped as v.GenericSchema);
    return "default" in schema && schema.default !== undefined
      ? v.nullish(wrapped, schema.default)
      : v.nullish(wrapped);
  }

  // Array
  if (schema.type === "array" && "item" in schema) {
    const item = strict(schema.item as v.GenericSchema);
    return v.array(item);
  }

  // Record
  if (schema.type === "record" && "value" in schema) {
    const value = strict(schema.value as v.GenericSchema);
    const key = "key" in schema ? schema.key : v.string();
    return v.record(key as v.GenericSchema<string, string | number | symbol>, value);
  }

  // Union
  if (schema.type === "union" && "options" in schema) {
    const options = (schema.options as v.GenericSchema[]).map(strict);
    return v.union(options);
  }

  // Variant
  if (schema.type === "variant" && "options" in schema && "key" in schema) {
    const options = (schema.options as v.GenericSchema[]).map(strict);
    return v.variant(schema.key as string, options as v.VariantOptions<string>);
  }

  // Lazy
  if (schema.type === "lazy" && "getter" in schema) {
    return v.lazy(() => strict((schema.getter as () => v.GenericSchema)()));
  }

  // Object
  if (schema.type === "object" && "entries" in schema) {
    const entries = Object.fromEntries(
      Object.entries(schema.entries as Record<string, v.GenericSchema>).map(
        ([key, value]) => [key, strict(value)],
      ),
    );
    const newSchema = v.strictObject(entries);
    return "pipe" in schema && schema.pipe ? v.pipe(newSchema, ...schema.pipe as v.GenericPipeAction[]) : newSchema;
  }

  // Tuple
  if (schema.type === "tuple" && "items" in schema) {
    const items = (schema.items as v.GenericSchema[]).map(strict);
    const newSchema = v.strictTuple(items);
    return "pipe" in schema && schema.pipe ? v.pipe(newSchema, ...schema.pipe as v.GenericPipeAction[]) : newSchema;
  }

  return schema;
}

/**
 * Recursively checks a valibot schema against provided data samples for coverage issues.
 * Identifies areas of the schema that are not exercised by the sample data including:
 * - Uncovered branches in union/variant schemas (BRANCH_UNCOVERED)
 * - Empty arrays in all samples (ARRAY_EMPTY)
 * - Uncovered literal values (LITERAL_VALUE_UNCOVERED)
 * - Uncovered picklist values (PICKLIST_VALUE_UNCOVERED)
 * - Uncovered null types in nullable schemas (NULL_TYPE_UNCOVERED)
 * - Uncovered undefined types in optional/nullish schemas (UNDEFINED_TYPE_UNCOVERED)
 * - Uncovered defined values in wrapper schemas (DEFINED_TYPE_UNCOVERED)
 * @param schema - The valibot schema object to check for coverage
 * @param samples - Array of data samples to test against the schema
 * @param options - Configuration options to ignore specific coverage issues
 * @param _path - Current path in the schema (used for reporting issues)
 * @returns Array of CoverageIssue objects describing coverage problems found
 */
function checkCoverage(
  schema: v.GenericSchema,
  samples: unknown[],
  options: CoverageOptions,
  path: string = "#",
): CoverageIssue[] {
  const issues: CoverageIssue[] = [];

  // Check if this schema should be ignored
  if (options.ignoreSchemas?.includes(schema)) {
    return issues;
  }

  // Handle schemas with pipe (transformations/validations)
  if ("pipe" in schema && Array.isArray(schema.pipe)) {
    // Find the base schema in the pipe (usually first element)
    const baseSchema = schema.pipe.find((item) => item.kind === "schema" && item.type);
    if (baseSchema) {
      return checkCoverage(baseSchema, samples, options, path);
    }
  }

  // Handle union and variant schemas
  if (schema.type === "union" || schema.type === "variant") {
    const branchSchema = schema as
      | v.UnionSchema<v.UnionOptions, v.ErrorMessage<v.GenericIssue>>
      | v.VariantSchema<string, v.VariantOptions<string>, v.ErrorMessage<v.GenericIssue>>;
    const ignoredBranches = options.ignoreBranches?.[path] || [];

    branchSchema.options.forEach((option, idx) => {
      if (ignoredBranches.includes(idx)) return;

      const matched = samples.filter((s) => v.safeParse(option, s).success);

      if (!matched.length) {
        issues.push({
          path,
          type: "BRANCH_UNCOVERED",
          message: `Branch ${idx} in ${schema.type} is not covered by samples`,
        });
      } else {
        issues.push(...checkCoverage(option, matched, options, `${path}/${schema.type}/${idx}`));
      }
    });
  } // Handle picklist (enum) schemas
  else if (schema.type === "picklist") {
    const picklistSchema = schema as v.PicklistSchema<v.PicklistOptions, v.ErrorMessage<v.GenericIssue>>;
    const ignoredValues = options.ignorePicklistValues?.[path] || [];

    for (const picklistValue of picklistSchema.options) {
      if (!new Set(samples).has(picklistValue) && !ignoredValues.includes(picklistValue)) {
        issues.push({
          path,
          type: "PICKLIST_VALUE_UNCOVERED",
          message: `Picklist value '${String(picklistValue)}' is not covered by samples`,
        });
      }
    }
  } // Handle literal schemas (single enum value)
  else if (schema.type === "literal") {
    const literalSchema = schema as v.LiteralSchema<string, v.ErrorMessage<v.GenericIssue>>;
    const ignoredValues = options.ignoreLiteralValues?.[path] || [];

    if (!samples.includes(literalSchema.literal) && !ignoredValues.includes(literalSchema.literal)) {
      issues.push({
        path,
        type: "LITERAL_VALUE_UNCOVERED",
        message: `Literal value '${String(literalSchema.literal)}' is not covered by samples`,
      });
    }
  } // Handle array schemas
  else if (schema.type === "array") {
    const arraySchema = schema as v.ArraySchema<v.GenericSchema, v.ErrorMessage<v.GenericIssue>>;
    const arrays = samples.filter(Array.isArray);

    // Check if all arrays are empty
    if (
      arrays.length &&
      !options.ignoreEmptyArray?.includes(path) &&
      arrays.every((arr) => arr.length === 0)
    ) {
      issues.push({
        path,
        type: "ARRAY_EMPTY",
        message: "Array is empty in all samples",
      });
    }

    // Check array items
    const allItems = arrays.flat();
    if (allItems.length && arraySchema.item) {
      issues.push(...checkCoverage(arraySchema.item, allItems, options, `${path}/items`));
    }
  } // Handle tuple schemas
  else if (
    schema.type === "tuple" || schema.type === "strict_tuple" || schema.type === "looseTuple" ||
    schema.type === "loose_tuple"
  ) {
    const tupleSchema = schema as
      | v.TupleSchema<v.GenericSchema[], v.ErrorMessage<v.GenericIssue>>
      | v.LooseTupleSchema<v.GenericSchema[], v.ErrorMessage<v.GenericIssue>>;
    const arrays = samples.filter(Array.isArray);

    tupleSchema.items.forEach((itemSchema, idx) => {
      const itemSamples = arrays
        .filter((arr) => arr.length > idx)
        .map((arr) => arr[idx]);

      if (itemSamples.length) {
        issues.push(...checkCoverage(itemSchema, itemSamples, options, `${path}/items/${idx}`));
      }
    });
  } // Handle tupleWithRest schemas
  else if (schema.type === "tupleWithRest" || schema.type === "tuple_with_rest") {
    const tupleSchema = schema as v.TupleWithRestSchema<
      v.GenericSchema[],
      v.GenericSchema,
      v.ErrorMessage<v.GenericIssue>
    >;
    const arrays = samples.filter(Array.isArray);

    // Check fixed tuple items
    tupleSchema.items.forEach((itemSchema, idx) => {
      const itemSamples = arrays
        .filter((arr) => arr.length > idx)
        .map((arr) => arr[idx]);

      if (itemSamples.length) {
        issues.push(...checkCoverage(itemSchema, itemSamples, options, `${path}/items/${idx}`));
      }
    });

    // Check rest items
    const restItems: unknown[] = [];
    arrays.forEach((arr) => {
      if (arr.length > tupleSchema.items.length) {
        restItems.push(...arr.slice(tupleSchema.items.length));
      }
    });

    if (restItems.length && tupleSchema.rest) {
      issues.push(...checkCoverage(tupleSchema.rest, restItems, options, `${path}/rest`));
    }
  } // Handle object schemas
  else if (
    schema.type === "object" ||
    schema.type === "strict_object" || schema.type === "strictObject" ||
    schema.type === "looseObject" || schema.type === "loose_object"
  ) {
    const objectSchema = schema as
      | v.ObjectSchema<v.ObjectEntries, v.ErrorMessage<v.GenericIssue>>
      | v.StrictObjectSchema<v.ObjectEntries, v.ErrorMessage<v.GenericIssue>>
      | v.LooseObjectSchema<v.ObjectEntries, v.ErrorMessage<v.GenericIssue>>;
    const objects = samples.filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null);

    for (const [key, propSchema] of Object.entries(objectSchema.entries)) {
      const propPath = `${path}/properties/${key}`;
      const propSamples = objects
        .filter((obj) => key in obj)
        .map((obj) => obj[key]);

      // For optional/nullish properties, check both presence and absence
      if (propSchema.type === "optional" || propSchema.type === "nullish") {
        const hasUndefined = objects.some((obj) => !(key in obj) || obj[key] === undefined);
        const hasNull = propSchema.type === "nullish" ? objects.some((obj) => key in obj && obj[key] === null) : false;
        const hasDefined = propSamples.some((val) =>
          val !== undefined && (propSchema.type !== "nullish" || val !== null)
        );

        // Check if undefined case is covered
        if (!options.ignoreUndefinedTypes?.includes(propPath) && !hasUndefined) {
          issues.push({
            path: propPath,
            type: "UNDEFINED_TYPE_UNCOVERED",
            message: `Optional property never appears as undefined in samples`,
          });
        }

        // Check if null case is covered for nullish
        if (propSchema.type === "nullish" && !options.ignoreNullTypes?.includes(propPath) && !hasNull) {
          issues.push({
            path: propPath,
            type: "NULL_TYPE_UNCOVERED",
            message: `Nullish property never appears as null in samples`,
          });
        }

        // Check if defined case is covered
        if (!options.ignoreDefinedTypes?.includes(propPath) && !hasDefined) {
          issues.push({
            path: propPath,
            type: "DEFINED_TYPE_UNCOVERED",
            message: `${
              propSchema.type === "nullish" ? "Nullish" : "Optional"
            } property never appears with a value in samples`,
          });
        }

        // Check coverage of the wrapped schema when values are present
        const definedSamples = propSamples.filter((val) =>
          val !== undefined && (propSchema.type !== "nullish" || val !== null)
        );
        if (definedSamples.length) {
          if ("wrapped" in propSchema && propSchema.wrapped) {
            issues.push(...checkCoverage(propSchema.wrapped, definedSamples, options, propPath));
          }
        }
      } else {
        // For required properties
        if (propSamples.length) {
          issues.push(...checkCoverage(propSchema, propSamples, options, propPath));
        }
      }
    }
  } // Handle objectWithRest schemas
  else if (schema.type === "objectWithRest" || schema.type === "object_with_rest") {
    const objectSchema = schema as v.ObjectWithRestSchema<
      v.ObjectEntries,
      v.GenericSchema,
      v.ErrorMessage<v.GenericIssue>
    >;
    const objects = samples.filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null);

    // Check defined entries
    for (const [key, propSchema] of Object.entries(objectSchema.entries)) {
      const propPath = `${path}/properties/${key}`;
      const propSamples = objects
        .filter((obj) => key in obj)
        .map((obj) => obj[key]);

      if (propSamples.length) {
        issues.push(...checkCoverage(propSchema, propSamples, options, propPath));
      }
    }

    // Check rest values
    const definedKeys = new Set(Object.keys(objectSchema.entries));
    const restValues: unknown[] = [];
    objects.forEach((obj) => {
      Object.entries(obj).forEach(([key, value]) => {
        if (!definedKeys.has(key)) {
          restValues.push(value);
        }
      });
    });

    if (restValues.length && objectSchema.rest) {
      issues.push(...checkCoverage(objectSchema.rest, restValues, options, `${path}/rest`));
    }
  } // Handle collection schemas (record, map, set)
  else if (schema.type === "record" || schema.type === "map" || schema.type === "set") {
    const collectionSchema = schema as
      | v.RecordSchema<v.GenericSchema<string, string | number>, v.GenericSchema, v.ErrorMessage<v.GenericIssue>>
      | v.MapSchema<v.GenericSchema, v.GenericSchema, v.ErrorMessage<v.GenericIssue>>
      | v.SetSchema<v.GenericSchema, v.ErrorMessage<v.GenericIssue>>;

    const allValues: unknown[] = [];
    let valuePath: string;

    if (schema.type === "record") {
      const objects = samples.filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null);
      objects.forEach((obj) => {
        allValues.push(...Object.values(obj));
      });
      valuePath = `${path}/values`;
    } else if (schema.type === "map") {
      const maps = samples.filter((s) => s instanceof Map);
      maps.forEach((map) => {
        allValues.push(...map.values());
      });
      valuePath = `${path}/values`;
    } else { // set
      const sets = samples.filter((s) => s instanceof Set);
      sets.forEach((set) => {
        allValues.push(...set);
      });
      valuePath = `${path}/items`;
    }

    // Check value/item schema coverage
    if (allValues.length && collectionSchema.value) {
      issues.push(...checkCoverage(collectionSchema.value, allValues, options, valuePath));
    }
  } // Handle intersect schemas
  else if (schema.type === "intersect") {
    const intersectSchema = schema as v.IntersectSchema<v.IntersectOptions, v.ErrorMessage<v.GenericIssue>>;
    intersectSchema.options.forEach((subschema, idx) => {
      issues.push(...checkCoverage(subschema, samples, options, `${path}/intersect/${idx}`));
    });
  } // Handle wrapper schemas (nullable, optional, nullish, undefinedable)
  else if (
    schema.type === "nullable" || schema.type === "optional" || schema.type === "nullish" ||
    schema.type === "undefinedable"
  ) {
    const wrapperSchema = schema as
      | v.NullableSchema<v.GenericSchema, v.ErrorMessage<v.GenericIssue>>
      | v.OptionalSchema<v.GenericSchema, v.ErrorMessage<v.GenericIssue>>
      | v.NullishSchema<v.GenericSchema, v.ErrorMessage<v.GenericIssue>>
      | v.UndefinedableSchema<v.GenericSchema, v.ErrorMessage<v.GenericIssue>>;
    const schemaType = schema.type;

    const hasNull = samples.some((s) => s === null);
    const hasUndefined = samples.some((s) => s === undefined);
    const hasDefined = samples.some((s) => {
      if (schemaType === "nullable") return s !== null;
      if (schemaType === "optional" || schemaType === "undefinedable") return s !== undefined;
      return s !== null && s !== undefined; // nullish
    });

    // Check type coverage based on schema type
    if (schemaType === "nullable" || schemaType === "nullish") {
      if (!options.ignoreNullTypes?.includes(path) && !hasNull) {
        issues.push({
          path,
          type: "NULL_TYPE_UNCOVERED",
          message: `Type 'null' in ${schemaType} is not covered by samples`,
        });
      }
    }

    if (schemaType === "optional" || schemaType === "nullish" || schemaType === "undefinedable") {
      if (!options.ignoreUndefinedTypes?.includes(path) && !hasUndefined) {
        issues.push({
          path,
          type: "UNDEFINED_TYPE_UNCOVERED",
          message: `Type 'undefined' in ${schemaType} is not covered by samples`,
        });
      }
    }

    if (!options.ignoreDefinedTypes?.includes(path) && !hasDefined) {
      const typeDescription = schemaType === "nullable" ? "Non-null type" : "Defined value";
      issues.push({
        path,
        type: "DEFINED_TYPE_UNCOVERED",
        message: `${typeDescription} in ${schemaType} is not covered by samples`,
      });
    }

    // Check wrapped schema for filtered samples
    const filteredSamples = samples.filter((s) => {
      if (schemaType === "nullable") return s !== null;
      if (schemaType === "optional" || schemaType === "undefinedable") return s !== undefined;
      return s !== null && s !== undefined; // nullish
    });

    if (filteredSamples.length) {
      issues.push(...checkCoverage(wrapperSchema.wrapped, filteredSamples, options, `${path}/wrapped`));
    }
  } // Handle nonNullable schemas
  else if (
    schema.type === "nonNullable" || schema.type === "non_nullable" ||
    schema.type === "nonNullish" || schema.type === "non_nullish" ||
    schema.type === "nonOptional" || schema.type === "non_optional"
  ) {
    const nonSchema = schema as
      | v.NonNullableSchema<v.GenericSchema, v.ErrorMessage<v.GenericIssue>>
      | v.NonNullishSchema<v.GenericSchema, v.ErrorMessage<v.GenericIssue>>
      | v.NonOptionalSchema<v.GenericSchema, v.ErrorMessage<v.GenericIssue>>;
    issues.push(...checkCoverage(nonSchema.wrapped, samples, options, path));
  }

  return issues;
}
