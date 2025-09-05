import * as v from "valibot";

export const Integer = v.pipe(v.number(), v.safeInteger());
export type Integer = v.InferOutput<typeof Integer>;

export const UnsignedInteger = v.pipe(v.number(), v.safeInteger(), v.minValue(0));
export type UnsignedInteger = v.InferOutput<typeof UnsignedInteger>;

export const UnsignedDecimal = v.pipe(
    v.string(),
    v.regex(/^[0-9]+(\.[0-9]+)?$/),
    v.transform((value) => formatDecimal(value)),
);
export type UnsignedDecimal = v.InferOutput<typeof UnsignedDecimal>;

export const Decimal = v.pipe(
    v.string(),
    v.regex(/^-?[0-9]+(\.[0-9]+)?$/),
    v.transform((value) => formatDecimal(value)),
);
export type Decimal = v.InferOutput<typeof Decimal>;

export const Hex = v.pipe(
    v.string(),
    v.regex(/^0[xX][0-9a-fA-F]+$/),
    v.transform((value) => value.toLowerCase() as `0x${string}`),
);
export type Hex = v.InferOutput<typeof Hex>;

export const TokenId = v.pipe(
    v.string(),
    v.regex(/^[^:]+:0x[0-9a-fA-F]+$/),
    v.transform((value) => value as `${string}:${Hex}`),
);
export type TokenId = v.InferOutput<typeof TokenId>;

/** Removes leading/trailing zeros from decimal string without precision loss. */
function formatDecimal(numStr: string): string {
    return numStr
        .replace(/^(-?)0+(?=\d)/, "$1") // Remove leading zeros, keep sign
        .replace(/(\.\d*?)0+$/, "$1") // Remove trailing zeros after decimal
        .replace(/\.$/, ""); // Remove lone decimal point
}
