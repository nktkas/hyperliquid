import * as v from "@valibot/valibot";

export const UnsignedDecimal = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([v.string(), v.number()]),
    v.toString(),
    v.transform((value) => formatDecimalString(value)),
    v.regex(/^[0-9]+(\.[0-9]+)?$/),
  );
})();
export type UnsignedDecimal = v.InferOutput<typeof UnsignedDecimal>;

export const Decimal = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([v.string(), v.number()]),
    v.toString(),
    v.transform((value) => formatDecimalString(value)),
    v.regex(/^-?[0-9]+(\.[0-9]+)?$/),
  );
})();
export type Decimal = v.InferOutput<typeof Decimal>;

export const Integer = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([v.string(), v.number()]),
    v.toNumber(),
    v.integer(),
    v.safeInteger(),
  );
})();
export type Integer = v.InferOutput<typeof Integer>;

export const UnsignedInteger = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([v.string(), v.number()]),
    v.toNumber(),
    v.integer(),
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

export const ISO8601WithoutTimezone = /* @__PURE__ */ (() => {
  return v.pipe(
    v.string(),
    v.regex(/^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])[T ](?:0\d|1\d|2[0-3])(?::[0-5]\d){2}(?:\.\d{1,9})?$/),
  );
})();
export type ISO8601WithoutTimezone = v.InferOutput<typeof ISO8601WithoutTimezone>;

function formatDecimalString(value: string): string {
  return value
    // remove leading/trailing whitespace
    .trim() // "  123.45  " → "123.45"
    // remove leading zeros
    .replace(/^(-?)0+(?=\d)/, "$1") // "00123" → "123", "-00.5" → "-0.5"
    // remove trailing zeros
    .replace(/\.0*$|(\.\d+?)0+$/, "$1") // "1.2000" → "1.2", "5.0" → "5"
    // add leading zero if starts with decimal point
    .replace(/^(-?)\./, "$10.") // ".5" → "0.5", "-.5" → "-0.5"
    // add "0" if string is empty after trimming
    .replace(/^-?$/, "0") // "" → "0", "-" → "0"
    // normalize negative zero
    .replace(/^-0$/, "0"); // "-0" → "0"
}
