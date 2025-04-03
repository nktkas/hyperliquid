import { Ajv, type SchemaObject } from "npm:ajv@^8.17.1";
import { resolveRef, type ResolveRefOptions } from "./resolveRef.ts";
import { resolveAllOf, type ResolveAllOfOptions } from "./resolveAllOf.ts";
import { addStrictAdditionalProperties } from "./addStrictAdditionalProperties.ts";

export type IssueType =
    | "BRANCH_UNCOVERED"
    | "ARRAY_EMPTY"
    | "ENUM_VALUE_UNCOVERED"
    | "TYPE_UNCOVERED"
    | "PROPERTY_UNCOVERED"
    | "RECURSIVE_REF";

export interface CoverageIssue {
    path: string;
    type: IssueType;
    message: string;
}

export interface CoverageOptions {
    ignoreBranchesByPath?: Record<string, number[]>; // BRANCH_UNCOVERED
    ignoreEmptyArrayPaths?: string[]; // ARRAY_EMPTY
    ignoreEnumValuesByPath?: Record<string, unknown[]>; // ENUM_VALUE_UNCOVERED
    ignoreTypesByPath?: Record<string, string[]>; // TYPE_UNCOVERED
    ignorePropertiesByPath?: string[]; // PROPERTY_UNCOVERED
    ignoreRecursiveRefsByPath?: string[]; // RECURSIVE_REF
    resolveRefOptions?: ResolveRefOptions; // Default: { ignoreRecursiveRefsByPath: true }
    resolveAllOfOptions?: ResolveAllOfOptions; // Default: { conflictResolution: "smart" }
}

export class SchemaCoverageError extends Error {
    constructor(message: string, public issues?: CoverageIssue[]) {
        super(message);
        this.name = "SchemaCoverageError";
    }
}

/**
 * Validates a JSON schema against a set of samples and checks for coverage issues.
 *
 * @param schema - The JSON schema object to validate
 * @param samples - Array of data samples to test against the schema
 * @param options - Configuration options to ignore specific coverage issues
 * @throws {SchemaCoverageError} If any coverage issues are found or if validation fails
 */
export function schemaCoverage(schema: SchemaObject, samples: unknown[], options: CoverageOptions = {}): void {
    if (!samples.length) {
        throw new SchemaCoverageError("At least one data sample is required");
    }

    // Modify the schema
    // - resolve $ref references
    // - resolve allOf into a single schema
    // - add strict additionalProperties: false
    const { schema: resolvedRefSchema, issues: refIssues } = resolveRef(
        schema,
        options.resolveRefOptions ?? { ignoreRecursiveRefsByPath: true },
    );
    const resolvedAllOfSchema = resolveAllOf(
        resolvedRefSchema,
        options.resolveAllOfOptions ?? { conflictResolution: "smart" },
    );
    const strictSchema = addStrictAdditionalProperties(resolvedAllOfSchema);

    // Basic validation of the schema
    const validator = new Ajv({ strict: true }).compile(strictSchema);
    for (let i = 0; i < samples.length; i++) {
        if (!validator(samples[i])) {
            throw new SchemaCoverageError(
                `Sample #${i} failed validation: ${JSON.stringify(validator.errors)}\n${JSON.stringify(samples[i])}`,
            );
        }
    }

    // Check coverage issues
    const coverageIssues = checkCoverage(strictSchema, samples, options);

    // Convert RefIssues to CoverageIssues
    const recursiveRefIssues: CoverageIssue[] = refIssues.map((issue) => ({
        path: issue.path,
        type: "RECURSIVE_REF",
        message: issue.message,
    }));

    // Throw an error if there are any issues
    const allIssues = [...coverageIssues, ...recursiveRefIssues];
    if (allIssues.length) {
        const details = allIssues
            .map((issue) => `- ${issue.path}: ${issue.type} - ${issue.message}`)
            .join("\n");
        throw new SchemaCoverageError(`Schema coverage issues:\n${details}`, allIssues);
    }
}

/**
 * Recursively checks a JSON schema against provided data samples for coverage issues.
 * Identifies areas of the schema that are not exercised by the sample data including:
 * - Uncovered branches in anyOf/oneOf (BRANCH_UNCOVERED)
 * - Empty arrays in all samples (ARRAY_EMPTY)
 * - Uncovered enum values (ENUM_VALUE_UNCOVERED)
 * - Uncovered types in union types (TYPE_UNCOVERED)
 * - Uncovered optional object properties (PROPERTY_UNCOVERED)
 *
 * @param schema - The JSON schema object to check for coverage
 * @param samples - Array of data samples to test against the schema
 * @param options - Configuration options to ignore specific coverage issues
 * @param _path - Current path in the schema (used for reporting issues)
 * @returns Array of CoverageIssue objects describing coverage problems found
 */
function checkCoverage(
    schema: SchemaObject,
    samples: unknown[],
    options: CoverageOptions,
    _path: string = "#",
): CoverageIssue[] {
    // Skip invalid schemas or negation patterns
    if (typeof schema !== "object" || !schema || schema.not) {
        return [];
    }

    const issues: CoverageIssue[] = [];

    // Check union types
    if (schema.type && Array.isArray(schema.type)) {
        const ignoredTypes = options.ignoreTypesByPath?.[_path] || [];

        for (const type of schema.type) {
            if (ignoredTypes.includes(type)) continue;

            const typeMatches = samples.some((sample) => {
                if (type === "string") return typeof sample === "string";
                if (type === "number") return typeof sample === "number";
                if (type === "boolean") return typeof sample === "boolean";
                if (type === "object") return typeof sample === "object" && sample !== null;
                if (type === "array") return Array.isArray(sample);
                if (type === "null") return sample === null;
                if (type === "integer") return typeof sample === "number" && Number.isInteger(sample);
                return false; // Unknown type
            });

            if (!typeMatches) {
                issues.push({
                    path: _path,
                    type: "TYPE_UNCOVERED",
                    message: `Type '${type}' in union type is not covered by samples`,
                });
            }
        }
    }

    // Check enum values
    if (schema.enum && Array.isArray(schema.enum)) {
        const sampleValues = new Set(samples.map((sample) => JSON.stringify(sample)));
        const ignoredEnumValues = options.ignoreEnumValuesByPath?.[_path] || [];

        for (const enumValue of schema.enum) {
            const stringifiedEnumValue = JSON.stringify(enumValue);
            if (
                !sampleValues.has(stringifiedEnumValue) &&
                !ignoredEnumValues.some((ignored) => JSON.stringify(ignored) === stringifiedEnumValue)
            ) {
                issues.push({
                    path: _path,
                    type: "ENUM_VALUE_UNCOVERED",
                    message: `Enum value '${String(enumValue)}' is not covered by samples`,
                });
            }
        }
    }

    // Check anyOf/oneOf branches
    for (const bench of ["anyOf", "oneOf"]) {
        if (!Array.isArray(schema[bench])) continue;

        schema[bench].forEach((branch, idx) => {
            const ignoredBranches = options.ignoreBranchesByPath?.[`${_path}/${bench}`] || [];
            if (ignoredBranches.includes(idx)) return;

            const branchValidator = new Ajv({ strict: true }).compile(branch);
            const matched = samples.filter((s) => branchValidator(s));

            if (!matched.length) {
                issues.push({
                    path: `${_path}/${bench}`,
                    type: "BRANCH_UNCOVERED",
                    message: `Branch ${idx} in ${bench} is not covered by samples`,
                });
            } else {
                issues.push(...checkCoverage(branch, matched, options, `${_path}/${bench}/${idx}`));
            }
        });
    }

    // Check arrays
    if (schema.type === "array") {
        const arrays = samples.filter(Array.isArray);

        // Check if all arrays are empty
        if (
            arrays.length &&
            !options.ignoreEmptyArrayPaths?.includes(_path) &&
            arrays.every((arr) => arr.length === 0)
        ) {
            issues.push({
                path: _path,
                type: "ARRAY_EMPTY",
                message: "Array is empty in all samples",
            });
        }

        // Check array items
        if (schema.items) {
            if (Array.isArray(schema.items)) {
                // Tuple validation
                schema.items.forEach((itemSchema, idx) => {
                    const itemSamples = arrays
                        .filter((arr) => arr.length > idx)
                        .map((arr) => arr[idx]);

                    if (itemSamples.length) {
                        issues.push(...checkCoverage(itemSchema, itemSamples, options, `${_path}/items/${idx}`));
                    }
                });
            } else {
                // Single schema for all items
                const allItems = arrays.flat();
                if (allItems.length) {
                    issues.push(...checkCoverage(schema.items, allItems, options, `${_path}/items`));
                }
            }
        }
    }

    // Check object properties
    if (schema.type === "object" && schema.properties) {
        const objects = samples.filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null);
        const requiredProps = Array.isArray(schema.required) ? schema.required : [];

        for (const [key, propSchema] of Object.entries<SchemaObject>(schema.properties)) {
            const propSamples = objects
                .filter((obj) => key in obj)
                .map((obj) => obj[key]);

            if (propSamples.length) {
                issues.push(...checkCoverage(propSchema, propSamples, options, `${_path}/properties/${key}`));
            } else if (!requiredProps.includes(key)) {
                // Flag uncovered optional properties
                if (!options.ignorePropertiesByPath?.includes(`${_path}/properties/${key}`)) {
                    issues.push({
                        path: `${_path}/properties/${key}`,
                        type: "PROPERTY_UNCOVERED",
                        message: `Optional property is not covered by samples`,
                    });
                }
            }
        }
    }

    // Check allOf
    if (schema.allOf) {
        schema.allOf.forEach((subschema: SchemaObject, idx: number) => {
            issues.push(...checkCoverage(subschema, samples, options, `${_path}/allOf/${idx}`));
        });
    }

    return issues;
}
