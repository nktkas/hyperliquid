import { InfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";

Deno.test(
    "allMids",
    { permissions: { net: true, read: true } },
    async () => {
        // Create client
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("AllMids");

        // Test
        const data = await client.allMids();

        assertJsonSchema(schema, data);
    },
);
