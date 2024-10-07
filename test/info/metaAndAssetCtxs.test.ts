import { InfoClient } from "../../index.ts";
import { assertJsonSchema, recursiveTraversal } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert, assertGreater } from "jsr:@std/assert@^1.0.4";

Deno.test(
    "metaAndAssetCtxs",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Create TypeScript type schemas
        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("MetaAndAssetCtxs");

        // Test
        const data = await client.metaAndAssetCtxs();

        assertJsonSchema(schema, data);
        recursiveTraversal(data, (key, value) => {
            if (Array.isArray(value)) {
                assertGreater(value.length, 0, `WARNING: Unable to fully validate the type due to an empty array. Key: ${key}`);
            }
        });

        await t.step("typeof AssetCtx.premium === string", () => {
            assert(data[1].find((item) => typeof item.premium === "string"));
        });

        await t.step("AssetCtx.premium === null", () => {
            assert(data[1].find((item) => item.premium === null));
        });

        await t.step("typeof AssetCtx.midPx === string", () => {
            assert(data[1].find((item) => typeof item.midPx === "string"));
        });

        await t.step("AssetCtx.midPx === null", () => {
            assert(data[1].find((item) => item.midPx === null));
        });

        await t.step("AssetCtx.impactPxs.length > 0", () => {
            assert(data[1].find((item) => Array.isArray(item.impactPxs) && item.impactPxs.length > 0));
        });

        await t.step("AssetCtx.impactPxs === null", () => {
            assert(data[1].find((item) => item.impactPxs === null));
        });
    },
);
