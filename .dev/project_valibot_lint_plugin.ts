// deno-lint-ignore-file no-irregular-whitespace explicit-function-return-type

/**
 * Lint plugin for {@link https://valibot.dev/ | Valibot} schemas enforcing project-specific conventions
 *
 * @module
 */

// ============================================================
// Core Utilities
// ============================================================

/** Valibot function call expression with typed callee */
interface ValibotCallExpression extends Deno.lint.CallExpression {
  callee: Deno.lint.MemberExpression & {
    object: Deno.lint.Identifier & { name: "v" };
    property: Deno.lint.Identifier;
  };
}

/** Variable declarator with IIFE init */
interface ValibotSchemaDeclarator extends Deno.lint.VariableDeclarator {
  init: Deno.lint.CallExpression;
}

/** Check if node is a Valibot function call (e.g., v.object, v.pipe, v.string) */
function isValibotCall(node: Deno.lint.CallExpression): node is ValibotCallExpression {
  const callee = node.callee;
  return callee.type === "MemberExpression" &&
    callee.object.type === "Identifier" &&
    callee.object.name === "v" &&
    callee.property.type === "Identifier";
}

/** Check if node is a Valibot schema variable (IIFE containing Valibot return) */
function isValibotSchemaVariable(node: Deno.lint.VariableDeclarator): node is ValibotSchemaDeclarator {
  const init = node.init;
  if (!init || init.type !== "CallExpression") return false;

  const callee = init.callee;
  if (callee.type !== "ArrowFunctionExpression" || callee.body.type !== "BlockStatement") return false;

  return callee.body.body.some(
    (stmt) =>
      stmt.type === "ReturnStatement" &&
      stmt.argument?.type === "CallExpression" &&
      isValibotCall(stmt.argument),
  );
}

/** Get the top-level statement node (handles export wrapper) */
function getStatementNode(node: Deno.lint.VariableDeclarator): Deno.lint.Node | undefined {
  const varDecl = node.parent;
  if (!varDecl) return undefined;
  const maybeExport = varDecl.parent;
  if (maybeExport && maybeExport.type === "ExportNamedDeclaration") {
    return maybeExport;
  }
  return varDecl;
}

/** Check if node is inside an exported context */
function isInsideExportedContext(node: Deno.lint.Node): boolean {
  type NodeWithParent = Deno.lint.Node & { parent?: Deno.lint.Node };
  let current: NodeWithParent | undefined = node as NodeWithParent;
  while (current && current.type !== "Program") {
    if (current.type === "ExportNamedDeclaration") {
      return true;
    }
    current = current.parent as NodeWithParent;
  }
  return false;
}

/** Check if variable declarator is a Valibot schema declarator (IIFE or direct call) */
function isValibotSchemaDeclarator(node: Deno.lint.VariableDeclarator): boolean {
  if (!node.init) return false;

  // IIFE schema: const X = (() => { return v.object(...); })();
  if (isValibotSchemaVariable(node)) return true;

  // Direct schema: const X = v.object(...)
  if (node.init.type === "CallExpression" && isValibotCall(node.init) && !isRuntimeFunction(node.init)) {
    return true;
  }

  return false;
}

/** Check if node is inside an exported Valibot schema declarator */
function isInsideExportedSchemaDeclarator(node: Deno.lint.Node): boolean {
  type NodeWithParent = Deno.lint.Node & { parent?: Deno.lint.Node };

  let current = node as NodeWithParent | undefined;
  while (current && current.type !== "Program") {
    if (current.type === "VariableDeclarator" && isValibotSchemaDeclarator(current)) {
      const stmtNode = getStatementNode(current);
      return stmtNode ? isInsideExportedContext(stmtNode) : false;
    }
    current = current.parent as NodeWithParent | undefined;
  }

  return false;
}

/** Get the Valibot schema call expression from a variable declarator (IIFE or direct call) */
function getSchemaCallFromDeclarator(node: Deno.lint.VariableDeclarator): ValibotCallExpression | undefined {
  // IIFE schema: export const X = (() => { return v.pipe(...); })();
  if (isValibotSchemaVariable(node)) {
    const init = node.init;
    if (!init || init.type !== "CallExpression") return undefined;

    const callee = init.callee;
    if (callee.type !== "ArrowFunctionExpression" || callee.body.type !== "BlockStatement") return undefined;

    const returnStmt = callee.body.body.find((stmt) => stmt.type === "ReturnStatement");
    const returned = returnStmt && returnStmt.type === "ReturnStatement" ? returnStmt.argument : undefined;
    if (!returned || returned.type !== "CallExpression" || !isValibotCall(returned)) return undefined;

    return returned;
  }

  // Direct schema: export const X = v.pipe(...)
  const init = node.init;
  if (!init || init.type !== "CallExpression" || !isValibotCall(init)) return undefined;
  if (isRuntimeFunction(init)) return undefined;

  return init;
}

/** Valibot runtime functions that don't define schemas */
const RUNTIME_FUNCTIONS = [
  "parse",
  "safeParse",
  "is",
  "assert",
  "parser",
  "safeParser",
];

/** Check if node is a Valibot runtime function call (not schema definition) */
function isRuntimeFunction(node: ValibotCallExpression): boolean {
  return RUNTIME_FUNCTIONS.includes(node.callee.property.name);
}

// ============================================================
// JSDoc & Description Utilities
// ============================================================

/** Extract raw JSDoc comment before node */
function getRawJSDoc(node: Deno.lint.Node, sourceText: string): string | undefined {
  const before = sourceText.slice(0, node.range[0]).trimEnd();
  if (!before.endsWith("*/")) return undefined;

  const commentStart = before.lastIndexOf("/*");
  if (commentStart === -1) return undefined;

  const comment = before.slice(commentStart);
  if (!comment.startsWith("/**")) return undefined;

  return comment;
}

/** Extract JSDoc text from comment before node (excluding tags like `@see`, `@param`, etc.) */
function getJSDocText(node: Deno.lint.Node, sourceText: string): string | undefined {
  const comment = getRawJSDoc(node, sourceText);
  if (!comment) return undefined;

  // Extract text between /** and */
  const content = comment.slice(3, -2).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const lines = content
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter((line) => !line.startsWith("@"));

  // Trim empty lines at the start/end but keep internal empty lines
  while (lines.length > 0 && lines[0] === "") lines.shift();
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();

  if (lines.length === 0) return undefined;
  return lines.join("\n");
}

/** Check if node is v.description() call */
function isDescriptionCall(node: Deno.lint.Expression): boolean {
  return node.type === "CallExpression" &&
    isValibotCall(node) &&
    node.callee.property.name === "description";
}

/** Check if node is v.pipe() where last argument is v.description() */
function isPipeWithDescription(node: ValibotCallExpression): boolean {
  if (node.callee.property.name !== "pipe") return false;
  const lastArg = node.arguments[node.arguments.length - 1];
  return lastArg !== undefined && lastArg.type !== "SpreadElement" && isDescriptionCall(lastArg);
}

// ============================================================
// Plugin Definition
// ============================================================

export default {
  name: "valibot-project",
  rules: {
    /**
     * Require all Valibot schemas to be wrapped in IIFE with `@__PURE__` annotation.
     * This is necessary for correct tree-shaking in bundler.
     *
     * @example
     * ```
     * // ❌ Bad
     * const MySchema = v.object({ name: v.string() });
     *
     * // ✅ Good
     *
     * const MySchema = /​** @__PURE__ *​/ (() => {
     *   return v.object({ name: v.string() });
     * })();
     * ```
     */
    "require-iife": {
      create(context) {
        /** Require-iife should apply only to module top-level schema declarations. */
        function isTopLevelDeclaration(node: Deno.lint.VariableDeclarator): boolean {
          type NodeWithParent = Deno.lint.Node & { parent?: Deno.lint.Node };
          const stmtNode = getStatementNode(node);
          if (!stmtNode) return false;
          return (stmtNode as NodeWithParent).parent?.type === "Program";
        }

        /** Check if there's a `@__PURE__` comment before the IIFE */
        function hasPureComment(node: Deno.lint.VariableDeclarator): boolean {
          const text = context.sourceCode.text;

          const init = node.init;
          if (!init) return false;

          const beforeInit = text.slice(node.range[0], init.range[0]);
          return beforeInit.includes("@__PURE__");
        }

        return {
          VariableDeclarator(node) {
            // Only apply at module top-level (skip nested declarations)
            if (!isTopLevelDeclaration(node)) return;
            if (node.id.type !== "Identifier" || !node.init) return;

            // Skip runtime functions (v.parse, v.safeParse, etc.)
            if (node.init.type === "CallExpression" && isValibotCall(node.init) && isRuntimeFunction(node.init)) return;

            // Case 1: Direct schema assignment without IIFE
            if (node.init.type === "CallExpression" && isValibotCall(node.init)) {
              // ERROR: Report lint error
              context.report({
                node: node.init,
                message: `Valibot schema '${node.id.name}' must be wrapped in IIFE with \`@__PURE__\` annotation`,
                hint:
                  "Wrap the schema in IIFE for tree-shaking: `/* @__PURE__ */ (() => { return v.object({...}); })()`",
              });
              return;
            }

            // Only apply to Valibot schema variables (IIFE)
            if (!isValibotSchemaVariable(node)) return;

            // Case 2: IIFE without @__PURE__ annotation
            if (!hasPureComment(node)) {
              // ERROR: Report lint error
              context.report({
                node: node.init,
                message: `Valibot schema '${node.id.name}' IIFE is missing @__PURE__ annotation`,
                hint: "Add `/* @__PURE__ */` comment before the IIFE for tree-shaking optimization",
              });
            }
          },
        };
      },
    },

    /**
     * Require exported Valibot schemas to have a corresponding type export.
     *
     * @example
     * ```
     * // ❌ Bad
     * export const MySchema = v.object({ name: v.string() });
     *
     * // ✅ Good
     * export const MySchema = v.object({ name: v.string() });
     * export type MySchema = v.InferOutput<typeof MySchema>;
     *
     * const AnotherSchema = v.string(); // non-exported schema is OK
     * ```
     */
    "require-type-export": {
      create(context) {
        return {
          ExportNamedDeclaration(node) {
            const declaration = node.declaration;
            if (!declaration || declaration.type !== "VariableDeclaration") return;

            for (const desc of declaration.declarations) {
              if (desc.id.type !== "Identifier") continue;

              // Only apply to Valibot schema declarators (IIFE or direct Valibot call)
              if (!isValibotSchemaDeclarator(desc)) continue;

              // Only apply to top-level exports
              if (node.parent.type !== "Program") continue;

              // Look for type export with same name
              const schemaName = desc.id.name;
              const hasTypeExport = node.parent.body.some((sibling) => {
                return sibling.type === "ExportNamedDeclaration" && sibling.declaration &&
                  sibling.declaration.type === "TSTypeAliasDeclaration" && sibling.declaration.id.name === schemaName;
              });
              if (hasTypeExport) return;

              // ERROR: Report lint error
              context.report({
                node: desc,
                message: `Exported Valibot schema '${desc.id.name}' must have a corresponding type export`,
                hint: `Add: export type \`${desc.id.name} = v.InferOutput<typeof ${desc.id.name}>;\``,
              });
            }
          },
        };
      },
    },

    /**
     * Require Valibot schemas to have a specific suffix.
     *
     * @example
     * ```
     * // ❌ Bad
     * const User = v.object({ name: v.string() });
     *
     * // ✅ Good
     * const UserSchema = v.object({ name: v.string() });
     * ```
     */
    "require-name-suffix": {
      create(context) {
        const allowedSuffixes = ["Request", "Response", "Schema", "Event", "Parameters"];

        return {
          VariableDeclarator(node) {
            if (node.id.type !== "Identifier") return;

            // Only apply to Valibot schema declarators (IIFE or direct Valibot call)
            if (!isValibotSchemaDeclarator(node)) return;

            const schemaName = node.id.name;
            const hasSuffix = allowedSuffixes.some((suffix) => schemaName.endsWith(suffix));

            // OK: schema name ends with an allowed suffix
            if (hasSuffix) return;

            // ERROR: Report lint error
            context.report({
              node: node.id,
              message: `Valibot schema '${node.id.name}' must end with one of: ${allowedSuffixes.join(", ")}`,
              hint:
                `Rename to '${node.id.name}Schema', '${node.id.name}Request', '${node.id.name}Response', or '${node.id.name}Event'`,
            });
          },
        };
      },
    },

    /**
     * Require all Valibot calls in exported schemas to end with v.description().
     *
     * @example
     * ```
     * // ❌ Bad - exported schema without description
     * export const MySchema = v.pipe(v.string(), v.minLength(1));
     *
     * // ❌ Bad - object field referencing schema variable without description
     * export const MySchema = v.object({
     *   address: AddressSchema
     * });
     *
     * // ✅ Good - exported schema with description
     * export const MySchema = v.pipe(v.string(), v.description("User name."));
     *
     * // ✅ Good - object field with schema variable wrapped in v.pipe with description
     * export const MySchema = v.object({
     *   address: v.pipe(AddressSchema, v.description("User address."))
     * });
     *
     * // ✅ Good - non-exported schema doesn't need description
     * const HelperSchema = v.pipe(v.string(), v.minLength(1));
     * ```
     */
    "require-description": {
      create(context) {
        return {
          VariableDeclarator(node) {
            // Resolve the statement node so we can detect `export ...` wrappers
            const stmtNode = getStatementNode(node);
            if (!stmtNode) return;

            // Only apply to schema declarators (IIFE or direct Valibot call)
            if (!isValibotSchemaDeclarator(node)) return;

            // Only apply to exported schemas
            if (!isInsideExportedContext(stmtNode)) return;

            // Only handle named declarations (we use the identifier in the message)
            if (node.id.type !== "Identifier") return;

            // Get the top-level schema call that must end with `v.description()`
            const schemaCall = getSchemaCallFromDeclarator(node);
            if (!schemaCall) return;

            // OK: exported schema already ends with `v.description()`
            if (isPipeWithDescription(schemaCall)) return;

            // ERROR: Report lint error
            context.report({
              node: schemaCall,
              message: `Exported Valibot schema '${node.id.name}' must end with \`v.description()\``,
              hint: 'Wrap the schema in `v.pipe(..., v.description("..."))`',
            });
          },

          Property(node) {
            // Only check object shape properties inside object-like Valibot schema calls
            const parent = node.parent;
            const parentParent = node.parent.parent;
            if (parent.type !== "ObjectExpression") return;
            if (!parentParent || parentParent.type !== "CallExpression" || !isValibotCall(parentParent)) return;

            // Only apply inside exported schema declarators (IIFE or direct Valibot call)
            if (!isInsideExportedSchemaDeclarator(node.parent.parent)) return;

            // Only handle calls where the first argument is an object expression
            const firstArg = parentParent.arguments[0];
            if (!firstArg || firstArg.type !== "ObjectExpression") return;

            // Schema references (Identifier / MemberExpression) must be wrapped in `v.pipe(..., v.description())`
            if (node.value.type === "Identifier" || node.value.type === "MemberExpression") {
              const refText = node.value.type === "Identifier"
                ? node.value.name
                : context.sourceCode.getText(node.value);

              // ERROR: Report lint error
              context.report({
                node: node.value,
                message: `Schema reference '${refText}' must have \`v.description()\``,
                hint: `Wrap in \`v.pipe(${refText}, v.description("..."))\``,
              });
              return;
            }

            // Direct Valibot call in a field must end with `v.description()` via `v.pipe`
            if (node.value.type === "CallExpression" && isValibotCall(node.value)) {
              // Skip runtime functions (v.parse, v.safeParse, etc.)
              if (isRuntimeFunction(node.value)) return;

              // OK: field schema already ends with `v.description()`
              if (isPipeWithDescription(node.value)) return;

              // ERROR: Report lint error
              context.report({
                node: node.value,
                message: `Valibot field schema must end with \`v.description()\``,
                hint: `Wrap in \`v.pipe(${context.sourceCode.getText(node.value)}, v.description("..."))\``,
              });
            }
          },
        };
      },
    },

    /**
     * Require JSDoc comments for exported schema variables and object fields.
     *
     * @example
     * ```
     * // ❌ Bad
     * export const MySchema = v.object({ name: v.string() });
     *
     * // ✅ Good
     * /​** My schema. *​/
     * export const MySchema = v.object({
     *   /​** User name. *​/
     *   name: v.string()
     * });
     *
     * // ✅ Good - non-exported schema doesn't need JSDoc
     * const HelperSchema = v.object({ name: v.string() });
     * ```
     */
    "require-jsdoc": {
      create(context) {
        return {
          // Check schema variables
          VariableDeclarator(node) {
            // Only apply to Valibot schema declarators (IIFE or direct Valibot call)
            if (!isValibotSchemaDeclarator(node)) return;

            // Only handle named declarations (we use the identifier in the message)
            if (node.id.type !== "Identifier") return;

            // Resolve the statement node so we can detect `export ...` wrappers
            const stmtNode = getStatementNode(node);
            if (!stmtNode) return;

            // Only apply to exported schemas
            if (!isInsideExportedContext(stmtNode)) return;

            // OK: JSDoc exists
            if (getJSDocText(stmtNode, context.sourceCode.text)) return;

            // ERROR: Report lint error
            context.report({
              node: node.id,
              message: `Valibot schema '${node.id.name}' must have a JSDoc comment`,
              hint: `Add: \`/** Description */\``,
            });
          },

          // Check object fields
          CallExpression(node) {
            // Only check Valibot calls
            if (!isValibotCall(node)) return;

            // Only apply inside exported schema declarators (IIFE or direct Valibot call)
            if (!isInsideExportedSchemaDeclarator(node)) return;

            // Only handle calls where the first argument is an object expression
            const firstArg = node.arguments[0];
            if (!firstArg || firstArg.type !== "ObjectExpression") return;

            // Check each property for JSDoc comment
            for (const prop of firstArg.properties) {
              if (prop.type !== "Property" || prop.key.type !== "Identifier") continue;

              // OK: JSDoc exists
              if (getJSDocText(prop, context.sourceCode.text)) continue;

              // ERROR: Report lint error
              context.report({
                node: prop.key,
                message: `Field '${prop.key.name}' must have a JSDoc comment`,
                hint: `Add: \`/** Description */\``,
              });
            }
          },
        };
      },
    },

    /**
     * Require v.description() text to match preceding JSDoc comment.
     *
     * @example
     * ```
     * // ❌ Bad - object field
     * /​** User name. *​/
     * name: v.pipe(v.string(), v.description("Different text."))
     *
     * // ❌ Bad - schema variable
     * /​** My schema. *​/
     * export const MySchema = /​* @__PURE__ *​/ (() => {
     *   return v.pipe(v.object({...}), v.description("Different text."));
     * })();
     *
     * // ✅ Good
     * /​** User name. *​/
     * name: v.pipe(v.string(), v.description("User name."))
     * ```
     */
    "require-description-match-jsdoc": {
      create(context) {
        /** Recursively extract string value from expression (handles Literal and BinaryExpression with + operator) */
        function extractStringValue(node: Deno.lint.Expression): string | undefined {
          if (node.type === "Literal" && typeof node.value === "string") {
            return node.value;
          }
          if (node.type === "BinaryExpression" && node.operator === "+") {
            if (node.left.type === "PrivateIdentifier") {
              return undefined;
            }
            const left = extractStringValue(node.left);
            const right = extractStringValue(node.right);
            if (left !== undefined && right !== undefined) {
              return left + right;
            }
          }
          return undefined;
        }

        /** Extract description text from v.pipe(..., v.description("...")) */
        function getDescriptionText(node: ValibotCallExpression): string | undefined {
          if (node.callee.property.name !== "pipe") return undefined;

          const lastArg = node.arguments[node.arguments.length - 1];
          if (!lastArg || lastArg.type !== "CallExpression" || !isValibotCall(lastArg)) return undefined;
          if (lastArg.callee.property.name !== "description") return undefined;

          const descArg = lastArg.arguments[0];
          if (!descArg || descArg.type === "SpreadElement") return undefined;

          return extractStringValue(descArg);
        }

        return {
          // Check object fields
          Property(node) {
            // Only handle named properties
            if (node.key.type !== "Identifier") return;

            // Only apply inside exported schema declarators (IIFE or direct Valibot call)
            if (!isInsideExportedSchemaDeclarator(node)) return;

            // Only check Valibot call field schemas
            if (node.value.type !== "CallExpression" || !isValibotCall(node.value)) return;

            // Only apply when JSDoc exists
            const jsdocText = getJSDocText(node, context.sourceCode.text);
            if (!jsdocText) return;

            // Only apply when field schema ends with v.description()
            const descText = getDescriptionText(node.value);
            if (!descText) return;

            // Compare normalized texts
            if (jsdocText.trim() !== descText.trim()) {
              // ERROR: Report lint error
              context.report({
                node: node.key,
                message: `JSDoc '${jsdocText}' does not match \`v.description('${descText}')\``,
                hint: "Make JSDoc and `v.description()` text identical",
              });
            }
          },

          // Check schema variables
          VariableDeclarator(node) {
            // Only apply to Valibot schema declarators (IIFE or direct Valibot call)
            if (!isValibotSchemaDeclarator(node)) return;

            // Only handle named declarations (we use the identifier in the message)
            if (node.id.type !== "Identifier") return;

            const stmtNode = getStatementNode(node);
            if (!stmtNode) return;

            // Only apply to exported schemas
            if (!isInsideExportedContext(stmtNode)) return;

            // Only apply when JSDoc exists
            const jsdocText = getJSDocText(stmtNode, context.sourceCode.text);
            if (!jsdocText) return;

            const schemaCall = getSchemaCallFromDeclarator(node);
            if (!schemaCall) return;

            // Only apply when schema ends with v.description()
            const descText = getDescriptionText(schemaCall);
            if (!descText) return;

            // Compare normalized texts
            if (jsdocText.trim() !== descText.trim()) {
              // ERROR: Report lint error
              context.report({
                node: node.id,
                message: `JSDoc '${jsdocText}' does not match \`v.description('${descText}')\``,
                hint: "Make JSDoc and `v.description()` text identical",
              });
            }
          },
        };
      },
    },
  },
} satisfies Deno.lint.Plugin;
