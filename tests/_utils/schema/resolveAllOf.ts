import type { SchemaObject } from "npm:ajv@^8.17.1";

/**
 * Error thrown when incompatible schemas are found during allOf resolution.
 */
export class AllOfResolutionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AllOfResolutionError";
    }
}

/**
 * Options for controlling the behavior of allOf resolution.
 */
export interface ResolveAllOfOptions {
    /**
     * Controls how to handle conflicts between applicators and direct constraints.
     * - 'strict': Throws an error when a conflict is detected (default)
     * - 'smart': Attempts to perform logical intersection
     */
    conflictResolution?: "strict" | "smart";
}

/**
 * Resolves all occurrences of `allOf` in a JSON schema by merging the schemas inside it.
 * Replaces each allOf with an equivalent merged schema.
 *
 * @param schema - The JSON schema to process
 * @param options - Options controlling the behavior of allOf resolution
 * @returns A new schema with all resolvable `allOf` replaced by merged schemas
 * @throws {AllOfResolutionError} If schemas inside `allOf` contain incompatible requirements
 */
export function resolveAllOf(
    schema: SchemaObject,
    options?: ResolveAllOfOptions,
): SchemaObject {
    // Default to 'strict' if not specified
    const resolveOptions = {
        conflictResolution: options?.conflictResolution || "strict",
    };

    // Base case: if schema is not an object or is null, return it as is
    if (typeof schema !== "object" || schema === null) {
        return schema;
    }

    // Create a new object to avoid modifying the input
    const result = structuredClone(schema);

    // Process nested schemas first (except in allOf)
    for (const [key, value] of Object.entries(result)) {
        if (key === "allOf") continue; // Handle allOf separately

        if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
                // Process arrays (like items in tuple validation)
                result[key] = value.map((item) =>
                    typeof item === "object" && item !== null ? resolveAllOf(item, options) : item
                );
            } else {
                // Process nested objects
                result[key] = resolveAllOf(value, options);
            }
        }
    }

    // Process allOf if present
    if (Array.isArray(result.allOf) && result.allOf.length > 0) {
        // First, recursively resolve any nested allOf in each subschema
        const resolvedSubschemas = result.allOf.map((subschema) => resolveAllOf(subschema, options));

        // Merge all subschemas from allOf into one
        const mergedAllOfSchema = mergeAllOfSchemas(resolvedSubschemas, resolveOptions);

        // Remove the allOf property
        delete result.allOf;

        // Merge the parent schema with the merged allOf schema
        return mergeSchemas(result, mergedAllOfSchema, resolveOptions);
    }

    return result;
}

/**
 * Merges multiple schemas from an `allOf` array into a single schema.
 *
 * @param schemas - Array of schemas to merge
 * @param options - Options controlling the merging behavior
 * @returns A merged schema that satisfies all requirements from the input schemas
 * @throws {AllOfResolutionError} If schemas contain incompatible requirements
 */
function mergeAllOfSchemas(
    schemas: SchemaObject[],
    options: { conflictResolution: "strict" | "smart" },
): SchemaObject {
    if (schemas.length === 0) {
        return {};
    }

    if (schemas.length === 1) {
        return schemas[0];
    }

    // Initialize the result with the first schema
    let result = structuredClone(schemas[0]);

    // Merge with each subsequent schema
    for (let i = 1; i < schemas.length; i++) {
        result = mergeSchemas(result, schemas[i], options);
    }

    return result;
}

/**
 * Performs smart merging of a schema with oneOf and another schema.
 * For oneOf, we consider the result as "Exactly one of (T1 AND S), (T2 AND S), ..."
 * We never simplify to a single schema, even if only one branch remains.
 */
function smartMergeOneOf(
    schemaWithOneOf: SchemaObject,
    otherSchema: SchemaObject,
    options: { conflictResolution: "strict" | "smart" },
): SchemaObject {
    // Create result with non-conflicting properties
    const result: SchemaObject = {};

    // Copy non-conflicting properties
    copyNonConflictingProperties(result, schemaWithOneOf, otherSchema);

    // Try to merge each oneOf branch with the other schema
    const mergedBranches = [];

    for (const branch of schemaWithOneOf.oneOf) {
        try {
            // Attempt to merge this branch with other schema
            const mergedBranch = mergeSchemas(
                structuredClone(branch),
                structuredClone(otherSchema),
                options,
            );
            mergedBranches.push(mergedBranch);
        } catch {
            // This branch is incompatible, skip it
            continue;
        }
    }

    // Check if we have any valid branches left
    if (mergedBranches.length === 0) {
        throw new AllOfResolutionError("No valid branches after merging oneOf with constraints");
    }

    // Create new oneOf with merged branches (don't simplify to single schema even if only one branch)
    result.oneOf = mergedBranches;
    return result;
}

/**
 * Performs smart merging of a schema with allOf and another schema.
 * For allOf, we consider the result as "(T1 AND T2 AND ...) AND S"
 */
function smartMergeAllOf(
    schemaWithAllOf: SchemaObject,
    otherSchema: SchemaObject,
    options: { conflictResolution: "strict" | "smart" },
): SchemaObject {
    try {
        // Extract the allOf array
        const allOfArray = schemaWithAllOf.allOf;

        // Merge all schemas from allOf
        let mergedSchema = mergeAllOfSchemas(allOfArray, options);

        // Get the remaining properties from schemaWithAllOf
        const remainingProps = structuredClone(schemaWithAllOf);
        delete remainingProps.allOf;

        // Merge with the remaining properties
        if (Object.keys(remainingProps).length > 0) {
            mergedSchema = mergeSchemas(mergedSchema, remainingProps, options);
        }

        // Finally, merge with otherSchema
        return mergeSchemas(mergedSchema, otherSchema, options);
    } catch (error) {
        if (error instanceof AllOfResolutionError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new AllOfResolutionError(`Failed to merge allOf with constraints: ${errorMessage}`);
    }
}

/**
 * Performs smart merging of a schema with not and another schema.
 * For not, we consider the result as "(NOT T1) AND S"
 */
function smartMergeNot(
    schemaWithNot: SchemaObject,
    otherSchema: SchemaObject,
    options: { conflictResolution: "strict" | "smart" },
): SchemaObject {
    // Store the not value
    const notValue = schemaWithNot.not;

    // Create a temporary copy without the not
    const tempSchema = structuredClone(schemaWithNot);
    delete tempSchema.not;

    try {
        // Merge the temp schema (without not) with the other schema
        const mergedSchema = mergeSchemas(
            tempSchema,
            structuredClone(otherSchema),
            options,
        );

        // Add back the not value
        mergedSchema.not = notValue;

        return mergedSchema;
    } catch (error) {
        // If merge fails, the entire operation fails
        if (error instanceof AllOfResolutionError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new AllOfResolutionError(`Failed to merge schema with 'not' constraint: ${errorMessage}`);
    }
}

/**
 * Merges two schemas according to the allOf merging rules.
 *
 * @param target - The target schema
 * @param source - The source schema to merge from
 * @param options - Options controlling the merging behavior
 * @returns A new schema that represents the merge of the two input schemas
 * @throws {AllOfResolutionError} If schemas contain incompatible requirements
 */
function mergeSchemas(
    target: SchemaObject,
    source: SchemaObject,
    options: { conflictResolution: "strict" | "smart" },
): SchemaObject {
    // Check for conflicts between applicators and direct constraints
    if (hasApplicatorDirectConflict(target, source)) {
        if (options.conflictResolution === "strict") {
            throw new AllOfResolutionError(
                `Cannot merge schema with applicator and schema with direct constraints in strict mode`,
            );
        } else {
            // In 'smart' mode, try logical intersection
            return smartMergeSchemas(target, source, options);
        }
    }

    const result = structuredClone(target);

    // Merge type (check compatibility)
    if (source.type !== undefined) {
        if (result.type === undefined) {
            result.type = source.type;
        } else {
            result.type = mergeType(result.type, source.type);
        }
    }

    // Merge properties
    if (source.properties) {
        if (!result.properties) {
            result.properties = structuredClone(source.properties);
        } else {
            const mergedProperties = structuredClone(result.properties);

            for (const [key, sourceProperty] of Object.entries<SchemaObject>(source.properties)) {
                if (key in mergedProperties) {
                    // Property exists in both schemas, merge recursively
                    mergedProperties[key] = mergeSchemas(mergedProperties[key], sourceProperty, options);
                } else {
                    // Property only exists in source, copy it
                    mergedProperties[key] = sourceProperty;
                }
            }

            result.properties = mergedProperties;
        }
    }

    // Merge required properties
    if (Array.isArray(source.required) && source.required.length > 0) {
        if (!Array.isArray(result.required)) {
            result.required = [...source.required];
        } else {
            // Add all unique required properties from source
            result.required = [
                ...result.required,
                ...source.required.filter((prop) => !result.required!.includes(prop)),
            ];
        }
    }

    // Merge additionalProperties (strictest rule wins)
    if (source.additionalProperties !== undefined) {
        if (
            result.additionalProperties === undefined ||
            (source.additionalProperties === false && result.additionalProperties !== false)
        ) {
            result.additionalProperties = source.additionalProperties;
        }
    }

    // Merge numeric constraints
    mergeNumericConstraint(result, source, "minProperties", Math.max);
    mergeNumericConstraint(result, source, "maxProperties", Math.min);
    mergeNumericConstraint(result, source, "minItems", Math.max);
    mergeNumericConstraint(result, source, "maxItems", Math.min);
    mergeNumericConstraint(result, source, "minLength", Math.max);
    mergeNumericConstraint(result, source, "maxLength", Math.min);
    mergeNumericConstraint(result, source, "minimum", Math.max);
    mergeNumericConstraint(result, source, "maximum", Math.min);
    mergeNumericConstraint(result, source, "exclusiveMinimum", Math.max);
    mergeNumericConstraint(result, source, "exclusiveMaximum", Math.min);
    mergeNumericConstraint(result, source, "multipleOf", findLCM);

    // Merge other constraints
    mergeConstraint(result, source, "pattern", mergePatterns);
    mergeConstraint(result, source, "format");
    mergeConstraint(result, source, "enum", mergeEnum);

    // Handle items (for arrays)
    if (source.items) {
        if (!result.items) {
            result.items = source.items;
        } else {
            // Check for applicator conflict in items
            if (hasApplicatorDirectConflict(result.items, source.items)) {
                if (options.conflictResolution === "strict") {
                    throw new AllOfResolutionError(
                        `Cannot merge items schemas with applicator and direct constraints in strict mode`,
                    );
                } else {
                    // In 'smart' mode, try logical intersection for items
                    result.items = smartMergeSchemas(result.items, source.items, options);
                }
            } else {
                // No conflict, continue with normal items merging
                if (Array.isArray(result.items) && Array.isArray(source.items)) {
                    // Tuple validation - merge each position
                    const maxLength = Math.max(result.items.length, source.items.length);
                    const mergedItems = [];

                    for (let i = 0; i < maxLength; i++) {
                        if (i < result.items.length && i < source.items.length) {
                            // Position exists in both - merge
                            mergedItems.push(mergeSchemas(result.items[i], source.items[i], options));
                        } else if (i < result.items.length) {
                            // Position only in result
                            mergedItems.push(result.items[i]);
                        } else {
                            // Position only in source
                            mergedItems.push(source.items[i]);
                        }
                    }

                    result.items = mergedItems;
                } else if (!Array.isArray(result.items) && !Array.isArray(source.items)) {
                    // Single schema for all items - merge them
                    result.items = mergeSchemas(result.items, source.items, options);
                } else {
                    // Incompatible items definitions (one is array, one is object)
                    throw new AllOfResolutionError("Cannot merge schemas with incompatible items definitions");
                }
            }
        }
    }

    // Process all remaining keys from source
    const metadataKeys = ["title", "description", "$id", "$schema", "examples", "default", "$comment"];
    for (const [key, value] of Object.entries(source)) {
        // Skip keys that have been explicitly handled above
        if (
            key === "type" ||
            key === "properties" ||
            key === "required" ||
            key === "additionalProperties" ||
            key === "items" ||
            key === "minProperties" ||
            key === "maxProperties" ||
            key === "minItems" ||
            key === "maxItems" ||
            key === "minLength" ||
            key === "maxLength" ||
            key === "minimum" ||
            key === "maximum" ||
            key === "exclusiveMinimum" ||
            key === "exclusiveMaximum" ||
            key === "multipleOf" ||
            key === "pattern" ||
            key === "format" ||
            key === "enum"
        ) {
            continue;
        }

        // For metadata: always overwrite existing values
        if (metadataKeys.includes(key)) {
            result[key] = structuredClone(value);
        } // For all other properties: copy only if not already exists in result
        else if (!(key in result)) {
            result[key] = structuredClone(value);
        }
    }

    return result;
}

/**
 * Checks if there's a conflict between applicators and direct constraints in two schemas.
 */
function hasApplicatorDirectConflict(target: SchemaObject, source: SchemaObject): boolean {
    const targetHasApplicator = hasApplicator(target);
    const sourceHasApplicator = hasApplicator(source);
    const targetHasDirectConstraints = hasDirectConstraints(target);
    const sourceHasDirectConstraints = hasDirectConstraints(source);

    // Conflict if one has applicator and the other has direct constraints
    return (targetHasApplicator && sourceHasDirectConstraints) ||
        (sourceHasApplicator && targetHasDirectConstraints);
}

/**
 * Checks if a schema contains any applicator keywords.
 */
function hasApplicator(schema: SchemaObject): boolean {
    return !!(schema.anyOf || schema.oneOf || schema.allOf || schema.not);
}

/**
 * Checks if a schema contains any direct constraint keywords.
 */
function hasDirectConstraints(schema: SchemaObject): boolean {
    // Check for presence of direct constraint keywords
    // (excluding metadata like description, title)
    const directConstraintKeys = [
        "type",
        "const",
        "enum",
        "properties",
        "required",
        "minimum",
        "maximum",
        "minItems",
        "maxItems",
        "minLength",
        "maxLength",
        "pattern",
        "format",
        "multipleOf",
        "additionalProperties",
        "minProperties",
        "maxProperties",
    ];

    return directConstraintKeys.some((key) => schema[key] !== undefined);
}

/**
 * Performs smart merging of schemas with applicator/direct constraint conflicts.
 */
function smartMergeSchemas(
    target: SchemaObject,
    source: SchemaObject,
    options: { conflictResolution: "strict" | "smart" },
): SchemaObject {
    // Handle anyOf applicator in target
    if (target.anyOf) {
        return smartMergeAnyOf(target, source, options);
    }

    // Handle anyOf applicator in source
    if (source.anyOf) {
        return smartMergeAnyOf(source, target, options);
    }

    // Handle oneOf applicator in target
    if (target.oneOf) {
        return smartMergeOneOf(target, source, options);
    }

    // Handle oneOf applicator in source
    if (source.oneOf) {
        return smartMergeOneOf(source, target, options);
    }

    // Handle allOf applicator in target
    if (target.allOf) {
        return smartMergeAllOf(target, source, options);
    }

    // Handle allOf applicator in source
    if (source.allOf) {
        return smartMergeAllOf(source, target, options);
    }

    // Handle not applicator in target
    if (target.not !== undefined) {
        return smartMergeNot(target, source, options);
    }

    // Handle not applicator in source
    if (source.not !== undefined) {
        return smartMergeNot(source, target, options);
    }

    // If no specific handling, fall back to regular merge
    throw new AllOfResolutionError(
        "Applicator/direct constraint conflict detected but no smart merge handler available",
    );
}

/**
 * Performs smart merging of a schema with anyOf and another schema.
 */
function smartMergeAnyOf(
    schemaWithAnyOf: SchemaObject,
    otherSchema: SchemaObject,
    options: { conflictResolution: "strict" | "smart" },
): SchemaObject {
    // Create result with non-conflicting properties
    const result: SchemaObject = {};

    // Copy non-conflicting properties
    copyNonConflictingProperties(result, schemaWithAnyOf, otherSchema);

    // Try to merge each anyOf branch with the other schema
    const mergedBranches = [];

    for (const branch of schemaWithAnyOf.anyOf) {
        try {
            // Attempt to merge this branch with other schema
            const mergedBranch = mergeSchemas(
                structuredClone(branch),
                structuredClone(otherSchema),
                options,
            );
            mergedBranches.push(mergedBranch);
        } catch {
            // This branch is incompatible, skip it
            continue;
        }
    }

    // Check if we have any valid branches left
    if (mergedBranches.length === 0) {
        throw new AllOfResolutionError("No valid branches after merging anyOf with constraints");
    }

    // If only one branch remains, simplify by returning just that branch
    if (mergedBranches.length === 1) {
        // Clone to avoid modifying the branch directly
        const mergedResult = structuredClone(mergedBranches[0]);

        // Add any metadata properties from result
        const metadataProps = ["title", "description", "$id", "$schema", "examples", "default"];
        for (const prop of metadataProps) {
            if (result[prop] !== undefined && mergedResult[prop] === undefined) {
                mergedResult[prop] = result[prop];
            }
        }

        return mergedResult;
    }

    // Otherwise, create new anyOf with merged branches
    result.anyOf = mergedBranches;
    return result;
}

/**
 * Copies non-conflicting (metadata) properties from two schemas to a result schema.
 */
function copyNonConflictingProperties(
    result: SchemaObject,
    schema1: SchemaObject,
    schema2: SchemaObject,
): void {
    // Define metadata properties that aren't constraints
    const metadataProps = ["title", "description", "$id", "$schema", "examples", "default"];

    // Copy metadata from both schemas
    for (const prop of metadataProps) {
        if (schema1[prop] !== undefined) {
            result[prop] = schema1[prop];
        }
        if (schema2[prop] !== undefined && result[prop] === undefined) {
            result[prop] = schema2[prop];
        }
    }
}

/**
 * Merges type definitions from two schemas.
 *
 * @param targetType - The type from the target schema
 * @param sourceType - The type from the source schema
 * @returns The merged type definition
 * @throws {AllOfResolutionError} If types are incompatible
 */
function mergeType(targetType: string | string[], sourceType: string | string[]): string | string[] {
    if (targetType === sourceType) {
        return targetType;
    }

    // Handle array vs. single string
    const targetTypes = Array.isArray(targetType) ? targetType : [targetType];
    const sourceTypes = Array.isArray(sourceType) ? sourceType : [sourceType];

    // Find common types
    const commonTypes = targetTypes.filter((type) => sourceTypes.includes(type));

    if (commonTypes.length === 0) {
        throw new AllOfResolutionError(
            `Incompatible types: ${JSON.stringify(targetType)} and ${JSON.stringify(sourceType)}`,
        );
    }

    return commonTypes.length === 1 ? commonTypes[0] : commonTypes;
}

/**
 * Merges a numeric constraint like minProperties, maxItems, etc.
 *
 * @param target - The target schema
 * @param source - The source schema
 * @param property - The property name to merge
 * @param mergeFunction - Function to determine the merged value (e.g., Math.max for min constraints)
 */
function mergeNumericConstraint(
    target: SchemaObject,
    source: SchemaObject,
    property: string,
    mergeFunction: (a: number, b: number) => number,
): void {
    if (typeof source[property] === "number") {
        if (typeof target[property] === "number") {
            target[property] = mergeFunction(target[property], source[property]);
        } else {
            target[property] = source[property];
        }
    }
}

/**
 * Merges a generic constraint that should be identical in both schemas, or only present in one.
 *
 * @param target - The target schema
 * @param source - The source schema
 * @param property - The property name to merge
 * @param customMerger - Optional custom merger function for complex properties
 */
function mergeConstraint(
    target: SchemaObject,
    source: SchemaObject,
    property: string,
    // deno-lint-ignore no-explicit-any
    customMerger?: (a: any, b: any) => any,
): void {
    if (source[property] !== undefined) {
        if (target[property] === undefined) {
            target[property] = source[property];
        } else if (customMerger) {
            target[property] = customMerger(target[property], source[property]);
        } else if (JSON.stringify(target[property]) !== JSON.stringify(source[property])) {
            // For simple constraints, they must be identical if present in both schemas
            throw new AllOfResolutionError(
                `Incompatible ${property} values: ${JSON.stringify(target[property])} and ${
                    JSON.stringify(source[property])
                }`,
            );
        }
    }
}

/**
 * Merges enum values from two schemas.
 *
 * @param targetEnum - The enum values from the target schema
 * @param sourceEnum - The enum values from the source schema
 * @returns The merged enum values (intersection)
 * @throws {AllOfResolutionError} If there's no common value between the enums
 */
function mergeEnum(targetEnum: unknown[], sourceEnum: unknown[]): unknown[] {
    // Convert to strings for comparison
    const targetStrings = targetEnum.map((item) => JSON.stringify(item));
    const sourceStrings = sourceEnum.map((item) => JSON.stringify(item));

    // Find common values
    const commonStringValues = targetStrings.filter((value) => sourceStrings.includes(value));

    if (commonStringValues.length === 0) {
        throw new AllOfResolutionError("Incompatible enum values with no common values");
    }

    // Convert back to original format
    return commonStringValues.map((str) => JSON.parse(str));
}

/**
 * Merges pattern constraints from two schemas by creating a pattern that satisfies both.
 *
 * @param pattern1 - The first pattern
 * @param pattern2 - The second pattern
 * @returns A pattern that satisfies both input patterns
 */
function mergePatterns(pattern1: string, pattern2: string): string {
    // Simple case: if patterns are identical, return either one
    if (pattern1 === pattern2) {
        return pattern1;
    }

    // Create a pattern that matches both (positive lookahead assertion)
    return `(?=${pattern1})(?=${pattern2})`;
}

/**
 * Calculates the least common multiple (LCM) of two numbers.
 * Used for merging multipleOf constraints.
 *
 * @param a - First number
 * @param b - Second number
 * @returns The least common multiple of a and b
 */
function findLCM(a: number, b: number): number {
    // Calculate greatest common divisor (GCD) using Euclidean algorithm
    const findGCD = (x: number, y: number): number => {
        while (y) {
            const temp = y;
            y = x % y;
            x = temp;
        }
        return x;
    };

    // LCM = (a * b) / GCD(a, b)
    return (a * b) / findGCD(a, b);
}
