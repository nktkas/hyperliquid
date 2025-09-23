export type RawArgs = {
  [key: string]: string | undefined;
} & {
  _: string[];
};

export type ParseOptions = {
  /**
   * Consider these keys as flags (no value expected).
   * Value going after a flag will be treated as a positional argument.
   */
  flags?: string[];
};

/**
 * Parse command-line arguments into a key-value object.
 * Does not transform values.
 */
export function parseArgs(args: string[], options?: ParseOptions): RawArgs {
  const result = { _: [] } as unknown as RawArgs;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1] as string | undefined;

    if (arg.startsWith("-")) {
      if (arg === "-_" || arg === "--_") continue; // Skip reserved key "_"

      const isLong = arg.startsWith("--");
      let keyPart = arg.slice(isLong ? 2 : 1);
      let value: string | undefined;
      const eqIndex = keyPart.indexOf("=");

      if (eqIndex !== -1) {
        value = keyPart.substring(eqIndex + 1);
        keyPart = keyPart.substring(0, eqIndex);
      } else if (
        !options?.flags?.includes(keyPart) && // Skip if key is defined as flag and don't expect value
        typeof nextArg === "string" && (!nextArg.startsWith("-") || !isNaN(parseFloat(nextArg)))
      ) {
        value = nextArg;
        i++; // Skip next arg as it's consumed as value for current key
      }
      result[keyPart] = value;
    } else {
      result._.push(arg);
    }
  }
  return result;
}

export interface TransformOptions {
  /**
   * Transform rule for flags (keys without values).
   * @value `undefined`
   * @default "true"
   */
  flag?: "true" | "false" | ((key: string) => "true" | "false");
  /**
   * Transform rule for null values.
   * @value `"null"` (case insensitive)
   * @default "null"
   */
  null?: "null" | "string" | ((key: string, value: string) => "null" | "string");
  /**
   * Transform rule for boolean values.
   * @value `"true"`, `"false"` (case insensitive)
   * @default "bool"
   */
  bool?: "bool" | "string" | ((key: string, value: string) => "bool" | "string");
  /**
   * Transform rule for hexadecimal values.
   * @value `"0xff"`, `"0X1A"` (case insensitive) (0x prefix required)
   * @default "string"
   */
  hex?: "string" | "number" | ((key: string, value: string) => "string" | "number");
  /**
   * Transform rule for special numeric values.
   * @value `"Infinity"`, `"-Infinity"`, `"NaN"`, `"-NaN"` (case insensitive)
   * @default "string"
   */
  specialNumber?: "string" | "number" | ((key: string, value: string) => "string" | "number");
  /**
   * Transform rule for numeric values.
   * @value `"123"`, `"12.3"`, `"1e+2"`, `"+123"`, `"-123"` (anything that can be parsed by `Number(value)`) (excludes hex values)
   * @default "number"
   */
  number?: "number" | "string" | ((key: string, value: string) => "number" | "string");
  /**
   * Transform rule for JSON object/array values.
   * @value `"{ \"a\": 1 }"`, `"[invalid array string]"` (anything that begins with `{` and ends with `}` or begins with `[` and ends with `]`)
   * @default "object"
   */
  json?: "object" | "string" | ((key: string, value: string) => "object" | "string");
}

export interface Args {
  [key: string]: string | number | boolean | null | Record<string, unknown> | unknown[];
  _: string[];
}

/**
 * Transform raw args (string values) into typed args based on rules.
 *
 * Order of transformation:
 * 1. flag (`undefined`)
 * 2. null (`"null"`)
 * 3. boolean (`"true"`, `"false"`)
 * 4. hex (`"0x..."`)
 * 5. special number (`"Infinity"`, `"-Infinity"`, `"NaN", "-NaN"`)
 * 6. number (numeric strings)
 * 7. json (object/array strings)
 * 8. string (default)
 */
export function transformArgs(args: RawArgs, options?: TransformOptions): Args {
  const opts = {
    flag: "true",
    null: "null",
    bool: "bool",
    hex: "string",
    specialNumber: "string",
    number: "number",
    json: "object",
    ...options,
  } as const;

  const result: Args = { _: args._ };
  for (const key in args) {
    if (key === "_") continue; // Skip the positional args array

    const value = args[key];

    // Transformation logic
    let transformedValue: Args[string];

    // flag
    if (value === undefined) {
      const action = typeof opts.flag === "function" ? opts.flag(key) : opts.flag;
      transformedValue = action === "true" ? true : false;
    } // null
    else if (value.toLowerCase() === "null") {
      const action = typeof opts.null === "function" ? opts.null(key, value) : opts.null;
      transformedValue = action === "null" ? null : value;
    } // boolean
    else if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
      const action = typeof opts.bool === "function" ? opts.bool(key, value) : opts.bool;
      transformedValue = action === "bool" ? value.toLowerCase() === "true" : value;
    } // hex
    else if ((value.startsWith("0x") || value.startsWith("0X")) && !isNaN(parseInt(value, 16))) {
      const action = typeof opts.hex === "function" ? opts.hex(key, value) : opts.hex;
      transformedValue = action === "string" ? value : parseInt(value, 16);
    } // special number
    else if (
      value.toLowerCase() === "infinity" || value.toLowerCase() === "-infinity" ||
      value.toLowerCase() === "nan" || value.toLowerCase() === "-nan"
    ) {
      const action = typeof opts.specialNumber === "function" ? opts.specialNumber(key, value) : opts.specialNumber;
      transformedValue = action === "string" ? value : Number(value);
    } // number
    else if (!isNaN(Number(value))) {
      const action = typeof opts.number === "function" ? opts.number(key, value) : opts.number;
      transformedValue = action === "number" ? Number(value) : value;
    } // json object/array
    else if (
      (value.startsWith("{") && value.endsWith("}")) ||
      (value.startsWith("[") && value.endsWith("]"))
    ) {
      const action = typeof opts.json === "function" ? opts.json(key, value) : opts.json;
      try {
        transformedValue = action === "object" ? JSON.parse(value) as Record<string, unknown> | unknown[] : value;
      } catch {
        transformedValue = value;
      }
    } // string (default)
    else {
      transformedValue = value;
    }

    result[key] = transformedValue;
  }
  return result;
}
