import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { fromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { HttpTransport, PublicClient } from "../../../mod.ts";
import { assertJsonSchema } from "../../utils.ts";

// —————————— Type schema ——————————

export type MethodReturnType = ReturnType<PublicClient["l2Book"]>;
const MethodReturnType = tsj
    .createGenerator({ path: fromFileUrl(import.meta.url), skipTypeCheck: true })
    .createSchema("MethodReturnType");

// —————————— Test ——————————

Deno.test("l2Book", async (t) => {
    // —————————— Prepare ——————————

    const transport = new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const isMatchToScheme = await t.step("Matching data to type schema", async () => {
        const data = await client.l2Book({ coin: "ETH" });
        assertJsonSchema(MethodReturnType, data);
    });

    await t.step({
        name: "Additional checks",
        fn: async (t) => {
            await t.step("Check argument 'nSigFigs'", async (t) => {
                await t.step("nSigFigs: 2", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 2 });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("nSigFigs: 3", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 3 });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("nSigFigs: 4", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 4 });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("nSigFigs: 5", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 5 });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("nSigFigs: null", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: null });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("nSigFigs: undefined", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: undefined });
                    assertJsonSchema(MethodReturnType, data);
                });
            });

            await t.step("Check argument 'mantissa'", async (t) => {
                await t.step("mantissa: 2", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 2 });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("mantissa: 5", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 5 });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("mantissa: null", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: null });
                    assertJsonSchema(MethodReturnType, data);
                });
                await t.step("mantissa: undefined", async () => {
                    const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: undefined });
                    assertJsonSchema(MethodReturnType, data);
                });
            });
        },
        ignore: !isMatchToScheme,
    });
});
