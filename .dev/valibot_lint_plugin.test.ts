import { assertEquals } from "jsr:@std/assert@1";
import lintPlugin from "./valibot_lint_plugin.ts";

interface DiagnosticMessage {
  message: string;
  hint?: string;
}

function assertLintPluginDiagnostics(source: string, expectedDiagnostics: DiagnosticMessage[]): void {
  const diagnostics = Deno.lint.runPlugin(lintPlugin, "main.ts", source);
  const diagnosticMessages = diagnostics.map((d) => ({ message: d.message, hint: d.hint }));
  assertEquals(diagnosticMessages, expectedDiagnostics);
}

Deno.test("valibot/no-explicit-any", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.unknown();
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.any();
`,
    [
      {
        message: "`v.any()` is not allowed",
        hint: "Use a more specific schema type",
      },
    ],
  );
});

Deno.test("valibot/no-nested-pipe", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.string(), v.length(10));
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.pipe(v.string(), v.length(10)), v.description("..."));
`,
    [
      {
        message: "Nested `v.pipe()` is not allowed",
        hint: "Flatten arguments into a single `v.pipe()` call",
      },
    ],
  );
});

Deno.test("valibot/no-empty-object", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.object({ a: v.string() });
`,
    [],
  );

  // Bad: object
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.object({});
`,
    [
      {
        message: "Empty `v.object({})` is not allowed",
        hint:
          "Use `v.record(v.string(), v.never())` to express an object with dynamic keys but no allowed values (i.e. effectively empty), instead of `v.object({})`.",
      },
    ],
  );

  // Bad: strictObject
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.strictObject({});
`,
    [
      {
        message: "Empty `v.strictObject({})` is not allowed",
        hint:
          "Use `v.record(v.string(), v.never())` to express an object with dynamic keys but no allowed values (i.e. effectively empty), instead of `v.object({})`.",
      },
    ],
  );
});

Deno.test("valibot/no-empty-looseObject", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.looseObject({ a: v.string() });
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.looseObject({});
`,
    [
      {
        message: "Empty `v.looseObject({})` is not allowed",
        hint:
          "Use `v.record(v.string(), v.unknown())` to express an object with dynamic keys and unknown values (i.e. a fully loose object), instead of `v.looseObject({})`.",
      },
    ],
  );
});

Deno.test("valibot/no-empty-objectWithRest", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.objectWithRest({ a: v.string() }, v.string());
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.objectWithRest({}, v.string());
`,
    [
      {
        message: "Empty `v.objectWithRest({/* empty */}, ...)` is not allowed",
        hint:
          "Use `v.record(v.string(), rest)` to validate an object with dynamic keys, instead of `v.objectWithRest({/* empty */}, rest)`.",
      },
    ],
  );
});

Deno.test("valibot/no-empty-tuple", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.tuple([v.string()]);
`,
    [],
  );

  // Bad: tuple
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.tuple([]);
`,
    [
      {
        message: "Empty `v.tuple([])` is not allowed",
        hint:
          "Use `v.array(v.never())` to represent an array that cannot contain any valid items, instead of an empty tuple.",
      },
    ],
  );

  // Bad: strictTuple
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.strictTuple([]);
`,
    [
      {
        message: "Empty `v.strictTuple([])` is not allowed",
        hint:
          "Use `v.array(v.never())` to represent an array that cannot contain any valid items, instead of an empty tuple.",
      },
    ],
  );
});

Deno.test("valibot/no-empty-looseTuple", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.looseTuple([v.string()]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.looseTuple([]);
`,
    [
      {
        message: "Empty `v.looseTuple([])` is not allowed",
        hint: "Use `v.array(v.unknown())` to express an array with unknown items, instead of `v.looseTuple([])`.",
      },
    ],
  );
});

Deno.test("valibot/no-empty-tupleWithRest", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.tupleWithRest([v.string()], v.number());
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.tupleWithRest([], v.string());
`,
    [
      {
        message: "Empty `v.tupleWithRest([], ...)` is not allowed",
        hint: "Use `v.array(rest)` to validate an array of rest items, instead of `v.tupleWithRest([], rest)`.",
      },
    ],
  );
});

Deno.test("valibot/no-empty-picklist", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.picklist(["a", "b"]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.picklist([]);
`,
    [
      {
        message: "Empty `v.picklist([])` is not allowed",
        hint: "Use `v.never()` to represent a type that can never be valid, instead of an empty picklist.",
      },
    ],
  );
});

Deno.test("valibot/no-empty-enum", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.enum({ A: "A" });
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.enum({});
`,
    [
      {
        message: "Empty `v.enum({})` is not allowed",
        hint: "Use `v.never()` to represent a schema with no valid values, instead of `v.enum({})`.",
      },
    ],
  );
});

Deno.test("valibot/no-empty-union", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.string(), v.number()]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([]);
`,
    [
      {
        message: "Empty `v.union([])` is not allowed",
        hint: "Use `v.never()` to represent an empty union (no variants), instead of `v.union([])`.",
      },
    ],
  );
});

Deno.test("valibot/no-empty-intersect", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.intersect([v.string(), v.string()]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.intersect([]);
`,
    [
      {
        message: "Empty `v.intersect([])` is not allowed",
        hint: "Use `v.never()` to represent a schema with no valid values, instead of an empty `v.intersect([])`.",
      },
    ],
  );
});

Deno.test("valibot/no-empty-variant", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.variant("type", [
  v.object({ type: v.literal("a") }),
  v.object({ type: v.literal("b") }),
]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.variant("type", []);
`,
    [
      {
        message: "Empty `v.variant(..., [])` is not allowed",
        hint: "Use `v.never()` to represent a variant with no possible cases, instead of `v.variant(..., [])`.",
      },
    ],
  );
});

Deno.test("valibot/no-redundant-wrap", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.optional(v.string());
`,
    [],
  );

  // Bad: optional
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.optional(v.optional(v.string()));
`,
    [
      {
        message: "Redundant `v.optional(v.optional(...))` is not allowed",
        hint: "Remove one of the `v.optional()` calls",
      },
    ],
  );

  // Bad: nullable
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullable(v.nullable(v.string()));
`,
    [
      {
        message: "Redundant `v.nullable(v.nullable(...))` is not allowed",
        hint: "Remove one of the `v.nullable()` calls",
      },
    ],
  );

  // Bad: nullish
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullish(v.nullish(v.string()));
`,
    [
      {
        message: "Redundant `v.nullish(v.nullish(...))` is not allowed",
        hint: "Remove one of the `v.nullish()` calls",
      },
    ],
  );

  // Bad: undefinedable
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.undefinedable(v.undefinedable(v.string()));
`,
    [
      {
        message: "Redundant `v.undefinedable(v.undefinedable(...))` is not allowed",
        hint: "Remove one of the `v.undefinedable()` calls",
      },
    ],
  );

  // Bad: exactOptional
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.exactOptional(v.exactOptional(v.string()));
`,
    [
      {
        message: "Redundant `v.exactOptional(v.exactOptional(...))` is not allowed",
        hint: "Remove one of the `v.exactOptional()` calls",
      },
    ],
  );

  // Bad: nonOptional
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nonOptional(v.nonOptional(v.string()));
`,
    [
      {
        message: "Redundant `v.nonOptional(v.nonOptional(...))` is not allowed",
        hint: "Remove one of the `v.nonOptional()` calls",
      },
    ],
  );

  // Bad: nonNullable
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nonNullable(v.nonNullable(v.string()));
`,
    [
      {
        message: "Redundant `v.nonNullable(v.nonNullable(...))` is not allowed",
        hint: "Remove one of the `v.nonNullable()` calls",
      },
    ],
  );

  // Bad: nonNullish
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nonNullish(v.nonNullish(v.string()));
`,
    [
      {
        message: "Redundant `v.nonNullish(v.nonNullish(...))` is not allowed",
        hint: "Remove one of the `v.nonNullish()` calls",
      },
    ],
  );
});

Deno.test("valibot/no-single-union", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.string(), v.number()]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.string()]);
`,
    [
      {
        message: "`v.union()` with single element is redundant",
        hint: "Use the schema directly, instead of wrapping it in `v.union([single])`.",
      },
    ],
  );
});

Deno.test("valibot/no-single-intersect", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.intersect([v.string(), v.string()]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.intersect([v.string()]);
`,
    [
      {
        message: "`v.intersect()` with single element is redundant",
        hint: "Use the schema directly, instead of wrapping it in `v.intersect([single])`.",
      },
    ],
  );
});

Deno.test("valibot/no-single-variant", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.variant("type", [v.object({ type: v.literal("a") }), v.object({ type: v.literal("b") })]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.variant("type", [v.object({ type: v.literal("a") })]);
`,
    [
      {
        message: "`v.variant()` with single option is redundant",
        hint: "Use the schema directly, instead of wrapping it in `v.variant(key, [single])`.",
      },
    ],
  );
});

Deno.test("valibot/no-single-picklist", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.picklist(["a", "b"]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.picklist(["only"]);
`,
    [
      {
        message: "`v.picklist()` with single element is redundant",
        hint: "Use `v.literal(...)` instead of `v.picklist([single])`.",
      },
    ],
  );
});

Deno.test("valibot/no-single-pipe", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.string(), v.length(10));
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.string());
`,
    [
      {
        message: "`v.pipe()` with single argument is redundant",
        hint: "Use the schema directly, instead of wrapping it in `v.pipe(single)`.",
      },
    ],
  );
});

Deno.test("valibot/no-nullish-redundancy", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullish(v.string());
`,
    [],
  );

  // Bad: inside optional
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullish(v.optional(v.string()));
`,
    [
      {
        message: "`v.optional()` is redundant inside `v.nullish()` - nullish already accepts undefined",
        hint: "Remove `v.optional()` - `v.nullish()` already covers its functionality",
      },
    ],
  );

  // Bad: inside nullable
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullish(v.nullable(v.string()));
`,
    [
      {
        message: "`v.nullable()` is redundant inside `v.nullish()` - nullish already accepts null",
        hint: "Remove `v.nullable()` - `v.nullish()` already covers its functionality",
      },
    ],
  );

  // Bad: inside undefinedable
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullish(v.undefinedable(v.string()));
`,
    [
      {
        message: "`v.undefinedable()` is redundant inside `v.nullish()` - nullish already accepts undefined",
        hint: "Remove `v.undefinedable()` - `v.nullish()` already covers its functionality",
      },
    ],
  );

  // Bad: outside nullable
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullable(v.nullish(v.string()));
`,
    [
      {
        message: "`v.nullable()` is redundant outside `v.nullish()` - nullish already accepts null",
        hint: "Remove `v.nullable()` - `v.nullish()` already covers its functionality",
      },
    ],
  );

  // Bad: outside optional
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.optional(v.nullish(v.string()));
`,
    [
      {
        message: "`v.optional()` is redundant outside `v.nullish()` - nullish already accepts undefined",
        hint: "Remove `v.optional()` - `v.nullish()` already covers its functionality",
      },
    ],
  );

  // Bad: outside undefinedable
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.undefinedable(v.nullish(v.string()));
`,
    [
      {
        message: "`v.undefinedable()` is redundant outside `v.nullish()` - nullish already accepts undefined",
        hint: "Remove `v.undefinedable()` - `v.nullish()` already covers its functionality",
      },
    ],
  );
});

Deno.test("valibot/no-conflicting-wrapper", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.optional(v.string());
`,
    [],
  );

  // Bad: exactOptional vs optional
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.exactOptional(v.optional(v.string()));
`,
    [
      {
        message: "Conflicting `v.exactOptional(v.optional())` is not allowed",
        hint: "These wrappers contradict each other, remove one",
      },
    ],
  );

  // Bad: optional vs nonOptional
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.optional(v.nonOptional(v.string()));
`,
    [
      {
        message: "Conflicting `v.optional(v.nonOptional())` is not allowed",
        hint: "These wrappers contradict each other, remove one",
      },
    ],
  );

  // Bad: nullable vs nonNullable
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullable(v.nonNullable(v.string()));
`,
    [
      {
        message: "Conflicting `v.nullable(v.nonNullable())` is not allowed",
        hint: "These wrappers contradict each other, remove one",
      },
    ],
  );

  // Bad: nullish vs nonNullish
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullish(v.nonNullish(v.string()));
`,
    [
      {
        message: "Conflicting `v.nullish(v.nonNullish())` is not allowed",
        hint: "These wrappers contradict each other, remove one",
      },
    ],
  );

  // Bad: undefinedable vs nonOptional
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.undefinedable(v.nonOptional(v.string()));
`,
    [
      {
        message: "Conflicting `v.undefinedable(v.nonOptional())` is not allowed",
        hint: "These wrappers contradict each other, remove one",
      },
    ],
  );

  // Bad: exactOptional vs undefinedable
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.exactOptional(v.undefinedable(v.string()));
`,
    [
      {
        message: "Conflicting `v.exactOptional(v.undefinedable())` is not allowed",
        hint: "These wrappers contradict each other, remove one",
      },
    ],
  );
});

Deno.test("valibot/no-invalid-range", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.string(), v.minLength(5), v.maxLength(10));
`,
    [],
  );

  // Bad: non-strict (min > max)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.string(), v.minLength(10), v.maxLength(5));
`,
    [
      {
        message: "Invalid range: `v.minLength()`(10) > `v.maxLength()`(5)",
        hint: "Minimum value (10) cannot be greater than maximum value (5)",
      },
    ],
  );

  // Bad: strict (gt >= lt)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.number(), v.gtValue(100), v.ltValue(50));
`,
    [
      {
        message: "Invalid range: `v.gtValue()`(100) >= `v.ltValue()`(50)",
        hint: "For strict comparison, `v.gtValue()` value must be less than `v.ltValue()` value",
      },
    ],
  );

  // Bad: non-strict with unary negatives
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.number(), v.minValue(-1), v.maxValue(-5));
`,
    [
      {
        message: "Invalid range: `v.minValue()`(-1) > `v.maxValue()`(-5)",
        hint: "Minimum value (-1) cannot be greater than maximum value (-5)",
      },
    ],
  );

  // Bad: minWords/maxWords (valueArgIndex=1)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.string(), v.minWords("en", 10), v.maxWords("en", 5));
`,
    [
      {
        message: "Invalid range: `v.minWords()`(10) > `v.maxWords()`(5)",
        hint: "Minimum value (10) cannot be greater than maximum value (5)",
      },
    ],
  );
});

Deno.test("valibot/no-never-in-union", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.string(), v.number()]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.string(), v.never()]);
`,
    [
      {
        message: "`v.never()` in `v.union()` has no effect",
        hint: "Remove `v.never()` from union or use it alone for impossible type",
      },
    ],
  );
});

Deno.test("valibot/prefer-nullish", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullish(v.string());
`,
    [],
  );

  // Bad: optional(nullable)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.optional(v.nullable(v.string()));
`,
    [
      {
        message: "Use `v.nullish()` instead of `v.optional(v.nullable())`",
        hint: "Replace with `v.nullish(...)` for cleaner code",
      },
    ],
  );

  // Bad: nullable(optional)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullable(v.optional(v.string()));
`,
    [
      {
        message: "Use `v.nullish()` instead of `v.nullable(v.optional())`",
        hint: "Replace with `v.nullish(...)` for cleaner code",
      },
    ],
  );

  // Bad: undefinedable(nullable)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.undefinedable(v.nullable(v.string()));
`,
    [
      {
        message: "Use `v.nullish()` instead of `v.undefinedable(v.nullable())`",
        hint: "Replace with `v.nullish(...)` for cleaner code",
      },
    ],
  );

  // Bad: nullable(undefinedable)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.nullable(v.undefinedable(v.string()));
`,
    [
      {
        message: "Use `v.nullish()` instead of `v.nullable(v.undefinedable())`",
        hint: "Replace with `v.nullish(...)` for cleaner code",
      },
    ],
  );
});

Deno.test("valibot/prefer-picklist", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.picklist(["a", "b"]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.literal("a"), v.literal("b")]);
`,
    [
      {
        message: "Use `v.picklist()` instead of `v.union()` with literals",
        hint: "Replace `v.union([v.literal(...), ...])` with `v.picklist([...])`",
      },
    ],
  );
});

Deno.test("valibot/prefer-nullable-union", () => {
  // Good: base
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.string(), v.number()]);
`,
    [],
  );

  // Good: no suggestion when there are 2+ other schemas
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.string(), v.number(), v.null()]);
`,
    [],
  );

  // Bad: nullable (null)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.string(), v.null()]);
`,
    [
      {
        message: "Use `v.nullable()` instead of `v.union()` with null",
        hint: "Replace `v.union([schema, v.null()])` with `v.nullable(schema)`",
      },
    ],
  );

  // Bad: optional (undefined)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.string(), v.undefined()]);
`,
    [
      {
        message: "Use `v.optional()` instead of `v.union()` with undefined",
        hint: "Replace `v.union([schema, v.undefined()])` with `v.optional(schema)` or `v.undefinedable(schema)`",
      },
    ],
  );

  // Bad: nullish (null + undefined)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.string(), v.null(), v.undefined()]);
`,
    [
      {
        message: "Use `v.nullish()` instead of `v.union()` with null and undefined",
        hint: "Replace `v.union([schema, v.null(), v.undefined()])` with `v.nullish(schema)`",
      },
    ],
  );
});

Deno.test("valibot/prefer-variant", () => {
  // Good: base
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([v.string(), v.number()]);
`,
    [],
  );

  // Good: objects without a shared discriminator should not trigger
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([
  v.object({ type: v.literal("a"), a: v.string() }),
  v.object({ kind: v.literal("b"), b: v.string() }),
]);
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.union([
  v.object({ type: v.literal("email"), email: v.string() }),
  v.object({ type: v.literal("url"), url: v.string() }),
]);
`,
    [
      {
        message: 'Use `v.variant("type", [...])` instead of `v.union()` with objects',
        hint:
          "All objects have a 'type' property with `v.literal()` - use `v.variant()` for better performance and error messages",
      },
    ],
  );
});

Deno.test("valibot/prefer-nonEmpty", () => {
  // Good: nonEmpty
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.string(), v.nonEmpty());
`,
    [],
  );

  // Good: allowed when max constraint exists
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.string(), v.minLength(1), v.maxLength(10));
`,
    [],
  );

  // Good: does not suggest for minLength(2)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.string(), v.minLength(2));
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.pipe(v.string(), v.minLength(1));
`,
    [
      {
        message: "Use `v.nonEmpty()` instead of `v.minLength(1)`",
        hint: "Replace `v.minLength(1)` with `v.nonEmpty()` for cleaner code",
      },
    ],
  );
});

Deno.test("valibot/require-check-message", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.check((input) => input > 0, "Value must be positive.");
v.checkItems((item) => item.length > 0, "Items must not be empty.");
`,
    [],
  );

  // Bad: check
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.check((input) => input > 0);
`,
    [
      {
        message: "`v.check()` must have an error message",
        hint: 'Add a second argument with the error message: `v.check(fn, "Error message.")`',
      },
    ],
  );

  // Bad: checkItems
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.checkItems((item) => item.length > 0);
`,
    [
      {
        message: "`v.checkItems()` must have an error message",
        hint: 'Add a second argument with the error message: `v.checkItems(fn, "Error message.")`',
      },
    ],
  );
});

Deno.test("valibot/title-description-format", () => {
  // Good: description
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.description("User name.");
`,
    [],
  );

  // Good: title
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.title("Title also check.");
`,
    [],
  );

  // Bad: empty string
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.title("");
`,
    [
      {
        message: "Description must not be empty",
        hint: "Add a meaningful description",
      },
    ],
  );

  // Bad: lowercase start (ends with punctuation)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.description("user name.");
`,
    [
      {
        message: "Description 'user name.' must start with uppercase letter",
        hint: "Capitalize the first letter of the description",
      },
    ],
  );

  // Bad: missing punctuation (starts with uppercase)
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
v.description("User name");
`,
    [
      {
        message: "Description 'User name' must end with punctuation",
        hint: "Add punctuation at the end (., ?, !, :, ), ])",
      },
    ],
  );
});
