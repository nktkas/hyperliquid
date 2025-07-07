import * as TJS from "npm:typescript-json-schema@^0.65.1";
import { fromFileUrl } from "jsr:@std/path@1/from-file-url";
import type { SchemaObject } from "npm:ajv@8";

/**
 * Generates a JSON schema for a given TypeScript type.
 * @param path - The path to the TypeScript file containing the type.
 * @param typeName - The name of the type to generate the schema for.
 * @returns The generated JSON schema object.
 */
export function schemaGenerator(path: string, typeName: string): SchemaObject {
    const program = TJS.getProgramFromFiles([fromFileUrl(path)], {
        strict: true,
        allowImportingTsExtensions: true,
        lib: ["esnext", "dom"],
        module: "esnext",
        downlevelIteration: true,
    });
    const schema = TJS.generateSchema(program, typeName, {
        strictNullChecks: true,
        required: true,
        ignoreErrors: true,
    });
    if (!schema) throw new Error(`Failed to generate schema for ${typeName}`);
    return schema;
}
