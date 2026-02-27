import * as v from "@valibot/valibot";

/** Base error class for all SDK errors. */
export class HyperliquidError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "HyperliquidError";
  }
}

/** Thrown when request parameters fail schema validation. */
export class ValidationError extends HyperliquidError {
  override cause: v.ValiError<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>;
  constructor(message: string, options: { cause: v.ValiError<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>> }) {
    super(message);
    this.name = "ValidationError";
    this.cause = options.cause;
  }
}

/** Wrapper around `v.parse` that throws {@linkcode ValidationError} instead of `ValiError`. */
export function parse<
  const TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(schema: TSchema, input: unknown): v.InferOutput<TSchema> {
  try {
    return v.parse(schema, input);
  } catch (error) {
    const valiError = error as v.ValiError<typeof schema>;
    throw new ValidationError(v.summarize(valiError.issues), { cause: valiError });
  }
}
