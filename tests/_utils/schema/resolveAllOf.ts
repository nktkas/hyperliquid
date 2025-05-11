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
 * Conflict resolution mode for schema merging
 */
export type MergeMode = "strict" | "smart";

/**
 * Options for controlling the behavior of allOf resolution.
 */
export interface ResolveAllOfOptions {
    /**
     * Controls how to handle conflicts between applicators and direct constraints.
     * - 'strict': Throws an error when a conflict is detected (default)
     * - 'smart': Attempts to perform logical intersection
     */
    conflictResolution?: MergeMode;
}

/**
 * Resolves all occurrences of `allOf` in a JSON schema by merging the schemas inside it.
 * Replaces each allOf with an equivalent merged schema.
 */
export function resolveAllOf(schema: SchemaObject, options?: ResolveAllOfOptions): SchemaObject {
    const mode = options?.conflictResolution || "strict";
    const result = structuredClone(schema);

    // Process nested schemas first (except allOf)
    processNested(result, options);

    // Process allOf if present
    if (Array.isArray(result.allOf) && result.allOf.length > 0) {
        // First, recursively resolve any nested allOf in each subschema
        const resolvedSubschemas = result.allOf.map((s) => resolveAllOf(s, options));

        // Merge all subschemas from allOf into one
        const mergedSchema = resolvedSubschemas.reduce(
            (acc, cur) => mergeSchemas(acc, cur, mode),
            {},
        );

        // Remove the allOf property
        delete result.allOf;

        // Merge the parent schema with the merged allOf schema
        return mergeSchemas(result, mergedSchema, mode);
    }

    return result;
}

/**
 * Recursively processes nested schemas to resolve allOf in all sub-schemas
 */
function processNested(schema: SchemaObject, options?: ResolveAllOfOptions): void {
    for (const [key, value] of Object.entries(schema)) {
        if (key === "allOf") continue; // Handle allOf separately

        if (typeof value === "object") {
            if (Array.isArray(value)) {
                // Process arrays (like items in tuple validation)
                schema[key] = value.map((item) => typeof item === "object" ? resolveAllOf(item, options) : item);
            } else if (value !== null) {
                // Process nested objects
                schema[key] = resolveAllOf(value, options);
            }
        }
    }
}

/**
 * Merges two schemas according to the allOf merging rules
 */
function mergeSchemas(target: SchemaObject, source: SchemaObject, mode: MergeMode): SchemaObject {
    // Handle empty schemas
    if (Object.keys(source).length === 0) return structuredClone(target);
    if (Object.keys(target).length === 0) return structuredClone(source);

    // Check for conflicts between applicators and direct constraints
    if (hasApplicatorConflict(target, source)) {
        if (mode === "strict") {
            throw new AllOfResolutionError("Cannot merge schema with applicator and direct constraints in strict mode");
        }
        // In 'smart' mode, try logical intersection
        return resolveApplicatorConflict(target, source, mode);
    }

    const result = structuredClone(target);

    // Merge all schema components in sequence
    mergeType(result, source);
    mergeProps(result, source, mode);
    mergeRequired(result, source);
    mergeAdditionalProps(result, source);
    mergeConstraints(result, source);

    // Handle items (for arrays)
    if (source.items) mergeItems(result, source, mode);

    // Process all remaining keys from source
    copyRemainingProps(result, source);

    return result;
}

/**
 * Checks if there's a conflict between applicators and direct constraints
 */
function hasApplicatorConflict(s1: SchemaObject, s2: SchemaObject): boolean {
    return (hasApplicator(s1) && hasDirectConstraints(s2)) ||
        (hasApplicator(s2) && hasDirectConstraints(s1));
}

/**
 * Checks if a schema contains any applicator keywords (anyOf, oneOf, allOf, not)
 */
function hasApplicator(schema: SchemaObject): boolean {
    return Boolean(schema.anyOf || schema.oneOf || schema.allOf || schema.not);
}

/**
 * Checks if a schema contains any direct constraint keywords
 */
function hasDirectConstraints(schema: SchemaObject): boolean {
    return [
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
    ].some((key) => schema[key] !== undefined);
}

/**
 * Handles merging when an applicator conflicts with direct constraints
 */
function resolveApplicatorConflict(
    s1: SchemaObject,
    s2: SchemaObject,
    mode: MergeMode,
): SchemaObject {
    // Determine which schema has the applicator and which has direct constraints
    const [withApplicator, other] = hasApplicator(s1) ? [s1, s2] : [s2, s1];

    // Route to the appropriate merger based on applicator type
    if (withApplicator.anyOf) return mergeAnyOf(withApplicator, other, mode);
    if (withApplicator.oneOf) return mergeOneOf(withApplicator, other, mode);
    if (withApplicator.allOf) return mergeAllOf(withApplicator, other, mode);
    if (withApplicator.not !== undefined) return mergeNot(withApplicator, other, mode);

    throw new AllOfResolutionError("Unsupported applicator type");
}

/**
 * Merges a schema containing anyOf with another schema.
 * Tries to merge each branch with the other schema and keeps valid branches.
 */
function mergeAnyOf(
    schemaWithAnyOf: SchemaObject,
    other: SchemaObject,
    mode: MergeMode,
): SchemaObject {
    // Preserve metadata properties
    const result = copyMetadata(schemaWithAnyOf, other);

    // Special handling for `items.anyOf` when the other schema also has `items.anyOf`
    if (
        schemaWithAnyOf.items && Array.isArray(schemaWithAnyOf.anyOf) &&
        other.items && other.items.anyOf && Array.isArray(other.items.anyOf)
    ) {
        // For `items.anyOf`, we need to keep only branches that are compatible with any branch in the other schema
        const validBranches = schemaWithAnyOf.anyOf.filter((branch) => {
            // A branch is valid if it's compatible with at least one branch in the other schema
            return other.items.anyOf.some((otherBranch: SchemaObject) =>
                !areLogicallyIncompatible(branch, otherBranch)
            );
        });

        if (validBranches.length === 0) {
            throw new AllOfResolutionError("No valid branches after merging anyOf in items");
        }

        result.anyOf = validBranches;
        return result;
    }

    // Regular handling for other anyOf schemas
    const validBranches = schemaWithAnyOf.anyOf
        .map((branch: SchemaObject) => {
            try {
                // First, check for logical incompatibility before attempting the merge
                if (areLogicallyIncompatible(branch, other)) {
                    return null;
                }

                // If not logically incompatible, try to merge
                return mergeSchemas(structuredClone(branch), other, mode);
            } catch {
                // This branch is incompatible, skip it
                return null;
            }
        })
        .filter(Boolean) as SchemaObject[];

    // Check if we have any valid branches left
    if (validBranches.length === 0) {
        throw new AllOfResolutionError("No valid branches after merging anyOf");
    }

    // If only one branch remains, simplify by returning just that branch
    if (validBranches.length === 1) {
        const merged = structuredClone(validBranches[0]);
        copyMetadataTo(merged, result);
        return merged;
    }

    // Otherwise, create new anyOf with merged branches
    result.anyOf = validBranches;
    return result;
}

/**
 * Merges a schema containing oneOf with another schema.
 * Unlike anyOf, oneOf always keeps its structure even if only one branch remains.
 */
function mergeOneOf(
    schemaWithOneOf: SchemaObject,
    other: SchemaObject,
    mode: MergeMode,
): SchemaObject {
    const result = copyMetadata(schemaWithOneOf, other);

    // Try to merge each oneOf branch with the other schema
    const validBranches = schemaWithOneOf.oneOf
        .map((branch: SchemaObject) => {
            try {
                // First check for logical incompatibility
                if (areLogicallyIncompatible(branch, other)) {
                    return null;
                }

                return mergeSchemas(structuredClone(branch), other, mode);
            } catch {
                // This branch is incompatible, skip it
                return null;
            }
        })
        .filter(Boolean) as SchemaObject[];

    if (validBranches.length === 0) {
        throw new AllOfResolutionError("No valid branches after merging oneOf");
    }

    // Always preserve oneOf structure
    result.oneOf = validBranches;
    return result;
}

/**
 * Merges a schema containing allOf with another schema.
 * Resolves the allOf internally first, then merges with the other schema.
 */
function mergeAllOf(
    schemaWithAllOf: SchemaObject,
    other: SchemaObject,
    mode: MergeMode,
): SchemaObject {
    try {
        // Merge all schemas from allOf
        const mergedAllOf = schemaWithAllOf.allOf.reduce(
            (acc: SchemaObject, schema: SchemaObject) => mergeSchemas(acc, schema, mode),
            {},
        );

        // Get the remaining properties from schemaWithAllOf
        const remainder = { ...schemaWithAllOf };
        delete remainder.allOf;

        // Merge with the remaining properties if any exist
        const merged = Object.keys(remainder).length === 0 ? mergedAllOf : mergeSchemas(mergedAllOf, remainder, mode);

        // Finally, merge with the other schema
        return mergeSchemas(merged, other, mode);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new AllOfResolutionError(`Failed to merge allOf: ${msg}`);
    }
}

/**
 * Merges a schema containing not with another schema.
 * Preserves the not constraint while merging other properties.
 */
function mergeNot(
    schemaWithNot: SchemaObject,
    other: SchemaObject,
    mode: MergeMode,
): SchemaObject {
    // Store the not value
    const notValue = schemaWithNot.not;

    // Create a temporary copy without the not
    const rest = { ...schemaWithNot };
    delete rest.not;

    try {
        // Merge the rest of the schema with the other schema
        const merged = mergeSchemas(rest, other, mode);

        // Add back the not value
        merged.not = notValue;
        return merged;
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new AllOfResolutionError(`Failed to merge not schema: ${msg}`);
    }
}

/**
 * Creates a new schema with metadata properties from both input schemas
 */
function copyMetadata(s1: SchemaObject, s2: SchemaObject): SchemaObject {
    const result: SchemaObject = {};

    // Copy metadata properties, prioritizing the first schema
    ["title", "description", "$id", "$schema", "examples", "default"].forEach((key) => {
        if (s1[key] !== undefined) result[key] = s1[key];
        else if (s2[key] !== undefined) result[key] = s2[key];
    });

    return result;
}

/**
 * Copies metadata properties from source to target (if not already set)
 */
function copyMetadataTo(target: SchemaObject, source: SchemaObject): void {
    ["title", "description", "$id", "$schema", "examples", "default"].forEach((key) => {
        if (source[key] !== undefined && target[key] === undefined) {
            target[key] = source[key];
        }
    });
}

/**
 * Merges the type definition between schemas
 * Finds the intersection of allowed types
 */
function mergeType(target: SchemaObject, source: SchemaObject): void {
    if (source.type === undefined) return;

    if (target.type === undefined) {
        target.type = source.type;
        return;
    }

    if (target.type === source.type) return;

    // Convert to arrays for consistent handling
    const t1 = Array.isArray(target.type) ? target.type : [target.type];
    const t2 = Array.isArray(source.type) ? source.type : [source.type];

    // Find common types (intersection)
    const common = t1.filter((t) => t2.includes(t));

    if (common.length === 0) {
        throw new AllOfResolutionError(
            `Incompatible types: ${JSON.stringify(target.type)} and ${JSON.stringify(source.type)}`,
        );
    }

    // Simplify to single type if possible
    target.type = common.length === 1 ? common[0] : common;
}

/**
 * Merges properties objects from both schemas
 * Recursively merges properties that exist in both schemas
 */
function mergeProps(target: SchemaObject, source: SchemaObject, mode: MergeMode): void {
    if (!source.properties) return;

    if (!target.properties) {
        target.properties = structuredClone(source.properties);
        return;
    }

    for (const [key, sourceSchema] of Object.entries<SchemaObject>(source.properties)) {
        if (key in target.properties) {
            // Property exists in both schemas, merge recursively
            target.properties[key] = mergeSchemas(target.properties[key], sourceSchema, mode);
        } else {
            // Property only exists in source, copy it
            target.properties[key] = structuredClone(sourceSchema);
        }
    }
}

/**
 * Merges required properties arrays, preserving uniqueness
 */
function mergeRequired(target: SchemaObject, source: SchemaObject): void {
    if (!Array.isArray(source.required) || source.required.length === 0) return;

    if (!Array.isArray(target.required)) {
        target.required = [...source.required];
        return;
    }

    // Add all unique required properties from source
    target.required = [
        ...target.required,
        ...source.required.filter((prop) => !target.required!.includes(prop)),
    ];
}

/**
 * Merges additionalProperties constraints (strictest rule wins)
 */
function mergeAdditionalProps(target: SchemaObject, source: SchemaObject): void {
    if (source.additionalProperties === undefined) return;

    if (
        target.additionalProperties === undefined ||
        (source.additionalProperties === false && target.additionalProperties !== false)
    ) {
        // False is stricter than true or object schema
        target.additionalProperties = source.additionalProperties;
    }
}

/**
 * Merges all numeric and validation constraints
 */
function mergeConstraints(target: SchemaObject, source: SchemaObject): void {
    // Process numeric constraints with appropriate merge functions
    [
        { key: "minProperties", fn: Math.max }, // Most restrictive minimum
        { key: "maxProperties", fn: Math.min }, // Most restrictive maximum
        { key: "minItems", fn: Math.max },
        { key: "maxItems", fn: Math.min },
        { key: "minLength", fn: Math.max },
        { key: "maxLength", fn: Math.min },
        { key: "minimum", fn: Math.max },
        { key: "maximum", fn: Math.min },
        { key: "exclusiveMinimum", fn: Math.max },
        { key: "exclusiveMaximum", fn: Math.min },
        { key: "multipleOf", fn: lcm }, // Least common multiple for multipleOf
    ].forEach(({ key, fn }) => {
        if (typeof source[key] === "number") {
            if (typeof target[key] === "number") {
                target[key] = fn(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    });

    // Handle non-numeric constraints
    mergeConstraint(target, source, "pattern", mergePatterns);
    mergeConstraint(target, source, "format");
    mergeConstraint(target, source, "enum", mergeEnums);
}

/**
 * Calculates least common multiple for multipleOf constraints
 */
function lcm(a: number, b: number): number {
    // Greatest common divisor using Euclidean algorithm
    const gcd = (x: number, y: number): number => {
        while (y) [x, y] = [y, x % y];
        return x;
    };

    return (a * b) / gcd(a, b);
}

/**
 * Merges a general constraint with optional custom merger function
 */
function mergeConstraint(
    target: SchemaObject,
    source: SchemaObject,
    key: string,
    // deno-lint-ignore no-explicit-any
    merger?: (a: any, b: any) => any,
): void {
    if (source[key] === undefined) return;

    if (target[key] === undefined) {
        target[key] = source[key];
        return;
    }

    // Use custom merger if provided
    if (merger) {
        target[key] = merger(target[key], source[key]);
        return;
    }

    // Otherwise constraints must be identical
    if (JSON.stringify(target[key]) !== JSON.stringify(source[key])) {
        throw new AllOfResolutionError(
            `Incompatible ${key} values: ${JSON.stringify(target[key])} and ${JSON.stringify(source[key])}`,
        );
    }
}

/**
 * Creates a regex pattern that requires both input patterns to match
 */
function mergePatterns(p1: string, p2: string): string {
    return p1 === p2 ? p1 : `(?=${p1})(?=${p2})`;
}

/**
 * Finds the intersection of enum values from both schemas
 */
function mergeEnums(e1: unknown[], e2: unknown[]): unknown[] {
    // Convert to string sets for comparison
    const s1 = new Set(e1.map((v) => JSON.stringify(v)));
    const s2 = new Set(e2.map((v) => JSON.stringify(v)));

    // Find common values (intersection)
    const common = [...s1].filter((v) => s2.has(v));

    if (common.length === 0) {
        throw new AllOfResolutionError("Incompatible enum values with no common values");
    }

    // Convert back to original format
    return common.map((v) => JSON.parse(v));
}

/**
 * Merges items schemas for array validation
 */
function mergeItems(target: SchemaObject, source: SchemaObject, mode: MergeMode): void {
    if (!target.items) {
        target.items = source.items;
        return;
    }

    // Handle special case for anyOf inside items
    if (target.items.anyOf && source.items.anyOf) {
        // When both items have anyOf, we need to filter target.items.anyOf
        // to keep only branches that are compatible with at least one branch in source.items.anyOf
        const validBranches = target.items.anyOf.filter((branch: SchemaObject) => {
            return source.items.anyOf.some((sourceBranch: SchemaObject) =>
                !areLogicallyIncompatible(branch, sourceBranch)
            );
        });

        if (validBranches.length === 0) {
            throw new AllOfResolutionError("No valid branches after merging items.anyOf");
        }

        target.items.anyOf = validBranches;
        return;
    }

    // Handle applicator conflict in items
    if (hasApplicatorConflict(target.items, source.items)) {
        if (mode === "strict") {
            throw new AllOfResolutionError(
                "Cannot merge items schemas with applicator and direct constraints in strict mode",
            );
        }

        target.items = resolveApplicatorConflict(target.items, source.items, mode);
        return;
    }

    // Handle tuple validation (arrays) vs. single schema validation
    if (Array.isArray(target.items) && Array.isArray(source.items)) {
        // Tuple validation - merge each position
        const maxLen = Math.max(target.items.length, source.items.length);
        const merged = [];

        for (let i = 0; i < maxLen; i++) {
            if (i < target.items.length && i < source.items.length) {
                // Position exists in both - merge
                merged.push(mergeSchemas(target.items[i], source.items[i], mode));
            } else if (i < target.items.length) {
                // Position only in target
                merged.push(target.items[i]);
            } else {
                // Position only in source
                merged.push(source.items[i]);
            }
        }

        target.items = merged;
    } else if (!Array.isArray(target.items) && !Array.isArray(source.items)) {
        // Single schema for all items - merge them
        target.items = mergeSchemas(target.items, source.items, mode);
    } else {
        // Incompatible items definitions (one is array, one is object)
        throw new AllOfResolutionError("Cannot merge schemas with incompatible items definitions");
    }
}

/**
 * Copies remaining properties from source to target
 */
function copyRemainingProps(target: SchemaObject, source: SchemaObject): void {
    // Properties that have already been processed
    const skipKeys = new Set([
        "type",
        "properties",
        "required",
        "additionalProperties",
        "items",
        "minProperties",
        "maxProperties",
        "minItems",
        "maxItems",
        "minLength",
        "maxLength",
        "minimum",
        "maximum",
        "exclusiveMinimum",
        "exclusiveMaximum",
        "multipleOf",
        "pattern",
        "format",
        "enum",
        "anyOf",
        "oneOf",
        "allOf",
        "not",
    ]);

    // Metadata properties that should overwrite existing values
    const metadataKeys = new Set([
        "title",
        "description",
        "$id",
        "$schema",
        "examples",
        "default",
        "$comment",
    ]);

    for (const [key, value] of Object.entries(source)) {
        if (skipKeys.has(key)) continue;

        if (metadataKeys.has(key)) {
            // Always update metadata
            target[key] = structuredClone(value);
        } else if (!(key in target)) {
            // Only copy other properties if they don't exist in target
            target[key] = structuredClone(value);
        }
    }
}

/**
 * Determines if two schemas are logically incompatible
 * Looks for contradictions that would make the merged schema invalid
 */
function areLogicallyIncompatible(s1: SchemaObject, s2: SchemaObject): boolean {
    // Check for object schemas with potentially incompatible required properties
    if (s1.type === "object" && s2.type === "object") {
        // When both schemas have required properties
        if (s1.required && s2.required) {
            // If both schemas have additionalProperties: false, they must require the same set of properties
            // or one schema's required set must be a subset of the other's properties
            if (s1.additionalProperties === false && s2.additionalProperties === false) {
                // Check if schema1 requires properties not defined in schema2
                for (const reqProp of s1.required) {
                    if (!s2.properties || !(reqProp in s2.properties)) {
                        return true; // Schema1 requires a property not allowed in schema2
                    }
                }

                // Check if schema2 requires properties not defined in schema1
                for (const reqProp of s2.required) {
                    if (!s1.properties || !(reqProp in s1.properties)) {
                        return true; // Schema2 requires a property not allowed in schema1
                    }
                }
            }

            // If one schema has additionalProperties: false, check if it can accept all required properties
            // from the other schema
            if (s1.additionalProperties === false) {
                for (const reqProp of s2.required) {
                    if (!s1.properties || !(reqProp in s1.properties)) {
                        return true; // Schema2 requires a property not allowed in schema1
                    }
                }
            }

            if (s2.additionalProperties === false) {
                for (const reqProp of s1.required) {
                    if (!s2.properties || !(reqProp in s2.properties)) {
                        return true; // Schema1 requires a property not allowed in schema2
                    }
                }
            }

            // Check for required properties with mutually exclusive values
            if (s1.properties && s2.properties) {
                // Check for mutually exclusive required properties
                // Each schema must define one property that the other schema doesn't have

                // Check for properties required by s1 but not by s2 and vice versa
                const s1OnlyRequired = s1.required.filter((p: SchemaObject) => !s2.required.includes(p));
                const s2OnlyRequired = s2.required.filter((p: SchemaObject) => !s1.required.includes(p));

                // If both schemas have exclusive required properties, they might be mutually exclusive
                if (s1OnlyRequired.length > 0 && s2OnlyRequired.length > 0) {
                    // Check if s2 defines any of s1's exclusive required properties
                    for (const prop1 of s1OnlyRequired) {
                        if (!(prop1 in s2.properties)) {
                            // If s1 has an exclusive required property that s2 doesn't define,
                            // and s2 has an exclusive required property that s1 doesn't define,
                            // then these schemas likely represent alternative object states
                            for (const prop2 of s2OnlyRequired) {
                                if (!(prop2 in s1.properties)) {
                                    // Both schemas require incompatible properties that are mutually exclusive
                                    return true;
                                }
                            }
                        }
                    }
                }

                // Check for incompatible common required properties
                const commonRequired = s1.required.filter((p: SchemaObject) => s2.required.includes(p));
                for (const prop of commonRequired) {
                    if (isPropertySchemaIncompatible(s1.properties[prop], s2.properties[prop])) {
                        return true;
                    }
                }
            }
        }
    }

    // Check for type incompatibility
    if (s1.type && s2.type) {
        const t1 = Array.isArray(s1.type) ? s1.type : [s1.type];
        const t2 = Array.isArray(s2.type) ? s2.type : [s2.type];

        // If there's no overlap in allowed types, they're incompatible
        if (!t1.some((t) => t2.includes(t))) {
            return true;
        }
    }

    // Check for const value incompatibility
    if (s1.const !== undefined && s2.const !== undefined && s1.const !== s2.const) {
        return true;
    }

    // Check for enum incompatibility
    if (Array.isArray(s1.enum) && Array.isArray(s2.enum)) {
        const s1Set = new Set(s1.enum.map((v) => JSON.stringify(v)));
        const s2Set = new Set(s2.enum.map((v) => JSON.stringify(v)));

        // Check if there's any overlap between the enums
        let hasCommon = false;
        for (const val of s1Set) {
            if (s2Set.has(val)) {
                hasCommon = true;
                break;
            }
        }

        if (!hasCommon) {
            return true;
        }
    }

    return false;
}

/**
 * Checks if two property schemas are logically incompatible
 */
function isPropertySchemaIncompatible(s1: SchemaObject | undefined, s2: SchemaObject): boolean {
    if (!s1) return false;

    // Direct check for const/enum conflicts
    if (s1.const !== undefined && s2.const !== undefined && s1.const !== s2.const) {
        return true;
    }

    // Check for enum incompatibility
    if (Array.isArray(s1.enum) && Array.isArray(s2.enum)) {
        const s1Set = new Set(s1.enum.map((v) => JSON.stringify(v)));
        const s2Set = new Set(s2.enum.map((v) => JSON.stringify(v)));

        // Check if there's any overlap between the enums
        let hasCommon = false;
        for (const val of s1Set) {
            if (s2Set.has(val)) {
                hasCommon = true;
                break;
            }
        }

        if (!hasCommon) {
            return true;
        }
    }

    // Check for anyOf/oneOf special case where all branches are incompatible
    if (s1.anyOf) {
        // If all branches in anyOf are incompatible with s2, then these schemas are incompatible
        return s1.anyOf.every((branch: SchemaObject) => areLogicallyIncompatible(branch, s2));
    }

    if (s1.oneOf) {
        // If all branches in oneOf are incompatible with s2, then these schemas are incompatible
        return s1.oneOf.every((branch: SchemaObject) => areLogicallyIncompatible(branch, s2));
    }

    // Check type compatibility
    if (s1.type && s2.type) {
        const t1 = Array.isArray(s1.type) ? s1.type : [s1.type];
        const t2 = Array.isArray(s2.type) ? s2.type : [s2.type];
        return !t1.some((t) => t2.includes(t));
    }

    return false;
}
