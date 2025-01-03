import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { assertGreater } from "jsr:@std/assert@^1.0.10";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertJsonSchema } from "../../utils.ts";

Deno.test("candleSnapshot", async (t) => {
    // Create a scheme of type
    const typeSchema = tsj
        .createGenerator({ path: "./index.ts", skipTypeCheck: true })
        .createSchema("CandleSnapshot");

    // Create client
    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    //Test
    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.candleSnapshot({
            coin: "ETH",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
        });
        assertGreater(data.length, 0, "Expected data to have at least one element");
        data.forEach((item) => assertJsonSchema(typeSchema, item));
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check argument 'endTime'", async () => {
                const data = await client.candleSnapshot({
                    coin: "ETH",
                    interval: "15m",
                    startTime: Date.now() - 1000 * 60 * 60 * 24,
                    endTime: Date.now(),
                });
                assertGreater(data.length, 0, "Expected data to have at least one element");
                data.forEach((item) => assertJsonSchema(typeSchema, item));
            });
        },
        ignore: !isMatchToScheme,
    });
});
