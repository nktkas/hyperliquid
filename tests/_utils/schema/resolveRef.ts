import type { SchemaObject } from "npm:ajv@^8.17.1";

/**
 * Error thrown when there's a problem resolving references in a schema.
 */
export class RefResolutionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RefResolutionError";
    }
}

/**
 * Result of resolving references in a schema.
 */
export interface ResolveRefResult {
    schema: SchemaObject;
    issues: RefIssue[];
}

/**
 * Represents an issue found during reference resolution.
 */
export interface RefIssue {
    path: string;
    message: string;
}

/**
 * Options for reference resolution.
 */
export interface ResolveRefOptions {
    ignoreRecursiveRefsByPath?: string[] | boolean;
}

/**
 * Recursively processes a JSON schema, resolving all $ref references and detecting circular references.
 * Tracks any issues encountered during resolution for later reporting.
 *
 * @param schema - The schema to resolve
 * @param options - Configuration options for reference resolution
 * @param _rootSchema - The root schema used for resolving references (defaults to schema)
 * @param _path - The current path in the schema (defaults to "#")
 * @param _visited - A set of visited references to detect circular references
 * @param _issues - A list of issues encountered during resolution
 * @returns An object containing the resolved schema and a list of issues
 * @throws {RefResolutionError} If an invalid reference is encountered
 */
export function resolveRef(
    schema: SchemaObject,
    options: ResolveRefOptions = {},
    _rootSchema: SchemaObject = schema,
    _path: string = "#",
    _visited: Set<string> = new Set(),
    _issues: RefIssue[] = [],
): ResolveRefResult {
    if (typeof schema !== "object" || !schema) {
        return { schema, issues: _issues };
    }

    // Handle $ref reference
    if (schema.$ref) {
        // Validate ref format
        if (!schema.$ref.startsWith("#/")) {
            throw new RefResolutionError(`Invalid $ref: ${schema.$ref}`);
        }

        // Check if we've already visited this reference
        if (_visited.has(schema.$ref)) {
            // Determine if this recursive reference should be ignored
            const shouldIgnore = typeof options.ignoreRecursiveRefsByPath === "boolean"
                ? options.ignoreRecursiveRefsByPath
                : options.ignoreRecursiveRefsByPath?.includes(_path);

            // Circular reference detected
            if (!shouldIgnore) {
                _issues.push({
                    path: _path,
                    message: `Recursive reference detected: ${schema.$ref}`,
                });
            }
            // Return a schema that allows any data
            return {
                schema: { description: `Circular reference to ${schema.$ref}` },
                issues: _issues,
            };
        }

        // Add current reference to the visited set
        _visited.add(schema.$ref);

        // Resolve reference by navigating through rootSchema
        const refSchema = schema.$ref.slice(2).split("/")
            .reduce((current: SchemaObject | null, segment: string) => {
                const key = decodeURIComponent(segment);
                return typeof current === "object" && current !== null && key in current ? current[key] : null;
            }, _rootSchema);

        if (!refSchema) {
            throw new RefResolutionError(`Invalid $ref: ${schema.$ref}`);
        }

        // Recursively resolve the schema that $ref points to
        const { schema: resolved, issues } = resolveRef(refSchema, options, _rootSchema, _path, _visited, _issues);

        // Remove current reference from visited set after processing this branch
        _visited.delete(schema.$ref);

        return { schema: resolved, issues };
    }

    // Create a new object for the result
    const result: SchemaObject = {};

    // Process all object properties except "definitions"
    for (const [key, value] of Object.entries(schema)) {
        // Skip the "definitions" property
        if (key === "definitions") continue;

        if (typeof value !== "object" || value === null) {
            // Copy primitive values as is
            result[key] = value;
        } else if (Array.isArray(value)) {
            // Process arrays
            result[key] = value.map((item, idx) => {
                if (typeof item === "object" && item !== null) {
                    const { schema: resolvedItem } = resolveRef(
                        item,
                        options,
                        _rootSchema,
                        `${_path}/${key}/${idx}`,
                        _visited,
                        _issues,
                    );
                    return resolvedItem;
                }
                return item;
            });
        } else {
            // Recursively process nested objects
            const { schema: resolvedValue } = resolveRef(
                value,
                options,
                _rootSchema,
                `${_path}/${key}`,
                _visited,
                _issues,
            );
            result[key] = resolvedValue;
        }
    }

    return { schema: result, issues: _issues };
}
