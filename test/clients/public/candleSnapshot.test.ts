import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assertGreater } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("candleSnapshot", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("CandleSnapshot");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    await t.step("required parameters", async () => {
        const data = await client.candleSnapshot({
            coin: "ETH",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
        });
        assertGreater(data.length, 0, "Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));
    });
    await t.step("required parameters + endTime", async () => {
        const data = await client.candleSnapshot({
            coin: "ETH",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
            endTime: Date.now(),
        });
        assertGreater(data.length, 0, "Unable to fully validate the type due to an empty array");
        data.forEach((item) => assertJsonSchema(schema, item));
    });
});
