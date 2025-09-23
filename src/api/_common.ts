// deno-lint-ignore-file no-explicit-any ban-types
import * as v from "valibot";
import { HyperliquidError } from "../_base.ts";

// -------------------- Types --------------------

export type Prettify<T> =
  & { [K in keyof T]: T[K] }
  & {};

export type DeepImmutable<T> = {
  readonly [K in keyof T]: DeepImmutable<T[K]>;
};

export type OmitFirst<T extends readonly any[]> = T extends readonly [any, ...infer R] ? R : [];

export type OverloadedParameters<T> = T extends {
  (...args: infer A1): unknown;
  (...args: infer A2): unknown;
  (...args: infer A3): unknown;
  (...args: infer A4): unknown;
} ? A1 | A2 | A3 | A4
  : T extends {
    (...args: infer A1): unknown;
    (...args: infer A2): unknown;
    (...args: infer A3): unknown;
  } ? A1 | A2 | A3
  : T extends {
    (...args: infer A1): unknown;
    (...args: infer A2): unknown;
  } ? A1 | A2
  : T extends (...args: infer A) => unknown ? A
  : never;

// -------------------- Schemas --------------------

export const UnsignedDecimal = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(String),
    v.trim(),
    v.regex(/^[0-9]+(\.[0-9]+)?$/),
    v.transform((value) => formatDecimal(value)),
  );
})();
export type UnsignedDecimal = v.InferOutput<typeof UnsignedDecimal>;

export const Decimal = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(String),
    v.trim(),
    v.regex(/^-?[0-9]+(\.[0-9]+)?$/),
    v.transform((value) => formatDecimal(value)),
  );
})();
export type Decimal = v.InferOutput<typeof Decimal>;

export const Integer = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.safeInteger(),
  );
})();
export type Integer = v.InferOutput<typeof Integer>;

export const UnsignedInteger = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.safeInteger(),
    v.minValue(0),
  );
})();
export type UnsignedInteger = v.InferOutput<typeof UnsignedInteger>;

export const Hex = /* @__PURE__ */ (() => {
  return v.pipe(
    v.string(),
    v.regex(/^0[xX][0-9a-fA-F]+$/),
    v.transform((value) => value.toLowerCase() as `0x${string}`),
  );
})();
export type Hex = v.InferOutput<typeof Hex>;

export const Address = /* @__PURE__ */ (() => {
  return v.pipe(Hex, v.length(42));
})();
export type Address = v.InferOutput<typeof Address>;

export const TokenId = /* @__PURE__ */ (() => {
  return v.pipe(
    v.string(),
    v.regex(/^[^:]+:0x[0-9a-fA-F]+$/),
    v.transform((value) => value as `${string}:${Hex}`),
  );
})();
export type TokenId = v.InferOutput<typeof TokenId>;

export const Percent = /* @__PURE__ */ (() => {
  return v.pipe(
    v.string(),
    v.regex(/^[0-9]+(\.[0-9]+)?%$/),
    v.transform((value) => value as `${string}%`),
  );
})();
export type Percent = v.InferOutput<typeof Percent>;

/** Removes leading/trailing zeros from decimal string without precision loss. */
function formatDecimal(numStr: string): string {
  return numStr
    .trim()
    .replace(/^(-?)0+(?=\d)/, "$1") // Remove leading zeros, keep sign
    .replace(/(\.\d*?)0+$/, "$1") // Remove trailing zeros after decimal
    .replace(/\.$/, ""); // Remove lone decimal point
}

/** Thrown when a schema validation error occurs.  */
export class SchemaError extends HyperliquidError {
  constructor(message: string) {
    super(message);
    this.name = "SchemaError";
  }
}

/**
 * Creates a valibot parser with summarized error messages.
 * Used for validating, formatting, and sorting object keys for correct signature generation.
 * @param schema - The valibot schema to validate against.
 * @returns A parser function that validates input against the schema.
 */
export function parser<TSchema extends v.GenericSchema>(schema: TSchema): v.Parser<TSchema, undefined> {
  const safeParser = v.safeParser(schema);
  const parser = (input: unknown) => {
    const result = safeParser(input);
    if (result.issues) throw new SchemaError("\n" + v.summarize(result.issues));
    return result.output;
  };
  parser.schema = schema;
  parser.config = undefined;
  return parser;
}
