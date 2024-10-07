import { type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema, recursiveTraversal } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test(
    "userFills",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("UserFill");

        // Test
        const data = await client.userFills({ user: USER_ADDRESS });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step("side", async (t) => {
            await t.step("side === B", () => {
                assert(data.find((item) => item.side === "B"));
            });

            await t.step("side === A", () => {
                assert(data.find((item) => item.side === "A"));
            });
        });

        await t.step("cloid", async (t) => {
            await t.step("typeof cloid === string", () => {
                assert(data.find((item) => typeof item.cloid === "string"));
            });

            await t.step("cloid !== undefined", () => {
                assert(data.find((item) => item.cloid));
            });
        });

        await t.step("liquidation", async (t) => {
            await t.step("liquidation === undefined", () => {
                assert(data.find((item) => item.liquidation === undefined));
            });

            await t.step("liquidation !== undefined", () => {
                assert(data.find((item) => item.liquidation !== undefined));
            });
        });

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(
                    value.length,
                    0,
                    `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                );
            }
        });
    },
);
