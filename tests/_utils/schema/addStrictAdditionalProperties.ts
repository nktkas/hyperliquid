import type { SchemaObject } from "npm:ajv@8";

/**
 * Adds additionalProperties: false to all object type schemas recursively.
 * This makes the schema stricter by not allowing properties not explicitly defined.
 *
 * @param schema The JSON schema to modify
 * @returns The modified schema with additionalProperties: false added to object types
 */
export function addStrictAdditionalProperties(schema: SchemaObject): SchemaObject {
    // Base case: if schema is not an object or is null, return it as is
    if (typeof schema !== "object" || schema === null) {
        return schema;
    }

    // Create a new object to avoid modifying the input
    const result = structuredClone(schema);

    // If this is an object type schema, add additionalProperties: false
    if (
        schema.type === "object" ||
        (Array.isArray(schema.type) && schema.type.includes("object")) ||
        schema.properties
    ) {
        // Only set additionalProperties if it's not already defined
        if (result.additionalProperties === undefined) {
            result.additionalProperties = false;
        }
    }

    // Recursively process nested schemas
    if (schema.properties) {
        result.properties = Object.entries<SchemaObject>(schema.properties)
            .reduce<Record<string, SchemaObject>>((acc, [key, propSchema]) => {
                acc[key] = addStrictAdditionalProperties(propSchema);
                return acc;
            }, {});
    }

    // Process array items
    if (schema.items) {
        if (Array.isArray(schema.items)) {
            // Handle tuple validation
            result.items = schema.items.map((item) => addStrictAdditionalProperties(item));
        } else {
            // Handle array validation
            result.items = addStrictAdditionalProperties(schema.items);
        }
    }

    // Process allOf
    if (schema.allOf) {
        result.allOf = schema.allOf.map((subschema: SchemaObject) => addStrictAdditionalProperties(subschema));
    }

    // Process anyOf
    if (schema.anyOf) {
        result.anyOf = schema.anyOf.map((subschema: SchemaObject) => addStrictAdditionalProperties(subschema));
    }

    // Process oneOf
    if (schema.oneOf) {
        result.oneOf = schema.oneOf.map((subschema: SchemaObject) => addStrictAdditionalProperties(subschema));
    }

    return result;
}
