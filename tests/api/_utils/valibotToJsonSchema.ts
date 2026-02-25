/**
 * Valibot schema → JSON Schema converter.
 *
 * Uses {@link https://jsr.io/@valibot/to-json-schema | @valibot/to-json-schema}
 * to convert valibot request schemas to JSON Schema Draft-07.
 *
 * Output format matches {@link typeToJsonSchema}: JSON Schema Draft-07
 * compatible with {@link schemaCoverage}.
 *
 * @example
 * ```ts
 * import * as v from "@valibot/valibot";
 * import { valibotToJsonSchema } from "./valibotToJsonSchema.ts";
 *
 * const Request = v.object({ type: v.literal("foo"), coin: v.string() });
 * const schema = valibotToJsonSchema(v.omit(Request, ["type"]));
 * ```
 *
 * @module
 */

import { type ConversionConfig, toJsonSchema } from "jsr:@valibot/to-json-schema@1";
import type { JsonSchema } from "./schemaCoverage.ts";

export type { JsonSchema } from "./schemaCoverage.ts";

const conversionConfig: ConversionConfig = {
  errorMode: "ignore",
  typeMode: "output",
  overrideSchema: ({ jsonSchema }) => {
    if ("default" in jsonSchema) delete jsonSchema.default;
    return undefined;
  },
};

/**
 * Converts a valibot schema to JSON Schema.
 *
 * @param schema Valibot schema to convert
 * @return JSON Schema representation of the valibot schema
 */
export function valibotToJsonSchema(schema: Parameters<typeof toJsonSchema>[0]): JsonSchema {
  return toJsonSchema(schema, conversionConfig) as JsonSchema;
}
