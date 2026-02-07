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
  return v.string();
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
  return v.string();
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
        message: "Valibot schema 'User' must end with one of: Request, Schema, Event, Parameters",
        hint: "Rename to 'UserSchema', 'UserRequest', or 'UserEvent'",
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
  return v.string();
})();
export type UserSchema = v.InferOutput<typeof UserSchema>;
`,
    [],
  );

  // Bad: missing schema JSDoc
  assertLintPluginDiagnostics(
    `import * as v from "valibot";
export const UserSchema = /* @__PURE__ */ (() => {
  return v.string();
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
  return v.object({ name: v.string() });
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
