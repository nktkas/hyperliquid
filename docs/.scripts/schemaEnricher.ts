// deno-lint-ignore-file no-explicit-any no-import-prefix

import type { JsonSchema } from "jsr:@valibot/to-json-schema@1";

import type { SchemaJSDoc } from "./jsdocParser.ts";

// =============================================================================
// TYPES
// =============================================================================

/** Extended JSON Schema with OpenAPI-specific fields */
type ExtendedJsonSchema = JsonSchema & {
  externalDocs?: { url: string; description?: string };
};

// =============================================================================
// MAIN EXPORT
// =============================================================================

/**
 * Enrich JSON Schema with JSDoc descriptions and `@see` links.
 * @param schema - JSON Schema to enrich
 * @param jsdoc - JSDoc data extracted from source file
 */
export function enrichJsonSchema(schema: JsonSchema, jsdoc: SchemaJSDoc): ExtendedJsonSchema {
  // Clone schema to avoid mutation
  const result = structuredClone(schema) as ExtendedJsonSchema;

  // Add schema-level description
  if (jsdoc.schemaDescription && !result.description) {
    result.description = jsdoc.schemaDescription;
  }

  // Add @see tag as externalDocs (use first URL if multiple)
  const firstSeeUrl = jsdoc.tags?.see?.[0];
  if (firstSeeUrl) {
    result.externalDocs = { url: firstSeeUrl };
  }

  // Enrich nested properties
  enrichSchemaNode(result, "", jsdoc.fields);

  return result;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Build path for indexed items (tuples, prefixItems) */
function buildIndexedPath(basePath: string, index: number): string {
  return basePath ? `${basePath}[${index}]` : `[${index}]`;
}

/** Enrich indexed schema items (tuples, prefixItems) */
function enrichIndexedItems(
  items: any[],
  currentPath: string,
  fields: Record<string, string>,
): void {
  for (const [index, itemSchema] of items.entries()) {
    enrichSchemaNode(itemSchema, buildIndexedPath(currentPath, index), fields);
  }
}

/** Recursively enrich schema node with field descriptions */
function enrichSchemaNode(
  schema: any,
  currentPath: string,
  fields: Record<string, string>,
): void {
  // Skip non-object schemas (boolean schemas like true/false)
  if (typeof schema !== "object" || schema === null) {
    return;
  }

  // Add description to current schema node if path matches
  if (currentPath && fields[currentPath] && !schema.description) {
    schema.description = fields[currentPath];
  }

  // Handle object properties
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties) as [string, any][]) {
      // Skip boolean schemas
      if (typeof propSchema !== "object" || propSchema === null) {
        continue;
      }

      const propPath = currentPath ? `${currentPath}.${propName}` : propName;

      // Add description if available
      const description = fields[propPath];
      if (description && !propSchema.description) {
        propSchema.description = description;
      }

      // Recursively process nested schema
      enrichSchemaNode(propSchema, propPath, fields);
    }
  }

  // Handle array items
  if (schema.items) {
    if (Array.isArray(schema.items)) {
      // Tuple-like array with multiple item schemas
      enrichIndexedItems(schema.items, currentPath, fields);
    } else if (typeof schema.items === "object") {
      // Single item schema
      const arrayPath = currentPath ? `${currentPath}[]` : "[]";
      enrichSchemaNode(schema.items, arrayPath, fields);
    }
  }

  // Handle prefixItems
  if (schema.prefixItems) {
    enrichIndexedItems(schema.prefixItems, currentPath, fields);
  }

  // Handle anyOf (union types), oneOf (discriminated unions), and allOf (intersections)
  const compositionKeywords = ["anyOf", "oneOf", "allOf"] as const;
  for (const keyword of compositionKeywords) {
    const variants = schema[keyword];
    if (variants) {
      for (const variant of variants) {
        enrichSchemaNode(variant, currentPath, fields);
      }
    }
  }
}
