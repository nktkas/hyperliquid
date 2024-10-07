import { InfoClient } from "../../index.ts";
import { assertJsonSchema } from "../utils.ts";
import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assert } from "jsr:@std/assert@^1.0.4";

Deno.test(
    "candleSnapshot",
    { permissions: { net: true, read: true } },
    async (t) => {
        // Create client
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./src/types/info.d.ts"), skipTypeCheck: true });
        const schema = tsjSchemaGenerator.createSchema("CandleSnapshot");

        // Test
        await t.step("coin + interval + startTime", async () => {
            const data = await client.candleSnapshot({
                coin: "ETH",
                interval: "15m",
                startTime: Date.now() - 1000 * 60 * 60 * 24,
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));
        });

        await t.step("coin + interval + startTime + endTime", async () => {
            const data = await client.candleSnapshot({
                coin: "ETH",
                interval: "15m",
                startTime: Date.now() - 1000 * 60 * 60 * 24,
                endTime: Date.now(),
            });

            assert(Array.isArray(data), "WARNING: Unable to fully validate the type due to an empty array");
            data.forEach((item) => assertJsonSchema(schema, item));
        });
    },
);
