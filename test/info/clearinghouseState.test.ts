import { type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema, recursiveTraversal } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0x563C175E6f11582f65D6d9E360A618699DEe14a9";

Deno.test(
    "clearinghouseState",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create HyperliquidInfoClient
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("ClearinghouseState");

        // Test
        const data = await client.clearinghouseState({ user: USER_ADDRESS });

        assertJsonSchema(schema, data);

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });

        await t.step(`assetPositions.position.leverage.type === isolated`, () => {
            assert(
                data.assetPositions.find((item) => item.position.leverage.type === "isolated"),
                "Failed to verify type with 'assetPositions.position.leverage.type === isolated'",
            );
        });

        await t.step(`assetPositions.position.leverage.type === cross`, () => {
            assert(
                data.assetPositions.find((item) => item.position.leverage.type === "cross"),
                "Failed to verify type with 'assetPositions.position.leverage.type === cross'",
            );
        });
    },
);
