/**
 * TypeScript type → JSON Schema converter.
 *
 * Uses {@link https://github.com/vega/ts-json-schema-generator | ts-json-schema-generator}
 * to convert type aliases, interfaces, and any other TypeScript type construct to JSON Schema.
 *
 * JSDoc tags are extracted automatically:
 * - Text:    `@description`, `@pattern`, `@format`, `@comment`
 * - Numeric: `@minimum`, `@maximum`, `@minLength`, `@maxLength`, `@minItems`, `@maxItems`,
 *            `@exclusiveMinimum`, `@exclusiveMaximum`, `@multipleOf`, `@minProperties`, `@maxProperties`
 * - Boolean: `@deprecated`, `@readOnly`, `@writeOnly`, `@uniqueItems`
 * - JSON:    `@default`, `@examples`, `@const`
 * - Special: `@nullable`, `@discriminator`
 *
 * Output format:
 * - JSON Schema Draft-07 with `definitions` and `#/definitions/` references
 * - Top-level `$ref` is unwrapped: the root schema is the type definition itself
 * - Shared types are placed in `definitions` and referenced via `$ref: "#/definitions/TypeName"`
 *
 * @example
 * ```ts
 * import { typeToJsonSchema } from "./typeToJsonSchema.ts";
 *
 * const schema = typeToJsonSchema("/path/to/file.ts", "MyResponse");
 * ```
 *
 * @module
 */

import { type Config, createGenerator } from "npm:ts-json-schema-generator@2";
import ts from "npm:typescript@5";
import type { JsonSchema } from "./schemaCoverage.ts";

export type { JsonSchema } from "./schemaCoverage.ts";

// ============================================================
// Configuration
// ============================================================

/** Compiler options for the TypeScript program. */
const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  noEmit: true,
  allowImportingTsExtensions: true,
  skipLibCheck: true,
};

/** Configuration for ts-json-schema-generator. */
const generatorConfig: Config = {
  skipTypeCheck: true,
  jsDoc: "extended",
  sortProps: false,
  strictTuples: true,
  additionalProperties: false,
  topRef: true,
  expose: "all",
};

// ============================================================
// Public API
// ============================================================

/**
 * Converts a named TypeScript type to JSON Schema.
 *
 * @param filePath Absolute path to the TypeScript source file
 * @param typeName Name of the exported type alias or interface
 * @return JSON Schema representation of the type
 *
 * @throws {Error} If the type is not found or cannot be resolved
 */
export function typeToJsonSchema(filePath: string, typeName: string): JsonSchema {
  // On Windows, URL.pathname gives "/C:/..." - strip the leading slash for TypeScript
  const normalizedPath = filePath.replace(/^\/([A-Za-z]:)/, "$1");
  const tsProgram = ts.createProgram([normalizedPath], compilerOptions);
  const schemaGen = createGenerator({ ...generatorConfig, tsProgram });
  const rawTypeSchema = schemaGen.createSchema(typeName);
  return normalizeSchema(rawTypeSchema as Record<string, unknown>);
}

// ============================================================
// Schema Normalization
// ============================================================

/**
 * Unwraps the top-level `$ref` produced by ts-json-schema-generator.
 *
 * The generator outputs `{ "$ref": "#/definitions/TypeName", "definitions": { ... } }`.
 * This function inlines the root definition so the schema directly describes the type.
 */
function normalizeSchema(raw: Record<string, unknown>): JsonSchema {
  const defs = raw.definitions as Record<string, JsonSchema> | undefined;

  if (typeof raw.$ref === "string" && defs) {
    const refName = extractRefName(raw.$ref);
    if (refName) {
      const definition = defs[refName];
      if (definition) {
        const { [refName]: _, ...remainingDefs } = defs;
        const result: JsonSchema = { ...definition };
        if (Object.keys(remainingDefs).length > 0) {
          result.definitions = remainingDefs;
        }
        return result;
      }
    }
  }

  const { definitions: _, ...rest } = raw;
  return { ...rest, ...(defs ? { definitions: defs } : {}) };
}

/** Extracts type name from a `#/definitions/` ref string. */
function extractRefName(ref: string): string | null {
  const prefix = "#/definitions/";
  if (ref.startsWith(prefix)) {
    return decodeURIComponent(ref.slice(prefix.length));
  }
  return null;
}
