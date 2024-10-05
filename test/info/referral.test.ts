import { type Hex, InfoClient } from "../../index.ts";
import { assertJsonSchema, recursiveTraversal } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assertGreater } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0xe019d6167E7e324aEd003d94098496b6d986aB05";

Deno.test(
    "referral",
    { permissions: { net: true, read: true } },
    async () => {
        // Create HyperliquidInfoClient
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("Referral");

        // Test
        const data = await client.referral({ user: USER_ADDRESS });

        assertJsonSchema(schema, data);

        recursiveTraversal(data, (key, value) => {
            if (key === "rewardHistory") return;
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
