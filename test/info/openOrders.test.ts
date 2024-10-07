import { type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test(
    "openOrders",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("OpenOrder");

        // Test
        const data = await client.openOrders({ user: USER_ADDRESS });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        await t.step("side", async (t) => {
            await t.step("find side === B", () => {
                assert(data.find((item) => item.side === "B"));
            });

            await t.step("find side === A", () => {
                assert(data.find((item) => item.side === "A"));
            });
        });

        await t.step("cloid", async (t) => {
            await t.step("find typeof cloid === string", () => {
                assert(data.find((item) => typeof item.cloid === "string"));
            });

            await t.step("find cloid === undefined", () => {
                assert(data.find((item) => item.cloid === undefined));
            });
        });
    },
);
