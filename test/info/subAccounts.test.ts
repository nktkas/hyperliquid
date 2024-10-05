import { type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema, recursiveTraversal } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0x393296977708952244b02311d6e6ecaf785949a8";

Deno.test(
    "subAccounts",
    { permissions: { net: true, read: true } },
    async () => {
        // Create HyperliquidInfoClient
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("SubAccount");

        // Test
        const data = await client.subAccounts({ user: USER_ADDRESS });

        assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));

        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                if (key === "assetPositions" || key === "balances") return;
                assertGreater(
                    value.length,
                    0,
                    `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`,
                );
            }
        });
    },
);
