import { assertEquals } from "jsr:@std/assert@1";
import lintPlugin from "./project_valibot_lint_plugin.ts";

interface DiagnosticMessage {
  message: string;
  hint?: string;
}

function assertLintPluginDiagnostics(source: string, expectedDiagnostics: DiagnosticMessage[]): void {
  const diagnostics = Deno.lint.runPlugin(lintPlugin, "main.ts", source);
  const diagnosticMessages = diagnostics.map((d) => ({ message: d.message, hint: d.hint }));
  assertEquals(diagnosticMessages, expectedDiagnostics);
}

Deno.test("valibot-project/require-iife", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
const UserSchema = /* @__PURE__ */ (() => {
  return v.string();
})();
`,
    [],
  );

  // Bad: direct schema assignment
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
const UserSchema = v.string();
`,
    [
      {
        message: "Valibot schema 'UserSchema' must be wrapped in IIFE with `@__PURE__` annotation",
        hint: "Wrap the schema in IIFE for tree-shaking: `/* @__PURE__ */ (() => { return v.object({...}); })()`",
      },
    ],
  );

  // Bad: missing @__PURE__
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
const UserSchema = (() => {
  return v.string();
})();
`,
    [
      {
        message: "Valibot schema 'UserSchema' IIFE is missing @__PURE__ annotation",
        hint: "Add `/* @__PURE__ */` comment before the IIFE for tree-shaking optimization",
      },
    ],
  );
});

Deno.test("valibot-project/require-type-export", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.string(), v.description("User schema."));
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.string(), v.description("User schema."));
})();
`,
    [
      {
        message: "Exported Valibot schema 'UserSchema' must have a corresponding type export",
        hint: "Add: export type `UserSchema = v.InferOutput<typeof UserSchema>;`",
      },
    ],
  );
});

Deno.test("valibot-project/require-name-suffix", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
const UserSchema = /* @__PURE__ */ (() => {
  return v.string();
})();
`,
    [],
  );

  // Bad
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
const User = /* @__PURE__ */ (() => {
  return v.string();
})();
`,
    [
      {
        message: "Valibot schema 'User' must end with one of: Request, Response, Schema, Event, Parameters",
        hint: "Rename to 'UserSchema', 'UserRequest', 'UserResponse', or 'UserEvent'",
      },
    ],
  );
});

Deno.test("valibot-project/require-jsdoc", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.string(), v.description("User schema."));
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [],
  );

  // Bad: missing schema JSDoc
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.string(), v.description("User schema."));
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [
      {
        message: "Valibot schema 'UserSchema' must have a JSDoc comment",
        hint: "Add: `/** Description */`",
      },
    ],
  );

  // Bad: field without JSDoc
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      name: v.pipe(v.string(), v.description("User name.")),
    }),
    v.description("User schema."),
  );
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [
      {
        message: "Field 'name' must have a JSDoc comment",
        hint: "Add: `/** Description */`",
      },
    ],
  );
});

Deno.test("valibot-project/require-description", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.string(), v.description("User schema."));
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [],
  );

  // Bad: exported schema without v.description()
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.string(), v.minLength(1));
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [
      {
        message: "Exported Valibot schema 'UserSchema' must end with `v.description()`",
        hint: 'Wrap the schema in `v.pipe(..., v.description("..."))`',
      },
    ],
  );

  // Bad: schema reference field
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** Address schema. */
const AddressSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.string(), v.description("Address schema."));
})();

/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Address. */
      address: AddressSchema,
    }),
    v.description("User schema."),
  );
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [
      {
        message: "Schema reference 'AddressSchema' must have `v.description()`",
        hint: 'Wrap in `v.pipe(AddressSchema, v.description("..."))`',
      },
    ],
  );

  // Bad: field schema without v.description()
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User name. */
      name: v.string(),
    }),
    v.description("User schema."),
  );
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [
      {
        message: "Valibot field schema must end with `v.description()`",
        hint: 'Wrap in `v.pipe(v.string(), v.description("..."))`',
      },
    ],
  );
});

Deno.test("valibot-project/require-description-match-jsdoc", () => {
  // Good
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User name. */
      name: v.pipe(v.string(), v.description("User name.")),
    }),
    v.description("User schema."),
  );
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [],
  );

  // Bad: schema mismatch
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(v.string(), v.description("Different text."));
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [
      {
        message: "JSDoc 'User schema.' does not match `v.description('Different text.')`",
        hint: "Make JSDoc and `v.description()` text identical",
      },
    ],
  );

  // Bad: field mismatch
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User name. */
      name: v.pipe(v.string(), v.description("Different text.")),
    }),
    v.description("User schema."),
  );
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [
      {
        message: "JSDoc 'User name.' does not match `v.description('Different text.')`",
        hint: "Make JSDoc and `v.description()` text identical",
      },
    ],
  );

  // Bad: whitespace mismatch
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** User  name. */
      name: v.pipe(v.string(), v.description("User name.")),
    }),
    v.description("User schema."),
  );
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [
      {
        message: "JSDoc 'User  name.' does not match `v.description('User name.')`",
        hint: "Make JSDoc and `v.description()` text identical",
      },
    ],
  );

  // Bad: newline mismatch should be an error
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
/** User schema. */
export const UserSchema = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Order type.
       * - Market.
       * - Limit.
       */
      orderType: v.pipe(
        v.string(),
        v.description("Order type. - Market. - Limit."),
      ),
    }),
    v.description("User schema."),
  );
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [
      {
        message:
          "JSDoc 'Order type.\n- Market.\n- Limit.' does not match `v.description('Order type. - Market. - Limit.')`",
        hint: "Make JSDoc and `v.description()` text identical",
      },
    ],
  );
});
