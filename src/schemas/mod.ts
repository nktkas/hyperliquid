/**
 * This module provides valibot schemas for validating, formatting, and inferring types for data used in the Hyperliquid API.
 *
 * @example
 * ```ts
 * import { OrderRequest, parser } from "@nktkas/hyperliquid/schemas";
 * //       ^^^^^^^^^^^^
 * //       both a valibot schema and a typescript type
 *
 * const action = {
 *   type: "order",
 *   orders: [{
 *       a: 0,
 *       b: true,
 *       p: "50000",
 *       s: "0.1",
 *       r: false,
 *       t: { limit: { tif: "Gtc" } },
 *   }],
 *   grouping: "na",
 * } satisfies OrderRequest["action"]; // can be used as type
 *
 * //                             or as valibot schema
 * //                             ⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄
 * const validatedAction = parser(OrderRequest.entries.action)(action);
 * //                      ^^^^^^
 * //                      validates, formats, sorts object keys for correct signature generation
 * //                      and returns typed data
 * ```
 *
 * Also valibot schema can be converted to JSON Schema:
 *
 * @example
 * ```ts
 * import { OrderRequest } from "@nktkas/hyperliquid/schemas";
 * import { toJsonSchema } from "npm:@valibot/to-json-schema";
 *
 * const schema = toJsonSchema(OrderRequest, { errorMode: "ignore" });
 *
 * console.log(JSON.stringify(schema, null, 2));
 * // {
 * //   "$schema": "http://json-schema.org/draft-07/schema#",
 * //   "type": "object",
 * //   "properties": {
 * //     "action": {
 * //       "type": "object",
 * //       "properties": {
 * //         "type": { "const": "order" },
 * //         "orders": { "type": "array", "items": {...} },
 * //         "grouping": { "anyOf": [...] },
 * //         "builder": { "type": "object", ... }
 * //       },
 * //       "required": ["type", "orders", "grouping"]
 * //     },
 * //     "nonce": { "type": "number" },
 * //     "signature": {
 * //       "type": "object",
 * //       "properties": {
 * //         "r": { "type": "string", ... },
 * //         "s": { "type": "string", ... },
 * //         "v": { "anyOf": [{"const": 27}, {"const": 28}] }
 * //       },
 * //       "required": ["r", "s", "v"]
 * //     },
 * //     "vaultAddress": { "type": "string", ... },
 * //     "expiresAfter": { "type": "number" }
 * //   },
 * //   "required": ["action", "nonce", "signature"]
 * // }
 * ```
 *
 * @module
 */

import * as v from "valibot";
import { HyperliquidError } from "../_errors.ts";

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

export { Hex } from "./_base.ts";

export * from "./exchange/requests.ts";
export * from "./exchange/responses.ts";

export * from "./explorer/requests.ts";
export * from "./explorer/responses.ts";

export * from "./info/accounts.ts";
export * from "./info/assets.ts";
export * from "./info/markets.ts";
export * from "./info/orders.ts";
export * from "./info/requests.ts";
export * from "./info/validators.ts";
export * from "./info/vaults.ts";

export * from "./subscriptions/responses.ts";
export * from "./subscriptions/requests.ts";
