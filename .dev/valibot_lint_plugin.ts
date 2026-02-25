// deno-lint-ignore-file explicit-function-return-type

/**
 * Lint plugin for {@link https://valibot.dev/ | Valibot} schemas enforcing best practices and preventing common mistakes.
 * @module
 */

/** Valibot function call expression with typed callee */
interface ValibotCallExpression extends Deno.lint.CallExpression {
  callee: Deno.lint.MemberExpression & {
    object: Deno.lint.Identifier & { name: "v" };
    property: Deno.lint.Identifier;
  };
}

/** Check if node is a Valibot function call (e.g., v.object, v.pipe, v.string) */
function isValibotCall(node: Deno.lint.CallExpression): node is ValibotCallExpression {
  const callee = node.callee;
  return callee.type === "MemberExpression" &&
    callee.object.type === "Identifier" &&
    callee.object.name === "v" &&
    callee.property.type === "Identifier";
}

/** Get the method name if node is a Valibot call, otherwise undefined */
function getValibotMethodName(node: Deno.lint.CallExpression): string | undefined {
  if (!isValibotCall(node)) return undefined;
  return node.callee.property.name;
}

export default {
  name: "valibot",
  rules: {
    /**
     * Disallow `v.any()`.
     *
     * This schema function exists only for completeness and is not recommended in practice.
     * Instead, `unknown` should be used to accept unknown data.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.any()
     *
     * // ✅ Good
     * v.unknown()
     * ```
     */
    "no-explicit-any": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.any()
            const methodName = node.callee.property.name;
            if (methodName !== "any") return;

            // Report lint error
            context.report({
              node: node,
              message: `\`v.${methodName}()\` is not allowed`,
              hint: "Use a more specific schema type",
            });
          },
        };
      },
    },

    /**
     * Disallow nested `v.pipe()` calls.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.pipe(v.pipe(v.string(), v.length(10)), v.description("..."))
     *
     * // ✅ Good
     * v.pipe(v.string(), v.length(10), v.description("..."))
     * ```
     */
    "no-nested-pipe": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.pipe()
            const methodName = node.callee.property.name;
            if (methodName !== "pipe") return;

            // Check for nested v.pipe() in arguments
            for (const arg of node.arguments) {
              // Check if argument is a Valibot call
              if (arg.type !== "CallExpression" || !isValibotCall(arg)) continue;

              // Check if it's v.pipe()
              const argMethodName = arg.callee.property.name;
              if (argMethodName !== "pipe") continue;

              // Report lint error
              context.report({
                node: arg,
                message: "Nested `v.pipe()` is not allowed",
                hint: "Flatten arguments into a single `v.pipe()` call",
              });
            }
          },
        };
      },
    },

    /**
     * Disallow empty `v.object({})` or `v.strictObject({})`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.object({})
     *
     * // ✅ Good
     * v.record(v.string(), v.never())
     * ```
     */
    "no-empty-object": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.object() or v.strictObject()
            const methodName = node.callee.property.name;
            if (methodName !== "object" && methodName !== "strictObject") return;

            // Check if first argument is an empty object literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ObjectExpression" || arg.properties.length !== 0) return;

            // Report lint error
            context.report({
              node: node,
              message: `Empty \`v.${methodName}({})\` is not allowed`,
              hint:
                "Use `v.record(v.string(), v.never())` to express an object with dynamic keys but no allowed values (i.e. effectively empty), instead of `v.object({})`.",
            });
          },
        };
      },
    },

    /**
     * Disallow empty `v.looseObject({})`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.looseObject({})
     *
     * // ✅ Good
     * v.record(v.string(), v.unknown())
     * ```
     */
    "no-empty-looseObject": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.looseObject()
            const methodName = node.callee.property.name;
            if (methodName !== "looseObject") return;

            // Check if first argument is an empty object literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ObjectExpression" || arg.properties.length !== 0) return;

            // Report lint error
            context.report({
              node: node,
              message: "Empty `v.looseObject({})` is not allowed",
              hint:
                "Use `v.record(v.string(), v.unknown())` to express an object with dynamic keys and unknown values (i.e. a fully loose object), instead of `v.looseObject({})`.",
            });
          },
        };
      },
    },

    /**
     * Disallow empty `v.objectWithRest({/* empty *\/}, rest)`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.objectWithRest({}, v.string())
     *
     * // ✅ Good
     * v.record(v.string(), v.string())
     * ```
     */
    "no-empty-objectWithRest": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.objectWithRest()
            const methodName = node.callee.property.name;
            if (methodName !== "objectWithRest") return;

            // Check if first argument is an empty object literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ObjectExpression" || arg.properties.length !== 0) return;

            // Report lint error
            context.report({
              node: node,
              message: "Empty `v.objectWithRest({/* empty */}, ...)` is not allowed",
              hint:
                "Use `v.record(v.string(), rest)` to validate an object with dynamic keys, instead of `v.objectWithRest({/* empty */}, rest)`.",
            });
          },
        };
      },
    },

    /**
     * Disallow empty `v.tuple([])` or `v.strictTuple([])`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.tuple([])
     *
     * // ✅ Good
     * v.array(v.never())
     * ```
     */
    "no-empty-tuple": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.tuple() or v.strictTuple()
            const methodName = node.callee.property.name;
            if (methodName !== "tuple" && methodName !== "strictTuple") return;

            // Check if first argument is an empty array literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression" || arg.elements.length !== 0) return;

            // Report lint error
            context.report({
              node: node,
              message: `Empty \`v.${methodName}([])\` is not allowed`,
              hint:
                "Use `v.array(v.never())` to represent an array that cannot contain any valid items, instead of an empty tuple.",
            });
          },
        };
      },
    },

    /**
     * Disallow empty `v.looseTuple([])`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.looseTuple([])
     *
     * // ✅ Good
     * v.array(v.unknown())
     * ```
     */
    "no-empty-looseTuple": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.looseTuple()
            const methodName = node.callee.property.name;
            if (methodName !== "looseTuple") return;

            // Check if first argument is an empty array literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression" || arg.elements.length !== 0) return;

            // Report lint error
            context.report({
              node: node,
              message: "Empty `v.looseTuple([])` is not allowed",
              hint: "Use `v.array(v.unknown())` to express an array with unknown items, instead of `v.looseTuple([])`.",
            });
          },
        };
      },
    },

    /**
     * Disallow empty `v.tupleWithRest([], rest)`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.tupleWithRest([], v.string())
     *
     * // ✅ Good
     * v.array(v.string())
     * ```
     */
    "no-empty-tupleWithRest": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.tupleWithRest()
            const methodName = node.callee.property.name;
            if (methodName !== "tupleWithRest") return;

            // Check if first argument is an empty array literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression" || arg.elements.length !== 0) return;

            // Report lint error
            context.report({
              node: node,
              message: "Empty `v.tupleWithRest([], ...)` is not allowed",
              hint: "Use `v.array(rest)` to validate an array of rest items, instead of `v.tupleWithRest([], rest)`.",
            });
          },
        };
      },
    },

    /**
     * Disallow empty `v.picklist([])`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.picklist([])
     *
     * // ✅ Good
     * v.never()
     * ```
     */
    "no-empty-picklist": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.picklist()
            const methodName = node.callee.property.name;
            if (methodName !== "picklist") return;

            // Check if first argument is an empty array literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression" || arg.elements.length !== 0) return;

            // Report lint error
            context.report({
              node: node,
              message: "Empty `v.picklist([])` is not allowed",
              hint: "Use `v.never()` to represent a type that can never be valid, instead of an empty picklist.",
            });
          },
        };
      },
    },

    /**
     * Disallow empty `v.enum({})`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.enum({})
     *
     * // ✅ Good
     * v.never()
     * ```
     */
    "no-empty-enum": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.enum()
            const methodName = node.callee.property.name;
            if (methodName !== "enum") return;

            // Check if first argument is an empty object literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ObjectExpression" || arg.properties.length !== 0) return;

            // Report lint error
            context.report({
              node: node,
              message: "Empty `v.enum({})` is not allowed",
              hint: "Use `v.never()` to represent a schema with no valid values, instead of `v.enum({})`.",
            });
          },
        };
      },
    },

    /**
     * Disallow empty `v.union([])`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.union([])
     *
     * // ✅ Good
     * v.never()
     * ```
     */
    "no-empty-union": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.union()
            const methodName = node.callee.property.name;
            if (methodName !== "union") return;

            // Check if first argument is an empty array literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression" || arg.elements.length !== 0) return;

            // Report lint error
            context.report({
              node: node,
              message: "Empty `v.union([])` is not allowed",
              hint: "Use `v.never()` to represent an empty union (no variants), instead of `v.union([])`.",
            });
          },
        };
      },
    },

    /**
     * Disallow empty `v.intersect([])`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.intersect([])
     *
     * // ✅ Good
     * v.never()
     * ```
     */
    "no-empty-intersect": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.intersect()
            const methodName = node.callee.property.name;
            if (methodName !== "intersect") return;

            // Check if first argument is an empty array literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression" || arg.elements.length !== 0) return;

            // Report lint error
            context.report({
              node: node,
              message: "Empty `v.intersect([])` is not allowed",
              hint:
                "Use `v.never()` to represent a schema with no valid values, instead of an empty `v.intersect([])`.",
            });
          },
        };
      },
    },

    /**
     * Disallow empty `v.variant("type", [])`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.variant("type", [])
     *
     * // ✅ Good
     * v.never()
     * ```
     */
    "no-empty-variant": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.variant()
            const methodName = node.callee.property.name;
            if (methodName !== "variant") return;

            // Check if second argument is an empty array literal
            const arg = node.arguments[1];
            if (!arg || arg.type !== "ArrayExpression" || arg.elements.length !== 0) return;

            // Report lint error
            context.report({
              node: node,
              message: "Empty `v.variant(..., [])` is not allowed",
              hint: "Use `v.never()` to represent a variant with no possible cases, instead of `v.variant(..., [])`.",
            });
          },
        };
      },
    },

    /**
     * Disallow redundant wrappers like `v.optional(v.optional(...))`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.optional(v.optional(v.string()))
     * v.nullable(v.nullable(v.string()))
     * v.nullish(v.nullish(v.string()))
     *
     * // ✅ Good
     * v.optional(v.string())
     * v.nullable(v.string())
     * v.nullish(v.string())
     * ```
     */
    "no-redundant-wrap": {
      create(context) {
        const redundantWrappers = [
          "optional",
          "nullable",
          "nullish",
          "undefinedable",
          "exactOptional",
          "nonOptional",
          "nonNullable",
          "nonNullish",
        ];

        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's a redundant wrapper
            const outerMethod = node.callee.property.name;
            if (!redundantWrappers.includes(outerMethod)) return;

            // Check if first argument is a Valibot call
            const arg = node.arguments[0];
            if (!arg || arg.type !== "CallExpression" || !isValibotCall(arg)) return;

            // Check if first argument is the same wrapper
            const innerMethod = arg.callee.property.name;
            if (innerMethod !== outerMethod) return;

            // Report lint error
            context.report({
              node: node,
              message: `Redundant \`v.${outerMethod}(v.${innerMethod}(...))\` is not allowed`,
              hint: `Remove one of the \`v.${outerMethod}()\` calls`,
            });
          },
        };
      },
    },

    /**
     * Disallow `v.union([single])`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.union([v.string()])
     *
     * // ✅ Good
     * v.string()
     * ```
     */
    "no-single-union": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.union()
            const methodName = node.callee.property.name;
            if (methodName !== "union") return;

            // Check if first argument is an array literal with single element
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression" || arg.elements.length !== 1) return;

            // Report lint error
            context.report({
              node: node,
              message: "`v.union()` with single element is redundant",
              hint: "Use the schema directly, instead of wrapping it in `v.union([single])`.",
            });
          },
        };
      },
    },

    /**
     * Disallow `v.intersect([single])`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.intersect([v.object({ name: v.string() })])
     *
     * // ✅ Good
     * v.object({ name: v.string() })
     * ```
     */
    "no-single-intersect": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.intersect()
            const methodName = node.callee.property.name;
            if (methodName !== "intersect") return;

            // Check if first argument is an array literal with single element
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression" || arg.elements.length !== 1) return;

            // Report lint error
            context.report({
              node: node,
              message: "`v.intersect()` with single element is redundant",
              hint: "Use the schema directly, instead of wrapping it in `v.intersect([single])`.",
            });
          },
        };
      },
    },

    /**
     * Disallow `v.variant(key, [single])`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.variant("type", [v.object({ type: v.literal("a") })])
     *
     * // ✅ Good
     * v.object({ type: v.literal("a") })
     * ```
     */
    "no-single-variant": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.variant()
            const methodName = node.callee.property.name;
            if (methodName !== "variant") return;

            // Check if second argument is an array literal with single element
            const arg = node.arguments[1];
            if (!arg || arg.type !== "ArrayExpression" || arg.elements.length !== 1) return;

            // Report lint error
            context.report({
              node: node,
              message: "`v.variant()` with single option is redundant",
              hint: "Use the schema directly, instead of wrapping it in `v.variant(key, [single])`.",
            });
          },
        };
      },
    },

    /**
     * Disallow `v.picklist([single])`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.picklist(["only"])
     *
     * // ✅ Good
     * v.literal("only")
     * ```
     */
    "no-single-picklist": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.picklist()
            const methodName = node.callee.property.name;
            if (methodName !== "picklist") return;

            // Check if first argument is an array literal with single element
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression" || arg.elements.length !== 1) return;

            // Report lint error
            context.report({
              node: node,
              message: "`v.picklist()` with single element is redundant",
              hint: "Use `v.literal(...)` instead of `v.picklist([single])`.",
            });
          },
        };
      },
    },

    /**
     * Disallow `v.pipe(single)`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.pipe(v.string())
     *
     * // ✅ Good
     * v.string()
     * ```
     */
    "no-single-pipe": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.pipe()
            const methodName = node.callee.property.name;
            if (methodName !== "pipe") return;

            // Check if there's only a single argument
            if (node.arguments.length !== 1) return;

            // Report lint error
            context.report({
              node: node,
              message: "`v.pipe()` with single argument is redundant",
              hint: "Use the schema directly, instead of wrapping it in `v.pipe(single)`.",
            });
          },
        };
      },
    },

    // TODO: AST comparison utility functions needed

    /**
     * Disallow duplicate items in `v.union()`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.union([v.literal("a"), v.literal("a"), v.literal("b")])
     *
     * // ✅ Good
     * v.union([v.literal("a"), v.literal("b")])
     * ```
     */
    // "no-duplicate-items-union": {
    //   create(context) {
    //     return {
    //       CallExpression(node) {
    //         // Check if it's a Valibot call
    //         if (!isValibotCall(node)) return;
    //
    //         // Check if it's v.union()
    //         const methodName = node.callee.property.name;
    //         if (methodName !== "union") return;
    //
    //         // Check if there's an array argument
    //         const arg = node.arguments[0];
    //         if (!arg || arg.type !== "ArrayExpression") return;
    //
    //         // Check for duplicate elements
    //         if (!hasDuplicateArrayElements(arg)) return;
    //
    //         // Report lint error
    //         context.report({
    //           node: arg,
    //           message: "Duplicate items in `v.union()` are not allowed",
    //           hint: "Remove duplicate schemas from the `v.union([...])` options.",
    //         });
    //       },
    //     };
    //   },
    // },

    /**
     * Disallow duplicate items in `v.intersect()`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.intersect([v.string(), v.string()])
     *
     * // ✅ Good
     * v.intersect([v.string()])
     * ```
     */
    // "no-duplicate-items-intersect": {
    //   create(context) {
    //     return {
    //       CallExpression(node) {
    //         // Check if it's a Valibot call
    //         if (!isValibotCall(node)) return;
    //
    //         // Check if it's v.intersect()
    //         const methodName = node.callee.property.name;
    //         if (methodName !== "intersect") return;
    //
    //         // Check if there's an array argument
    //         const arg = node.arguments[0];
    //         if (!arg || arg.type !== "ArrayExpression") return;
    //
    //         // Check for duplicate elements
    //         if (!hasDuplicateArrayElements(arg)) return;
    //
    //         // Report lint error
    //         context.report({
    //           node: arg,
    //           message: "Duplicate items in `v.intersect()` are not allowed",
    //           hint: "Remove duplicate schemas from the `v.intersect([...])` options.",
    //         });
    //       },
    //     };
    //   },
    // },

    /**
     * Disallow duplicate items in `v.picklist()`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.picklist(["a", "a", "b"])
     *
     * // ✅ Good
     * v.picklist(["a", "b"])
     * ```
     */
    // "no-duplicate-items-picklist": {
    //   create(context) {
    //     return {
    //       CallExpression(node) {
    //         // Check if it's a Valibot call
    //         if (!isValibotCall(node)) return;
    //
    //         // Check if it's v.picklist()
    //         const methodName = node.callee.property.name;
    //         if (methodName !== "picklist") return;
    //
    //         // Check if there's an array argument
    //         const arg = node.arguments[0];
    //         if (!arg || arg.type !== "ArrayExpression") return;
    //
    //         // Check for duplicate elements
    //         if (!hasDuplicateArrayElements(arg)) return;
    //
    //         // Report lint error
    //         context.report({
    //           node: arg,
    //           message: "Duplicate items in `v.picklist()` are not allowed",
    //           hint: "Remove duplicate values from the `v.picklist([...])` options.",
    //         });
    //       },
    //     };
    //   },
    // },

    /**
     * Disallow duplicate items in `v.variant()`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.variant("type", [v.object({ type: v.literal("a") }), v.object({ type: v.literal("a") })])
     *
     * // ✅ Good
     * v.variant("type", [v.object({ type: v.literal("a") })])
     * ```
     */
    // "no-duplicate-items-variant": {
    //   create(context) {
    //     return {
    //       CallExpression(node) {
    //         // Check if it's a Valibot call
    //         if (!isValibotCall(node)) return;
    //
    //         // Check if it's v.variant()
    //         const methodName = node.callee.property.name;
    //         if (methodName !== "variant") return;
    //
    //         // Check if there's an array argument
    //         const arg = node.arguments[1];
    //         if (!arg || arg.type !== "ArrayExpression") return;
    //
    //         // Check for duplicate elements
    //         if (!hasDuplicateArrayElements(arg)) return;
    //
    //         // Report lint error
    //         context.report({
    //           node: arg,
    //           message: "Duplicate items in `v.variant()` are not allowed",
    //           hint: "Remove duplicate schemas from the `v.variant(key, [...])` options.",
    //         });
    //       },
    //     };
    //   },
    // },

    /**
     * Disallow redundant combinations where `v.nullish()` absorbs `v.nullable()`/`v.optional()`/`v.undefinedable()`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.nullish(v.nullable(v.string()))   // nullable is redundant inside nullish
     * v.nullish(v.optional(v.string()))   // optional is redundant inside nullish
     * v.nullable(v.nullish(v.string()))   // nullable is redundant outside nullish
     * v.optional(v.nullish(v.string()))   // optional is redundant outside nullish
     *
     * // ✅ Good
     * v.nullish(v.string())
     * v.nullable(v.string())
     * v.optional(v.string())
     * ```
     */
    "no-nullish-redundancy": {
      create(context) {
        const absorbedByNullish: Array<{ wrapper: string; accepts: "null" | "undefined" }> = [
          { wrapper: "nullable", accepts: "null" },
          { wrapper: "optional", accepts: "undefined" },
          { wrapper: "undefinedable", accepts: "undefined" },
        ];

        function getAbsorbed(wrapper: string) {
          return absorbedByNullish.find((entry) => entry.wrapper === wrapper);
        }

        function buildReason(wrapper: string, position: "inside" | "outside", accepts: "null" | "undefined") {
          return `\`v.${wrapper}()\` is redundant ${position} \`v.nullish()\` - nullish already accepts ${accepts}`;
        }

        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if first argument is a Valibot call
            const arg = node.arguments[0];
            if (!arg || arg.type !== "CallExpression" || !isValibotCall(arg)) return;

            // Check for redundant combinations
            const outerMethod = node.callee.property.name;

            const innerMethod = getValibotMethodName(arg);
            if (!innerMethod) return;

            // Case 1: v.nullish(v.<wrapper>(...)) -> inner wrapper is redundant
            if (outerMethod === "nullish") {
              const absorbed = getAbsorbed(innerMethod);
              if (!absorbed) return;

              context.report({
                node: node,
                message: buildReason(absorbed.wrapper, "inside", absorbed.accepts),
                hint: `Remove \`v.${absorbed.wrapper}()\` - \`v.nullish()\` already covers its functionality`,
              });
              return;
            }

            // Case 2: v.<wrapper>(v.nullish(...)) -> outer wrapper is redundant
            if (innerMethod === "nullish") {
              const absorbed = getAbsorbed(outerMethod);
              if (!absorbed) return;

              context.report({
                node: node,
                message: buildReason(absorbed.wrapper, "outside", absorbed.accepts),
                hint: `Remove \`v.${absorbed.wrapper}()\` - \`v.nullish()\` already covers its functionality`,
              });
              return;
            }
          },
        };
      },
    },

    /**
     * Disallow conflicting wrapper combinations.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.optional(v.nonOptional(v.string()))
     * v.nonOptional(v.optional(v.string()))
     * v.nullable(v.nonNullable(v.string()))
     * v.nonNullable(v.nullable(v.string()))
     * v.nullish(v.nonNullish(v.string()))
     * v.nonNullish(v.nullish(v.string()))
     *
     * // ✅ Good
     * v.optional(v.string())
     * v.nullable(v.string())
     * v.nullish(v.string())
     * ```
     */
    "no-conflicting-wrapper": {
      create(context) {
        const conflictingPairs = [
          ["optional", "nonOptional"],
          ["nonOptional", "optional"],
          ["nullable", "nonNullable"],
          ["nonNullable", "nullable"],
          ["nullish", "nonNullish"],
          ["nonNullish", "nullish"],
          ["undefinedable", "nonOptional"],
          ["nonOptional", "undefinedable"],
          ["exactOptional", "optional"],
          ["optional", "exactOptional"],
          ["exactOptional", "undefinedable"],
          ["undefinedable", "exactOptional"],
        ];

        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if first argument is a Valibot call
            const arg = node.arguments[0];
            if (!arg || arg.type !== "CallExpression" || !isValibotCall(arg)) return;

            // Check of conflicting combinations
            const outerMethod = node.callee.property.name;

            const innerMethod = getValibotMethodName(arg);
            if (!innerMethod) return;

            for (const [outer, inner] of conflictingPairs) {
              if (outerMethod !== outer || innerMethod !== inner) continue;

              // Report lint error
              context.report({
                node: node,
                message: `Conflicting \`v.${outer}(v.${inner}())\` is not allowed`,
                hint: "These wrappers contradict each other, remove one",
              });
              return;
            }
          },
        };
      },
    },

    /**
     * Disallow invalid min/max ranges where min > max.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.pipe(v.string(), v.minLength(10), v.maxLength(5))
     * v.pipe(v.number(), v.minValue(100), v.maxValue(50))
     * v.pipe(v.set(v.string()), v.minSize(10), v.maxSize(5))
     * v.pipe(v.number(), v.gtValue(100), v.ltValue(50))
     * v.pipe(v.record(v.string(), v.number()), v.minEntries(10), v.maxEntries(5))
     *
     * // ✅ Good
     * v.pipe(v.string(), v.minLength(5), v.maxLength(10))
     * v.pipe(v.number(), v.minValue(50), v.maxValue(100))
     * v.pipe(v.set(v.string()), v.minSize(5), v.maxSize(10))
     * v.pipe(v.number(), v.gtValue(50), v.ltValue(100))
     * v.pipe(v.record(v.string(), v.number()), v.minEntries(5), v.maxEntries(10))
     * ```
     */
    "no-invalid-range": {
      create(context) {
        /** Pairs of min/max functions and their argument index for the value */
        const rangePairs: Array<{ min: string; max: string; valueArgIndex: number; strict?: boolean }> = [
          { min: "minLength", max: "maxLength", valueArgIndex: 0 },
          { min: "minValue", max: "maxValue", valueArgIndex: 0 },
          { min: "minSize", max: "maxSize", valueArgIndex: 0 },
          { min: "minBytes", max: "maxBytes", valueArgIndex: 0 },
          { min: "minGraphemes", max: "maxGraphemes", valueArgIndex: 0 },
          { min: "minWords", max: "maxWords", valueArgIndex: 1 }, // locale is first arg
          { min: "minEntries", max: "maxEntries", valueArgIndex: 0 },
          { min: "gtValue", max: "ltValue", valueArgIndex: 0, strict: true }, // strict comparison: gt must be < lt
        ];

        /** Extract numeric value from action call */
        function getNumericValue(node: ValibotCallExpression, argIndex: number): number | undefined {
          const arg = node.arguments[argIndex];
          if (!arg) return undefined;

          if (arg.type === "Literal" && typeof arg.value === "number") {
            return arg.value;
          }

          // Handle negative numbers: UnaryExpression with - operator
          if (
            arg.type === "UnaryExpression" &&
            arg.operator === "-" &&
            arg.argument.type === "Literal" &&
            typeof arg.argument.value === "number"
          ) {
            return -arg.argument.value;
          }

          return undefined;
        }

        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.pipe()
            if (node.callee.property.name !== "pipe") return;

            // Collect all min/max values from pipe arguments
            const values: Map<string, { value: number; node: ValibotCallExpression }> = new Map();

            for (const arg of node.arguments) {
              // Check if argument is a Valibot call
              if (arg.type !== "CallExpression" || !isValibotCall(arg)) continue;

              // Check each min/max pair
              for (const pair of rangePairs) {
                // Check if argument is one of the min/max methods
                const methodName = arg.callee.property.name;
                if (methodName !== pair.min && methodName !== pair.max) continue;

                // Extract numeric value
                const numValue = getNumericValue(arg, pair.valueArgIndex);
                if (numValue !== undefined) {
                  values.set(methodName, { value: numValue, node: arg });
                }
              }
            }

            // Check each pair for invalid range
            for (const pair of rangePairs) {
              const minData = values.get(pair.min);
              const maxData = values.get(pair.max);

              if (minData && maxData) {
                // For strict comparisons (gtValue/ltValue), min must be strictly less than max
                // because gtValue(x) means > x and ltValue(y) means < y, so x >= y is invalid
                const isInvalid = pair.strict ? minData.value >= maxData.value : minData.value > maxData.value;
                if (!isInvalid) continue;

                // Report lint error
                context.report({
                  node: node,
                  message: `Invalid range: \`v.${pair.min}()\`(${minData.value}) ${
                    pair.strict ? ">=" : ">"
                  } \`v.${pair.max}()\`(${maxData.value})`,
                  hint: pair.strict
                    ? `For strict comparison, \`v.${pair.min}()\` value must be less than \`v.${pair.max}()\` value`
                    : `Minimum value (${minData.value}) cannot be greater than maximum value (${maxData.value})`,
                });
              }
            }
          },
        };
      },
    },

    /**
     * Disallow `v.never()` in `v.union()` as it has no effect.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.union([v.string(), v.never()])
     *
     * // ✅ Good
     * v.never();
     * ```
     */
    "no-never-in-union": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.union()
            if (node.callee.property.name !== "union") return;

            // Check if first argument is an array literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression") return;

            // Check for v.never() in elements
            for (const el of arg.elements) {
              // Check if element is a Valibot call
              if (!el || el.type !== "CallExpression" || !isValibotCall(el)) continue;

              // Check if it's v.never()
              if (getValibotMethodName(el) !== "never") continue;

              // Report lint error
              context.report({
                node: el,
                message: "`v.never()` in `v.union()` has no effect",
                hint: "Remove `v.never()` from union or use it alone for impossible type",
              });
            }
          },
        };
      },
    },

    /**
     * Prefer `v.nullish()` over `v.optional(v.nullable())` and similar combinations.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.optional(v.nullable(v.string()))
     * v.nullable(v.optional(v.string()))
     * v.undefinedable(v.nullable(v.string()))
     * v.nullable(v.undefinedable(v.string()))
     *
     * // ✅ Good
     * v.nullish(v.string())
     * ```
     */
    "prefer-nullish": {
      create(context) {
        const nullishCombinations = [
          ["optional", "nullable"],
          ["nullable", "optional"],
          ["undefinedable", "nullable"],
          ["nullable", "undefinedable"],
        ];

        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if first argument is a Valibot call
            const arg = node.arguments[0];
            if (!arg || arg.type !== "CallExpression" || !isValibotCall(arg)) return;

            // Check for nullish combinations
            const innerMethod = getValibotMethodName(arg);
            if (!innerMethod) return;

            for (const [outer, inner] of nullishCombinations) {
              // Check if the combination matches
              const outerMethod = node.callee.property.name;
              if (outerMethod !== outer || innerMethod !== inner) continue;

              // Report lint error
              context.report({
                node: node,
                message: `Use \`v.nullish()\` instead of \`v.${outer}(v.${inner}())\``,
                hint: "Replace with `v.nullish(...)` for cleaner code",
              });
              return;
            }
          },
        };
      },
    },

    /**
     * Prefer `v.picklist()` over `v.union()` with 2+ literals.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.union([v.literal("a"), v.literal("b")])
     *
     * // ✅ Good
     * v.picklist(["a", "b"])
     * ```
     */
    "prefer-picklist": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.union()
            if (node.callee.property.name !== "union") return;

            // Check if first argument is an array literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression") return;

            // Only suggest if there are 2+ elements
            if (arg.elements.length < 2) return;

            // Check if all elements are v.literal() calls
            const allLiterals = arg.elements.every((el) => {
              if (!el || el.type !== "CallExpression") return false;
              return getValibotMethodName(el) === "literal";
            });
            if (!allLiterals) return;

            // Report lint error
            context.report({
              node: node,
              message: "Use `v.picklist()` instead of `v.union()` with literals",
              hint: "Replace `v.union([v.literal(...), ...])` with `v.picklist([...])`",
            });
          },
        };
      },
    },

    /**
     * Prefer `v.nullable()` / `optional()` / `nullish()` over `v.union()` with null/undefined.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.union([v.string(), v.null()])
     * v.union([v.string(), v.undefined()])
     * v.union([v.string(), v.null(), v.undefined()])
     *
     * // ✅ Good
     * v.nullable(v.string())
     * v.optional(v.string())
     * v.nullish(v.string())
     * ```
     */
    "prefer-nullable-union": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.union()
            if (node.callee.property.name !== "union") return;

            // Check if first argument is an array literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression") return;

            // Analyze elements for null/undefined presence
            let hasNull = false;
            let hasUndefined = false;
            let otherCount = 0;

            for (const el of arg.elements) {
              // Check if element is a Valibot call
              if (!el || el.type !== "CallExpression" || !isValibotCall(el)) {
                otherCount++;
                continue;
              }

              // Check if it's v.null() or v.undefined()
              const methodName = getValibotMethodName(el);
              if (methodName === "null") {
                hasNull = true;
              } else if (methodName === "undefined") {
                hasUndefined = true;
              } else {
                otherCount++;
              }
            }

            // Only suggest if there's exactly one other schema
            if (otherCount !== 1) return;

            // Report appropriate suggestion
            if (hasNull && hasUndefined) {
              context.report({
                node: node,
                message: "Use `v.nullish()` instead of `v.union()` with null and undefined",
                hint: "Replace `v.union([schema, v.null(), v.undefined()])` with `v.nullish(schema)`",
              });
            } else if (hasNull) {
              context.report({
                node: node,
                message: "Use `v.nullable()` instead of `v.union()` with null",
                hint: "Replace `v.union([schema, v.null()])` with `v.nullable(schema)`",
              });
            } else if (hasUndefined) {
              context.report({
                node: node,
                message: "Use `v.optional()` instead of `v.union()` with undefined",
                hint:
                  "Replace `v.union([schema, v.undefined()])` with `v.optional(schema)` or `v.undefinedable(schema)`",
              });
            }
          },
        };
      },
    },

    /**
     * Prefer `v.variant()` over `v.union()` with objects sharing a discriminator key.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.union([
     *   v.object({ type: v.literal("email"), email: v.string() }),
     *   v.object({ type: v.literal("url"), url: v.string() })
     * ])
     *
     * // ✅ Good
     * v.variant("type", [
     *   v.object({ type: v.literal("email"), email: v.string() }),
     *   v.object({ type: v.literal("url"), url: v.string() })
     * ])
     * ```
     */
    "prefer-variant": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.union()
            if (node.callee.property.name !== "union") return;

            // Check if first argument is an array literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "ArrayExpression") return;

            // Only suggest if there are 2+ elements
            const elements = arg.elements;
            if (elements.length < 2) return;

            // Check if all elements are v.object() calls
            const objectCalls: ValibotCallExpression[] = [];
            for (const el of elements) {
              // Check if element is a Valibot call
              if (!el || el.type !== "CallExpression" || !isValibotCall(el)) return;

              // Check if it's v.object() / v.looseObject() / v.strictObject() / v.objectWithRest()
              const methodName = el.callee.property.name;
              if (
                methodName !== "object" &&
                methodName !== "looseObject" &&
                methodName !== "strictObject" &&
                methodName !== "objectWithRest"
              ) return;

              // Collect object calls
              objectCalls.push(el);
            }

            // Find common keys that have v.literal() values in all objects
            const discriminatorCandidates: Map<string, number> = new Map();

            for (const objCall of objectCalls) {
              // Check if first argument is an object literal
              const objArg = objCall.arguments[0];
              if (!objArg || objArg.type !== "ObjectExpression") return;

              // Analyze properties for v.literal() values
              for (const prop of objArg.properties) {
                // Only consider standard properties with identifier keys
                if (prop.type !== "Property" || prop.key.type !== "Identifier") continue;

                // Check if value is a Valibot call
                if (prop.value.type !== "CallExpression" || !isValibotCall(prop.value)) continue;

                // Check if value is v.literal()
                if (prop.value.callee.property.name === "literal") {
                  discriminatorCandidates.set(
                    prop.key.name,
                    (discriminatorCandidates.get(prop.key.name) || 0) + 1,
                  );
                }
              }
            }

            // Check if any key appears in all objects with literal values
            for (const [keyName, count] of discriminatorCandidates) {
              if (count !== objectCalls.length) continue;

              // Report lint error
              context.report({
                node: node,
                message: `Use \`v.variant("${keyName}", [...])\` instead of \`v.union()\` with objects`,
                hint:
                  `All objects have a '${keyName}' property with \`v.literal()\` - use \`v.variant()\` for better performance and error messages`,
              });
              return;
            }
          },
        };
      },
    },

    /**
     * Prefer `v.nonEmpty()` over `v.minLength(1)`.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.pipe(v.string(), v.minLength(1))
     * v.pipe(v.array(v.number()), v.minLength(1))
     *
     * // ✅ Good
     * v.pipe(v.string(), v.nonEmpty())
     * v.pipe(v.array(v.number()), v.nonEmpty())
     * v.pipe(v.string(), v.minLength(1), v.maxLength(10)) // OK - has max constraint
     * ```
     */
    "prefer-nonEmpty": {
      create(context) {
        /** Max constraint action names that make minLength(1) acceptable */
        const MAX_CONSTRAINTS = [
          "maxLength",
          "maxSize",
          "maxValue",
          "maxBytes",
          "maxGraphemes",
          "maxWords",
          "length",
        ];

        /** Check if parent pipe contains any max constraint */
        function hasMaxConstraintInPipe(node: Deno.lint.CallExpression): boolean {
          // Check if parent is a Valibot call
          if (!node.parent || node.parent.type !== "CallExpression" || !isValibotCall(node.parent)) return false;

          // Check if parent is v.pipe()
          if (node.parent.callee.property.name !== "pipe") return false;

          // Check all arguments in the pipe for max constraints
          for (const arg of node.parent.arguments) {
            // Check if argument is a Valibot call
            if (arg.type !== "CallExpression" || !isValibotCall(arg)) continue;

            // Check if it's a max constraint
            if (MAX_CONSTRAINTS.includes(arg.callee.property.name)) return true;
          }

          // No max constraint found
          return false;
        }

        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.minLength()
            if (node.callee.property.name !== "minLength") return;

            // Check if first argument is literal with value 1
            const arg = node.arguments[0];
            if (!arg || arg.type !== "Literal" || arg.value !== 1) return;

            // Skip if there's a max constraint in the same pipe
            if (hasMaxConstraintInPipe(node)) return;

            // Report lint error
            context.report({
              node: node,
              message: "Use `v.nonEmpty()` instead of `v.minLength(1)`",
              hint: "Replace `v.minLength(1)` with `v.nonEmpty()` for cleaner code",
            });
          },
        };
      },
    },

    /**
     * Require `v.check()` and `v.checkItems()` to have an error message.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.check((input) => input > 0)
     * v.checkItems((item) => item.length > 0)
     *
     * // ✅ Good
     * v.check((input) => input > 0, "Value must be positive.")
     * v.checkItems((item) => item.length > 0, "Items must not be empty.")
     * ```
     */
    "require-check-message": {
      create(context) {
        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.check() or v.checkItems()
            const methodName = node.callee.property.name;
            if (methodName !== "check" && methodName !== "checkItems") return;

            // v.check() and v.checkItems() require at least 2 arguments: requirement and message
            if (node.arguments.length >= 2) return;

            // Report lint error
            context.report({
              node: node,
              message: `\`v.${methodName}()\` must have an error message`,
              hint: `Add a second argument with the error message: \`v.${methodName}(fn, "Error message.")\``,
            });
          },
        };
      },
    },

    /**
     * Require `v.description()` text to be properly formatted.
     *
     * @example
     * ```
     * // ❌ Bad
     * v.description("")
     * v.description("user name.")
     * v.description("User name")
     * v.title("title also check")
     *
     * // ✅ Good
     * v.description("User name.")
     * v.description("Is this valid?")
     * v.description("Warning!")
     * v.title("Title also check.")
     * ```
     */
    "title-description-format": {
      create(context) {
        const VALID_ENDINGS = [".", "?", "!", ":", ")", "]"];

        return {
          CallExpression(node) {
            // Check if it's a Valibot call
            if (!isValibotCall(node)) return;

            // Check if it's v.description() or v.title()
            if (node.callee.property.name !== "description" && node.callee.property.name !== "title") return;

            // Check if first argument is a string literal
            const arg = node.arguments[0];
            if (!arg || arg.type !== "Literal" || typeof arg.value !== "string") return;

            // Case 1: Check empty string
            if (arg.value.length === 0) {
              context.report({
                node: arg,
                message: "Description must not be empty",
                hint: "Add a meaningful description",
              });
              return;
            }

            // Case 2: Check starts with uppercase
            if (arg.value[0] !== arg.value[0].toUpperCase()) {
              context.report({
                node: arg,
                message: `Description '${arg.value}' must start with uppercase letter`,
                hint: "Capitalize the first letter of the description",
              });
            }

            // Case 3: Check ends with valid punctuation
            const lastChar = arg.value[arg.value.length - 1];
            if (!VALID_ENDINGS.includes(lastChar)) {
              context.report({
                node: arg,
                message: `Description '${arg.value}' must end with punctuation`,
                hint: "Add punctuation at the end (., ?, !, :, ), ])",
              });
            }
          },
        };
      },
    },
  },
} satisfies Deno.lint.Plugin;
