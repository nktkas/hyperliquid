import * as tsj from "npm:ts-json-schema-generator@^2.3.0";
import { resolve } from "jsr:@std/path@^1.0.2";
import { assertRejects } from "jsr:@std/assert@^1.0.9";
import { HttpTransport, PublicClient } from "../../../index.ts";
import { assertIncludesNotEmptyArray, assertJsonSchema } from "../../utils.ts";

Deno.test("l2Book", async (t) => {
    // Create TypeScript type schemas
    const tsjSchemaGenerator = tsj.createGenerator({ path: resolve("./index.ts"), skipTypeCheck: true });
    const schema = tsjSchemaGenerator.createSchema("L2Book");

    // Create client
    const client = new PublicClient(new HttpTransport({ url: "https://api.hyperliquid-testnet.xyz" }));

    //Test
    await t.step("required parameters", async () => {
        const data = await client.l2Book({ coin: "ETH" });
        assertJsonSchema(schema, data);
        assertIncludesNotEmptyArray(data);
    });
    await t.step("required parameters + nSigFigs", async (t) => {
        await t.step("nSigFigs === 2", async () => {
            const data = await client.l2Book({ coin: "ETH", nSigFigs: 2 });
            assertJsonSchema(schema, data);
            assertIncludesNotEmptyArray(data);
        });

        await t.step("nSigFigs === 3", async () => {
            const data = await client.l2Book({ coin: "ETH", nSigFigs: 3 });
            assertJsonSchema(schema, data);
            assertIncludesNotEmptyArray(data);
        });

        await t.step("nSigFigs === 4", async () => {
            const data = await client.l2Book({ coin: "ETH", nSigFigs: 4 });
            assertJsonSchema(schema, data);
            assertIncludesNotEmptyArray(data);
        });

        await t.step("nSigFigs === 5", async () => {
            const data = await client.l2Book({ coin: "ETH", nSigFigs: 5 });
            assertJsonSchema(schema, data);
            assertIncludesNotEmptyArray(data);
        });
    });
    await t.step("required parameters + nSigFigs + mantissa", async (t) => {
        await t.step("mantissa === 1 (Server returns error)", async () => {
            // @ts-ignore Check what doesn't work
            await assertRejects(() => client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 1 }));
        });

        await t.step("mantissa === 2", async () => {
            const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 2 });
            assertJsonSchema(schema, data);
            assertIncludesNotEmptyArray(data);
        });

        await t.step("mantissa === 5", async () => {
            const data = await client.l2Book({ coin: "ETH", nSigFigs: 5, mantissa: 5 });
            assertJsonSchema(schema, data);
            assertIncludesNotEmptyArray(data);
        });
    });
});
