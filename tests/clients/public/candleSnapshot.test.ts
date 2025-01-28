import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["candleSnapshot"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("candleSnapshot", async (t) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.candleSnapshot({
            coin: "ETH",
            interval: "15m",
            startTime: Date.now() - 1000 * 60 * 60 * 24,
        });
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check argument 'endTime'", async (t) => {
                await t.step("endTime: Date.now()", async () => {
                    const data = await client.candleSnapshot({
                        coin: "ETH",
                        interval: "15m",
                        startTime: Date.now() - 1000 * 60 * 60 * 24,
                        endTime: Date.now(),
                    });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("endTime: null", async () => {
                    const data = await client.candleSnapshot({
                        coin: "ETH",
                        interval: "15m",
                        startTime: Date.now() - 1000 * 60 * 60 * 24,
                        endTime: null,
                    });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("endTime: undefined", async () => {
                    const data = await client.candleSnapshot({
                        coin: "ETH",
                        interval: "15m",
                        startTime: Date.now() - 1000 * 60 * 60 * 24,
                        endTime: undefined,
                    });
                    assertJsonSchema(MethodReturnType, data);
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
