import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["fundingHistory"]>;
const MethodReturnType = tsj
    .createGenerator({ path: import.meta.url, skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("fundingHistory", async (t) => {
    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.fundingHistory({
            coin: "ETH",
            startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
        });
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check argument 'endTime'", async (t) => {
                await t.step("endTime: Date.now()", async () => {
                    const data = await client.fundingHistory({
                        coin: "ETH",
                        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                        endTime: Date.now(),
                    });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("endTime: null", async () => {
                    const data = await client.fundingHistory({
                        coin: "ETH",
                        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                        endTime: null,
                    });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("endTime: undefined", async () => {
                    const data = await client.fundingHistory({
                        coin: "ETH",
                        startTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
                        endTime: undefined,
                    });
                    assertJsonSchema(MethodReturnType, data);
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
